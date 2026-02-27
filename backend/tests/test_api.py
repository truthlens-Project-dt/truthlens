"""
Basic API tests — run with: pytest backend/tests/
File: backend/tests/test_api.py
"""

from fastapi.testclient import TestClient
import pytest
import io

# Correct import for FastAPI app
from backend.app.main import app

client = TestClient(app)


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "running"


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert "components" in data


def test_history_empty():
    r = client.get("/api/v1/history")
    assert r.status_code == 200
    assert "results" in r.json()


def test_stats_empty():
    r = client.get("/api/v1/stats")
    assert r.status_code == 200


def test_detect_wrong_extension():
    """Should return 400 for non-video file."""
    fake_file = io.BytesIO(b"not a video")

    r = client.post(
        "/api/v1/detect/video",
        files={"file": ("test.txt", fake_file, "text/plain")}
    )

    assert r.status_code == 400
    assert "Invalid type" in str(r.json())


def test_detect_no_file():
    """Should return 422 if no file attached."""
    r = client.post("/api/v1/detect/video")
    assert r.status_code == 422


def test_model_info():
    r = client.get("/api/v1/model/info")
    assert r.status_code == 200
    assert "model" in r.json()


def test_history_pagination():
    r = client.get("/api/v1/history?limit=5&offset=0")
    assert r.status_code == 200
    data = r.json()

    assert "count" in data
    assert "results" in data
    assert isinstance(data["results"], list)


def test_history_detail_not_found():
    r = client.get("/api/v1/history/nonexistent_id")
    assert r.status_code == 404


def test_delete_not_found():
    r = client.delete("/api/v1/history/nonexistent_id")
    assert r.status_code == 404


def test_stats_structure():
    r = client.get("/api/v1/stats")
    assert r.status_code == 200
    data = r.json()

    assert "total_detections" in data