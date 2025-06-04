import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import ConfirmationModal from './ConfirmationModal';
import UserSettings from './UserSettings';
import { CogIcon } from '../constants';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { addToast, clearAllToasts } = useToast();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Clear all toasts before signing out
      clearAllToasts();
      await signOut();
      // Don't show success toast as user will be redirected to login
    } catch (error: any) {
      addToast('Failed to sign out. Please try again.', 'error');
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowUserSettings(true)}
            className="flex items-center space-x-3 hover:bg-slate-700 rounded-lg p-2 -m-2 transition-colors duration-200 flex-grow"
            aria-label="Open user settings"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="text-left">
              <p className="text-white font-semibold">
                {user.displayName || 'User'}
              </p>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
            <CogIcon className="w-5 h-5 text-slate-400 ml-auto" />
          </button>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowSignOutModal(true)}
              disabled={isSigningOut}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      <UserSettings
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
      />

      <ConfirmationModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        isDangerous={false}
      />
    </>
  );
};

export default UserProfile;
