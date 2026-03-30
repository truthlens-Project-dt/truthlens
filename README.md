# TruthLens — Deepfake Detection System

> Created by **Devika S & E Thanusree** — MVJ College of Engineering

---

##  Project Structure

```
truthlens/
├── .gitignore
├── backend/
│   ├── __init__.py
│   ├── requirements.txt
│   ├── API_DOCS.md
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── config.py
│   └── ml/
│       ├── __init__.py
│       ├── preprocessing/
│       │   ├── __init__.py
│       │   └── video_processor.py
│       └── inference/
│           ├── __init__.py
│           └── detector.py
├── frontend-web/
│   ├── README.md
│   └── src/
│       ├── App.js
│       ├── App.css
│       └── components/
│           ├── VideoUpload.js
│           └── VideoUpload.css
└── data/
    └── sample_videos/
        └── test.mp4
```

---

##  Backend Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
```

### 2. Install Dependencies
```bash
pip install --upgrade pip
pip install fastapi==0.109.0
pip install uvicorn==0.27.0
pip install opencv-python==4.9.0.80
pip install mtcnn==0.1.1
pip install pillow==10.2.0
pip install numpy==1.24.3
```

Or install from requirements file:
```bash
pip install -r backend/requirements.txt
```

### 3. Run Server
```bash
cd backend/app
uvicorn main:app --reload
```

### 4. Test Endpoints

| URL | Description |
|-----|-------------|
| `http://localhost:8000` | Root — server status |
| `http://localhost:8000/api/v1/health` | Health check |
| `http://localhost:8000/docs` | Swagger UI (auto-generated) |

---

##  Frontend Setup

```bash
cd frontend-web
npm install
npm install axios
npm install react-dropzone
npm start
```

Visit: `http://localhost:3000`

### Features
- Drag-and-drop video upload (MP4, AVI, MOV — max 100 MB)
- Real-time upload progress feedback
- Result card: verdict, confidence, fake probability, frame count, processing time
- Error handling with dismiss button
- "Try Another Video" reset button
- Responsive dark gradient UI

---

##  API Reference

### `GET /api/v1/health`
Returns status of all components.

### `POST /api/v1/detect/video`
Upload a video for deepfake analysis.

**Request:** `multipart/form-data` with field `file`
**Accepted:** `.mp4`, `.avi`, `.mov` (max 100 MB)

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

| Verdict | Meaning |
|---------|---------|
| `AUTHENTIC` | Real video (fake probability < 30%) |
| `FAKE` | Deepfake detected (fake probability > 70%) |
| `SUSPICIOUS` | Uncertain (30–70%) |
| `NO_FACES` | No faces found in video |
| `DEMO_MODE` | ML not loaded — placeholder response |

**Error codes:** `400` wrong type · `413` too large · `422` unprocessable · `500` server error

---

##  Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI + Uvicorn |
| Video Processing | OpenCV |
| Face Detection | MTCNN |
| Frontend | React 18 |
| HTTP Client | Axios |
| Upload UI | react-dropzone |

---
