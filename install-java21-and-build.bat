@echo off
echo ========================================
echo Installing Java 21 and Building APK
echo ========================================

echo Checking if Java 21 is already installed...
java -version 2>&1 | findstr "21" >nul
if %errorlevel% == 0 (
    echo Java 21 is already installed!
    goto :build_apk
)

echo Java 21 not found. Installing Java 21...

echo Downloading Java 21...
powershell -Command "& {Invoke-WebRequest -Uri 'https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.msi' -OutFile 'jdk-21.msi'}"

if not exist "jdk-21.msi" (
    echo Failed to download Java 21. Trying alternative source...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jdk_x64_windows_hotspot_21.0.5_11.msi' -OutFile 'jdk-21.msi'}"
)

if exist "jdk-21.msi" (
    echo Installing Java 21...
    msiexec /i jdk-21.msi /quiet /norestart
    echo Java 21 installation completed.
    del jdk-21.msi
) else (
    echo Failed to download Java 21. Please install manually.
    echo You can download it from: https://adoptium.net/temurin/releases/?version=21
    pause
    exit /b 1
)

:build_apk
echo Building APK with updated Java version...

echo Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build web app
    pause
    exit /b 1
)

echo Syncing with Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo Failed to sync with Capacitor
    pause
    exit /b 1
)

echo Building Android APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo Failed to build APK
    cd ..
    pause
    exit /b 1
)

cd ..

echo ========================================
echo APK Build Completed!
echo ========================================

echo Looking for APK file...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo APK found: android\app\build\outputs\apk\debug\app-debug.apk
    echo Copying APK to desktop...
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\BudgetTracker-debug.apk"
    if %errorlevel% == 0 (
        echo APK successfully copied to Desktop as BudgetTracker-debug.apk
    ) else (
        echo Failed to copy APK to desktop
    )
) else (
    echo APK file not found. Build may have failed.
)

echo ========================================
echo Build process completed!
echo ========================================
pause
