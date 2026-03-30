FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 1: CPU PyTorch (~800MB instead of ~2.5GB)
RUN pip install --no-cache-dir \
    torch==2.1.0 torchvision==0.16.0 \
    --index-url https://download.pytorch.org/whl/cpu

# Step 2: Replace mtcnn with facenet-pytorch (no TensorFlow dependency!)
RUN pip install --no-cache-dir facenet-pytorch

# Step 3: Rest of deps
RUN pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn==0.27.0 \
    opencv-python-headless==4.9.0.80 \
    pillow==10.3.0 \
    numpy==1.24.3 \
    timm==0.9.12 \
    scikit-learn==1.4.0 \
    matplotlib==3.8.2 \
    tqdm==4.66.1 \
    pytest==7.4.4 \
    httpx==0.27.0 \
    python-jose==3.3.0 \
    passlib==1.7.4 \
    bcrypt==4.1.2 \
    python-multipart==0.0.9 \
    python-dotenv==1.0.0

COPY backend/app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]