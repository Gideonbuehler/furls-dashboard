# FURLS Dashboard Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting FURLS Dashboard..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
$nodeVersion = & node --version
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green

# Start Backend Server
Write-Host ""
Write-Host "📦 Starting Backend Server (port 3002)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\gideo\source\repos\FURLS\Dashboard"
    npm start
}
Write-Host "✓ Backend started (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Wait a moment for backend to initialize
Start-Sleep -Seconds 2

# Start Frontend Server with explicit node path
Write-Host ""
Write-Host "🌐 Starting Frontend Server (port 5173)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\gideo\source\repos\FURLS\Dashboard\client"
    & "C:\Program Files\nodejs\node.exe" node_modules\vite\bin\vite.js
}
Write-Host "✓ Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Wait for frontend to start
Start-Sleep -Seconds 3

# Check if servers are running
Write-Host ""
Write-Host "🔍 Checking server status..." -ForegroundColor Yellow

$backendRunning = Test-NetConnection -ComputerName localhost -Port 3002 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($backendRunning) {
    Write-Host "✓ Backend: http://localhost:3002 - Running" -ForegroundColor Green
} else {
    Write-Host "✗ Backend: Not responding" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "✓ Frontend: http://localhost:5173 - Running" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend: Not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ FURLS Dashboard is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Dashboard URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Open browser
Start-Process "http://localhost:5173"

# Keep script running and show job output
Write-Host ""
Write-Host "📝 Server Logs:" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

try {
    while ($true) {
        # Check backend output
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            Write-Host "[Backend] $backendOutput" -ForegroundColor Blue
        }
        
        # Check frontend output
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            Write-Host "[Frontend] $frontendOutput" -ForegroundColor Magenta
        }
        
        Start-Sleep -Milliseconds 500
    }
} finally {
    # Cleanup on exit
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✓ Servers stopped" -ForegroundColor Green
}
