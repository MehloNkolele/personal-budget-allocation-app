# Mobile App Deployment Guide

## Overview
This guide will help you deploy your Budget Tracker Pro app to both Google Play Store and Apple App Store.

## Prerequisites

### For Android (Play Store)
1. **Android Studio** - Download from https://developer.android.com/studio
2. **Java Development Kit (JDK)** - Version 11 or higher
3. **Google Play Console Account** - $25 one-time registration fee
4. **Signing Key** - For app signing

### For iOS (App Store)
1. **macOS** - Required for iOS development
2. **Xcode** - Latest version from Mac App Store
3. **Apple Developer Account** - $99/year
4. **iOS Device** - For testing (optional but recommended)

## Step 1: Generate App Icons

1. Open the `generate-icons.html` file in your browser
2. Click "Download Icons" to get icon-192.png and icon-512.png
3. Place these files in the `public/` directory

## Step 2: Build and Test Locally

```bash
# Build the web app and sync with mobile platforms
npm run mobile:build

# Open Android project in Android Studio
npm run mobile:android

# Open iOS project in Xcode (macOS only)
npm run mobile:ios
```

## Step 3: Android Deployment

### 3.1 Setup Android Studio
1. Install Android Studio
2. Open the `android/` folder as a project
3. Install required SDK components when prompted

### 3.2 Generate Signing Key
```bash
# Navigate to android folder
cd android

# Generate keystore (replace with your details)
keytool -genkey -v -keystore budget-tracker-key.keystore -alias budget-tracker -keyalg RSA -keysize 2048 -validity 10000
```

### 3.3 Configure Signing
1. Create `android/key.properties`:
```
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=budget-tracker
storeFile=budget-tracker-key.keystore
```

2. Update `android/app/build.gradle` to include signing config

### 3.4 Build Release APK/AAB
```bash
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease    # For AAB (recommended)
```

### 3.5 Upload to Play Console
1. Go to https://play.google.com/console
2. Create new app
3. Upload AAB file
4. Fill in app details, screenshots, descriptions
5. Submit for review

## Step 4: iOS Deployment (macOS Required)

### 4.1 Setup Xcode
1. Install Xcode from Mac App Store
2. Open `ios/App/App.xcworkspace`
3. Sign in with Apple Developer account

### 4.2 Configure App
1. Set Bundle Identifier: `com.budgettracker.app`
2. Configure signing & capabilities
3. Set deployment target (iOS 13.0+)

### 4.3 Build and Archive
1. Select "Any iOS Device" as target
2. Product → Archive
3. Distribute App → App Store Connect

### 4.4 Upload to App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Upload build from Xcode
4. Fill in app metadata
5. Submit for review

## Step 5: App Store Optimization

### Required Assets
- App Icon (1024x1024 for iOS, various sizes for Android)
- Screenshots (various device sizes)
- App Description
- Keywords
- Privacy Policy URL

### App Store Descriptions

**Short Description (80 chars):**
"Track your budget, manage expenses, and achieve financial goals easily."

**Long Description:**
"Budget Tracker Pro helps you take control of your finances with powerful budgeting tools. Create categories, track expenses, set financial goals, and monitor your spending habits with beautiful charts and reports.

Features:
• Create custom budget categories
• Track income and expenses
• Visual spending reports
• Monthly budget planning
• Secure data storage
• Dark mode interface
• Offline functionality

Perfect for individuals and families who want to manage their money better and achieve their financial goals."

## Step 6: Testing

### Android Testing
```bash
# Run on connected device
npm run mobile:run:android

# Or use Android Studio's emulator
```

### iOS Testing
```bash
# Run on connected device (macOS only)
npm run mobile:run:ios

# Or use Xcode's simulator
```

## Troubleshooting

### Common Android Issues
- **Gradle build fails**: Update Android Gradle Plugin
- **Signing issues**: Verify keystore path and passwords
- **Permission errors**: Check AndroidManifest.xml

### Common iOS Issues
- **Code signing**: Ensure valid developer certificate
- **Provisioning profile**: Create and download from developer portal
- **Build errors**: Clean build folder and retry

## Next Steps

1. Generate app icons using the provided HTML tool
2. Set up development environments (Android Studio/Xcode)
3. Build and test locally
4. Create developer accounts
5. Generate signing certificates
6. Build release versions
7. Upload to stores
8. Submit for review

## Support

For issues with:
- **Capacitor**: https://capacitorjs.com/docs
- **Android**: https://developer.android.com/docs
- **iOS**: https://developer.apple.com/documentation

Remember to test thoroughly on real devices before submitting to stores!
