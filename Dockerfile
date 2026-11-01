# --- Stage 1: Build Frontend (Vite + React + Three.js) ---
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Production Container (Python 3.11 + FastAPI + OR-Tools) ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend, datasets, and built frontend
COPY backend/ ./backend/
COPY exports/ ./exports/
COPY scripts/ ./scripts/
COPY tests/ ./tests/
COPY public/ ./public/
COPY --from=frontend-builder /app/dist ./dist

# Hugging Face Spaces non-root user setup
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PORT=7860

EXPOSE 7860

# Launch FastAPI on Hugging Face default port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
