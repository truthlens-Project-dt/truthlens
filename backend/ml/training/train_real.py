"""
Train on real Kaggle deepfake dataset.
File: backend/ml/training/train_real.py
Run: python train_real.py
Expected: ~85%+ val accuracy after 20 epochs
"""

import sys
import torch
import torch.nn as nn
import torch.optim as optim
from pathlib import Path
from tqdm import tqdm
import logging
import json
from datetime import datetime
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from models.efficientnet_model import DeepfakeEfficientNet, get_transforms
from training.dataset import get_real_dataloaders
from training.trainer import train_one_epoch, evaluate

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parents[3]  # → truthlens/

TRAIN_DIR = BASE_DIR / "data/real_dataset/real_vs_fake/real-vs-fake/train"
TEST_DIR  = BASE_DIR / "data/real_dataset/real_vs_fake/real-vs-fake/test"

SAVE_DIR   = BASE_DIR / "backend/ml/checkpoints"
EPOCHS     = 20
BATCH_SIZE = 32
LR         = 3e-4
# ──────────────────────────────────────────────────────────


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Device: {device}")

    if device.type == "cpu":
        logger.warning("Training on CPU — 20 epochs may take several hours.")

    train_loader, test_loader = get_real_dataloaders(TRAIN_DIR, TEST_DIR, BATCH_SIZE)

    model     = DeepfakeEfficientNet(pretrained=True).to(device)
    criterion = nn.BCELoss()
    optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)

    scheduler = optim.lr_scheduler.OneCycleLR(
        optimizer,
        max_lr=LR,
        steps_per_epoch=len(train_loader),
        epochs=EPOCHS
    )

    save_path = Path(SAVE_DIR)
    save_path.mkdir(parents=True, exist_ok=True)

    history = []
    best_val = 0.0

    for epoch in range(1, EPOCHS + 1):

        train_loss, train_acc = train_one_epoch(
            model, train_loader, optimizer, criterion, device
        )

        scheduler.step()

        val_loss, val_acc = evaluate(
            model, test_loader, criterion, device
        )

        logger.info(
            f"Epoch {epoch:02d}/{EPOCHS} | "
            f"Train {train_loss:.4f}/{train_acc:.3f} | "
            f"Val {val_loss:.4f}/{val_acc:.3f}"
        )

        history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 4),
            "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 4)
        })

        # Save best model
        if val_acc > best_val:
            best_val = val_acc
            torch.save({
                "epoch": epoch,
                "model_state": model.state_dict(),
                "val_acc": val_acc,
                "val_loss": val_loss,
                "trained_on": "real_data"
            }, save_path / "best_model.pth")

            logger.info(f"💾 Best model saved (val_acc={val_acc:.3f})")

        # Save checkpoint every 5 epochs
        if epoch % 5 == 0:
            torch.save({
                "epoch": epoch,
                "model_state": model.state_dict(),
                "val_acc": val_acc,
            }, save_path / f"checkpoint_epoch{epoch}.pth")

    # Save training history
    with open(save_path / "training_history.json", "w") as f:
        json.dump({
            "history": history,
            "best_val_acc": best_val,
            "trained_at": datetime.now().isoformat(),
            "dataset": "real_kaggle_140k"
        }, f, indent=2)

    logger.info(f"\n✅ Done! Best val acc: {best_val:.3f} ({best_val*100:.1f}%)")


if __name__ == "__main__":
    main()
