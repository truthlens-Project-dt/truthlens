# TruthLens API Documentation

## Base URL
http://localhost:8000

## Endpoints

### GET /
Check if server is running.
**Response:** `{"app": "TruthLens", "status": "running"}`

---

### GET /api/v1/health
Check all components.
**Response:**
```json
{
  "status": "healthy",
  "components": {
    "api": "ready",
    "video_processor": "ready",
    "detector": "ready (placeholder)"
  }
}
```

---

### POST /api/v1/detect/video
Analyse a video for deepfakes.

**Request:** multipart/form-data
- `file`: video file (.mp4, .avi, .mov) — max 100 MB

**Response:**
```json
{
  "verdict": "AUTHENTIC",
  "confidence": 0.85,
  "fake_probability": 0.15,
  "frames_analyzed": 45,
  "total_frames": 50,
  "filename": "test.mp4",
  "file_size_mb": 12.3,
  "processing_time_sec": 3.2,
  "timestamp": "2026-02-14T10:30:00"
}
```

**Verdict values:**
- `AUTHENTIC` — real video (fake_probability < 0.3)
- `FAKE` — deepfake detected (fake_probability > 0.7)
- `SUSPICIOUS` — uncertain (0.3–0.7)
- `NO_FACES` — no faces found in video
- `DEMO_MODE` — ML not loaded, placeholder response

**Error codes:**
- `400` — wrong file type
- `413` — file too large
- `422` — video can't be processed
- `500` — server error

---

### POST /api/v1/detect/image
*(Coming Week 3)*

### GET /api/v1/history
*(Coming Week 5)*