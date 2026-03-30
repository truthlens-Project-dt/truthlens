"""
Push notification tokens storage.
File: backend/app/notifications.py
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from .database import Base
from datetime import datetime


class PushToken(Base):
    __tablename__ = "push_tokens"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    token      = Column(String, unique=True, nullable=False)
    platform   = Column(String)   # 'ios' | 'android'
    created_at = Column(DateTime, default=datetime.utcnow)