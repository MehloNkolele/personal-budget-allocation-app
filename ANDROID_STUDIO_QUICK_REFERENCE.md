# 🚀 Android Studio APK Build - Quick Reference

## ⚡ TL;DR - Fast Track to APK

### 1. Download & Install (One-time)
- Download: https://developer.android.com/studio
- Install with default settings
- Wait for SDK download (~30 minutes)

### 2. Open Project
- Android Studio → "Open existing project"
- Navigate to: `android/` folder (not root)
- Wait for Gradle sync

### 3. Build APK
- Menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Choose: **Release** (for production)
- Wait 5-15 minutes

### 4. Get Your APK
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Copy to Desktop**: Rename to `BudgetTrackerPro-v1.0.0.apk`

### 5. Install on Phone
- Enable: Developer Options + Unknown Sources
- Transfer APK to phone
- Tap APK file → Install

---

## 🎯 Key Locations

| Item | Location |
|------|----------|
| **Android Studio Download** | https://developer.android.com/studio |
| **Project Folder** | `android/` (not root folder) |
| **Release APK** | `android/app/build/outputs/apk/release/app-release.apk` |
| **Debug APK** | `android/app/build/outputs/apk/debug/app-debug.apk` |

---

## 🔧 Essential Menu Commands

| Action | Menu Path |
|--------|-----------|
| **Open Project** | File → Open |
| **Clean Build** | Build → Clean Project |
| **Build APK** | Build → Build Bundle(s) / APK(s) → Build APK(s) |
| **Sync Gradle** | File → Sync Project with Gradle Files |
| **View Build Output** | View → Tool Windows → Build |

---

## 📱 Phone Setup Checklist

- [ ] **Developer Options**: Settings → About → Tap "Build Number" 7x
- [ ] **USB Debugging**: Settings → Developer Options → ON
- [ ] **Unknown Sources**: Settings → Security → Install Unknown Apps → ON
- [ ] **Storage Space**: Ensure 50MB+ free space

---

## ⚠️ Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| **Gradle sync failed** | File → Sync Project with Gradle Files |
| **Build errors** | Build → Clean Project, then rebuild |
| **APK won't install** | Check Unknown Sources enabled |
| **App crashes** | Check Android version (need 7.0+) |
| **Can't find APK** | Look in `android/app/build/outputs/apk/` |

---

## 🎉 Expected Results

- **APK Size**: 15-25 MB
- **Build Time**: 5-15 minutes
- **Android Support**: 7.0+ (API 24+)
- **App Name**: "Budget Tracker Pro"
- **Package**: com.budgettracker.app

---

## 💡 Pro Tips

1. **Use Release build** for final APK
2. **Clean before building** for best results
3. **Check build output** for any warnings
4. **Test on real device** before distributing
5. **Keep APK file safe** - it's your final product!

---

## 🆘 Need Help?

- **Full Guide**: See `ANDROID_STUDIO_BUILD_GUIDE.md`
- **Alternative**: Use GitHub Actions (see `GITHUB_ACTIONS_SETUP.md`)
- **Troubleshooting**: Check Android Studio's Build tab for detailed errors

**Total Time**: ~45 minutes (including Android Studio download)
**Difficulty**: Beginner-friendly with this guide
