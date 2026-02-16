from fastapi import FastAPI

app = FastAPI(title="TruthLens API")

@app.get("/")
def home():
    return {"message": "TruthLens Backend Running!"}

@app.get("/api/v1/health")
def health():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/creator")
def creator():
    return {
        "name": "Devika.S & E. Thanusree",
        "project": "TruthLens",
        "college": "MVJ College of Engineering"
    }
