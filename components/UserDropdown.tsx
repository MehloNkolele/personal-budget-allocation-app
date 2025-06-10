import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { 
  ChevronDownIcon, 
  UserIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon 
} from '../constants';
import { User } from '../types';
import ConfirmationModal from './ConfirmationModal';
import UserSettings from './UserSettings';

interface UserDropdownProps {
  user: User;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
  const { signOut } = useAuth();
  const { addToast, clearAllToasts } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setIsOpen(false);
    }
  };

  const openSettings = () => {
    setShowUserSettings(true);
    setIsOpen(false);
  };

  const openSignOutModal = () => {
    setShowSignOutModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Enhanced User Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          aria-label="User menu"
        >
          {/* Enhanced User Avatar */}
          <div className="relative flex-shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-9 h-9 rounded-full ring-2 ring-slate-600 group-hover:ring-sky-500 transition-all duration-300 object-cover flex-shrink-0 aspect-square"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center ring-2 ring-slate-600 group-hover:ring-sky-500 transition-all duration-300 shadow-lg flex-shrink-0 aspect-square">
                <span className="text-white font-semibold text-sm">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            {/* Enhanced Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full shadow-sm animate-pulse"></div>
          </div>

          {/* User Info (Hidden on small screens) */}
          <div className="hidden lg:block text-left min-w-0">
            <p className="text-white font-medium text-sm leading-tight truncate max-w-[120px]">
              {user.displayName || 'User'}
            </p>
            <p className="text-slate-400 text-xs leading-tight truncate max-w-[120px]">
              {user.email && user.email.length > 15 ? `${user.email.substring(0, 15)}...` : user.email}
            </p>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDownIcon
            className={`w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-all duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 py-2 z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={openSettings}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
              >
                <CogIcon className="w-4 h-4" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {/* Add profile view functionality */}}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
              >
                <UserIcon className="w-4 h-4" />
                <span>View Profile</span>
              </button>

              <div className="border-t border-slate-700/50 my-1"></div>

              <button
                onClick={openSignOutModal}
                disabled={isSigningOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Settings Modal */}
      <UserSettings
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText={isSigningOut ? "Signing Out..." : "Sign Out"}
        isDangerous={true}
      />
    </>
  );
};

export default UserDropdown;
