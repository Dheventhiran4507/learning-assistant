@echo off
echo ===================================================
echo   Lumina Portal - Deployment Helper
echo ===================================================
echo.
echo Step 1: Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend build failed. Please check for errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Vercel deployment failed. Make sure Vercel CLI is installed and logged in.
    echo Run: npm install -g vercel
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   SUCCESS! Your app should be live at:
echo   https://learning-assistant-beryl.vercel.app
echo ===================================================
echo.
pause
