@echo off
if not exist .venv\Scripts\python.exe (
  echo Virtual environment missing. Run setup_windows.ps1 first.
  exit /b 1
)
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
