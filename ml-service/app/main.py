"""FastAPI inference microservice for Multimodal Crop Health Assessment.
Loads trained PyTorch artifacts:
- mobilenetv2_crop_health.pt
- multimodal_fusion.pt
Generates real-time predictions, probabilities, and Grad-CAM visual explanations.
"""
from __future__ import annotations
import base64
import io
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError

from .model_architecture import (
    ImageClassifier,
    MultimodalFusionModel,
    GradCAM,
    overlay_gradcam_on_image,
    get_image_transforms
)

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = ROOT / "model-artifacts"
REPORTS_DIR = ROOT / "reports"
DATASETS_DIR = ROOT / "datasets" / "reports"

app = FastAPI(
    title="Multimodal Crop Health AI Service",
    description="Real-time PyTorch inference engine with Grad-CAM visual explainability for greenhouse crops",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Global model state
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
image_model: Optional[ImageClassifier] = None
fusion_model: Optional[MultimodalFusionModel] = None
gradcam_explainer: Optional[GradCAM] = None
classes: list[str] = []
model_metadata: dict = {}


def load_models():
    global image_model, fusion_model, gradcam_explainer, classes, model_metadata
    img_path = ARTIFACTS_DIR / "mobilenetv2_crop_health.pt"
    fus_path = ARTIFACTS_DIR / "multimodal_fusion.pt"

    if img_path.exists():
        payload = torch.load(img_path, map_location=device, weights_only=False)
        classes = payload.get("classes", [])
        image_model = ImageClassifier(num_classes=len(classes), pretrained=False)
        image_model.load_state_dict(payload["state_dict"])
        image_model.to(device)
        image_model.eval()

        # Initialize Grad-CAM on last conv layer of MobileNetV2
        last_conv = image_model.backbone.features[-1]
        gradcam_explainer = GradCAM(model=image_model, target_layer=last_conv)
        model_metadata["image_model"] = {
            "version": "mobilenetv2-image-v1.0",
            "accuracy": payload.get("accuracy", 0.0),
            "classes": classes,
            "trained_at": payload.get("trained_at", "")
        }

    if fus_path.exists() and image_model is not None:
        fus_payload = torch.load(fus_path, map_location=device, weights_only=False)
        fusion_model = MultimodalFusionModel(image_model=image_model, num_classes=len(classes))
        fusion_model.load_state_dict(fus_payload["state_dict"])
        fusion_model.to(device)
        fusion_model.eval()
        model_metadata["multimodal_fusion"] = {
            "version": "multimodal-fusion-v1.0",
            "accuracy": fus_payload.get("accuracy", 0.0),
            "trained_at": fus_payload.get("trained_at", "")
        }


@app.on_event("startup")
def startup():
    load_models()


AGRONOMIC_GUIDANCE = {
    "Anthracnose": {
        "severity": "High",
        "description": "Fungal infection caused by Colletotrichum gloeosporioides producing dark, sunken lesions on leaves, blossoms, and fruits.",
        "environmental_factors": "Triggered by prolonged high relative humidity (>80%) and temperatures between 25°C and 30°C.",
        "recommended_action": "Improve canopy aeration by selective pruning. Apply protective copper oxychloride or azoxystrobin spray during cool morning hours. Avoid overhead sprinkler irrigation."
    },
    "Bacterial Canker": {
        "severity": "Critical",
        "description": "Caused by Xanthomonas campestris pv. mangiferaeindicae, resulting in water-soaked lesions that turn angular, raised, and cankerous.",
        "environmental_factors": "Spread rapidly through wind-driven rains and leaf abrasion in warm, stormy weather.",
        "recommended_action": "Sanitize pruning tools with 10% sodium hypochlorite. Apply copper hydroxide with valid bactericide. Remove and burn severely infected twigs."
    },
    "Cutting Weevil": {
        "severity": "Moderate",
        "description": "Deporaus marginatus weevils cut tender shoots and leaves near the base during vegetative flushing periods.",
        "environmental_factors": "Prevalent during moderate humidity and fresh leaf flush in early spring/summer.",
        "recommended_action": "Collect and destroy fallen severed leaf clippings. Apply neem-based insecticidal repellent or targeted lambda-cyhalothrin on new flush foliage."
    },
    "Die Back": {
        "severity": "High",
        "description": "Caused by Lasiodiplodia theobromae, leading to drying and wilting of twigs from top downward, accompanied by brown discoloration.",
        "environmental_factors": "Accelerated under thermal stress (>35°C), intense solar irradiance, and moisture deficits in canopy.",
        "recommended_action": "Prune dried branches 5 cm below infected margins and paint cut ends with Bordeaux paste or copper fungicide. Ensure uniform soil moisture."
    },
    "Gall Midge": {
        "severity": "Moderate",
        "description": "Procontarinia larvae cause wart-like galls on tender leaves, impeding normal photosynthesis.",
        "environmental_factors": "Favored by mild overcast days with high morning humidity during new canopy sprouting.",
        "recommended_action": "Inspect underside of new foliage regularly. Deploy yellow sticky insect traps in greenhouse canopy. Spray neem oil at egg-hatch stage."
    },
    "Healthy": {
        "severity": "None",
        "description": "Foliage exhibits vigorous chlorophyll pigmentation, uniform lamina structure, and absence of necrotic or chlorotic lesions.",
        "environmental_factors": "Balanced climate within greenhouse target comfort band: 22-28°C and 55-65% relative humidity.",
        "recommended_action": "Continue regular nutrient fertigation, monitor canopy humidity, and conduct preventive weekly inspections."
    },
    "Powdery Mildew": {
        "severity": "Moderate to High",
        "description": "Caused by Oidium mangiferae, forming white powdery mycelial patches on foliage and panicles.",
        "environmental_factors": "Favored by warm cloudy days, cool nights, and moderate relative humidity (60-70%).",
        "recommended_action": "Apply wettable sulfur (0.2%) or triazole fungicides. Increase greenhouse air velocity and avoid stagnant moist microclimates."
    },
    "Sooty Mould": {
        "severity": "Low to Moderate",
        "description": "Superficial dark fungal coating caused by Meliola or Capnodium growing saprophytically on insect honeydew secretions.",
        "environmental_factors": "Associated with dense infestations of sap-sucking pests (aphids, scale insects, hoppers).",
        "recommended_action": "Wash foliage with dilute starch spray (1-2%) to peel off mold coating. Control underlying honeydew-producing sucking insects."
    }
}


@app.get("/health")
def health():
    if image_model is None:
        load_models()
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "device": str(device),
        "models_ready": {
            "image_baseline": image_model is not None,
            "multimodal_fusion": fusion_model is not None
        },
        "supported_classes": classes,
        "metadata": model_metadata
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    mode: str = Form("image"),
    crop_type: str = Form("Mango"),
    temperature: Optional[float] = Form(None),
    relative_humidity: Optional[float] = Form(None),
    rainfall: Optional[float] = Form(None),
    solar_radiation: Optional[float] = Form(None),
    wind_speed: Optional[float] = Form(None)
):
    if image_model is None:
        load_models()
        if image_model is None:
            raise HTTPException(503, "ML model is not loaded yet. Train or verify model artifacts.")

    if file.content_type not in {"image/jpeg", "image/png", "image/jpg"}:
        raise HTTPException(400, "Please upload a valid JPG or PNG image.")

    content = await file.read()
    if not content or len(content) > 15 * 1024 * 1024:
        raise HTTPException(400, "Uploaded file must be a non-empty image under 15 MB.")

    try:
        pil_image = Image.open(io.BytesIO(content)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(400, "Corrupt or unrecognized image file.")

    t_start = time.perf_counter()

    # Preprocess Image
    transform = get_image_transforms(is_train=False)
    img_tensor = transform(pil_image).unsqueeze(0).to(device)

    # Determine mode & run inference
    is_multimodal = (mode.lower() == "multimodal" and fusion_model is not None and
                     all(v is not None for v in [temperature, relative_humidity]))

    if is_multimodal:
        # Normalize env readings
        env_raw = np.array([
            temperature if temperature is not None else 28.0,
            relative_humidity if relative_humidity is not None else 65.0,
            rainfall if rainfall is not None else 10.0,
            solar_radiation if solar_radiation is not None else 500.0,
            wind_speed if wind_speed is not None else 2.0
        ], dtype=np.float32)
        env_mean = np.array([28.8, 70.1, 18.6, 563.7, 2.38], dtype=np.float32)
        env_std = np.array([4.2, 16.5, 14.8, 145.0, 1.1], dtype=np.float32)
        env_norm = (env_raw - env_mean) / env_std
        env_tensor = torch.tensor(env_norm, dtype=torch.float32).unsqueeze(0).to(device)

        with torch.inference_mode():
            logits = fusion_model(img_tensor, env_tensor)[0]
            probs = torch.softmax(logits, dim=0).cpu().numpy()
        active_version = "multimodal-fusion-v1.0"
    else:
        with torch.inference_mode():
            logits = image_model(img_tensor)[0]
            probs = torch.softmax(logits, dim=0).cpu().numpy()
        active_version = "mobilenetv2-image-v1.0"

    inference_time_ms = round((time.perf_counter() - t_start) * 1000, 2)

    top_idx = int(np.argmax(probs))
    predicted_class = classes[top_idx]
    confidence = float(probs[top_idx])

    # Top 3 alternatives
    sorted_indices = np.argsort(probs)[::-1]
    alternatives = [
        {"class_name": classes[i], "score": round(float(probs[i]), 4)}
        for i in sorted_indices if i != top_idx
    ][:4]

    # Generate Grad-CAM saliency map using the visual backbone
    gradcam_base64 = None
    try:
        if gradcam_explainer is not None:
            heatmap = gradcam_explainer.generate_heatmap(img_tensor, class_idx=top_idx)
            overlay = overlay_gradcam_on_image(pil_image, heatmap, alpha=0.45)
            buf = io.BytesIO()
            overlay.save(buf, format="PNG")
            gradcam_base64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"Grad-CAM generation error (non-fatal): {e}")

    guidance = AGRONOMIC_GUIDANCE.get(predicted_class, {
        "severity": "Moderate",
        "description": "Foliage condition observed.",
        "environmental_factors": "General greenhouse environment.",
        "recommended_action": "Consult local agricultural extension office."
    })

    return {
        "prediction": predicted_class,
        "confidence": round(confidence, 4),
        "confidence_percentage": f"{round(confidence * 100, 1)}%",
        "crop_type": crop_type,
        "inference_mode": "multimodal" if is_multimodal else "image_only",
        "model_version": active_version,
        "inference_time_ms": inference_time_ms,
        "alternatives": alternatives,
        "gradcam_image_base64": gradcam_base64,
        "guidance": guidance,
        "environmental_inputs": {
            "temperature_celsius": temperature,
            "relative_humidity_percent": relative_humidity,
            "rainfall_mm": rainfall,
            "solar_radiation_wm2": solar_radiation,
            "wind_speed_ms": wind_speed,
            "is_user_provided": True
        }
    }


@app.get("/model/metrics")
def get_metrics():
    report_file = REPORTS_DIR / "model_evaluation_report.json"
    if report_file.exists():
        return json.loads(report_file.read_text(encoding="utf-8"))
    return {"status": "not_evaluated_yet", "message": "Run train_pipeline.py to compute metrics"}


@app.get("/datasets/manifest")
def get_manifest():
    manifest_file = DATASETS_DIR / "dataset_manifest.json"
    if manifest_file.exists():
        return json.loads(manifest_file.read_text(encoding="utf-8"))
    return {"status": "not_discovered_yet", "message": "Run inspect_datasets.py to generate manifest"}
