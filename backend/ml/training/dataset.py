"""
Dataset loader for deepfake detection training.
File: backend/ml/training/dataset.py

Folder structure expected:
  data/
    real/    ← real face images (224x224 jpg/png)
    fake/    ← deepfake face images (224x224 jpg/png)
"""
import os
import numpy as np
from pathlib import Path
from typing import Tuple, List
import torch
from torch.utils.data import Dataset, DataLoader
import cv2
import logging

logger = logging.getLogger(__name__)


class DeepfakeDataset(Dataset):
    """
    Loads face images from real/ and fake/ folders.
    Label: 0 = real, 1 = fake
    """

    def __init__(self, data_dir: str, transform=None):
        self.transform  = transform
        self.samples: List[Tuple[str, int]] = []

        data_path = Path(data_dir)
        real_dir  = data_path / "real"
        fake_dir  = data_path / "fake"

        # Load real samples (label=0)
        if real_dir.exists():
            for img_path in real_dir.glob("*.jpg"):
                self.samples.append((str(img_path), 0))
            for img_path in real_dir.glob("*.png"):
                self.samples.append((str(img_path), 0))

        # Load fake samples (label=1)
        if fake_dir.exists():
            for img_path in fake_dir.glob("*.jpg"):
                self.samples.append((str(img_path), 1))
            for img_path in fake_dir.glob("*.png"):
                self.samples.append((str(img_path), 1))

        real_count = sum(1 for _, l in self.samples if l == 0)
        fake_count = sum(1 for _, l in self.samples if l == 1)
        logger.info(f"Dataset: {real_count} real, {fake_count} fake")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]

        img = cv2.imread(img_path)
        if img is None:
            raise ValueError(f"Cannot read: {img_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        if self.transform:
            img = self.transform(img)

        return img, torch.tensor(label, dtype=torch.float32)


def get_dataloaders(data_dir: str, batch_size: int = 32, val_split: float = 0.2):
    """
    Split dataset into train/val and return DataLoaders.
    """
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    from models.efficientnet_model import get_transforms

    full_dataset = DeepfakeDataset(data_dir, transform=None)

    if len(full_dataset) == 0:
        raise ValueError(f"No images found in {data_dir}/real/ or {data_dir}/fake/")

    # Split indices
    n       = len(full_dataset)
    indices = list(range(n))
    np.random.shuffle(indices)
    split   = int(n * val_split)

    train_idx = indices[split:]
    val_idx   = indices[:split]

    # Create subsets with proper transforms
    train_dataset = DeepfakeDataset(data_dir, transform=get_transforms(train=True))
    val_dataset   = DeepfakeDataset(data_dir, transform=get_transforms(train=False))

    from torch.utils.data import Subset
    train_subset = Subset(train_dataset, train_idx)
    val_subset   = Subset(val_dataset,   val_idx)

    train_loader = DataLoader(train_subset, batch_size=batch_size, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_subset,   batch_size=batch_size, shuffle=False, num_workers=0)

    logger.info(f"Train: {len(train_subset)} | Val: {len(val_subset)}")
    return train_loader, val_loader

def get_real_dataloaders(
    train_dir: str,
    test_dir:  str,
    batch_size: int = 32
):
    """
    For Kaggle 140k dataset structure:

    data/real_dataset/real_vs_fake/real-vs-fake/
        train/real/, train/fake/
        valid/real/, valid/fake/
        test/real/,  test/fake/
    """

    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    from models.efficientnet_model import get_transforms

    # Correct full paths relative to project root
    base_path = Path("../../../data/real_dataset/real_vs_fake/real-vs-fake")

    train_dir = base_path / train_dir
    test_dir  = base_path / test_dir

    train_dataset = DeepfakeDataset(str(train_dir), transform=get_transforms(train=True))
    test_dataset  = DeepfakeDataset(str(test_dir),  transform=get_transforms(train=False))

    train_loader = DataLoader(train_dataset, batch_size=batch_size,
                              shuffle=True,  num_workers=2, pin_memory=True)
    test_loader  = DataLoader(test_dataset,  batch_size=batch_size,
                              shuffle=False, num_workers=2, pin_memory=True)

    logger.info(f"Real data — Train: {len(train_dataset)} | Test: {len(test_dataset)}")
    return train_loader, test_loader


# ── Synthetic data generator for testing WITHOUT real dataset ──
def generate_synthetic_data(output_dir: str = "data", n_per_class: int = 50):
    """
    Generate 50 real + 50 fake 224x224 synthetic face images for testing.
    Real = bright images, Fake = dark images (trivially separable — just for pipeline testing).
    """
    import cv2
    import numpy as np

    for label in ["real", "fake"]:
        folder = Path(output_dir) / label
        folder.mkdir(parents=True, exist_ok=True)

        for i in range(n_per_class):
            # Real: random bright face-ish image
            # Fake: random dark image
            base = 180 if label == "real" else 60
            img  = np.random.randint(base - 40, base + 40, (224, 224, 3), dtype=np.uint8)

            # Draw a simple oval to simulate a face
            cx, cy = 112, 112
            cv2.ellipse(img, (cx, cy), (60, 80), 0, 0, 360,
                        (base + 20, base + 10, base), -1)

            cv2.imwrite(str(folder / f"{label}_{i:04d}.jpg"), img)

    print(f"✅ Generated {n_per_class} real + {n_per_class} fake images in {output_dir}/")


if __name__ == "__main__":
    # Generate synthetic dataset and verify loader works
    generate_synthetic_data("../../../data", n_per_class=50)

    train_loader, val_loader = get_dataloaders("../../../data", batch_size=8)

    batch_imgs, batch_labels = next(iter(train_loader))
    print(f"\\n✅ DataLoader works!")
    print(f"   Batch shape: {batch_imgs.shape}")    # [8, 3, 224, 224]
    print(f"   Labels:      {batch_labels.tolist()}")
    