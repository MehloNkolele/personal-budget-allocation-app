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
        {/* Enhanced User Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          aria-label="User menu"
        >
          {/* Enhanced User Avatar */}
          <div className="relative flex-shrink-0">
            {user.photoURL ? (
              <div className="relative">
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-10 h-10 rounded-2xl ring-2 ring-slate-600/50 group-hover:ring-violet-500/60 transition-all duration-500 object-cover flex-shrink-0 aspect-square shadow-lg group-hover:shadow-violet-500/30 group-hover:scale-105"
                />
                {/* Profile image glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/20 via-sky-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-2xl flex items-center justify-center ring-2 ring-slate-600/50 group-hover:ring-violet-500/60 transition-all duration-500 shadow-lg group-hover:shadow-violet-500/30 flex-shrink-0 aspect-square group-hover:scale-105">
                  <span className="text-white font-bold text-sm bg-gradient-to-br from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                {/* Avatar glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/30 via-purple-500/20 to-fuchsia-600/30 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                
                {/* Floating particles around avatar */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-1 w-1 h-1 bg-violet-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                  <div className="absolute bottom-1 left-0 w-0.5 h-0.5 bg-sky-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                  <div className="absolute top-2 left-1 w-0.5 h-0.5 bg-purple-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
                </div>
              </div>
            )}
            {/* Enhanced Online Status Indicator with pulse effect */}
            <div className="absolute -bottom-0.5 -right-0.5">
              <div className="w-3.5 h-3.5 bg-gradient-to-br from-emerald-400 to-emerald-500 border-2 border-slate-800 rounded-full shadow-lg">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
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
          <div className="absolute right-0 mt-2 w-72 origin-top-right bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 z-50 overflow-hidden">
            <div className="max-h-[80vh] overflow-y-auto">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <div className="relative">
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-12 h-12 rounded-2xl shadow-lg ring-2 ring-violet-500/30 object-cover"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/10 via-sky-500/10 to-purple-600/10"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-violet-500/30">
                        <span className="text-white font-bold text-lg bg-gradient-to-br from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-sm">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/20 via-purple-500/15 to-fuchsia-600/20"></div>
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
              <div className="py-2 lg:hidden">
                <p className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</p>
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors duration-200 ${
                        isActive 
                          ? 'text-sky-400 bg-sky-500/10' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-sky-400"></div>}
                    </button>
                  );
                })}
              </div>

              {/* Menu Items */}
              <div className="py-2 border-t border-slate-700/50">
              <p className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                <button
                  onClick={openSettings}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <CogIcon className="w-5 h-5 text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={openSignOutModal}
                  disabled={isSigningOut}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                </button>
              </div>
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
