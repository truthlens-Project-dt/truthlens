# TruthLens Backend

## Stack
- Python 3.9+
- FastAPI 0.109 + Uvicorn
- PyTorch 2.1 + EfficientNet-B0 (via timm)
- MTCNN (face detection)
- OpenCV (video processing)

---

## Setup

```bash
cd truthlens
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r backend/requirements.txt
```

---

## Run

```bash
cd backend
uvicorn app.main:app --reload
```

Docs: http://localhost:8000/docs

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/v1/health        | System health + model status |
| POST | /api/v1/detect/video  | Analyse video for deepfakes  |
| GET  | /api/v1/history       | Last 50 detections (in-memory) |
| GET  | /api/v1/stats         | Session aggregate stats |
| GET  | /api/v1/model/info    | Training metrics + checkpoint info |

---

## Training

```bash
# Generate synthetic data + train
cd backend/ml/training
python dataset.py
python trainer.py
python evaluator.py
```

---

## Tests

```bash
python -m pytest backend/tests/ -v
```

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py
│   └── config.py
├── ml/
│   ├── models/
│   │   └── efficientnet_model.py
│   ├── preprocessing/
│   │   └── video_processor.py
│   ├── inference/
│   │   └── detector.py
│   ├── training/
│   │   ├── dataset.py
│   │   ├── trainer.py
│   │   └── evaluator.py
│   └── checkpoints/
│       ├── best_model.pth
│       ├── training_history.json
│       ├── eval_metrics.json
│       ├── training_curves.png
│       └── confusion_matrix.png
└── tests/
    └── test_api.py
```