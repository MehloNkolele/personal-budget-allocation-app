@echo off
echo ========================================
echo Building PRODUCTION APK for Budget Tracker Pro
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH.
    echo.
    echo Please install Java JDK 11 or higher from:
    echo https://adoptium.net/temurin/releases/
    echo.
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

echo ✅ Java is installed. Proceeding with production build...
echo.

REM Check if keystore exists, if not create one
if not exist "android\budget-tracker-key.keystore" (
    echo 🔑 No keystore found. Creating production keystore...
    echo.
    echo Please provide the following information for your production keystore:
    echo (This is required for signing your APK for distribution)
    echo.
    
    set /p STORE_PASSWORD="Enter store password (remember this!): "
    set /p KEY_PASSWORD="Enter key password (remember this!): "
    set /p YOUR_NAME="Enter your name: "
    set /p ORGANIZATION="Enter organization (or press Enter to skip): "
    if "%ORGANIZATION%"=="" set ORGANIZATION=Budget Tracker Pro
    set /p CITY="Enter city: "
    set /p STATE="Enter state/province: "
    set /p COUNTRY="Enter country code (e.g., US, UK, CA): "
    
    echo.
    echo 🔧 Generating production keystore...
    
    cd android
    keytool -genkey -v -keystore budget-tracker-key.keystore -alias budget-tracker -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=%YOUR_NAME%, OU=%ORGANIZATION%, L=%CITY%, ST=%STATE%, C=%COUNTRY%" -storepass %STORE_PASSWORD% -keypass %KEY_PASSWORD%
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to generate keystore
        cd ..
        pause
        exit /b 1
    )
    
    echo storePassword=%STORE_PASSWORD% > key.properties
    echo keyPassword=%KEY_PASSWORD% >> key.properties
    echo keyAlias=budget-tracker >> key.properties
    echo storeFile=budget-tracker-key.keystore >> key.properties
    
    cd ..
    echo ✅ Keystore created successfully!
    echo.
) else (
    echo ✅ Production keystore found.
    echo.
)

REM Build the web app first
echo 🌐 Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build web app
    pause
    exit /b 1
)
echo ✅ Web app built successfully!
echo.

REM Sync with Capacitor
echo 📱 Syncing with Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo ERROR: Failed to sync with Capacitor
    pause
    exit /b 1
)
echo ✅ Capacitor sync completed!
echo.

REM Build the RELEASE APK
echo 🚀 Building PRODUCTION APK (this may take a few minutes)...
cd android
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo ERROR: Failed to build production APK
    cd ..
    pause
    exit /b 1
)

cd ..

REM Copy APK to desktop
echo 📋 Copying APK to desktop...
set DESKTOP=%USERPROFILE%\Desktop
copy "android\app\build\outputs\apk\release\app-release.apk" "%DESKTOP%\BudgetTrackerPro-v1.0.0-production.apk"
if %errorlevel% neq 0 (
    echo WARNING: Could not copy to desktop, but APK was built successfully
    echo APK location: android\app\build\outputs\apk\release\app-release.apk
) else (
    echo ✅ APK copied to desktop as: BudgetTrackerPro-v1.0.0-production.apk
)

echo.
echo ========================================
echo 🎉 PRODUCTION APK BUILD SUCCESSFUL! 🎉
echo ========================================
echo.
echo 📱 Your production-ready APK files:
echo    Desktop: %DESKTOP%\BudgetTrackerPro-v1.0.0-production.apk
echo    Original: android\app\build\outputs\apk\release\app-release.apk
echo.
echo 🔒 This APK is signed with your production keystore and ready for:
echo    ✅ Sideloading on Android devices
echo    ✅ Distribution to testers
echo    ✅ Upload to Google Play Store (after review)
echo.
echo 📲 To install on your Android phone:
echo    1. Enable "Developer Options" on your phone
echo    2. Enable "USB Debugging" and "Install from unknown sources"
echo    3. Transfer the APK file to your phone
echo    4. Tap the APK file to install
echo.
echo 💡 Or use ADB to install directly:
echo    adb install "%DESKTOP%\BudgetTrackerPro-v1.0.0-production.apk"
echo.
echo ⚠️  IMPORTANT: Keep your keystore files secure!
echo    - android\budget-tracker-key.keystore
echo    - android\key.properties
echo    These are needed for future app updates!
echo.
pause
