@echo off
echo ========================================
echo   Court Management System - Auto Build
echo ========================================
echo.

echo [INFO] Changing directory to project folder...
cd /d "C:\Users\LENOVO\Documents\GitHub\court-marshal-connect"

echo [INFO] Current directory: %cd%
echo.

echo [INFO] Checking if package.json exists...
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo [ERROR] Make sure you're in the correct project directory.
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting build process...
echo.

npm run build

echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] ✅ Build completed successfully!
    echo [INFO] Build files are ready in the 'build' folder.
    echo.
    echo [INFO] You can now deploy to Netlify:
    echo 1. Go to https://app.netlify.com/sites/cojm/deploys
    echo 2. Drag the 'build' folder to deploy
    echo.
) else (
    echo [ERROR] ❌ Build failed with error code %ERRORLEVEL%
    echo [ERROR] Please check the error messages above.
    echo.
)

echo Press any key to exit...
pause >nul