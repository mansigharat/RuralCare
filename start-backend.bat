@echo off
echo ============================================================
echo  RuralCare - Backend Startup
echo ============================================================
echo.

cd /d "%~dp0backend"

echo [1/3] Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found. Install from https://python.org
    pause
    exit /b
)

echo.
echo [2/3] Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo [3/3] Starting FastAPI backend on http://localhost:8000
echo        Swagger docs: http://localhost:8000/docs
echo        Press Ctrl+C to stop.
echo.
python main.py

pause
