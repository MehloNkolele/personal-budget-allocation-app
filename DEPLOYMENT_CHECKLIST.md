# Deployment Checklist

## Pre-Deployment Setup ✅

### 1. App Icons and Assets
- [ ] Generate app icons using `generate-icons.html`
- [ ] Place `icon-192.png` and `icon-512.png` in `public/` folder
- [ ] Create app screenshots for store listings
- [ ] Prepare app store descriptions and metadata

### 2. Build Configuration
- [ ] Update app version in `package.json`
- [ ] Update version code/name in platform configs
- [ ] Test app functionality thoroughly
- [ ] Verify all features work offline

## Android Deployment 📱

### 3. Android Studio Setup
- [ ] Install Android Studio
- [ ] Install required SDK components
- [ ] Open `android/` folder as project

### 4. Signing Configuration
- [ ] Run `scripts/generate-keystore.bat` to create signing key
- [ ] Verify `android/key.properties` exists
- [ ] Verify `android/budget-tracker-key.keystore` exists
- [ ] **BACKUP KEYSTORE FILES SECURELY**

### 5. Build Release
```bash
# Build the app
npm run mobile:build

# Navigate to android folder
cd android

# Build release AAB (recommended)
./gradlew bundleRelease

# Or build APK
./gradlew assembleRelease
```
- [ ] Build completes without errors
- [ ] Test release build on device

### 6. Play Store Upload
- [ ] Create Google Play Console account ($25)
- [ ] Create new app in console
- [ ] Upload AAB file (`android/app/build/outputs/bundle/release/`)
- [ ] Fill in app details, descriptions, screenshots
- [ ] Set content rating
- [ ] Set pricing (free/paid)
- [ ] Submit for review

## iOS Deployment 🍎

### 7. iOS Setup (macOS Required)
- [ ] Install Xcode from Mac App Store
- [ ] Create Apple Developer account ($99/year)
- [ ] Open `ios/App/App.xcworkspace` in Xcode

### 8. iOS Configuration
- [ ] Set Bundle Identifier: `com.budgettracker.app`
- [ ] Configure signing & capabilities
- [ ] Set deployment target (iOS 13.0+)
- [ ] Test on iOS simulator

### 9. iOS Build and Upload
- [ ] Select "Any iOS Device" as target
- [ ] Product → Archive in Xcode
- [ ] Distribute App → App Store Connect
- [ ] Upload completes successfully

### 10. App Store Connect
- [ ] Create new app in App Store Connect
- [ ] Upload build from Xcode
- [ ] Fill in app metadata
- [ ] Add screenshots for all device sizes
- [ ] Set app category and keywords
- [ ] Submit for review

## Store Optimization 🎯

### 11. App Store Assets
- [ ] App icon (1024x1024 for iOS)
- [ ] Screenshots (iPhone, iPad, Android phones/tablets)
- [ ] App preview videos (optional but recommended)
- [ ] Localized descriptions for target markets

### 12. Metadata
- [ ] Compelling app title
- [ ] Keyword-optimized description
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App category selection

## Testing & Quality Assurance 🧪

### 13. Device Testing
- [ ] Test on multiple Android devices/versions
- [ ] Test on multiple iOS devices/versions
- [ ] Test all core features
- [ ] Test offline functionality
- [ ] Test app performance

### 14. Store Compliance
- [ ] Review Google Play policies
- [ ] Review Apple App Store guidelines
- [ ] Ensure app meets content guidelines
- [ ] Verify privacy policy compliance

## Post-Deployment 🚀

### 15. Launch Preparation
- [ ] Prepare marketing materials
- [ ] Set up app analytics
- [ ] Plan user feedback collection
- [ ] Prepare customer support

### 16. Monitoring
- [ ] Monitor app store reviews
- [ ] Track download metrics
- [ ] Monitor crash reports
- [ ] Plan regular updates

## Quick Commands Reference

```bash
# Build and sync
npm run mobile:build

# Open in IDEs
npm run mobile:android  # Opens Android Studio
npm run mobile:ios      # Opens Xcode (macOS only)

# Run on devices
npm run mobile:run:android
npm run mobile:run:ios

# Android release build
cd android && ./gradlew bundleRelease

# iOS archive (in Xcode)
Product → Archive
```

## Important Notes

⚠️ **CRITICAL**: Always backup your signing keys securely!
- Android: `android/budget-tracker-key.keystore` and `android/key.properties`
- iOS: Certificates and provisioning profiles

📱 **Testing**: Test thoroughly on real devices before submitting

⏰ **Review Time**: 
- Google Play: Usually 1-3 days
- Apple App Store: Usually 1-7 days

💰 **Costs**:
- Google Play Console: $25 one-time
- Apple Developer Program: $99/year

## Support Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Docs](https://developer.android.com/docs)
- [iOS Developer Docs](https://developer.apple.com/documentation)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect)
