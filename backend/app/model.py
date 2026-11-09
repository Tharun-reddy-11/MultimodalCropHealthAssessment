from __future__ import annotations
import json
from pathlib import Path
import torch
from PIL import Image
from torchvision import models, transforms

ROOT = Path(__file__).resolve().parents[2]
ARTIFACT = ROOT / "artifacts" / "image_baseline.pt"
class ModelNotReady(Exception): pass

def model_status():
    return {"ready": ARTIFACT.exists(), "mode": "image-only", "reason": None if ARTIFACT.exists() else "Train the image baseline before submitting an assessment; paired environmental data has not been supplied."}

def predict_image(path: Path):
    if not ARTIFACT.exists(): raise ModelNotReady(model_status()["reason"])
    payload = torch.load(ARTIFACT, map_location="cpu", weights_only=False)
    labels = payload["labels"]
    model = models.mobilenet_v2(weights=None); model.classifier[1] = torch.nn.Linear(model.last_channel, len(labels)); model.load_state_dict(payload["state_dict"]); model.eval()
    x = transforms.Compose([transforms.Resize(256), transforms.CenterCrop(224), transforms.ToTensor(), transforms.Normalize([.485,.456,.406],[.229,.224,.225])])(Image.open(path).convert("RGB")).unsqueeze(0)
    with torch.inference_mode(): probs = torch.softmax(model(x)[0], 0)
    values, indices = torch.topk(probs, min(3,len(labels)))
    return {"label": labels[indices[0]], "confidence": round(float(values[0]),4), "alternatives": [{"label":labels[i],"score":round(float(v),4)} for v,i in zip(values[1:],indices[1:])], "version": payload.get("version","mobilenetv2-image-baseline")}
