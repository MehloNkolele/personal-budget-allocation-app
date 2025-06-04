import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { UserIcon, PhotoIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, TrashIcon } from '../constants';
import { PasswordChangeData } from '../types';

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

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Settings">
      <div className="space-y-8">
        {/* Profile Settings Section */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <UserIcon className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-100">Profile Settings</h3>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">
                        {displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    <span>Choose Photo</span>
                  </button>
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
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
              <p className="text-xs text-slate-400 mt-2">
                Maximum file size: 2MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="Enter your display name"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={user.email || ''}
                className="w-full bg-slate-600 border border-slate-500 text-slate-300 rounded-md p-2.5 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-slate-400 mt-1">
                Email address cannot be changed
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-md transition-colors"
            >
              {isUpdatingProfile ? 'Updating Profile...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <LockClosedIcon className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-100">Change Password</h3>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 pr-10 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
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
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 pr-10 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => handlePasswordInputChange('confirmNewPassword', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 pr-10 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
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
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-md transition-colors"
            >
              {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Data Management Section */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrashIcon className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-slate-100">Data Management</h3>
          </div>

          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <h4 className="text-red-300 font-medium mb-2">Clear All Data</h4>
            <p className="text-slate-300 text-sm mb-4">
              This will permanently delete all your budget data including categories, transactions,
              and settings. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setShowClearDataConfirmation(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearDataConfirmation && !isClearingData}
        onClose={() => setShowClearDataConfirmation(false)}
        onConfirm={handleClearAllData}
        title="Clear All Data"
        message={`Are you sure you want to permanently delete all your budget data? This includes:

• All categories and subcategories
• All transactions and spending history
• Currency and display preferences
• Profile picture

This action cannot be undone and you will lose all your budget information.`}
        confirmText="Yes, Clear All Data"
        cancelText="Cancel"
        isDangerous={true}
      />
    </Modal>
  );
};

export default UserSettings;
