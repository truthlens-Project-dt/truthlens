"""
Model evaluation: precision, recall, F1, confusion matrix.
File: backend/ml/training/evaluator.py
"""
import sys
import torch
import numpy as np
from pathlib import Path
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score, classification_report
)
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend (no display needed)
import matplotlib.pyplot as plt
import json
import logging

sys.path.append(str(Path(__file__).parent.parent))

logger = logging.getLogger(__name__)


@torch.no_grad()
def evaluate_model(model, loader, device, threshold: float = 0.5):
    """
    Run full evaluation — returns dict of all metrics.
    """
    model.eval()
    all_probs  = []
    all_labels = []

    for imgs, labels in loader:
        imgs   = imgs.to(device)
        probs  = model(imgs).cpu().numpy()
        all_probs.extend(probs.tolist())
        all_labels.extend(labels.numpy().tolist())

    all_probs  = np.array(all_probs)
    all_labels = np.array(all_labels, dtype=int)
    all_preds  = (all_probs > threshold).astype(int)

    metrics = {
        "accuracy":  float(np.mean(all_preds == all_labels)),
        "precision": float(precision_score(all_labels, all_preds, zero_division=0)),
        "recall":    float(recall_score(all_labels, all_preds, zero_division=0)),
        "f1":        float(f1_score(all_labels, all_preds, zero_division=0)),
        "auc_roc":   float(roc_auc_score(all_labels, all_probs))
                     if len(np.unique(all_labels)) > 1 else 0.5,
        "threshold": threshold,
        "n_samples": len(all_labels),
        "n_real":    int(np.sum(all_labels == 0)),
        "n_fake":    int(np.sum(all_labels == 1)),
    }

    cm = confusion_matrix(all_labels, all_preds)
    metrics["confusion_matrix"] = cm.tolist()

    logger.info("\\n" + classification_report(
        all_labels, all_preds,
        target_names=["Real", "Fake"]
    ))

    return metrics, all_probs, all_labels


def plot_training_curves(history: list, save_dir: str = "."):
    """Plot loss and accuracy curves from training history."""
    epochs      = [r["epoch"]      for r in history]
    train_loss  = [r["train_loss"] for r in history]
    val_loss    = [r["val_loss"]   for r in history]
    train_acc   = [r["train_acc"]  for r in history]
    val_acc     = [r["val_acc"]    for r in history]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle("TruthLens — Training Curves", fontsize=14, fontweight="bold")

    # Loss
    ax1.plot(epochs, train_loss, "b-o", label="Train Loss", markersize=5)
    ax1.plot(epochs, val_loss,   "r-o", label="Val Loss",   markersize=5)
    ax1.set_title("Loss")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("BCE Loss")
    ax1.legend()
    ax1.grid(alpha=0.3)

    # Accuracy
    ax2.plot(epochs, train_acc, "b-o", label="Train Acc", markersize=5)
    ax2.plot(epochs, val_acc,   "r-o", label="Val Acc",   markersize=5)
    ax2.set_title("Accuracy")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy")
    ax2.set_ylim(0, 1.05)
    ax2.legend()
    ax2.grid(alpha=0.3)

    plt.tight_layout()
    out = Path(save_dir) / "training_curves.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"📊 Curves saved → {out}")
    return str(out)


def plot_confusion_matrix(cm: list, save_dir: str = "."):
    """Plot and save confusion matrix."""
    cm  = np.array(cm)
    fig, ax = plt.subplots(figsize=(5, 4))

    im = ax.imshow(cm, cmap="Blues")
    plt.colorbar(im, ax=ax)

    ax.set_xticks([0, 1]); ax.set_xticklabels(["Real", "Fake"])
    ax.set_yticks([0, 1]); ax.set_yticklabels(["Real", "Fake"])
    ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix")

    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(cm[i, j]),
                    ha="center", va="center", fontsize=16, fontweight="bold",
                    color="white" if cm[i, j] > cm.max() / 2 else "black")

    plt.tight_layout()
    out = Path(save_dir) / "confusion_matrix.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    logger.info(f"📊 Confusion matrix saved → {out}")
    return str(out)


# ── Run standalone to evaluate saved checkpoint ──────────
if __name__ == "__main__":
    import torch
    from models.efficientnet_model import DeepfakeEfficientNet
    from training.dataset import get_dataloaders

    logging.basicConfig(level=logging.INFO)

    CHECKPOINT = Path("backend/ml/checkpoints/best_model.pth")
    DATA_DIR   = "data"
    SAVE_DIR   = "backend/ml/checkpoints" 

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    _, val_loader = get_dataloaders(DATA_DIR, batch_size=8)

    model = DeepfakeEfficientNet(pretrained=False).to(device)
    ckpt  = torch.load(CHECKPOINT, map_location=device)
    model.load_state_dict(ckpt["model_state"])
    print(f"Loaded checkpoint (epoch {ckpt['epoch']})")

    metrics, probs, labels = evaluate_model(model, val_loader, device)

    print("\\n📊 Evaluation Metrics:")
    for k, v in metrics.items():
        if k != "confusion_matrix":
            print(f"   {k:15s}: {v}")

    # Save metrics JSON
    with open(Path(SAVE_DIR) / "eval_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Load history and plot
    history_path = Path(SAVE_DIR) / "training_history.json"
    if history_path.exists():
        with open(history_path) as f:
            data = json.load(f)
        plot_training_curves(data["history"], SAVE_DIR)

    plot_confusion_matrix(metrics["confusion_matrix"], SAVE_DIR)
    print("\\n✅ Charts saved to backend/ml/checkpoints/")
