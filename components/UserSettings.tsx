import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import DangerousActionModal from './DangerousActionModal';
import { UserIcon, PhotoIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, TrashIcon, FingerPrintIcon, InfoIcon, XMarkIcon } from '../constants';
import { PasswordChangeData, SecuritySettings, BudgetData } from '../types';
import { FirebaseDataManager } from '../services/firebaseDataManager';
import { UserDataManager } from '../utils/userDataManager';

import { ImageUtils } from '../utils/imageUtils';
import PinInput from './auth/PinInput';
import AboutScreen from './AboutScreen';

import { CURRENCIES } from '../constants';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const SettingsSectionModal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
    return (
        <motion.div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-40 min-h-screen"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
        >
            <div className="w-full max-w-2xl bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl shadow-sky-900/20 mt-8 mb-8 mx-auto transform translate-y-0">
                <header className="p-4 flex items-center justify-between border-b border-slate-700">
                    <motion.h2 variants={itemVariants} className="text-xl font-bold text-white">{title}</motion.h2>
                    <motion.button
                        variants={itemVariants}
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        aria-label={`Close ${title}`}
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </motion.button>
                </header>
                <motion.div variants={itemVariants} className="p-6 overflow-y-auto max-h-[70vh]">
                    {children}
                </motion.div>
            </div>
        </motion.div>
    );
};

