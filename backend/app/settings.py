"""
Environment-based settings.
File: backend/app/settings.py
"""

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY      = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
DATABASE_URL    = os.getenv("DATABASE_URL", "sqlite:///./truthlens.db")
MAX_FILE_MB     = int(os.getenv("MAX_FILE_SIZE_MB", "100"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
PORT            = int(os.getenv("PORT", "8000"))