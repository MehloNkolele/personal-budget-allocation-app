import { NativeBiometric, BiometryType, AvailableResult } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { BiometricAuthResult } from '../types';

export class BiometricService {
  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  static async getBiometryType(): Promise<BiometryType | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      const result = await NativeBiometric.isAvailable();
      return result.biometryType || null;
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticate(reason: string = 'Please authenticate to access your budget data'): Promise<BiometricAuthResult> {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: false,
        error: 'Biometric authentication is not available on web platform'
      };
    }

    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      await NativeBiometric.verifyIdentity({
        reason: reason,
        title: 'Budget Tracker Authentication',
        subtitle: 'Use your biometric to unlock the app',
        description: reason
      });

      const biometryType = await this.getBiometryType();
      const typeName = biometryType ? this.getBiometricTypeName(biometryType) : undefined;
      
      return {
        success: true,
        biometryType: typeName
      };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Biometric authentication failed';
      
      if (error.message) {
        if (error.message.includes('User canceled') || error.message.includes('cancelled')) {
          errorMessage = 'Authentication was cancelled';
        } else if (error.message.includes('not enrolled')) {
          errorMessage = 'No biometric data enrolled on this device';
        } else if (error.message.includes('not available')) {
          errorMessage = 'Biometric authentication is not available';
        } else if (error.message.includes('too many attempts')) {
          errorMessage = 'Too many failed attempts. Please try again later';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get a user-friendly name for the biometric type
   */
  static getBiometricTypeName(biometryType: BiometryType | null): string {
    if (!biometryType) return 'Biometric';
    
    switch (biometryType) {
      case BiometryType.TOUCH_ID:
        return 'Touch ID';
      case BiometryType.FACE_ID:
        return 'Face ID';
      case BiometryType.FINGERPRINT:
        return 'Fingerprint';
      case BiometryType.FACE_AUTHENTICATION:
        return 'Face Authentication';
      case BiometryType.IRIS_AUTHENTICATION:
        return 'Iris Authentication';
      default:
        return 'Biometric';
    }
  }

  /**
   * Check if device supports biometric authentication and user has enrolled
   */
  static async canUseBiometric(): Promise<{ canUse: boolean; reason?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return {
        canUse: false,
        reason: 'Biometric authentication is only available on mobile devices'
      };
    }

    try {
      const result = await NativeBiometric.isAvailable();
      
      if (!result.isAvailable) {
        return {
          canUse: false,
          reason: 'Biometric authentication is not available on this device'
        };
      }

      // Some devices/implementations don't have this property, so we'll assume biometrics are 
      // enrolled if the library reports they're available
      return { canUse: true };
    } catch (error) {
      console.error('Error checking biometric capability:', error);
      return {
        canUse: false,
        reason: 'Unable to check biometric availability'
      };
    }
  }
}
