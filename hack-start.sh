#!/bin/bash

# === Sanity check ===
if [[ ! -d "backend/.venv" ]]; then
  echo "❌ backend/.venv not found. Run python -m venv backend/.venv first."
  exit 1
fi

# === Start backend ===
echo "🚀 Starting FastAPI backend..."
source backend/.venv/bin/activate
cd backend
uvicorn app.main:app --reload &
BACK_PID=$!
cd ..

# === Start frontend ===
echo "🎨 Starting frontend (Vite)..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONT_PID=$!
cd ..

# === Wait for Ctrl+C to kill both ===
trap "echo '🛑 Shutting down...'; kill $BACK_PID $FRONT_PID" SIGINT
wait