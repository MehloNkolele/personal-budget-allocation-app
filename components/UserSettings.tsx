import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import DangerousActionModal from './DangerousActionModal';
import { UserIcon, PhotoIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, TrashIcon, FingerPrintIcon, InfoIcon, XMarkIcon } from '../constants';
import { PasswordChangeData, SecuritySettings } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import { BiometricService } from '../services/biometricService';
import PinInput from './auth/PinInput';
import AboutScreen from './AboutScreen';

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
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
        >
            <div className="w-full max-w-2xl bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl shadow-sky-900/20">
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
    const [profilePicture, setProfilePicture] = useState<string | null>(user?.photoURL || null);
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
  
    const [showSplashScreen, setShowSplashScreen] = useState(true);
  
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
      isEnabled: false,
      authMethod: 'pin',
      pinHash: '',
      requireOnAppResume: true,
      requireOnSensitiveActions: false
    });
    const [showPinSetup, setShowPinSetup] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('');
    const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  
    useEffect(() => {
      if (user?.uid) {
        const preferences = UserDataManager.loadUserPreferences(user.uid);
        setShowSplashScreen(preferences.showSplashScreen);
        setSecuritySettings(preferences.security);
        checkBiometricAvailability();
      }
    }, [user?.uid]);

    useEffect(() => {
        if (!isOpen) {
            setActiveScreen(null);
        }
    }, [isOpen]);
  
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
        if (file.size > 2 * 1024 * 1024) { addToast('Profile picture must be smaller than 2MB', 'error'); return; }
        if (!file.type.startsWith('image/')) { addToast('Please select a valid image file', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (e) => setProfilePicture(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
  
    const handleRemoveProfilePicture = () => {
      setProfilePicture(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (user?.uid) localStorage.removeItem(`profilePicture_${user.uid}`);
    };
  
    const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!displayName.trim()) { addToast('Display name cannot be empty', 'error'); return; }
      setIsUpdatingProfile(true);
      try {
        await updateUserProfile(displayName.trim(), profilePicture || undefined);
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
  
    const handleSplashScreenToggle = (enabled: boolean) => {
      if (user?.uid) {
        UserDataManager.updateSplashScreenPreference(user.uid, enabled);
        setShowSplashScreen(enabled);
        addToast(`Splash screen ${enabled ? 'enabled' : 'disabled'} successfully!`, 'success');
      }
    };
  
    const handleSecurityToggle = (enabled: boolean) => {
      if (!user?.uid) return;
      if (enabled && !securitySettings.pinHash) {
        setShowPinSetup(true);
        return;
      }
      const updatedSettings = { ...securitySettings, isEnabled: enabled };
      UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
      setSecuritySettings(updatedSettings);
      addToast(`Security ${enabled ? 'enabled' : 'disabled'} successfully!`, 'success');
    };
  
    const handleAuthMethodChange = (method: 'pin' | 'biometric' | 'both') => {
      if (!user?.uid) return;
      if ((method === 'biometric' || method === 'both') && !biometricAvailable) {
        addToast('Biometric authentication is not available on this device', 'error');
        return;
      }
      const updatedSettings = { ...securitySettings, authMethod: method };
      UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
      setSecuritySettings(updatedSettings);
      addToast('Authentication method updated successfully!', 'success');
    };
    
    const handlePinSetup = async (pin: string) => {
      if (!user?.uid) return;
      setIsUpdatingSecurity(true);
      try {
        const pinHash = await BiometricService.hashPin(pin);
        const updatedSettings = { ...securitySettings, isEnabled: true, pinHash };
        UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
        setSecuritySettings(updatedSettings);
        setShowPinSetup(false);
        addToast('PIN and security enabled successfully!', 'success');
      } catch (error) {
        addToast('Failed to set up PIN', 'error');
      } finally {
        setIsUpdatingSecurity(false);
      }
    };
  
    const handleRequireOnResumeToggle = (enabled: boolean) => {
      if(user?.uid) {
        const updatedSettings = { ...securitySettings, requireOnAppResume: enabled };
        UserDataManager.updateSecuritySettings(user.uid, updatedSettings);
        setSecuritySettings(updatedSettings);
        addToast(`'Require on resume' ${enabled ? 'enabled' : 'disabled'}.`, 'success');
      }
    };
    
    const ProfileSection = () => (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
                <label className="block text-lg font-semibold text-slate-200 mb-3">Profile Picture</label>
                <div className="flex flex-col items-center space-y-4">
                    {profilePicture ? <img src={profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-sky-500" /> : <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-bold text-sky-400 border-2 border-slate-600">{displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</div>}
                    <div className="flex gap-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sky-700 transition">Change</button>
                        {profilePicture && <button type="button" onClick={handleRemoveProfilePicture} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">Remove</button>}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
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
    );
    
    const PasswordSection = () => (
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
    );

    const PreferencesSection = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                    <h4 className="font-semibold text-white">Show Welcome Screen</h4>
                    <p className="text-sm text-slate-400">Display intro screen on app start.</p>
                </div>
                <button onClick={() => handleSplashScreenToggle(!showSplashScreen)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showSplashScreen ? 'bg-sky-600' : 'bg-slate-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showSplashScreen ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
    );

    const SecuritySection = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                    <h4 className="font-semibold text-white">Enable Security Features</h4>
                    <p className="text-sm text-slate-400">Lock the app with a PIN or biometrics.</p>
                </div>
                <button onClick={() => handleSecurityToggle(!securitySettings.isEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.isEnabled ? 'bg-sky-600' : 'bg-slate-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            {securitySettings.isEnabled && (
                <>
                    <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                        <label className="font-semibold text-white">Authentication Method</label>
                        <select onChange={(e) => handleAuthMethodChange(e.target.value as any)} value={securitySettings.authMethod} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md">
                            <option value="pin">PIN</option>
                            {biometricAvailable && <option value="biometric">{biometricType}</option>}
                            {biometricAvailable && <option value="both">PIN or {biometricType}</option>}
                        </select>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                        <button onClick={() => setShowPinSetup(true)} className="w-full text-center text-sky-400 font-semibold hover:text-sky-300">
                            Change PIN
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-white">Require Auth on App Resume</h4>
                            <p className="text-sm text-slate-400">Ask for authentication when you return to the app.</p>
                        </div>
                        <button onClick={() => handleRequireOnResumeToggle(!securitySettings.requireOnAppResume)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.requireOnAppResume ? 'bg-sky-600' : 'bg-slate-700'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.requireOnAppResume ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    const DataSection = () => (
        <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-red-500/30">
            <h4 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h4>
            <p className="text-slate-400 mb-4">Permanently delete all your budget and transaction data. This action cannot be undone.</p>
            <button onClick={() => { setShowClearDataConfirmation(true); setActiveScreen(null); }} className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition">
                Clear All Data
            </button>
        </div>
    );

    const sections = {
        profile: { title: 'Profile Settings', icon: UserIcon, component: <ProfileSection /> },
        password: { title: 'Change Password', icon: LockClosedIcon, component: <PasswordSection /> },
        preferences: { title: 'App Preferences', icon: PhotoIcon, component: <PreferencesSection /> },
        security: { title: 'Security Settings', icon: FingerPrintIcon, component: <SecuritySection /> },
        data: { title: 'Data Management', icon: TrashIcon, component: <DataSection /> },
    };

    return (
        <AnimatePresence>
            {isOpen && !activeScreen && (
                <motion.div
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-40"
                    initial="hidden" animate="visible" exit="exit" variants={modalVariants}
                >
                    <div className="w-full max-w-md bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl">
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
                            <button onClick={() => setActiveScreen('about')} className="w-full text-left flex items-center gap-4 p-4 rounded-lg transition-colors text-slate-300 hover:bg-slate-700">
                                <InfoIcon className="w-6 h-6 text-sky-400" />
                                <span className="font-semibold">About</span>
                            </button>
                        </nav>
                    </div>
                </motion.div>
            )}

            {activeScreen && activeScreen !== 'about' && sections[activeScreen as keyof typeof sections] && (
                <SettingsSectionModal title={sections[activeScreen as keyof typeof sections].title} onClose={() => setActiveScreen(null)}>
                    {sections[activeScreen as keyof typeof sections].component}
                </SettingsSectionModal>
            )}

            {activeScreen === 'about' && <AboutScreen onClose={() => setActiveScreen(null)} />}

            <DangerousActionModal
                isOpen={showClearDataConfirmation}
                onClose={() => setShowClearDataConfirmation(false)}
                onConfirm={handleClearAllData}
                title="Confirm Data Deletion"
                message="Are you sure you want to delete all your data? This action is irreversible."
                confirmText="Delete Data"
                isActionInProgress={isClearingData}
            />

            {showPinSetup && <PinInput onPinComplete={handlePinSetup} onCancel={() => setShowPinSetup(false)} mode="setup" />}
        </AnimatePresence>
    );
};

export default UserSettings;
