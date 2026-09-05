@echo off
echo ============================================================
echo  RuralCare - Frontend Startup
echo ============================================================
echo.

cd /d "%~dp0frontend"

:: Temporarily add Node.js to PATH just in case it's not set globally
set PATH=%PATH%;C:\Program Files\nodejs

echo [1/2] Installing npm packages (first run only)...
call npm install

echo.
echo [2/2] Starting Vite dev server on http://localhost:5173
echo        Press Ctrl+C to stop.
echo.
call npm run dev

pause
