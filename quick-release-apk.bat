@echo off
echo ========================================
echo Quick Release APK Build - Budget Tracker Pro
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH.
    echo Please install Java JDK 11 or higher and try again.
    pause
    exit /b 1
)

echo ✅ Java detected. Building release APK...
echo.

REM Create a temporary keystore if none exists
if not exist "android\budget-tracker-key.keystore" (
    echo 🔑 Creating temporary keystore for testing...
    cd android
    keytool -genkey -v -keystore budget-tracker-key.keystore -alias budget-tracker -keyalg RSA -keysize 2048 -validity 365 -dname "CN=Budget Tracker, OU=Test, L=Test, ST=Test, C=US" -storepass android -keypass android -noprompt
    
    echo storePassword=android > key.properties
    echo keyPassword=android >> key.properties
    echo keyAlias=budget-tracker >> key.properties
    echo storeFile=budget-tracker-key.keystore >> key.properties
    
    cd ..
    echo ✅ Temporary keystore created.
    echo.
)

REM Build web app
echo 🌐 Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Web build failed
    pause
    exit /b 1
)

REM Sync with Capacitor
echo 📱 Syncing with Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    pause
    exit /b 1
)

REM Build release APK
echo 🚀 Building release APK...
cd android
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo ERROR: APK build failed
    cd ..
    pause
    exit /b 1
)
cd ..

REM Copy to desktop
echo 📋 Copying APK to desktop...
set DESKTOP=%USERPROFILE%\Desktop
copy "android\app\build\outputs\apk\release\app-release.apk" "%DESKTOP%\BudgetTrackerPro-Release.apk"

echo.
echo ========================================
echo ✅ SUCCESS! Release APK Built
echo ========================================
echo.
echo 📱 APK Location: %DESKTOP%\BudgetTrackerPro-Release.apk
echo.
echo 📲 Install on Android:
echo    1. Enable "Install from unknown sources" in Settings
echo    2. Transfer APK to phone and tap to install
echo.
pause
