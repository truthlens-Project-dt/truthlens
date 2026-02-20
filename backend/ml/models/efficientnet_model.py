"""
EfficientNet-based deepfake detector.
File: backend/ml/models/efficientnet_model.py
"""
import torch
import torch.nn as nn
import timm
import logging

logger = logging.getLogger(__name__)


class DeepfakeEfficientNet(nn.Module):
    """
    EfficientNet-B0 fine-tuned for binary deepfake classification.
    Output: single probability (0=real, 1=fake)
    """

    def __init__(self, pretrained: bool = True):
        super().__init__()

        # Load EfficientNet-B0 backbone (downloads ~20MB weights on first run)
        self.backbone = timm.create_model(
            'efficientnet_b0',
            pretrained=pretrained,
            num_classes=0,       # Remove original classifier
            global_pool='avg'
        )

        feature_dim = self.backbone.num_features  # 1280 for B0

        # Custom classification head
        self.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(256, 1),
            nn.Sigmoid()         # Output: probability 0–1
        )

        logger.info(f"DeepfakeEfficientNet ready | features: {feature_dim}")

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.backbone(x)
        return self.classifier(features).squeeze(1)


def get_transforms(train: bool = False):
    """
    Image transforms for EfficientNet input.
    Input images are 224x224 RGB face crops.
    """
    import torchvision.transforms as T

    normalize = T.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )

    if train:
        return T.Compose([
            T.ToPILImage(),
            T.RandomHorizontalFlip(p=0.5),
            T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
            T.RandomRotation(degrees=10),
            T.ToTensor(),
            normalize,
        ])
    else:
        return T.Compose([
            T.ToPILImage(),
            T.ToTensor(),
            normalize,
        ])


# ── Quick sanity check ────────────────────────────────────
if __name__ == "__main__":
    model = DeepfakeEfficientNet(pretrained=True)
    model.eval()

    # Simulate a batch of 4 face images (224x224 RGB)
    dummy_input = torch.randn(4, 3, 224, 224)

    with torch.no_grad():
        output = model(dummy_input)

    print(f"\\n✅ Model output shape: {output.shape}")   # Expected: torch.Size([4])
    print(f"   Sample predictions: {output.tolist()}")  # Values between 0 and 1
    print(f"   Parameters: {sum(p.numel() for p in model.parameters()):,}")
    