# Logout to Splash Screen Test

## Expected Behavior
When a user logs out, they should be taken to the splash screens unless they are disabled.

## Implementation Details

### Current Logic
1. **Logout Process** (`AuthContext.tsx`):
   - Calls Firebase `signOut()`
   - Removes `hasSeenSplash` from localStorage
   - This ensures splash screen will show again for non-authenticated users

2. **Splash Screen Display Logic** (`ProtectedRoute.tsx`):
   - **For authenticated users**: Shows splash if user preferences `showSplashScreen` is true AND global `hasSeenSplash` is not set
   - **For non-authenticated users**: Shows splash if global `hasSeenSplash` is not set

3. **User Preferences**:
   - Users can disable splash screen in their settings
   - This preference is stored per-user and persists across sessions
   - When disabled, splash won't show even after logout/login

## Test Scenarios

### Scenario 1: User with splash screen enabled
1. User logs in → sees splash screen (first time)
2. User completes splash screen → splash screen hidden
3. User uses app normally
4. User logs out → `hasSeenSplash` flag removed
5. User visits app → sees splash screen again
6. User logs back in → sees splash screen (unless they had disabled it)

### Scenario 2: User with splash screen disabled
1. User logs in → sees splash screen (first time)
2. User clicks "Don't Show Again" → user preference `showSplashScreen` set to false
3. User uses app normally
4. User logs out → `hasSeenSplash` flag removed
5. User visits app → sees splash screen (because they're not authenticated)
6. User logs back in → does NOT see splash screen (because preference is disabled)

### Scenario 3: New user
1. User visits app → sees splash screen
2. User completes splash screen → `hasSeenSplash` set to true
3. User signs up/logs in → may see splash screen based on their preferences

## Manual Testing Steps

1. **Test Basic Flow**:
   - Open app in browser
   - Sign up/log in
   - Complete splash screen
   - Use app normally
   - Log out
   - Verify splash screen appears again

2. **Test Disabled Splash**:
   - Log in
   - Go to Settings → Disable splash screen
   - Log out
   - Visit app → should see splash (not authenticated)
   - Log back in → should NOT see splash (disabled in preferences)

3. **Test Browser Storage**:
   - Open browser dev tools
   - Check localStorage for `hasSeenSplash` flag
   - Log out and verify flag is removed
   - Check user-specific preferences remain intact

## Key Files Modified
- `contexts/AuthContext.tsx`: Updated `signOut` function to remove `hasSeenSplash` flag
- Logic already existed in `components/auth/ProtectedRoute.tsx` for splash screen display

## Notes
- User preferences for splash screen are preserved across logout/login
- Only the global `hasSeenSplash` flag is removed on logout
- This ensures the splash screen shows again unless explicitly disabled by the user