const UserSettings: React.FC<UserSettingsProps> = ({ isOpen, onClose }) => {
    const { user, updateUserProfile, updateUserPassword, clearUserData } = useAuth();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [activeScreen, setActiveScreen] = useState<string | null>(null);
  
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
    const [showClearDataConfirmation, setShowClearDataConfirmation] = useState(false);
    const [isClearingData, setIsClearingData] = useState(false);
  

  
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
      isEnabled: false,
      authMethod: 'pin',
      pinHash: '',
      requireOnAppResume: true,
      requireOnSensitiveActions: false
    });
    const [showPinSetup, setShowPinSetup] = useState(false);



    const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);


    // Budget data for AboutScreen
    const [budgetData, setBudgetData] = useState<BudgetData>({
        totalIncome: 0,
        categories: [],
        transactions: [],
        selectedCurrency: CURRENCIES[0].code,
        areGlobalAmountsHidden: false,
        isIncomeHidden: true,
        monthlyBudgets: [],
    });

    // Profile picture state
    const [profilePictureBase64, setProfilePictureBase64] = useState<string | null>(null);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    useEffect(() => {
      const loadUserData = async () => {
        if (user?.uid) {
          try {
            // Load user profile with preferences
            const profile = await FirebaseDataManager.getUserProfile(user.uid);
            if (profile?.preferences?.security) {
              setSecuritySettings(profile.preferences.security);
            } else {
              // Ensure we have default security settings
              const defaultSecurity: SecuritySettings = {
                isEnabled: false,
                authMethod: 'pin',
                requireOnAppResume: true,
                requireOnSensitiveActions: false
              };
              setSecuritySettings(defaultSecurity);
            }

            // Load profile picture from database first, then fallback to localStorage
            if (profile?.profilePictureBase64) {
              setProfilePictureBase64(profile.profilePictureBase64);
            } else {
              // Fallback to localStorage for migration
              const localProfilePicture = localStorage.getItem(`profilePicture_${user.uid}`);
              if (localProfilePicture) {
                setProfilePictureBase64(localProfilePicture);
                // Migrate to database
                try {
                  await FirebaseDataManager.updateProfilePicture(user.uid, localProfilePicture);
                } catch (migrationError) {
                  console.warn('Failed to migrate profile picture to database:', migrationError);
                }
              }
            }



            // Load budget data for AboutScreen
            const userData = await FirebaseDataManager.getBudgetData(user.uid);
            setBudgetData(userData);
          } catch (error) {
            console.error('Error loading user data:', error);
            // Fallback to localStorage for migration period
            const preferences = UserDataManager.loadUserPreferences(user.uid);
            setSecuritySettings(preferences.security);
            const userData = UserDataManager.loadUserData(user.uid);
            setBudgetData(userData);
          }
        }
      };

      loadUserData();
    }, [user?.uid]);

    useEffect(() => {
        if (!isOpen) {
            setActiveScreen(null);
        }
    }, [isOpen]);

    // Sync displayName state with user data
    useEffect(() => {
        if (user?.displayName !== undefined) {
            setDisplayName(user.displayName || '');
        }
    }, [user?.displayName]);


  
    const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!displayName.trim()) { addToast('Display name cannot be empty', 'error'); return; }
      setIsUpdatingProfile(true);
      try {
        await updateUserProfile(displayName.trim());
        addToast('Profile updated successfully!', 'success');
      } catch (error: any) {
        addToast(error.message || 'Failed to update profile', 'error');
      } finally {
        setIsUpdatingProfile(false);
      }
    };
  
    const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!passwordData.currentPassword.trim()) { addToast('Current password is required', 'error'); return; }
      if (passwordData.newPassword.length < 6) { addToast('New password must be at least 6 characters long', 'error'); return; }
      if (passwordData.newPassword !== passwordData.confirmNewPassword) { addToast('New passwords do not match', 'error'); return; }
      if (passwordData.currentPassword === passwordData.newPassword) { addToast('New password must be different from current password', 'error'); return; }
      
      setIsUpdatingPassword(true);
      try {
        await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
        addToast('Password updated successfully!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } catch (error: any) {
        addToast(error.message || 'Failed to update password', 'error');
      } finally {
        setIsUpdatingPassword(false);
      }
    };
  
    const handlePasswordInputChange = (field: keyof PasswordChangeData, value: string) => {
      setPasswordData(prev => ({ ...prev, [field]: value }));
    };
  
    const handleClearAllData = async () => {
      setIsClearingData(true);
      try {
        await clearUserData();
        addToast('All your data has been cleared successfully!', 'success');
        setShowClearDataConfirmation(false);
        onClose();
      } catch (error: any) {
        addToast(error.message || 'Failed to clear data', 'error');
      } finally {
        setIsClearingData(false);
      }
    };
  

  
    const handleSecurityToggle = async (enabled: boolean) => {
      if (!user?.uid) return;

      if (enabled && !securitySettings.pinHash) {
        setShowPinSetup(true);
        return;
      }

      try {
        const updatedSettings = { ...securitySettings, isEnabled: enabled };

        await FirebaseDataManager.updateUserProfile(user.uid, {
          preferences: { security: updatedSettings }
        });

        setSecuritySettings(updatedSettings);
        addToast(`Security ${enabled ? 'enabled' : 'disabled'} successfully!`, 'success');
      } catch (error) {
        console.error('Error updating security settings:', error);
        addToast('Failed to update security settings', 'error');
      }
    };

    
    const handlePinSetup = async (pin: string) => {
      if (!user?.uid) return;

      setIsUpdatingSecurity(true);
      try {
        // Simple PIN hashing using crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(pin + user.uid); // Add user ID as salt
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const updatedSettings = {
          ...securitySettings,
          isEnabled: true,
          pinHash,
          authMethod: 'pin' as const,
          requireOnAppResume: true
        };

        await FirebaseDataManager.updateUserProfile(user.uid, {
          preferences: { security: updatedSettings }
        });

        setSecuritySettings(updatedSettings);
        setShowPinSetup(false);
        addToast('PIN and security enabled successfully!', 'success');
      } catch (error) {
        console.error('Error setting up PIN:', error);
        addToast('Failed to set up PIN', 'error');
      } finally {
        setIsUpdatingSecurity(false);
      }
    };


    const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!user?.uid || !event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];

      // Validate file
      const validation = ImageUtils.validateImageFile(file);
      if (!validation.isValid) {
        addToast(validation.error || 'Invalid image file', 'error');
        return;
      }

      setIsUploadingPicture(true);

      try {
        // Resize and convert to base64
        const base64 = await ImageUtils.resizeImageToBase64(file, 200, 200, 0.8);

        // Update in Firebase
        await FirebaseDataManager.updateProfilePicture(user.uid, base64);

        // Also store in localStorage for backward compatibility
        localStorage.setItem(`profilePicture_${user.uid}`, base64);

        // Update local state
        setProfilePictureBase64(base64);
        addToast('Profile picture updated successfully!', 'success');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        addToast('Failed to upload profile picture', 'error');
      } finally {
        setIsUploadingPicture(false);
        // Clear the input
        event.target.value = '';
      }
    };

    const handleRemoveProfilePicture = async () => {
      if (!user?.uid) return;

      try {
        // Update profile in database to remove picture
        await FirebaseDataManager.updateUserProfile(user.uid, {
          profilePictureBase64: null
        });

        // Update local state
        setProfilePictureBase64(null);

        // Also remove from localStorage for backward compatibility
        localStorage.removeItem(`profilePicture_${user.uid}`);

        addToast('Profile picture removed successfully!', 'success');
      } catch (error) {
        console.error('Error removing profile picture:', error);
        addToast('Failed to remove profile picture', 'error');
      }
    };
    
    const ProfileSection = useCallback(() => (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                <label className="block text-lg font-semibold text-slate-200 mb-3">Profile Picture</label>
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                        {profilePictureBase64 ? (
                            <div className="relative">
                                <img
                                    src={profilePictureBase64}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-3xl object-cover border-4 border-violet-500/30 shadow-2xl group-hover:shadow-violet-500/40 transition-all duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400/20 via-sky-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                {/* Decorative elements */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-3xl flex items-center justify-center text-6xl font-bold border-4 border-violet-500/30 shadow-2xl group-hover:shadow-violet-500/40 transition-all duration-500 group-hover:scale-105">
                                    <span className="bg-gradient-to-br from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-lg">
                                        {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400/20 via-purple-500/15 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                
                                {/* Floating decorative elements */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-2 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                                    <div className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-sky-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                                    <div className="absolute top-6 left-6 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
                                </div>
                                
                                {/* Decorative corner elements */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPicture} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-violet-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100">
                            {isUploadingPicture ? 'Uploading...' : 'Change Photo'}
                        </button>
                        {profilePictureBase64 && (
                            <button type="button" onClick={handleRemoveProfilePicture} disabled={isUploadingPicture} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100">
                                Remove
                            </button>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
                    <input type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input type="email" id="email" value={user?.email || ''} disabled className="w-full p-3 bg-slate-800 border border-slate-700 rounded-md cursor-not-allowed text-slate-400" />
                </div>
            </div>
            <button type="submit" disabled={isUpdatingProfile} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-600 transition">
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </button>
        </form>
    ), [displayName, user?.email, profilePictureBase64, isUploadingPicture, isUpdatingProfile, handleUpdateProfile, handleRemoveProfilePicture, handleProfilePictureUpload]);
    
    const PasswordSection = useCallback(() => (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
                <input type={showCurrentPassword ? 'text' : 'password'} id="currentPassword" value={passwordData.currentPassword} onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500" />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-300">
                    {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
            <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                <input type={showNewPassword ? 'text' : 'password'} id="newPassword" value={passwordData.newPassword} onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-300">
                    {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
            <div className="relative">
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                <input type={showConfirmPassword ? 'text' : 'password'} id="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={(e) => handlePasswordInputChange('confirmNewPassword', e.target.value)} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-300">
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
            <button type="submit" disabled={isUpdatingPassword} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-600 transition">
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    ), [passwordData, showCurrentPassword, showNewPassword, showConfirmPassword, isUpdatingPassword, handleUpdatePassword, handlePasswordInputChange]);



    const SecuritySection = useCallback(() => (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                    <h4 className="font-semibold text-white">Enable Security Features</h4>
                    <p className="text-sm text-slate-400">Lock the app with a PIN when you return to it.</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSecurityToggle(!securitySettings.isEnabled);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 cursor-pointer ${securitySettings.isEnabled ? 'bg-sky-600' : 'bg-slate-700'}`}
                    style={{ pointerEvents: 'auto' }}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        style={{ pointerEvents: 'none' }}
                    />
                </button>
            </div>
            {securitySettings.isEnabled && (
                <>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                        <button onClick={() => setShowPinSetup(true)} className="w-full text-center text-sky-400 font-semibold hover:text-sky-300">
                            Change PIN
                        </button>
                    </div>
                </>
            )}
        </div>
    ), [securitySettings, handleSecurityToggle, setShowPinSetup]);

    const DataSection = useCallback(() => (
        <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-red-500/30">
            <h4 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h4>
            <p className="text-slate-400 mb-4">Permanently delete all your budget and transaction data. This action cannot be undone.</p>
            <button onClick={() => { setShowClearDataConfirmation(true); setActiveScreen(null); }} className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition">
                Clear All Data
            </button>
        </div>
    ), [setShowClearDataConfirmation, setActiveScreen]);

    const sections = useMemo(() => ({
        profile: { title: 'Profile Settings', icon: UserIcon, component: ProfileSection() },
        password: { title: 'Change Password', icon: LockClosedIcon, component: PasswordSection() },
        security: { title: 'Security Settings', icon: FingerPrintIcon, component: SecuritySection() },
        data: { title: 'Data Management', icon: TrashIcon, component: DataSection() },
    }), [
        displayName,
        user?.email,
        profilePictureBase64,
        isUploadingPicture,
        isUpdatingProfile,
        passwordData,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
        isUpdatingPassword,
        securitySettings,
        isClearingData,
        ProfileSection,
        PasswordSection,
        SecuritySection,
        DataSection
    ]);

    return (
        <AnimatePresence>
            {isOpen && !activeScreen && (
                <motion.div
                    key="settings-main"
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-40 min-h-screen"
                    initial="hidden" animate="visible" exit="exit" variants={modalVariants}
                >
                    <div className="w-full max-w-md bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl mt-8 mb-8 mx-auto transform translate-y-0">
                        <header className="p-4 flex items-center justify-between border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">Settings</h2>
                            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <nav className="p-4 space-y-2">
                            {Object.entries(sections).map(([key, { title, icon: Icon }]) => (
                                <button key={key} onClick={() => setActiveScreen(key)} className="w-full text-left flex items-center gap-4 p-4 rounded-lg transition-colors text-slate-300 hover:bg-slate-700">
                                    <Icon className="w-6 h-6 text-sky-400" />
                                    <span className="font-semibold">{title}</span>
                                </button>
                            ))}
                            <button key="about-button" onClick={() => setActiveScreen('about')} className="w-full text-left flex items-center gap-4 p-4 rounded-lg transition-colors text-slate-300 hover:bg-slate-700">
                                <InfoIcon className="w-6 h-6 text-sky-400" />
                                <span className="font-semibold">About</span>
                            </button>
                        </nav>
                    </div>
                </motion.div>
            )}

            {activeScreen && activeScreen !== 'about' && sections[activeScreen as keyof typeof sections] && !showPinSetup && (
                <SettingsSectionModal key={`settings-${activeScreen}`} title={sections[activeScreen as keyof typeof sections].title} onClose={() => setActiveScreen(null)}>
                    {sections[activeScreen as keyof typeof sections].component}
                </SettingsSectionModal>
            )}

            {activeScreen === 'about' && !showPinSetup && (
                <AboutScreen
                    key="about-screen"
                    onClose={() => setActiveScreen(null)}
                    budgetData={budgetData}
                    selectedCurrency={budgetData.selectedCurrency}
                />
            )}

            <DangerousActionModal
                key="clear-data-modal"
                isOpen={showClearDataConfirmation}
                onClose={() => setShowClearDataConfirmation(false)}
                onConfirm={handleClearAllData}
                title="Confirm Data Deletion"
                message="Are you sure you want to delete all your data? This action is irreversible."
                confirmText="Delete Data"
                isActionInProgress={isClearingData}
            />

            {showPinSetup && (
                <PinInput
                    key="pin-setup"
                    onPinComplete={handlePinSetup}
                    onCancel={() => setShowPinSetup(false)}
                    mode="setup"
                    title="Set Up PIN"
                    subtitle="Choose a 4-digit PIN to secure your budget data"
                />
            )}


        </AnimatePresence>
    );
};

export default UserSettings;
