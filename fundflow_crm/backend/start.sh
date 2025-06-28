#!/bin/bash
set -e

echo "=== FundFlow CRM Backend Startup ==="
echo "Port: ${PORT:-8000}"
echo "Environment: ${RAILWAY_ENVIRONMENT:-development}"
echo "Python version: $(python --version)"
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

# Test if main.py exists
if [ ! -f "main.py" ]; then
    echo "ERROR: main.py not found!"
    exit 1
fi

echo "=== Testing basic Python import ==="
python -c "import sys; print('Python executable:', sys.executable)"

echo "=== Testing FastAPI import ==="
python -c "import fastapi; print('FastAPI version:', fastapi.__version__)"

echo "=== Starting uvicorn server ==="
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info --access-log
