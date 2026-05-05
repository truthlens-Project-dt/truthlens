from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class DetectionBreakdown(BaseModel):
    video: float
    audio: float
    lip_sync: float

class DetectionResult(BaseModel):
    verdict: str
    confidence: float
    breakdown: DetectionBreakdown
    flags: List[str]
    reason: str
    processing_time: str

class BatchResult(BaseModel):
    filename: str
    verdict: str
    confidence: float

class HistoryItem(BaseModel):
    id: int
    filename: str
    verdict: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True
