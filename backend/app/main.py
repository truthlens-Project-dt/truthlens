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
import time
import uuid
from sqlalchemy.orm import Session
from fastapi import Depends
from .database import create_tables, get_db
from .db_service import save_detection, get_history, get_stats, get_detection_by_id


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
# Create DB tables on startup
create_tables()

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
# In-memory detection history (resets on server restart — DB comes Week 4)
from collections import deque
detection_history = deque(maxlen=50)   # Keep last 50 results

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
    from pathlib import Path
    import json

    checkpoint_path = Path(__file__).parent.parent / "ml" / "checkpoints" / "best_model.pth"
    metrics_path    = Path(__file__).parent.parent / "ml" / "checkpoints" / "eval_metrics.json"

    checkpoint_exists = checkpoint_path.exists()
    val_acc = None
    if checkpoint_exists:
        try:
            ckpt    = torch.load(checkpoint_path, map_location="cpu")
            val_acc = round(ckpt.get("val_acc", 0) * 100, 1)
        except Exception:
            pass

    eval_metrics = None
    if metrics_path.exists():
        with open(metrics_path) as f:
            eval_metrics = json.load(f)

    return {
        "status": "healthy",
        "components": {
            "api":             "ready",
            "video_processor": "ready" if ML_LOADED else "not_loaded",
            "detector":        "ready" if ML_LOADED else "not_loaded",
            "model_type":      "EfficientNet-B0" if ML_LOADED else "none",
            "checkpoint":      f"loaded (val_acc={val_acc}%)" if checkpoint_exists else "not found (using random)",
        },
        "session": {
            "detections_this_session": len(detection_history),
        },
        "eval_metrics": eval_metrics,
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
async def detect_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    request_id = str(uuid.uuid4())[:8]   # Short ID for log tracing
    start_time = time.time()
    logger.info(f"[{request_id}] 📹 Received: {file.filename}")

    allowed = [".mp4", ".avi", ".mov"]
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail={"error": f"Invalid type '{ext}'", "allowed": allowed, "request_id": request_id}
        )

    content = await file.read()
    size_mb  = len(content) / (1024 * 1024)

    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail={"error": f"File too large ({size_mb:.1f} MB)", "max_mb": 100, "request_id": request_id}
        )

    temp_path = UPLOAD_DIR / f"{request_id}_{file.filename}"
    try:
        temp_path.write_bytes(content)

        if not ML_LOADED:
            return JSONResponse(content={
                "verdict": "DEMO_MODE", "confidence": 0.0,
                "fake_probability": 0.0, "frames_analyzed": 0,
                "total_frames": 0, "filename": file.filename,
                "message": "ML not loaded", "request_id": request_id
            })

        frames, faces = video_processor.process_video(str(temp_path))
        result        = detector.predict_video(faces)

        result["filename"]            = file.filename
        result["total_frames"]        = len(frames)
        result["file_size_mb"]        = round(size_mb, 2)
        result["timestamp"]           = datetime.now().isoformat()
        result["processing_time_sec"] = round(time.time() - start_time, 2)
        result["request_id"]          = request_id

        logger.info(f"[{request_id}] ✅ {result['verdict']} ({result['confidence']:.0%}) in {result['processing_time_sec']}s")
        # Store in history
        detection_history.appendleft({
            "request_id":          result["request_id"],
            "filename":            result["filename"],
            "verdict":             result["verdict"],
            "confidence":          result["confidence"],
            "processing_time_sec": result["processing_time_sec"],
            "timestamp":           result["timestamp"],
        })
        save_detection(db, result)
        return JSONResponse(content=result)

    except ValueError as e:
        raise HTTPException(status_code=422, detail={"error": str(e), "request_id": request_id})
    except Exception as e:
        logger.error(f"[{request_id}] ❌ {e}", exc_info=True)
        raise HTTPException(status_code=500, detail={"error": str(e), "request_id": request_id})
    finally:
        if temp_path.exists():
            temp_path.unlink()


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
def get_history_endpoint(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    items = get_history(db, limit=limit, offset=offset)

    return {
        "count": len(items),
        "results": [
            {
                "request_id": d.request_id,
                "filename": d.filename,
                "verdict": d.verdict,
                "confidence": d.confidence,
                "fake_probability": d.fake_probability,
                "frames_analyzed": d.frames_analyzed,
                "processing_time_sec": d.processing_time_sec,
                "timestamp": d.timestamp.isoformat(),
            }
            for d in items
        ]
    }
@app.get("/api/v1/stats")
def get_stats_endpoint(db: Session = Depends(get_db)):
    return get_stats(db)

@app.get("/api/v1/model/info")
def model_info():
    """Return training metrics and model status."""
    import json
    from pathlib import Path

    checkpoint_dir = Path(__file__).parent.parent / "ml" / "checkpoints"
    metrics_path   = checkpoint_dir / "eval_metrics.json"
    history_path   = checkpoint_dir / "training_history.json"

    response = {
        "model":      "EfficientNet-B0",
        "status":     "loaded" if ML_LOADED else "not_loaded",
        "checkpoint": str(checkpoint_dir / "best_model.pth"),
    }

    if metrics_path.exists():
        with open(metrics_path) as f:
            response["eval_metrics"] = json.load(f)

    if history_path.exists():
        with open(history_path) as f:
            data = json.load(f)
            response["best_val_acc"]  = data.get("best_val_acc")
            response["epochs_trained"] = len(data.get("history", []))

    return JSONResponse(content=response)

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
