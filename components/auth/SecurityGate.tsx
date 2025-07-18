import React, { useState, useEffect } from 'react';
import { UserDataManager } from '../../utils/userDataManager';
import { useToast } from '../../hooks/useToast';
import PinInput from './PinInput';
import { LockClosedIcon } from '../../constants';
import { SecuritySettings } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

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
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadSecuritySettings();
  }, [userId]);

  const loadSecuritySettings = () => {
    const settings = UserDataManager.getSecuritySettings(userId);
    setSecuritySettings(settings);
  };



  const handlePinAuth = async (pin: string) => {
    if (!securitySettings?.pinHash || !user?.uid) {
      setError('PIN not configured. Please set up security in settings.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use the same hashing method as in UserSettings
      const encoder = new TextEncoder();
      const data = encoder.encode(pin + user.uid); // Add user ID as salt
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashedPin === securitySettings.pinHash) {
        // Success authentication without toast - it will show in main app
        onAuthenticated();
      } else {
        // Show error directly in the PIN input form instead of toast
        setError('Incorrect PIN. Please try again.');
      }
    } catch (error: any) {
      console.error('PIN authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  if (!securitySettings) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading security settings...</div>
      </div>
    );
  }

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
};

export default SecurityGate;
