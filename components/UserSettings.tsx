import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import SettingsModal from './SettingsModal';
import DangerousActionModal from './DangerousActionModal';
import { UserIcon, PhotoIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, TrashIcon, FingerPrintIcon } from '../constants';
import { PasswordChangeData, SecuritySettings } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import { BiometricService } from '../services/biometricService';
import PinInput from './auth/PinInput';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, updateUserPassword, clearUserData } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile settings state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.photoURL || null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Data management state
  const [showClearDataConfirmation, setShowClearDataConfirmation] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  // Preferences state
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    isEnabled: false,
    authMethod: 'pin',
    requireOnAppResume: true,
    requireOnSensitiveActions: false
  });
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    if (user?.uid) {
      const preferences = UserDataManager.loadUserPreferences(user.uid);
      setShowSplashScreen(preferences.showSplashScreen);
      setSecuritySettings(preferences.security);

      // Check biometric availability
      checkBiometricAvailability();
    }
  }, [user?.uid]);

  const checkBiometricAvailability = async () => {
    const { canUse } = await BiometricService.canUseBiometric();
    setBiometricAvailable(canUse);

    if (canUse) {
      const type = await BiometricService.getBiometryType();
      setBiometricType(BiometricService.getBiometricTypeName(type));
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        addToast('Profile picture must be smaller than 2MB', 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        addToast('Please select a valid image file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Also remove from localStorage if it exists
    if (user?.uid) {
      localStorage.removeItem(`profilePicture_${user.uid}`);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      addToast('Display name cannot be empty', 'error');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      // Pass null explicitly when removing profile picture, undefined when keeping current
      const photoURL = profilePicture === null ? null : profilePicture || undefined;
      await updateUserProfile(displayName.trim(), photoURL);
      addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword.trim()) {
      addToast('Current password is required', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      addToast('New password must be different from current password', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      console.log('Attempting to update password...');
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      addToast('Password updated successfully!', 'success');
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error: any) {
      console.error('Password update failed:', error);
      addToast(error.message || 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordInputChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearAllData = async () => {
    setIsClearingData(true);
    try {
      await clearUserData();
      addToast('All your data has been cleared successfully!', 'success');
      setShowClearDataConfirmation(false);
      // Close the settings modal after clearing data
      onClose();
    } catch (error: any) {
      addToast(error.message || 'Failed to clear data', 'error');
    } finally {
      setIsClearingData(false);
    }
  };

  const handleSplashScreenToggle = async (enabled: boolean) => {
    if (user?.uid) {
      try {
        UserDataManager.updateSplashScreenPreference(user.uid, enabled);
        setShowSplashScreen(enabled);
        addToast(`Splash screen ${enabled ? 'enabled' : 'disabled'} successfully!`, 'success');
      } catch (error: any) {
        addToast('Failed to update splash screen preference', 'error');
      }
    }
  };

  // Security settings handlers
  const handleSecurityToggle = async (enabled: boolean) => {
    if (!user?.uid) return;

    if (enabled && !securitySettings.pinHash) {
      // Need to set up PIN first
      setShowPinSetup(true);
      return;
    }

    setIsUpdatingSecurity(true);
    try {
      const updatedSettings = { ...securitySettings, isEnabled: enabled };
      UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
      setSecuritySettings(updatedSettings);
      addToast(`Security ${enabled ? 'enabled' : 'disabled'} successfully!`, 'success');
    } catch (error: any) {
      addToast('Failed to update security settings', 'error');
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleAuthMethodChange = async (method: 'pin' | 'biometric' | 'both') => {
    if (!user?.uid) return;

    if (method === 'biometric' || method === 'both') {
      if (!biometricAvailable) {
        addToast('Biometric authentication is not available on this device', 'error');
        return;
      }
    }

    setIsUpdatingSecurity(true);
    try {
      const updatedSettings = { ...securitySettings, authMethod: method };
      UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
      setSecuritySettings(updatedSettings);
      addToast('Authentication method updated successfully!', 'success');
    } catch (error: any) {
      addToast('Failed to update authentication method', 'error');
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handlePinSetup = async (pin: string) => {
    if (!user?.uid) return;

    setIsUpdatingSecurity(true);
    try {
      // Simple hash for demo (use proper hashing in production)
      const hashedPin = btoa(pin);

      const updatedSettings = {
        ...securitySettings,
        isEnabled: true,
        pinHash: hashedPin
      };

      UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
      setSecuritySettings(updatedSettings);
      setShowPinSetup(false);
      addToast('PIN set up successfully! Security is now enabled.', 'success');
    } catch (error: any) {
      addToast('Failed to set up PIN', 'error');
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleRequireOnResumeToggle = async (enabled: boolean) => {
    if (!user?.uid) return;

    setIsUpdatingSecurity(true);
    try {
      const updatedSettings = { ...securitySettings, requireOnAppResume: enabled };
      UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
      setSecuritySettings(updatedSettings);
      addToast(`Authentication on app resume ${enabled ? 'enabled' : 'disabled'}!`, 'success');
    } catch (error: any) {
      addToast('Failed to update setting', 'error');
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  if (!user) return null;

  return (
    <SettingsModal isOpen={isOpen} onClose={onClose} title="User Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Profile Settings Section */}
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Profile Settings</h3>
              <p className="text-slate-400 text-sm">Update your personal information</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Profile Picture */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-600 group-hover:border-sky-500 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center border-2 border-slate-600 group-hover:border-sky-400 transition-all duration-200">
                      <span className="text-white font-bold text-2xl">
                        {displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/25"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    <span>Choose Photo</span>
                  </button>
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors hover:bg-red-500/10 px-2 py-1 rounded-lg"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <p className="text-xs text-slate-400 mt-3 bg-slate-700/30 rounded-lg px-3 py-2">
                💡 Maximum file size: 2MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="block text-sm font-semibold text-slate-200">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-600/50 text-slate-100 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 hover:border-slate-500"
                placeholder="Enter your display name"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={user.email || ''}
                  className="w-full bg-slate-700/50 border border-slate-600/30 text-slate-300 rounded-xl p-3 cursor-not-allowed"
                  disabled
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-400 bg-slate-700/30 rounded-lg px-3 py-2">
                🔒 Email address cannot be changed for security reasons
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/25 disabled:shadow-none"
            >
              {isUpdatingProfile ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating Profile...</span>
                </div>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <LockClosedIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <p className="text-slate-400 text-sm">Update your account security</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-200">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  className="w-full bg-slate-800/70 border border-slate-600/50 text-slate-100 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 hover:border-slate-500"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 transition-colors duration-200"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-200">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  className="w-full bg-slate-800/70 border border-slate-600/50 text-slate-100 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 hover:border-slate-500"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 transition-colors duration-200"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 bg-slate-700/30 rounded-lg px-3 py-2">
                🔐 Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-slate-200">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => handlePasswordInputChange('confirmNewPassword', e.target.value)}
                  className="w-full bg-slate-800/70 border border-slate-600/50 text-slate-100 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 hover:border-slate-500"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 disabled:shadow-none"
            >
              {isUpdatingPassword ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Preferences Section - Full Width */}
      <div className="mt-8 bg-gradient-to-br from-indigo-900/30 to-purple-800/30 border border-indigo-500/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">App Preferences</h3>
            <p className="text-indigo-200 text-sm">Customize your app experience</p>
          </div>
        </div>

        <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-6">
          <div className="space-y-6">
            {/* Splash Screen Setting */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="text-indigo-300 font-bold text-lg mb-2">Welcome Introduction</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Show the interactive welcome tour when you sign in. This introduction helps you learn about all the app features and can be disabled here.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={() => handleSplashScreenToggle(!showSplashScreen)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    showSplashScreen ? 'bg-indigo-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      showSplashScreen ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings Section - Full Width */}
      <div className="mt-8 bg-gradient-to-br from-emerald-900/30 to-green-800/30 border border-emerald-500/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <LockClosedIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Security Settings</h3>
            <p className="text-emerald-200 text-sm">Protect your budget data with PIN or biometric authentication</p>
          </div>
        </div>

        <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-6">
          <div className="space-y-6">
            {/* Enable Security */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <LockClosedIcon className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="text-emerald-300 font-bold text-lg mb-2">App Security</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Require authentication when reopening the app. This adds an extra layer of security to protect your financial data.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={() => handleSecurityToggle(!securitySettings.isEnabled)}
                  disabled={isUpdatingSecurity}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 ${
                    securitySettings.isEnabled ? 'bg-emerald-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      securitySettings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Authentication Method Selection */}
            {securitySettings.isEnabled && (
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <FingerPrintIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-emerald-300 font-bold text-lg mb-2">Authentication Method</h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      Choose how you want to authenticate when accessing the app.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* PIN Option */}
                  <label className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors">
                    <input
                      type="radio"
                      name="authMethod"
                      value="pin"
                      checked={securitySettings.authMethod === 'pin'}
                      onChange={() => handleAuthMethodChange('pin')}
                      disabled={isUpdatingSecurity}
                      className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-500 focus:ring-emerald-500 focus:ring-2"
                    />
                    <div className="flex items-center space-x-2">
                      <LockClosedIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">PIN Only</span>
                    </div>
                  </label>

                  {/* Biometric Option */}
                  <label className={`flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg transition-colors ${
                    biometricAvailable ? 'cursor-pointer hover:bg-slate-700/70' : 'cursor-not-allowed opacity-50'
                  }`}>
                    <input
                      type="radio"
                      name="authMethod"
                      value="biometric"
                      checked={securitySettings.authMethod === 'biometric'}
                      onChange={() => handleAuthMethodChange('biometric')}
                      disabled={isUpdatingSecurity || !biometricAvailable}
                      className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-500 focus:ring-emerald-500 focus:ring-2"
                    />
                    <div className="flex items-center space-x-2">
                      <FingerPrintIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">
                        {biometricType || 'Biometric'} Only
                      </span>
                      {!biometricAvailable && (
                        <span className="text-xs text-slate-400">(Not Available)</span>
                      )}
                    </div>
                  </label>

                  {/* Both Option */}
                  <label className={`flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg transition-colors ${
                    biometricAvailable ? 'cursor-pointer hover:bg-slate-700/70' : 'cursor-not-allowed opacity-50'
                  }`}>
                    <input
                      type="radio"
                      name="authMethod"
                      value="both"
                      checked={securitySettings.authMethod === 'both'}
                      onChange={() => handleAuthMethodChange('both')}
                      disabled={isUpdatingSecurity || !biometricAvailable}
                      className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-500 focus:ring-emerald-500 focus:ring-2"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <FingerPrintIcon className="w-4 h-4 text-emerald-400" />
                        <LockClosedIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-white font-medium">
                        {biometricType || 'Biometric'} with PIN Fallback
                      </span>
                      {!biometricAvailable && (
                        <span className="text-xs text-slate-400">(Not Available)</span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Require on App Resume */}
            {securitySettings.isEnabled && (
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-emerald-300 font-bold text-lg mb-2">Require on App Resume</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Require authentication when returning to the app after it has been in the background for more than 30 seconds.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleRequireOnResumeToggle(!securitySettings.requireOnAppResume)}
                    disabled={isUpdatingSecurity}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 ${
                      securitySettings.requireOnAppResume ? 'bg-emerald-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        securitySettings.requireOnAppResume ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Management Section - Full Width */}
      <div className="mt-8 bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <TrashIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Data Management</h3>
            <p className="text-red-200 text-sm">Manage your account data</p>
          </div>
        </div>

        <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="text-red-300 font-bold text-lg mb-2">⚠️ Clear All Data</h4>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                This will permanently delete <strong>ALL</strong> your budget data including categories, transactions,
                monthly budgets, and settings. This action cannot be undone and will completely reset your account.
              </p>
              <button
                type="button"
                onClick={() => setShowClearDataConfirmation(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25 border border-red-500/50"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <DangerousActionModal
        isOpen={showClearDataConfirmation && !isClearingData}
        onClose={() => setShowClearDataConfirmation(false)}
        onConfirm={handleClearAllData}
        title="Clear All Data"
        message="You are about to permanently delete ALL of your budget data. This is an irreversible action that will completely wipe your account clean."
        confirmText="Yes, Delete Everything"
        cancelText="No, Keep My Data Safe"
        warningItems={[
          'All categories and subcategories',
          'All transactions and spending history',
          'Monthly budgets and planning data',
          'Currency and display preferences',
          'Profile picture and settings',
          'All reports and analytics data'
        ]}
      />

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPinSetup(false)} />
          <div className="relative z-10 w-full max-w-md mx-4">
            <PinInput
              onPinComplete={handlePinSetup}
              onCancel={() => setShowPinSetup(false)}
              title="Set Up PIN"
              subtitle="Create a 4-digit PIN to secure your budget data"
              isLoading={isUpdatingSecurity}
              mode="setup"
              showCancel={true}
            />
          </div>
        </div>
      )}
    </SettingsModal>
  );
};

export default UserSettings;
