from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./truthlens.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True)

    filename = Column(String)
    verdict = Column(String)
    confidence = Column(Float)
    fake_probability = Column(Float)

    frames_analyzed = Column(Integer)
    total_frames = Column(Integer)

    processing_time_sec = Column(Float)
    file_size_mb = Column(Float)

    model_used = Column(String)

    timestamp = Column(DateTime, default=datetime.utcnow)


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        