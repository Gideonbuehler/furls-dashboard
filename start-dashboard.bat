@echo off
echo.
echo ====================================
echo    FURLS Dashboard Quick Start
echo ====================================
echo.

echo [1/3] Starting Backend Server...
cd /d "c:\Users\gideo\source\repos\FURLS\Dashboard"
start "FURLS Backend" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Server...
cd /d "c:\Users\gideo\source\repos\FURLS\Dashboard\client"
start "FURLS Frontend" cmd /k "\"C:\Program Files\nodejs\node.exe\" node_modules\vite\bin\vite.js"

timeout /t 3 /nobreak >nul

echo [3/3] Opening Dashboard...
start http://localhost:5173

echo.
echo ====================================
echo    Dashboard is starting!
echo ====================================
echo.
echo Backend:  http://localhost:3002
echo Frontend: http://localhost:5173
echo.
echo Two terminal windows will open.
echo Close them to stop the servers.
echo.
pause
