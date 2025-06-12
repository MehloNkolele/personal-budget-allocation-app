# Security Testing Guide

This guide will help you test and troubleshoot the app's security features including PIN authentication and biometric authentication.

## What I Fixed

### 1. PIN Hashing Issue
- **Problem**: PIN was being hashed with simple base64 encoding
- **Fix**: Now uses proper SHA-256 hashing via `BiometricService.hashPin()`

### 2. App State Detection
- **Problem**: 5-second delay was too long for testing
- **Fix**: Reduced to 1 second and added extensive debugging logs

### 3. Added Debug Panel
- **New Feature**: Added a comprehensive debug panel to help troubleshoot security issues

## How to Test

### Step 1: Enable Security
1. Open the app and sign in
2. Go to Settings (user profile menu)
3. Scroll to "Security Features" section
4. Toggle "Enable Security Features" to ON
5. Set up a PIN when prompted (e.g., 1234)
6. Choose authentication method:
   - **PIN**: Only PIN authentication
   - **Fingerprint/Face ID**: Only biometric (if available)
   - **PIN or Fingerprint**: Both options available

### Step 2: Test App State Detection
1. With security enabled, minimize the app or switch to another app
2. Wait at least 2 seconds
3. Return to the app
4. You should see the security gate (PIN or biometric prompt)

### Step 3: Use Debug Panel
1. Go to Settings → Security Features
2. Click "🔧 Debug Security" button
3. The debug panel shows:
   - Current security settings
   - App background state
   - Biometric availability
   - Time since app went to background

### Step 4: Test Biometric Authentication
1. Ensure your device has fingerprint or face ID set up
2. In security settings, choose "Fingerprint" or "PIN or Fingerprint"
3. Test by going to background and returning to app
4. You should see biometric prompt automatically
5. Use the "Test Biometric" button in debug panel for manual testing

## Troubleshooting

### Security Not Working?
1. **Check Debug Panel**: Use the debug panel to see current state
2. **Console Logs**: Check browser/device console for detailed logs
3. **Security Enabled**: Ensure security is actually enabled in settings
4. **PIN Set**: Make sure a PIN has been configured

### Biometric Not Working?
1. **Device Support**: Check if device supports biometrics
2. **Enrollment**: Ensure biometrics are enrolled on device
3. **Permissions**: App may need biometric permissions
4. **Platform**: Only works on native mobile platforms (not web)

### App State Detection Not Working?
1. **Native Platform**: Only works on mobile devices (not web browser)
2. **Capacitor App Plugin**: Ensure `@capacitor/app` is properly installed
3. **Background Time**: Check debug panel for background timing
4. **Console Logs**: Look for app state change logs

## Debug Information

The debug panel shows:
- **Platform**: Whether running on native mobile or web
- **Security Settings**: Current configuration
- **Background State**: When app went to background and for how long
- **Biometric Info**: Device capabilities and availability

## Console Logs to Watch For

When testing, look for these console messages:
```
App state changed: {isActive: false}
App went to background, setting background state
App set to background for user: [userId] at time: [timestamp]

App state changed: {isActive: true}  
App came to foreground, checking if authentication is required
Checking authentication requirement: {...}
Should require auth: true/false
```

## Common Issues

### 1. "Security not enabled" in debug panel
- Go to Settings and enable security features
- Set up a PIN when prompted

### 2. "Was in Background: No" even after minimizing
- This indicates app state detection isn't working
- Ensure you're testing on a mobile device, not web browser
- Check that Capacitor app plugin is working

### 3. Biometric shows "Not Available"
- Device doesn't support biometrics
- Biometrics not enrolled on device
- App doesn't have biometric permissions

### 4. PIN authentication fails
- Ensure you're entering the correct PIN
- Check console for hashing errors
- Try setting up PIN again

## Testing Scenarios

### Scenario 1: Basic PIN Test
1. Enable security with PIN
2. Set PIN to "1234"
3. Minimize app for 2+ seconds
4. Return to app
5. Enter PIN "1234" - should work
6. Enter wrong PIN - should show error

### Scenario 2: Biometric Test
1. Enable security with biometric
2. Minimize app for 2+ seconds  
3. Return to app
4. Should show biometric prompt automatically
5. Use fingerprint/face ID - should work

### Scenario 3: Mixed Authentication
1. Enable security with "PIN or Biometric"
2. Minimize app for 2+ seconds
3. Return to app
4. Should show biometric prompt first
5. Can switch to PIN if biometric fails

## Need Help?

If you're still having issues:
1. Use the debug panel to gather information
2. Check console logs for error messages
3. Ensure you're testing on a real mobile device
4. Verify biometric enrollment on your device
5. Try disabling and re-enabling security features
