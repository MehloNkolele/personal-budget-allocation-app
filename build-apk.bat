@echo off
echo Building APK for Budget Tracker Pro...
echo.

REM Set Java path
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Java is not installed or not in PATH.
    echo.
    echo Please install Java JDK 11 or higher from:
    echo https://adoptium.net/temurin/releases/
    echo.
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

echo Java is installed. Proceeding with build...
echo.

REM Build the web app first
echo Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build web app
    pause
    exit /b 1
)

REM Sync with Capacitor
echo Syncing with Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo Failed to sync with Capacitor
    pause
    exit /b 1
)

REM Build the APK
echo Building Android APK...
cd android
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo Failed to build APK
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo APK BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your APK file is located at:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo To install on your phone:
echo 1. Enable "Developer Options" and "USB Debugging" on your phone
echo 2. Connect your phone to computer via USB
echo 3. Copy the APK file to your phone
echo 4. Install the APK (you may need to enable "Install from unknown sources")
echo.
echo Or you can use ADB to install directly:
echo adb install android\app\build\outputs\apk\release\app-release.apk
echo.
pause
