FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

# Install system dependencies if any are needed for easyocr/opencv
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install uvicorn

COPY . .

# Expose FastAPI port
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
