# Java 21 Installation and APK Build Guide

## The Issue
Your app uses Capacitor 7.x which requires Java 21, but you currently have Java 17 installed. This is causing the build to fail with "invalid source release: 21" error.

## Solution: Install Java 21

### Option 1: Download and Install Java 21 Manually

1. **Download Java 21:**
   - Go to: https://adoptium.net/temurin/releases/?version=21
   - Download: `OpenJDK 21 (LTS)` for Windows x64
   - Choose the `.msi` installer for easier installation

2. **Install Java 21:**
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - Make sure to check "Set JAVA_HOME variable" during installation
   - Make sure to check "Add to PATH" during installation

3. **Verify Installation:**
   ```cmd
   java -version
   ```
   Should show Java 21.x.x

### Option 2: Use Package Manager (Chocolatey)

If you have Chocolatey installed:
```cmd
choco install openjdk21
```

### Option 3: Use Winget (Windows Package Manager)

```cmd
winget install EclipseAdoptium.Temurin.21.JDK
```

## After Installing Java 21

### Step 1: Verify Java Installation
```cmd
java -version
javac -version
```
Both should show version 21.x.x

### Step 2: Set Environment Variables (if not set automatically)
1. Open System Properties → Advanced → Environment Variables
2. Set `JAVA_HOME` to: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot`
3. Add to `PATH`: `%JAVA_HOME%\bin`

### Step 3: Clean and Build APK
```cmd
# Navigate to your project directory
cd "C:\Users\AB038N8\Desktop\Programming\personal-budget-allocation-app"

# Clean previous builds
cd android
.\gradlew clean
cd ..

# Build the APK
.\build-apk.bat
```

## Alternative: Quick Manual Build

If the batch scripts still don't work, try these manual commands:

```cmd
# 1. Build web app
npm run build

# 2. Sync with Capacitor
npx cap sync

# 3. Build APK
cd android
.\gradlew assembleDebug

# 4. Find your APK
# Location: android\app\build\outputs\apk\debug\app-debug.apk
```

## Copy APK to Desktop

After successful build:
```cmd
copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\BudgetTracker-debug.apk"
```

## Troubleshooting

### If Java 21 installation doesn't work:
1. Uninstall existing Java versions
2. Restart your computer
3. Install Java 21 again
4. Verify with `java -version`

### If build still fails:
1. Clear Gradle cache:
   ```cmd
   cd android
   .\gradlew clean --refresh-dependencies
   ```

2. Delete node_modules and reinstall:
   ```cmd
   rmdir /s node_modules
   npm install
   ```

3. Try building again

### If you get permission errors:
- Run Command Prompt as Administrator
- Make sure antivirus isn't blocking the build

## What's in Your APK

Once built successfully, your APK will include:
- ✅ Fixed PIN authentication with proper SHA-256 hashing
- ✅ Improved app state detection (1-second delay for testing)
- ✅ Comprehensive debug panel for troubleshooting
- ✅ Enhanced biometric authentication
- ✅ Better error handling and logging

## Testing Your Security Features

After installing the APK on your phone:

1. **Enable Security:**
   - Open app → Settings → Security Features
   - Toggle "Enable Security Features" ON
   - Set up a PIN (e.g., 1234)

2. **Test App State Detection:**
   - Minimize the app
   - Wait 2+ seconds
   - Return to app
   - Should prompt for PIN/biometric

3. **Use Debug Panel:**
   - Settings → Security Features → "🔧 Debug Security"
   - Monitor app state and security status

## Need Help?

If you continue having issues:
1. Check the console logs for specific error messages
2. Use the debug panel to see what's happening
3. Ensure you're testing on a real device (not web browser)
4. Verify biometric enrollment on your device

The security features should work perfectly once the APK is built with Java 21!
