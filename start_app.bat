@echo off
echo ==========================================
echo   SBD SOLUTION - ONE-CLICK STARTUP
echo ==========================================
echo.
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo Done.
echo.

echo Starting Backend Server (Port 3001)...
start "SBD Backend" /D "backend" npm run start:dev
timeout /t 5 >nul

echo Starting Frontend Server (Port 3000)...
start "SBD Frontend" /D "frontend" npm run dev

echo.
echo ==========================================
echo   System is starting up...
echo   Please wait ~30 seconds for both windows to initialize.
echo   You can minimize the command windows but DO NOT CLOSE THEM.
echo ==========================================
pause
