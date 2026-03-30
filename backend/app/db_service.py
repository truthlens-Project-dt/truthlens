"""
Database operations for detections.
File: backend/app/db_service.py
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import Detection   # ✅ FIXED IMPORT
from datetime import datetime
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


def save_detection(db: Session, result: dict, user_id: int = None) -> Detection:
    detection = Detection(
        user_id=user_id,
        request_id=result.get("request_id", "unknown"),
        filename=result.get("filename", ""),
        verdict=result.get("verdict", ""),
        confidence=result.get("confidence", 0.0),
        fake_probability=result.get("fake_probability", 0.0),
        frames_analyzed=result.get("frames_analyzed", 0),
        total_frames=result.get("total_frames", 0),
        processing_time_sec=result.get("processing_time_sec", 0.0),
        file_size_mb=result.get("file_size_mb", 0.0),
        model_used=result.get("model_used", "unknown"),
        timestamp=datetime.utcnow(),
    )

    db.add(detection)
    db.commit()
    db.refresh(detection)

    logger.info(f"Saved detection {detection.request_id} to DB")
    return detection


def get_history(db: Session, limit: int = 20, offset: int = 0,
                user_id: int = None):
    query = db.query(Detection).order_by(Detection.timestamp.desc())
    if user_id is not None:
        query = query.filter(Detection.user_id == user_id)
    return query.offset(offset).limit(limit).all()



def get_stats(db: Session, user_id: int = None) -> dict:
    query = db.query(Detection)
    if user_id is not None:
        query = query.filter(Detection.user_id == user_id)
    total = query.count()
    if total == 0:
        return {"total_detections": 0}

    verdicts = query.with_entities(
        Detection.verdict, func.count(Detection.verdict)
    ).group_by(Detection.verdict).all()

    avg_time = query.with_entities(func.avg(Detection.processing_time_sec)).scalar() or 0
    avg_conf = query.with_entities(func.avg(Detection.confidence)).scalar() or 0

    return {
        "total_detections":    total,
        "verdict_breakdown":   {v: c for v, c in verdicts},
        "avg_processing_time": round(float(avg_time), 2),
        "avg_confidence":      round(float(avg_conf), 2),
    }


def get_detection_by_id(db: Session, request_id: str) -> Optional[Detection]:
    return (
        db.query(Detection)
        .filter(Detection.request_id == request_id)
        .first()
    )
def delete_all_detections(db: Session) -> int:
    count = db.query(Detection).count()
    db.query(Detection).delete()
    db.commit()
    return count