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

##  Development Log

### Feb 11 (Day 1) — Setup + First Working Code

**Backend**
- Python environment and project folder structure created
- `main.py` with basic FastAPI routes (`/` and `/health`)
- `video_processor.py` — frame extraction + face detection via MTCNN
- `detector.py` — placeholder verdict system (real model coming Week 3)
- Full `/detect/video` endpoint wired up with file upload support

**Frontend**
- React app initialized with `create-react-app`
- Basic UI: gradient background, upload button, feature cards
- `VideoUpload.js` component with drag-drop, file validation, API call
- Result card showing verdict, confidence, frame stats

**Both**
- End-to-end test: upload video → receive verdict on screen
- Code pushed to GitHub

---

### Feb 12 (Day 2) — Stability + Polish

**Backend**
- `.gitignore` added — excludes `venv/`, `uploads/`, `node_modules/`, `*.pth`
- `__init__.py` files created in all packages
- `config.py` added with shared constants (max size, allowed extensions, FPS)
- API tested with `curl`

**Frontend**
- `frontend-web/README.md` created
- Frontend file size guard added (rejects >100 MB before upload starts)
- "Supports: MP4, AVI, MOV — Max 100 MB" hint text added under dropzone

---

### Feb 13 (Day 3) — End-to-End Testing + Bug Fixes

**Backend**
- Tested with 3 different videos (close-up, multiple people, low light)
- `processing_time_sec` added to API response
- Edge cases tested: wrong file type → 400 error, no faces → `NO_FACES` verdict

**Frontend**
- Processing time displayed in result card
- "Try Another Video" button resets the UI
- All 4 verdict types verified in the UI

---

### Feb 14 (Day 4) — Wrap Up + Demo Prep

**Backend**
- `API_DOCS.md` written with full endpoint reference

**Both**
- Folder structure verified against expected layout
- End-to-end demo rehearsed
- All code pushed to GitHub

---

##  Checklist by Day

### Day 1
- [x] Backend runs at `http://localhost:8000`
- [x] `video_processor.py` extracts frames and detects faces
- [x] `detector.py` returns verdict + confidence JSON
- [x] React app runs at `http://localhost:3000`
- [x] Drag-drop works and sends file to backend
- [x] Result card displays on screen

### Day 2
- [x] `.gitignore` committed
- [x] All `__init__.py` files created
- [x] `config.py` with shared settings
- [x] Frontend validates file size before upload

### Day 3
- [x] Tested 3 different videos — all return valid JSON
- [x] Processing time in API response and UI
- [x] Wrong file type returns 400 (not a crash)
- [x] "Try Another Video" button works

### Day 4
- [x] `API_DOCS.md` written and pushed
- [x] Folder structure matches expected layout
- [x] Demo rehearsed end-to-end
- [x] All code on GitHub

---

##  Coming Next (Week 2 — Feb 17–18)

- **Backend:** PyTorch setup, FaceForensics++ dataset, EfficientNet model training
- **Frontend:** Upload progress bar, animated confidence bar in ResultCard, React Native setup

---

##  Quick Commands

```bash
# Start backend
cd backend/app && uvicorn main:app --reload

# Start frontend
cd frontend-web && npm start

# Test API with curl
curl http://localhost:8000/api/v1/health
curl -X POST http://localhost:8000/api/v1/detect/video -F "file=@data/sample_videos/test.mp4"

# Git
git add . && git commit -m "your message" && git push
```
