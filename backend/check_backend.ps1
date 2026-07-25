$ErrorActionPreference = "Stop"

Write-Host "Checking FastAPI..." -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
$ready = Invoke-RestMethod -Uri "http://127.0.0.1:8000/ready"

$health | ConvertTo-Json
$ready | ConvertTo-Json
Write-Host "Open API docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
