#!/bin/bash

# Get the port from environment variable or use default
PORT="${PORT:-8080}"

# Start the application with proper settings
exec gunicorn main:app \
    --bind "0.0.0.0:$PORT" \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info 