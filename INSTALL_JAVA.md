# Install Java for APK Building

To build an APK file, you need Java Development Kit (JDK) installed on your system.

## Quick Installation Steps

### Option 1: Download Java JDK (Recommended)

1. **Download Java JDK 11 or higher**:
   - Go to: https://adoptium.net/temurin/releases/
   - Select: **JDK 11** or **JDK 17** (LTS versions)
   - Choose: **Windows x64** 
   - Download the `.msi` installer

2. **Install Java**:
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - Keep default settings
   - Java will be automatically added to your PATH

3. **Verify Installation**:
   ```cmd
   java -version
   ```
   You should see something like:
   ```
   openjdk version "11.0.x" 2023-xx-xx
   ```

### Option 2: Using Chocolatey (if you have it)

```cmd
choco install openjdk11
```

### Option 3: Using Winget (Windows 10/11)

```cmd
winget install EclipseAdoptium.Temurin.11.JDK
```

## After Java Installation

Once Java is installed, you can build your APK:

```cmd
# Run the APK build script
build-apk.bat
```

## Manual Build Steps (if script fails)

```cmd
# 1. Build web app
npm run build

# 2. Sync with Capacitor
npx cap sync

# 3. Build APK
cd android
gradlew.bat assembleDebug
cd ..
```

## APK Location

After successful build, your APK will be at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## Installing APK on Your Phone

### Method 1: Direct Transfer
1. Copy the APK file to your phone (via USB, email, cloud storage)
2. On your phone, enable "Install from unknown sources" in Settings
3. Tap the APK file to install

### Method 2: ADB (if you have Android SDK)
1. Enable "Developer Options" and "USB Debugging" on your phone
2. Connect phone via USB
3. Run: `adb install android\app\build\outputs\apk\debug\app-debug.apk`

## Troubleshooting

### "JAVA_HOME is not set"
- Restart your command prompt/PowerShell after Java installation
- If still not working, manually set JAVA_HOME:
  ```cmd
  set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.x.x.x-hotspot
  ```

### "Gradle build failed"
- Make sure you have internet connection (Gradle downloads dependencies)
- Try running the build command again
- Check if antivirus is blocking Gradle

### "APK not installing on phone"
- Enable "Install from unknown sources" in phone settings
- Make sure you have enough storage space
- Try restarting your phone

## File Sizes
- Debug APK: ~50-100 MB (includes debugging info)
- Release APK: ~20-50 MB (optimized for distribution)

The debug APK is perfect for testing on your phone!
