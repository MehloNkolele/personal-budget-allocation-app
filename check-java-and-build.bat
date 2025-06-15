@echo off
echo ========================================
echo Budget Tracker APK Builder
echo ========================================

echo Checking Java version...
java -version 2>&1 | findstr "21" >nul
if %errorlevel% == 0 (
    echo ✅ Java 21 detected! Proceeding with build...
    goto :build_apk
) else (
    echo ❌ Java 21 not found!
    echo.
    echo Current Java version:
    java -version 2>&1
    echo.
    echo ========================================
    echo JAVA 21 REQUIRED
    echo ========================================
    echo.
    echo Capacitor 7.x requires Java 21, but you have a different version.
    echo.
    echo Please install Java 21:
    echo 1. Go to: https://adoptium.net/temurin/releases/?version=21
    echo 2. Download OpenJDK 21 (LTS) for Windows x64
    echo 3. Install the .msi file
    echo 4. Restart Command Prompt
    echo 5. Run this script again
    echo.
    echo Alternative quick install with winget:
    echo   winget install EclipseAdoptium.Temurin.21.JDK
    echo.
    echo See JAVA21_INSTALL_AND_BUILD_GUIDE.md for detailed instructions.
    echo.
    pause
    exit /b 1
)

:build_apk
echo Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build web app
    pause
    exit /b 1
)

echo Syncing with Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Failed to sync with Capacitor
    pause
    exit /b 1
)

echo Building Android APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ❌ Failed to build APK
    echo.
    echo If you're still getting Java version errors:
    echo 1. Make sure Java 21 is properly installed
    echo 2. Restart your computer
    echo 3. Try again
    cd ..
    pause
    exit /b 1
)

cd ..

echo ========================================
echo ✅ APK BUILD SUCCESSFUL!
echo ========================================

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo APK Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Copying APK to Desktop...
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\BudgetTracker-debug.apk" >nul
    if %errorlevel% == 0 (
        echo ✅ APK copied to Desktop as: BudgetTracker-debug.apk
    ) else (
        echo ⚠️  Could not copy to Desktop, but APK is ready at:
        echo    android\app\build\outputs\apk\debug\app-debug.apk
    )
) else (
    echo ❌ APK file not found. Build may have failed.
)

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Install BudgetTracker-debug.apk on your phone
echo 2. Enable Security in Settings → Security Features
echo 3. Test app state detection by minimizing/reopening app
echo 4. Use Debug Panel to troubleshoot if needed
echo.
echo Your security features are now ready! 🎉
echo.
pause
