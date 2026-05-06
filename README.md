# 🛡️ TruthLens

## Real-Time Multi-Modal Deepfake Detection System  
**Towards Explainable and Accessible Deepfake Detection**

---

##  Overview

**TruthLens** is a real-time deepfake detection system designed to analyze video content using multiple signals instead of relying on a single model.

It evaluates:

-  Visual inconsistencies  
-  Audio anomalies  
-  Lip-sync mismatches  

These signals are combined to produce:

-  Final Verdict: *Authentic / Suspicious / Likely Fake*  
-  Confidence Score  
-  Explainable Output (reasons and flags)

---

##  Features

- Multi-modal detection (video + audio + lip-sync)
- Fast processing (~2–5 seconds)
- Explainable results (not just predictions)
- Clean and interactive UI
- Optional detection history (extensible)

---


##  How It Works

```
Upload Video
    ↓
Frame Extraction
    ↓
Visual Analysis
    ↓
Audio Analysis
    ↓
Lip Sync Detection
    ↓
Score Fusion
    ↓
Final Result
```

---

##  Sample Output

```json
{
  "verdict": "Likely Fake",
  "confidence": 0.82,
  "breakdown": {
    "video": 0.85,
    "audio": 0.60,
    "lip_sync": 0.75
  },
  "flags": ["Lip-sync mismatch", "Audio anomaly"],
  "reason": "Audio does not align with lip movement",
  "processing_time": "2.1s"
}
```

---

##  Tech Stack

### Frontend
- React  
- Axios  
- Tailwind CSS  
- Framer Motion  

### Backend
- FastAPI  
- Python  

### Database (Optional)
- SQLite  
- SQLAlchemy  

### Deployment
- Vercel (Frontend)  
- Google Cloud Run (Backend)

---

##  Project Structure

```
truthlens/
│
├── frontend-web/        # React frontend
├── backend/             # FastAPI backend
│   ├── app/
│   └── requirements.txt
│
└── README.md
```

---

##  Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/truthlens-Project-dt/truthlens.git
cd truthlens
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### 3. Frontend Setup (React)

```bash
cd frontend-web
npm install
```

Run the frontend:

```bash
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

### 4. Connect Frontend to Backend

Set API endpoint to:

```
http://127.0.0.1:8000/api/detect
```

---

### 5. Test the Application

- Open frontend in browser  
- Upload a video  
- Click **Analyze**  

View:
- Verdict  
- Confidence  
- Explanation  

---

##  Optional: Docker Setup

```bash
cd backend
docker build -t truthlens-backend .
docker run -p 8000:8000 truthlens-backend
```

---

##  Deployment

### Frontend (Vercel)

```bash
vercel deploy --prod
```

### Backend (Google Cloud Run)

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/truthlens-backend

gcloud run deploy truthlens-backend \
  --image gcr.io/YOUR_PROJECT_ID/truthlens-backend \
  --platform managed \
  --allow-unauthenticated
```

---

##  Applications

- Social media verification  
- Journalism fact-checking  
- Cybersecurity awareness  
- Deepfake education  

---

##  Advantages

- More reliable than single-model detection  
- Explainable results  
- Fast and accessible  
- Lightweight system  

---

##  Future Scope

- Improved ML accuracy  
- Mobile application  
- Browser extension  
- Platform integrations  

---

##  Conclusion

Deepfakes are increasing rapidly and pose real-world risks.  
**TruthLens** provides a practical, fast, and explainable solution for detecting manipulated media.

---

##  Team

- Devika S  
- E Thanusree  
