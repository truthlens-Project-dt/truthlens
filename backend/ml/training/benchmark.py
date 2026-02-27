"""
Compare placeholder vs real model performance.
File: backend/ml/training/benchmark.py
"""

import sys
import torch
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from models.efficientnet_model import DeepfakeEfficientNet
from training.dataset import get_real_dataloaders
from training.evaluator import evaluate_model


def main():

    # ── Paths ────────────────────────────────────────────────
    BASE_DIR = Path(__file__).resolve().parents[3]

    TEST_DIR = BASE_DIR / "data/real_dataset/real_vs_fake/real-vs-fake/test"

    CHECKPOINT = BASE_DIR / "backend/ml/checkpoints/best_model.pth"
    # ─────────────────────────────────────────────────────────

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Load dataset
    _, test_loader = get_real_dataloaders(TEST_DIR, TEST_DIR, batch_size=32)

    # Load model
    model = DeepfakeEfficientNet(pretrained=False).to(device)

    # Load checkpoint
    ckpt = torch.load(CHECKPOINT, map_location=device)
    model.load_state_dict(ckpt["model_state"])

    # Evaluate
    metrics, _, _ = evaluate_model(model, test_loader, device)

    print("\n" + "="*50)
    print("  REAL MODEL BENCHMARK")
    print("="*50)

    for k, v in metrics.items():
        if k != "confusion_matrix":
            if isinstance(v, float):
                print(f"  {k:22s}: {v:.4f}")
            else:
                print(f"  {k:22s}: {v}")

    target = 0.85
    acc = metrics["accuracy"]

    print(f"\n{'✅ Target met!' if acc >= target else '⚠️  Below target — train more epochs'}")
    print(f"  Accuracy: {acc:.1%} (target: {target:.0%})")


if __name__ == "__main__":
    main()