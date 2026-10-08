@echo off
setlocal
cd /d "%~dp0"
echo.
echo ========================================
echo   BALLOT - Secure Voting Frontend
echo ========================================
echo.
if not exist node_modules (
  echo Installing dependencies for the first run...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Make sure Node.js and internet access are available.
    pause
    exit /b 1
  )
)
echo.
echo Starting BALLOT...
echo Open the localhost URL shown below.
echo.
call npm run dev
pause
