@echo off
echo ========================================
echo    FURLS Training Dashboard
echo ========================================
echo.
echo Checking for running processes on port 3002...

REM Kill any existing process on port 3002
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002 ^| findstr LISTENING') do (
    echo Stopping existing process (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Starting FURLS Dashboard Server...
echo.
echo Dashboard URL: http://localhost:3002
echo API URL:       http://localhost:3002/api
echo.
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"
node server/index.js

pause
