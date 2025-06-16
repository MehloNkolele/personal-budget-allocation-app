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

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserDropdownProps {
  user: User;
  navItems?: NavItem[];
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  user,
  navItems = [],
  currentSection,
  onSectionChange,
}) => {
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

  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    setIsOpen(false);
  }

  const openSignOutModal = () => {
    setShowSignOutModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* User Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="User menu"
        >
          {/* User Avatar */}
          <div className="relative flex-shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-slate-600"
              />
            ) : (
              <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center border-2 border-slate-600">
                <span className="text-white font-medium text-sm">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            {/* Online Status */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>

          {/* User Info (Hidden on small screens) */}
          <div className="hidden lg:block text-left min-w-0">
            <p className="text-white font-medium text-sm truncate max-w-[120px]">
              {user.displayName || 'User'}
            </p>
            <p className="text-slate-400 text-xs truncate max-w-[120px]">
              {user.email && user.email.length > 15 ? `${user.email.substring(0, 15)}...` : user.email}
            </p>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDownIcon
            className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 origin-top-right bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                  />
                ) : (
                  <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center border-2 border-slate-600">
                    <span className="text-white font-medium text-sm">
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

            {/* Navigation Items (Mobile Only) */}
            <div className="py-2 lg:hidden border-b border-slate-700">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-150 ${
                      isActive
                        ? 'text-sky-400 bg-sky-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-sky-400"></div>}
                  </button>
                );
              })}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={openSettings}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-150"
              >
                <CogIcon className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <button
                onClick={openSignOutModal}
                disabled={isSigningOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
