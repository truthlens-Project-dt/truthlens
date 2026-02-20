"""
Deepfake detector — uses trained EfficientNet when checkpoint exists.
Falls back to random scores if no checkpoint found.
File: backend/ml/inference/detector.py
"""
import numpy as np
import torch
from pathlib import Path
from typing import Dict, List, Optional
import logging
import sys

sys.path.append(str(Path(__file__).parent.parent))

logger = logging.getLogger(__name__)

CHECKPOINT_PATH = Path(__file__).parent.parent / "checkpoints" / "best_model.pth"


class DeepfakeDetector:

    def __init__(self):
        self.model     = None
        self.transform = None
        self.device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_model()

    def _load_model(self):
        if not CHECKPOINT_PATH.exists():
            logger.warning(f"⚠️  No checkpoint at {CHECKPOINT_PATH} — using random scores")
            return

        try:
            from models.efficientnet_model import DeepfakeEfficientNet, get_transforms
            self.model = DeepfakeEfficientNet(pretrained=False).to(self.device)
            checkpoint = torch.load(CHECKPOINT_PATH, map_location=self.device)
            self.model.load_state_dict(checkpoint["model_state"])
            self.model.eval()
            self.transform = get_transforms(train=False)
            logger.info(f"✅ Loaded model from {CHECKPOINT_PATH} (val_acc={checkpoint.get('val_acc', '?'):.3f})")
        except Exception as e:
            logger.error(f"❌ Could not load model: {e}")
            self.model = None

    def predict_face(self, face: np.ndarray) -> float:
        """Returns probability that face is FAKE (0=real, 1=fake)."""
        if self.model is None or self.transform is None:
            return float(np.random.random())  # fallback

        try:
            tensor = self.transform(face).unsqueeze(0).to(self.device)
            with torch.no_grad():
                prob = self.model(tensor).item()
            return prob
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return float(np.random.random())

    def predict_video(self, faces: List[Optional[np.ndarray]]) -> Dict:
        valid_faces = [f for f in faces if f is not None]

        if not valid_faces:
            return {
                "verdict":          "NO_FACES",
                "confidence":       0.0,
                "fake_probability": 0.0,
                "frames_analyzed":  0,
                "model_used":       "none"
            }

        predictions = [self.predict_face(f) for f in valid_faces]
        avg_fake    = float(np.mean(predictions))
        model_used  = "efficientnet" if self.model else "random_placeholder"

        if avg_fake > 0.7:
            verdict, confidence = "FAKE",      avg_fake
        elif avg_fake < 0.3:
            verdict, confidence = "AUTHENTIC", 1.0 - avg_fake
        else:
            verdict, confidence = "SUSPICIOUS", 0.5

        return {
            "verdict":          verdict,
            "confidence":       round(confidence, 4),
            "fake_probability": round(avg_fake, 4),
            "frames_analyzed":  len(valid_faces),
            "model_used":       model_used
        }
    