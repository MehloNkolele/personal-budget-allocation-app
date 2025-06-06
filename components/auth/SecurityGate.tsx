import React, { useState, useEffect } from 'react';
import { BiometricService } from '../../services/biometricService';
import { UserDataManager } from '../../utils/userDataManager';
import { useToast } from '../../hooks/useToast';
import PinInput from './PinInput';
import { LockClosedIcon, FingerPrintIcon } from '../../constants';
import { SecuritySettings } from '../../types';

interface SecurityGateProps {
  userId: string;
  onAuthenticated: () => void;
  onCancel?: () => void;
  reason?: string;
}

const SecurityGate: React.FC<SecurityGateProps> = ({
  userId,
  onAuthenticated,
  onCancel,
  reason = 'Please authenticate to access your budget data'
}) => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric'>('pin');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const { addToast } = useToast();

  useEffect(() => {
    loadSecuritySettings();
    checkBiometricAvailability();
  }, [userId]);

  const loadSecuritySettings = () => {
    const settings = UserDataManager.getSecuritySettings(userId);
    setSecuritySettings(settings);
    
    // Set initial auth method based on settings
    if (settings.authMethod === 'biometric') {
      setAuthMethod('biometric');
    } else if (settings.authMethod === 'both') {
      setAuthMethod('biometric'); // Try biometric first
    } else {
      setAuthMethod('pin');
    }
  };

  const checkBiometricAvailability = async () => {
    const { canUse } = await BiometricService.canUseBiometric();
    setBiometricAvailable(canUse);
    
    if (canUse) {
      const type = await BiometricService.getBiometryType();
      setBiometricType(BiometricService.getBiometricTypeName(type));
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await BiometricService.authenticate(reason);
      
      if (result.success) {
        addToast('Authentication successful!', 'success');
        onAuthenticated();
      } else {
        setError(result.error || 'Biometric authentication failed');
        
        // If biometric fails and PIN is available, switch to PIN
        if (securitySettings?.authMethod === 'both' || securitySettings?.authMethod === 'pin') {
          setAuthMethod('pin');
        }
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      setError('Authentication failed. Please try again.');
      
      // Switch to PIN if available
      if (securitySettings?.authMethod === 'both' || securitySettings?.authMethod === 'pin') {
        setAuthMethod('pin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinAuth = async (pin: string) => {
    if (!securitySettings?.pinHash) {
      setError('PIN not configured. Please set up security in settings.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simple hash comparison (in production, use proper hashing)
      const hashedPin = btoa(pin); // Base64 encoding for demo
      
      if (hashedPin === securitySettings.pinHash) {
        addToast('Authentication successful!', 'success');
        onAuthenticated();
      } else {
        setError('Incorrect PIN. Please try again.');
      }
    } catch (error: any) {
      console.error('PIN authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchAuthMethod = () => {
    if (!securitySettings) return;
    
    if (authMethod === 'pin' && securitySettings.authMethod === 'both' && biometricAvailable) {
      setAuthMethod('biometric');
    } else if (authMethod === 'biometric' && (securitySettings.authMethod === 'both' || securitySettings.authMethod === 'pin')) {
      setAuthMethod('pin');
    }
    setError('');
  };

  // Auto-trigger biometric authentication when component loads
  useEffect(() => {
    if (securitySettings && authMethod === 'biometric' && biometricAvailable && !isLoading) {
      handleBiometricAuth();
    }
  }, [securitySettings, authMethod, biometricAvailable]);

  if (!securitySettings) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading security settings...</div>
      </div>
    );
  }

  if (authMethod === 'pin') {
    return (
      <PinInput
        onPinComplete={handlePinAuth}
        onCancel={onCancel}
        title="Enter PIN"
        subtitle={reason}
        isLoading={isLoading}
        error={error}
        showCancel={!!onCancel}
      />
    );
  }

  // Biometric authentication UI
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FingerPrintIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {biometricType} Authentication
          </h1>
          <p className="text-slate-400">{reason}</p>
        </div>

        {/* Biometric Authentication */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
          {error && (
            <div className="text-red-400 text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleBiometricAuth}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <FingerPrintIcon className="w-5 h-5" />
                <span>Use {biometricType}</span>
              </>
            )}
          </button>

          {/* Switch to PIN option */}
          {(securitySettings.authMethod === 'both' || securitySettings.authMethod === 'pin') && (
            <button
              onClick={switchAuthMethod}
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <LockClosedIcon className="w-4 h-4" />
              <span>Use PIN instead</span>
            </button>
          )}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default SecurityGate;
