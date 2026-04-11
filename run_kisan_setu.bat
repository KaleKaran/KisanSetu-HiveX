@echo off
setlocal
:: Change to the folder where the bat file is
cd /d "%~dp0"

cls
echo ====================================================
echo  Kisan-Setu Multi-Sequence Launcher
echo ====================================================

echo [1/3] Attempting to start Backend...
cd /d "%~dp0Kisan-Setu_Backend"
:: Use a simpler start command
start "Kisan-Setu_Backend" cmd /k "echo BACKEND STARTING... & conda run -p C:\Anaconda\envs\RKdemy\RKdemy --no-capture-output python app.py"

echo.
echo [2/3] Attempting to start Frontend...
:: Delay so the OS doesn't choke on two starts at once
timeout /t 2 /nobreak > nul
cd /d "%~dp0Kisan-Setu_Frontend"
start "Kisan-Setu_Frontend" cmd /k "echo FRONTEND STARTING... & npm run dev"

echo.
echo [3/3] Waiting for systems to initialize (15s)...
timeout /t 15 /nobreak > nul
echo Opening browser to http://localhost:5173...
start http://localhost:5173

echo.
echo ====================================================
echo  LAUNCHER FINISHED SUCCESSFULLY
echo  If one window didn't open, check any error above.
echo ====================================================
pause
