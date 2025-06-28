FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only backend application code
COPY backend/ .

# Debug: List files to see what was copied
RUN echo "Files in /app:" && ls -la

# Make startup script executable if it exists
RUN chmod +x start.sh || echo "start.sh not found, will use direct uvicorn"

# Expose port
EXPOSE 8000

# Run the application with PORT environment variable support
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info"]
