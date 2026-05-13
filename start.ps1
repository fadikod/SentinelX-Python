# SentinelX startup script
# Run from the project root: .\start.ps1

Write-Host "Starting SentinelX (Django + React)..." -ForegroundColor Cyan

# Start Django backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python manage.py runserver 8000" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start React frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "First-time setup:" -ForegroundColor Yellow
Write-Host "  cd backend && pip install -r requirements.txt" -ForegroundColor Yellow
Write-Host "  python manage.py migrate" -ForegroundColor Yellow
Write-Host "  cd ../client && npm install" -ForegroundColor Yellow
