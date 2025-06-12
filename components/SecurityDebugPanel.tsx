import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserDataManager } from '../utils/userDataManager';
import { BiometricService } from '../services/biometricService';
import { Capacitor } from '@capacitor/core';

interface SecurityDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecurityDebugPanel: React.FC<SecurityDebugPanelProps> = ({ isOpen, onClose }) => {
  const { user, requiresSecurityAuth } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [biometricInfo, setBiometricInfo] = useState<any>({});

  useEffect(() => {
    if (isOpen && user?.uid) {
      updateDebugInfo();
      checkBiometricInfo();
    }
  }, [isOpen, user?.uid]);

  const updateDebugInfo = () => {
    if (!user?.uid) return;

    const securitySettings = UserDataManager.getSecuritySettings(user.uid);
    const wasInBackground = localStorage.getItem(`budgetApp_${user.uid}_appInBackground`);
    const backgroundTime = localStorage.getItem(`budgetApp_${user.uid}_backgroundTime`);
    const shouldRequireAuth = UserDataManager.shouldRequireAuthentication(user.uid);

    setDebugInfo({
      userId: user.uid,
      isNativePlatform: Capacitor.isNativePlatform(),
      securityEnabled: securitySettings.isEnabled,
      authMethod: securitySettings.authMethod,
      requireOnAppResume: securitySettings.requireOnAppResume,
      hasPinHash: !!securitySettings.pinHash,
      wasInBackground,
      backgroundTime: backgroundTime ? new Date(parseInt(backgroundTime)).toLocaleString() : null,
      timeSinceBackground: backgroundTime ? Date.now() - parseInt(backgroundTime) : null,
      shouldRequireAuth,
      requiresSecurityAuth,
      currentTime: new Date().toLocaleString()
    });
  };

  const checkBiometricInfo = async () => {
    const isAvailable = await BiometricService.isAvailable();
    const canUse = await BiometricService.canUseBiometric();
    const biometryType = await BiometricService.getBiometryType();
    const typeName = BiometricService.getBiometricTypeName(biometryType);

    setBiometricInfo({
      isAvailable,
      canUse: canUse.canUse,
      canUseReason: canUse.reason,
      biometryType,
      typeName
    });
  };

  const simulateBackground = () => {
    if (!user?.uid) return;
    UserDataManager.setAppInBackground(user.uid);
    updateDebugInfo();
  };

  const simulateForeground = () => {
    if (!user?.uid) return;
    UserDataManager.setAppInForeground(user.uid);
    updateDebugInfo();
  };

  const testBiometric = async () => {
    try {
      const result = await BiometricService.authenticate('Test authentication');
      alert(`Biometric test result: ${result.success ? 'Success' : 'Failed - ' + result.error}`);
    } catch (error) {
      alert(`Biometric test error: ${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Security Debug Panel</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* App State Info */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">App State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Platform:</span>
                <span className="text-white">{debugInfo.isNativePlatform ? 'Native' : 'Web'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">User ID:</span>
                <span className="text-white font-mono text-xs">{debugInfo.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Current Time:</span>
                <span className="text-white">{debugInfo.currentTime}</span>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Security Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Security Enabled:</span>
                <span className={`${debugInfo.securityEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {debugInfo.securityEnabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Auth Method:</span>
                <span className="text-white">{debugInfo.authMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Require on Resume:</span>
                <span className={`${debugInfo.requireOnAppResume ? 'text-green-400' : 'text-red-400'}`}>
                  {debugInfo.requireOnAppResume ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Has PIN:</span>
                <span className={`${debugInfo.hasPinHash ? 'text-green-400' : 'text-red-400'}`}>
                  {debugInfo.hasPinHash ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Background State */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Background State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Was in Background:</span>
                <span className={`${debugInfo.wasInBackground ? 'text-yellow-400' : 'text-green-400'}`}>
                  {debugInfo.wasInBackground ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Background Time:</span>
                <span className="text-white">{debugInfo.backgroundTime || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Time Since Background:</span>
                <span className="text-white">
                  {debugInfo.timeSinceBackground ? `${debugInfo.timeSinceBackground}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Should Require Auth:</span>
                <span className={`${debugInfo.shouldRequireAuth ? 'text-red-400' : 'text-green-400'}`}>
                  {debugInfo.shouldRequireAuth ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Currently Requires Auth:</span>
                <span className={`${debugInfo.requiresSecurityAuth ? 'text-red-400' : 'text-green-400'}`}>
                  {debugInfo.requiresSecurityAuth ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Biometric Info */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Biometric Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Available:</span>
                <span className={`${biometricInfo.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {biometricInfo.isAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Can Use:</span>
                <span className={`${biometricInfo.canUse ? 'text-green-400' : 'text-red-400'}`}>
                  {biometricInfo.canUse ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Type:</span>
                <span className="text-white">{biometricInfo.typeName || 'N/A'}</span>
              </div>
              {!biometricInfo.canUse && biometricInfo.canUseReason && (
                <div className="text-red-400 text-xs mt-2">
                  Reason: {biometricInfo.canUseReason}
                </div>
              )}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Test Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={simulateBackground}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-sm"
              >
                Simulate Background
              </button>
              <button
                onClick={simulateForeground}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm"
              >
                Simulate Foreground
              </button>
              <button
                onClick={updateDebugInfo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
              >
                Refresh Info
              </button>
              <button
                onClick={testBiometric}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm"
                disabled={!biometricInfo.canUse}
              >
                Test Biometric
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDebugPanel;
