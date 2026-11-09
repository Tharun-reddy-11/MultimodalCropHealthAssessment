@echo off
echo =====================================================================
echo           AgroVita AI - Full-Stack Agricultural Intelligence
echo =====================================================================
echo.
echo [1/3] Starting Python FastAPI ML Service on Port 8000...
start "AgroVita - ML Service (Port 8000)" cmd /k "set PYTHONPATH=ml-service && .\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir ml-service --host 127.0.0.1 --port 8000"

echo [2/3] Starting Spring Boot Backend API on Port 9090...
start "AgroVita - Backend API (Port 9090)" cmd /k "java -jar backend\target\crop-health-backend-1.0.0.jar"

echo [3/3] Starting Vite Frontend Server on Port 5173...
start "AgroVita - Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo All AgroVita AI services launched!
echo - Web App:        http://localhost:5173
echo - Spring Boot API: http://localhost:9090
echo - FastAPI ML:     http://localhost:8000
echo =====================================================================
