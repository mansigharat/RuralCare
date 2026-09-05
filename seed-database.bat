@echo off
echo ============================================================
echo  RuralCare - Seed Demo Data
echo ============================================================
echo.
cd /d "%~dp0backend"
echo Running seed.py — this loads 15 facilities + 3 demo users...
echo.
python seed.py
echo.
pause
