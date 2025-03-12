#!/bin/bash

# Start the Flask backend in the background
echo "Starting Flask backend..."
cd backend
python main.py &

# Wait a few seconds for the backend to initialize
sleep 3

# Start the Next.js frontend
echo "Starting Next.js frontend..."
cd ..
npm run dev 