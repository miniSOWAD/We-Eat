$ErrorActionPreference = "Stop"

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Error "Virtual environment is missing. Run .\setup_windows.ps1 first."
}
if (-not (Test-Path ".env")) {
    Write-Error ".env is missing. Copy .env.example to .env and configure it."
}

& .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
