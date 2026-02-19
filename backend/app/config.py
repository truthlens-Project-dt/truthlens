"""
Shared config and logging setup.
File: backend/app/config.py
"""
import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        datefmt="%H:%M:%S"
    )

# App-wide settings
MAX_FILE_SIZE_MB = 100
ALLOWED_VIDEO_EXT = [".mp4", ".avi", ".mov"]
ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png"]
VIDEO_EXTRACT_FPS = 5
FACE_SIZE = (224, 224)
