"""Model architectures for Multimodal Crop Health Assessment.
Includes:
1. MobileNetV2 image-only backbone & classifier
2. Environmental Tabular MLP branch
3. Multimodal Feature Fusion Network
4. Grad-CAM saliency explanation generator
"""
from __future__ import annotations
import io
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import numpy as np


class ImageClassifier(nn.Module):
    """MobileNetV2 Transfer Learning classifier for crop foliage health."""
    def __init__(self, num_classes: int = 8, pretrained: bool = True):
        super().__init__()
        weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v2(weights=weights)
        in_features = self.backbone.last_channel  # 1280
        self.backbone.classifier = nn.Identity()
        self.classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(in_features, num_classes)
        )

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        # features: [B, 1280, 7, 7] -> pool -> [B, 1280]
        feats = self.backbone.features(x)
        feats = nn.functional.adaptive_avg_pool2d(feats, (1, 1))
        return torch.flatten(feats, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.extract_features(x)
        return self.classifier(feat)


class EnvironmentalBranch(nn.Module):
    """Deep tabular neural network for environmental observations."""
    def __init__(self, in_features: int = 5, out_features: int = 32):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Linear(64, out_features),
            nn.BatchNorm1d(out_features),
            nn.ReLU()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class MultimodalFusionModel(nn.Module):
    """Late-fusion multimodal architecture combining leaf imagery and greenhouse environmental sensors."""
    def __init__(self, image_model: ImageClassifier, num_classes: int = 8, env_features: int = 5):
        super().__init__()
        self.image_model = image_model
        self.env_branch = EnvironmentalBranch(in_features=env_features, out_features=32)
        
        # 1280 (visual) + 32 (environmental) = 1312
        fused_dim = 1280 + 32
        self.fusion_head = nn.Sequential(
            nn.Linear(fused_dim, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, image_tensor: torch.Tensor, env_tensor: torch.Tensor) -> torch.Tensor:
        img_feats = self.image_model.extract_features(image_tensor)
        env_feats = self.env_branch(env_tensor)
        fused = torch.cat([img_feats, env_feats], dim=1)
        return self.fusion_head(fused)


def get_image_transforms(is_train: bool = False):
    if is_train:
        return transforms.Compose([
            transforms.Resize(256),
            transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.1, contrast=0.1),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])


class GradCAM:
    """Class Activation Mapping for visual explainability."""
    def __init__(self, model: nn.Module, target_layer: nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.target_layer.register_forward_hook(self._forward_hook)

    def _forward_hook(self, module, input, output):
        self.activations = output.detach()

    def generate_heatmap(self, input_tensor: torch.Tensor, class_idx: int | None = None) -> np.ndarray:
        self.model.eval()
        with torch.no_grad():
            output = self.model(input_tensor)
            if class_idx is None:
                class_idx = torch.argmax(output, dim=1).item()
            
            # Use class-specific weights from the linear classifier if available
            if hasattr(self.model, "classifier") and isinstance(self.model.classifier[-1], nn.Linear):
                fc_weights = self.model.classifier[-1].weight[class_idx].detach()  # [1280]
                act = self.activations[0]  # [1280, 7, 7]
                # Weighted sum of feature maps
                weighted = torch.sum(act * fc_weights.view(-1, 1, 1), dim=0)
                heatmap = F.relu(weighted).cpu().numpy()
            else:
                # Average activation across channels
                heatmap = torch.mean(self.activations[0], dim=0).cpu().numpy()
                heatmap = np.maximum(heatmap, 0)

        max_val = np.max(heatmap)
        if max_val > 0:
            heatmap = heatmap / max_val
        else:
            heatmap = np.zeros_like(heatmap)

        return heatmap


def overlay_gradcam_on_image(original_image: Image.Image, heatmap: np.ndarray, alpha: float = 0.5) -> Image.Image:
    """Create a colored heatmap overlaid on the input PIL image without requiring OpenCV."""
    heatmap_resized = Image.fromarray((heatmap * 255).astype(np.uint8)).resize(
        original_image.size, Image.Resampling.BILINEAR
    )
    heatmap_np = np.array(heatmap_resized) / 255.0
    
    # Generate custom agricultural/thermal color mapping (blue -> cyan -> yellow -> red)
    r = np.clip(1.5 * heatmap_np, 0, 1)
    g = np.clip(1.5 * (1 - np.abs(heatmap_np - 0.5) * 2), 0, 1)
    b = np.clip(1.5 * (1 - heatmap_np), 0, 1)
    
    color_map = np.stack([r, g, b], axis=-1) * 255.0
    color_map_img = Image.fromarray(color_map.astype(np.uint8))
    
    rgb_orig = original_image.convert("RGB")
    blended = Image.blend(rgb_orig, color_map_img, alpha=alpha)
    return blended
