FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc curl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create a simple startup script
RUN echo '#!/bin/bash\n\
echo "Starting FastAPI server..."\n\
echo "PORT: ${PORT:-8000}"\n\
echo "Working directory: $(pwd)"\n\
echo "Files: $(ls -la | head -5)"\n\
exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info --no-reload\n' > start.sh && chmod +x start.sh

# Expose port
EXPOSE 8000

# Start the application
CMD ["./start.sh"]
