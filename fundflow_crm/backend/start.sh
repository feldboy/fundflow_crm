#!/bin/bash
set -e

echo "=== FundFlow CRM Backend Startup ==="
echo "Port: ${PORT:-8000}"
echo "Environment: ${RAILWAY_ENVIRONMENT:-development}"
echo "Python version: $(python --version)"
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

# Set default environment variables if not set
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-https://fundflow-crm.vercel.app,https://fundflow-f48671lhy-yarons-projects-601a79ac.vercel.app}"
echo "ALLOWED_ORIGINS: $ALLOWED_ORIGINS"

# Test if main.py exists
if [ ! -f "main.py" ]; then
    echo "ERROR: main.py not found!"
    exit 1
fi

echo "=== Testing basic Python import ==="
python -c "import sys; print('Python executable:', sys.executable)"

echo "=== Testing FastAPI import ==="
python -c "import fastapi; print('FastAPI version:', fastapi.__version__)"

echo "=== Testing main.py import ==="
python -c "import main; print('main.py imports successfully')" || {
    echo "main.py import failed, trying simple version..."
    if [ -f "main_simple.py" ]; then
        echo "Using main_simple.py for testing..."
        exec uvicorn main_simple:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info --access-log
    else
        echo "ERROR: Neither main.py nor main_simple.py could be imported!"
        exit 1
    fi
}

echo "=== Starting uvicorn server ==="
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info --access-log
