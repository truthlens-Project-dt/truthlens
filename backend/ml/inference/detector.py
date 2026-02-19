"""
Deepfake detector (placeholder for now).
"""
import numpy as np
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DeepfakeDetector:
    """Detect deepfakes."""
    
    def __init__(self):
        logger.info("Detector ready (placeholder mode)")
    
    def predict_face(self, face: np.ndarray) -> float:
        """
        Predict if face is fake.
        
        Returns:
            Probability of being fake (0-1)
        """
        # PLACEHOLDER: Random for now
        # Week 3: Real model here
        return np.random.random()
    
    def predict_video(self, faces: List[Optional[np.ndarray]]) -> Dict:
        """
        Predict if video is deepfake.
        
        Args:
            faces: List of faces from video
            
        Returns:
            Results dictionary
        """
        # Remove None (frames without faces)
        valid_faces = [f for f in faces if f is not None]
        
        if not valid_faces:
            return {
                "verdict": "NO_FACES",
                "confidence": 0.0,
                "fake_probability": 0.0,
                "frames_analyzed": 0
            }
        
        # Get predictions
        predictions = [self.predict_face(f) for f in valid_faces]
        avg_fake = np.mean(predictions)
        
        # Determine verdict
        if avg_fake > 0.7:
            verdict = "FAKE"
            confidence = avg_fake
        elif avg_fake < 0.3:
            verdict = "AUTHENTIC"
            confidence = 1 - avg_fake
        else:
            verdict = "SUSPICIOUS"
            confidence = 0.5
        
        return {
            "verdict": verdict,
            "confidence": float(confidence),
            "fake_probability": float(avg_fake),
            "frames_analyzed": len(valid_faces)
        }