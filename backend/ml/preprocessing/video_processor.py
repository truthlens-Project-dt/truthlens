"""
Video processing for deepfake detection.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import List
import logging
from mtcnn import MTCNN

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VideoProcessor:
    """Extract frames and detect faces from videos."""

    def __init__(self, fps: int = 5):
        self.fps = fps
        self.face_detector = MTCNN()
        logger.info(f"VideoProcessor ready: {fps} FPS")

    def extract_frames(self, video_path: str) -> List[np.ndarray]:
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(f"Cannot open: {video_path}")

        video_fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logger.info(f"Video: {video_fps} FPS, {total_frames} frames")

        skip = int(video_fps / self.fps) if video_fps > 0 else 1

        frames = []
        frame_num = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_num % skip == 0:
                frames.append(frame)

            frame_num += 1

        cap.release()
        logger.info(f"Extracted {len(frames)} frames total")

        return frames

    def detect_face(self, frame: np.ndarray):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        detections = self.face_detector.detect_faces(rgb_frame)

        if not detections:
            return None

        x, y, w, h = detections[0]['box']

        padding = int(0.1 * max(w, h))
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = w + 2 * padding
        h = h + 2 * padding

        face = rgb_frame[y:y+h, x:x+w]
        face = cv2.resize(face, (224, 224))

        return face

    def process_video(self, video_path: str):
        logger.info(f"Processing: {video_path}")

        frames = self.extract_frames(video_path)

        faces = []
        for i, frame in enumerate(frames):
            face = self.detect_face(frame)
            faces.append(face)

        face_count = sum(1 for f in faces if f is not None)
        logger.info(f"Faces detected: {face_count}/{len(frames)}")

        return frames, faces


if __name__ == "__main__":
    processor = VideoProcessor(fps=5)

    test_video = "../../../data/sample_videos/test.mp4"

    if Path(test_video).exists():
        frames, faces = processor.process_video(test_video)

        print(f"\n✅ Results:")
        print(f"   Frames: {len(frames)}")
        print(f"   Faces: {sum(1 for f in faces if f is not None)}")

        if faces and faces[0] is not None:
            cv2.imwrite("face.jpg", cv2.cvtColor(faces[0], cv2.COLOR_RGB2BGR))
            print(f"   Saved: face.jpg")
    else:
        print("❌ Need test video!")
