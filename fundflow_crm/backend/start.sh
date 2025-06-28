#!/bin/bash
set -e

echo "=== FundFlow CRM Backend Startup ==="
echo "Port: ${PORT:-8000}"
echo "Environment: ${RAILWAY_ENVIRONMENT:-development}"
echo "Python version: $(python --version)"
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

echo "=== Starting uvicorn server ==="
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info
