"""
TruthLens - Complete Backend API
File: backend/app/main.py
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil
import sys
import logging
from datetime import datetime

# This lets Python find your ml/ folder
# because ml/ is in backend/, not backend/app/
sys.path.append(str(Path(__file__).parent.parent))

# Import your ML modules
# These files must exist:
#   backend/ml/preprocessing/video_processor.py
#   backend/ml/inference/detector.py
try:
    from ml.preprocessing.video_processor import VideoProcessor
    from ml.inference.detector import DeepfakeDetector
    ML_LOADED = True
except ImportError as e:
    print(f"⚠️  Could not load ML modules: {e}")
    print("    Make sure video_processor.py and detector.py exist")
    ML_LOADED = False


# ─────────────────────────────────────────────
# LOGGING SETUP
# Logs show in your terminal so you can see
# what's happening when videos are uploaded
# ─────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# CREATE FASTAPI APP
# This is your web server
# ─────────────────────────────────────────────

app = FastAPI(
    title="TruthLens API",
    description="AI-powered deepfake detection backend",
    version="1.0.0",
    # Swagger docs available at: http://localhost:8000/docs
)

# CORS MIDDLEWARE
# CORS = Cross-Origin Resource Sharing
# Without this, your React app (localhost:3000)
# cannot talk to this backend (localhost:8000)
# The browser blocks it for security reasons.
# This middleware tells the browser "it's ok!"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React dev server
        "http://127.0.0.1:3000",  # Alternative localhost
        "*"                        # Allow all (for development)
    ],
    allow_credentials=True,
    allow_methods=["*"],           # Allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],           # Allow all headers
)

# FOLDER SETUP
# Uploaded videos are saved here temporarily,
# then deleted after processing

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
logger.info(f"Upload folder: {UPLOAD_DIR.resolve()}")

# INITIALIZE ML COMPONENTS
# VideoProcessor: extracts frames from videos
# DeepfakeDetector: predicts real vs fake


if ML_LOADED:
    try:
        video_processor = VideoProcessor(fps=5)
        detector        = DeepfakeDetector()
        logger.info("✅ ML components loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize ML: {e}")
        ML_LOADED = False

# STARTUP EVENT
# Runs once when the server starts

@app.on_event("startup")
async def on_startup():
    logger.info("=" * 50)
    logger.info("🚀 TruthLens API starting...")
    logger.info(f"   ML modules loaded: {ML_LOADED}")
    logger.info(f"   Upload folder: {UPLOAD_DIR.resolve()}")
    logger.info("   Visit: http://localhost:8000")
    logger.info("   Docs:  http://localhost:8000/docs")
    logger.info("=" * 50)

# ROUTE 1: HOME
# Visit http://localhost:8000
# Quick check that server is alive

@app.get("/")
def root():
    """Home endpoint - confirms API is running."""
    return {
        "app":       "TruthLens",
        "version":   "1.0.0",
        "status":    "running",
        "docs":      "http://localhost:8000/docs",
        "timestamp": datetime.now().isoformat()
    }

# ROUTE 2: HEALTH CHECK
# Visit http://localhost:8000/api/v1/health
# Checks all components are ready

@app.get("/api/v1/health")
def health_check():
    """Detailed health check for all components."""
    return {
        "status": "healthy",
        "components": {
            "api":             "ready",
            "video_processor": "ready" if ML_LOADED else "not loaded",
            "detector":        "ready (placeholder)" if ML_LOADED else "not loaded",
            "upload_folder":   str(UPLOAD_DIR.resolve()),
        },
        "timestamp": datetime.now().isoformat()
    }


# ROUTE 3: DETECT VIDEO (MAIN ENDPOINT)
# POST http://localhost:8000/api/v1/detect/video
#
# Frontend sends a video file here.
# This endpoint:
#   1. Saves the file temporarily
#   2. Extracts frames using OpenCV
#   3. Detects faces in each frame
#   4. Runs deepfake detection
#   5. Returns result as JSON
#   6. Deletes the temp file


@app.post("/api/v1/detect/video")
async def detect_video(file: UploadFile = File(...)):
    """
    Analyze a video for deepfake content.

    Args:
        file: Video file uploaded from frontend (MP4, AVI, MOV)

    Returns:
        JSON with verdict, confidence, and analysis details
    """

    logger.info(f"📹 Received file: {file.filename}")
    logger.info(f"   Content type: {file.content_type}")

    # ── STEP 1: Validate file type ──────────────────
    allowed_extensions = [".mp4", ".avi", ".mov"]
    file_extension     = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        logger.warning(f"❌ Invalid file type: {file_extension}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file_extension}'. Allowed: {allowed_extensions}"
        )

    # ── STEP 2: Validate file size (max 100 MB) ─────
    MAX_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB
    file_content   = await file.read()
    file_size_mb   = len(file_content) / (1024 * 1024)

    if len(file_content) > MAX_SIZE_BYTES:
        logger.warning(f"❌ File too large: {file_size_mb:.1f} MB")
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({file_size_mb:.1f} MB). Max allowed: 100 MB"
        )

    logger.info(f"   File size: {file_size_mb:.2f} MB ✅")

    # ── STEP 3: Save file temporarily ───────────────
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    temp_filename = f"{timestamp}_{file.filename}"
    temp_path     = UPLOAD_DIR / temp_filename

    try:
        # Write file to disk
        with temp_path.open("wb") as buffer:
            buffer.write(file_content)

        logger.info(f"💾 Saved temporarily: {temp_path}")

        # ── STEP 4: Check if ML is loaded ───────────
        if not ML_LOADED:
            logger.warning("⚠️  ML not loaded, returning demo result")
            return JSONResponse(content={
                "verdict":          "DEMO_MODE",
                "confidence":       0.0,
                "fake_probability": 0.0,
                "frames_analyzed":  0,
                "total_frames":     0,
                "filename":         file.filename,
                "file_size_mb":     round(file_size_mb, 2),
                "timestamp":        datetime.now().isoformat(),
                "message":          "ML modules not loaded. Check video_processor.py and detector.py"
            })

        # ── STEP 5: Extract frames from video ───────
        logger.info("🔍 Extracting frames...")
        frames, faces = video_processor.process_video(str(temp_path))

        logger.info(f"   Frames extracted: {len(frames)}")
        logger.info(f"   Faces detected:   {sum(1 for f in faces if f is not None)}")

        # ── STEP 6: Run deepfake detection ──────────
        logger.info("🤖 Running deepfake detection...")
        result = detector.predict_video(faces)

        # ── STEP 7: Add extra info to result ────────
        result["filename"]     = file.filename
        result["total_frames"] = len(frames)
        result["file_size_mb"] = round(file_size_mb, 2)
        result["timestamp"]    = datetime.now().isoformat()

        logger.info(f"✅ Detection complete!")
        logger.info(f"   Verdict:    {result['verdict']}")
        logger.info(f"   Confidence: {result['confidence']:.2%}")

        return JSONResponse(content=result)

    except ValueError as e:
        # Video file can't be opened / processed
        logger.error(f"❌ Video processing error: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"Could not process video: {str(e)}"
        )

    except Exception as e:
        # Unexpected error
        logger.error(f"❌ Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

    finally:
        # ── ALWAYS delete temp file ─────────────────
        # Even if there's an error, clean up the file
        if temp_path.exists():
            temp_path.unlink()
            logger.info(f"🗑️  Temp file deleted: {temp_filename}")


# ROUTE 4: DETECT IMAGE
# POST http://localhost:8000/api/v1/detect/image
# (Coming in Week 3 - placeholder for now)

@app.post("/api/v1/detect/image")
async def detect_image(file: UploadFile = File(...)):
    """
    Analyze an image for deepfake content.
    Currently a placeholder - will be implemented in Week 3.
    """
    logger.info(f"🖼️  Image received: {file.filename}")

    # Validate file type
    allowed_extensions = [".jpg", ".jpeg", ".png"]
    file_extension     = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {allowed_extensions}"
        )

    # Placeholder response
    return JSONResponse(content={
        "verdict":          "COMING_SOON",
        "confidence":       0.0,
        "fake_probability": 0.0,
        "filename":         file.filename,
        "timestamp":        datetime.now().isoformat(),
        "message":          "Image detection coming in Week 3!"
    })

# ROUTE 5: LIST RECENT DETECTIONS
# GET http://localhost:8000/api/v1/history
# (Placeholder - database coming in Week 5)

@app.get("/api/v1/history")
def get_history():
    """
    Get recent detection history.
    Placeholder - database will be added in Week 5.
    """
    return {
        "message": "History feature coming in Week 5",
        "detections": []
    }


# ─────────────────────────────────────────────
# RUN THE SERVER
# Only runs when you execute: python main.py
# Does NOT run when imported as a module
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",       # "filename:variable_name"
        host="0.0.0.0",  # 0.0.0.0 = accessible from any device on network
        port=8000,        # Port number
        reload=True,      # Auto-restart when you save the file (great for development!)
        log_level="info"
    )