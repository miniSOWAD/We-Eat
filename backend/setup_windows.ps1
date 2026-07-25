$ErrorActionPreference = "Stop"

Write-Host "=== We Eat backend setup ===" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example." -ForegroundColor Yellow
    Write-Host "Edit DATABASE_URL, JWT_SECRET and OTP_PEPPER, then run this script again." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".venv")) {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -3 -m venv .venv
    }
    elseif (Get-Command python -ErrorAction SilentlyContinue) {
        python -m venv .venv
    }
    else {
        throw "Python 3.12 or newer was not found."
    }
}

& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
& .\.venv\Scripts\python.exe -m scripts.check_config
& .\.venv\Scripts\python.exe -m alembic upgrade head
& .\.venv\Scripts\python.exe -m scripts.check_database

Write-Host "Backend setup complete." -ForegroundColor Green
Write-Host "Start it with: .\start_dev.ps1"
