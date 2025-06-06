import React, { useState, useEffect, useRef } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '../../constants';

interface PinInputProps {
  onPinComplete: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string;
  pinLength?: number;
  showCancel?: boolean;
  mode?: 'setup' | 'verify';
}

const PinInput: React.FC<PinInputProps> = ({
  onPinComplete,
  onCancel,
  title = 'Enter PIN',
  subtitle = 'Please enter your PIN to continue',
  isLoading = false,
  error,
  pinLength = 4,
  showCancel = true,
  mode = 'verify'
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (pin.length === pinLength) {
      onPinComplete(pin);
    }
  }, [pin, pinLength, onPinComplete]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedPin = value.slice(0, pinLength);
      setPin(pastedPin);
      
      // Focus the last input or the next empty one
      const nextIndex = Math.min(pastedPin.length - 1, pinLength - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (!/^\d*$/.test(value)) {
      return; // Only allow digits
    }

    const newPin = pin.split('');
    newPin[index] = value;
    const updatedPin = newPin.join('').slice(0, pinLength);
    setPin(updatedPin);

    // Move to next input
    if (value && index < pinLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newPin = pin.split('');
        newPin[index] = '';
        setPin(newPin.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < pinLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const clearPin = () => {
    setPin('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400">{subtitle}</p>
        </div>

        {/* PIN Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex justify-center space-x-3 mb-6">
            {Array.from({ length: pinLength }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type={showPin ? 'text' : 'password'}
                value={pin[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                maxLength={1}
                disabled={isLoading}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          {/* Show/Hide PIN Toggle */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
              disabled={isLoading}
            >
              {showPin ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
              <span className="text-sm">{showPin ? 'Hide PIN' : 'Show PIN'}</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm text-center mb-4">
              {error}
            </div>
          )}

          {/* Clear PIN Button */}
          {pin.length > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={clearPin}
                className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                disabled={isLoading}
              >
                Clear PIN
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center space-x-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Verifying...</span>
            </div>
          </div>
        )}

        {/* Setup Mode Instructions */}
        {mode === 'setup' && (
          <div className="text-center mt-6">
            <p className="text-sm text-slate-400">
              Choose a {pinLength}-digit PIN that you'll remember. This will be required to access your budget data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinInput;
