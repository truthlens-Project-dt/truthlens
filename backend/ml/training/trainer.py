"""
Training loop for the deepfake detector.
File: backend/ml/training/trainer.py
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

sys.path.append(str(Path(__file__).parent.parent))
from models.efficientnet_model import DeepfakeEfficientNet, get_transforms
from training.dataset import get_dataloaders

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss, correct, total = 0.0, 0, 0

    for imgs, labels in tqdm(loader, desc="  Train", leave=False):
        imgs, labels = imgs.to(device), labels.to(device)

        optimizer.zero_grad()
        preds = model(imgs)
        loss  = criterion(preds, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * len(imgs)
        correct    += ((preds > 0.5) == labels.bool()).sum().item()
        total      += len(imgs)

    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0

    for imgs, labels in tqdm(loader, desc="  Val  ", leave=False):
        imgs, labels = imgs.to(device), labels.to(device)
        preds = model(imgs)
        loss  = criterion(preds, labels)

        total_loss += loss.item() * len(imgs)
        correct    += ((preds > 0.5) == labels.bool()).sum().item()
        total      += len(imgs)

    return total_loss / total, correct / total


def train(
    data_dir:   str = "../../../data",
    epochs:     int = 10,
    batch_size: int = 16,
    lr:         float = 1e-4,
    save_dir:   str = "../checkpoints"
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Device: {device}")

    # Data
    train_loader, val_loader = get_dataloaders(data_dir, batch_size=batch_size)

    # Model
    model     = DeepfakeEfficientNet(pretrained=True).to(device)
    criterion = nn.BCELoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    # Checkpoints folder
    save_path = Path(save_dir)
    save_path.mkdir(parents=True, exist_ok=True)

    history    = []
    best_val   = 0.0

    logger.info(f"Starting training: {epochs} epochs")
    logger.info("=" * 55)

    for epoch in range(1, epochs + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, criterion, device)
        val_loss,   val_acc   = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        logger.info(
            f"Epoch {epoch:02d}/{epochs} | "
            f"Train loss: {train_loss:.4f} acc: {train_acc:.3f} | "
            f"Val   loss: {val_loss:.4f} acc: {val_acc:.3f}"
        )

        record = {
            "epoch": epoch, "train_loss": round(train_loss, 4),
            "train_acc": round(train_acc, 4), "val_loss": round(val_loss, 4),
            "val_acc": round(val_acc, 4)
        }
        history.append(record)

        # Save best model
        if val_acc > best_val:
            best_val = val_acc
            ckpt_path = save_path / "best_model.pth"
            torch.save({
                "epoch":       epoch,
                "model_state": model.state_dict(),
                "val_acc":     val_acc,
                "val_loss":    val_loss,
            }, ckpt_path)
            logger.info(f"  💾 Saved best model → {ckpt_path} (val_acc={val_acc:.3f})")

    # Save training history
    history_path = save_path / "training_history.json"
    with open(history_path, "w") as f:
        json.dump({"history": history, "best_val_acc": best_val,
                   "trained_at": datetime.now().isoformat()}, f, indent=2)
    logger.info(f"\\n✅ Training complete! Best val acc: {best_val:.3f}")
    logger.info(f"   History saved → {history_path}")
    return history


if __name__ == "__main__":
    train(
        data_dir="../../../data",
        epochs=20,
        batch_size=16
    )
