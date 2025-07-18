import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase.config';
import { User, AuthContextType } from '../types';
import { FirebaseDataManager } from '../services/firebaseDataManager';
import { UserDataManager } from '../utils/userDataManager';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert Firebase User to our User type
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  // Check for custom profile picture in localStorage
  const customPhotoURL = localStorage.getItem(`profilePicture_${firebaseUser.uid}`);

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: customPhotoURL || firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [requiresSecurityAuth, setRequiresSecurityAuth] = useState(false);

  // Store the previous auth state for detecting new login
  const [previousAuthState, setPreviousAuthState] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user to our User type
        const mappedUser = mapFirebaseUser(firebaseUser);
        setUser(mappedUser);
        
        // Check if this is a new login (not a page refresh)
        // We use localStorage to keep track across page reloads
        const currentAuthState = localStorage.getItem('authState');
        if (currentAuthState !== firebaseUser.uid) {
          // This is a new login
          localStorage.setItem('authState', firebaseUser.uid);
          
          // Show welcome toast after successful login
          // Delay to ensure it appears after navigation completes
          setTimeout(() => {
            const displayName = firebaseUser.displayName || 
                               firebaseUser.email?.split('@')[0] || 'User';
            
            window.dispatchEvent(new CustomEvent('show-toast', { 
              detail: { message: `Welcome back, ${displayName}!`, type: 'success' }
            }));
          }, 500);
        }

        // Check if security authentication is required
        const shouldRequireAuth = UserDataManager.shouldRequireAuthentication(firebaseUser.uid);
        setRequiresSecurityAuth(shouldRequireAuth);
      } else {
        // No user is signed in
        setUser(null);
        setRequiresSecurityAuth(false);
        
        // Clear auth state when logging out
        localStorage.removeItem('authState');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Set up app state listeners for mobile
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user) return;

    const handleAppStateChange = async (state: any) => {
      console.log('App state changed:', state);
      console.log('Current user:', user?.uid);
      console.log('Security enabled:', UserDataManager.isSecurityEnabled(user.uid));

      if (state.isActive) {
        // App came to foreground
        console.log('App came to foreground, checking if authentication is required');

        // Check if security authentication is required
        const shouldRequireAuth = UserDataManager.shouldRequireAuthentication(user.uid);
        console.log('Should require auth:', shouldRequireAuth);

        if (shouldRequireAuth) {
          console.log('Setting requiresSecurityAuth to true');
          setRequiresSecurityAuth(true);
        } else {
          console.log('Authentication not required, setting app in foreground');
          UserDataManager.setAppInForeground(user.uid);
        }
      } else {
        // App went to background
        console.log('App went to background, setting background state');
        UserDataManager.setAppInBackground(user.uid);
      }
    };

    let cleanup: (() => void) | undefined;
    
    // Add the app state change listener
    const setupListener = async () => {
      const listener = await App.addListener('appStateChange', handleAppStateChange);
      cleanup = () => {
        listener.remove();
      };
    };
    
    setupListener();

    // Check authentication requirement on initial mount
    const checkInitialAuth = async () => {
      const shouldRequireAuth = UserDataManager.shouldRequireAuthentication(user.uid);
      if (shouldRequireAuth) {
        setRequiresSecurityAuth(true);
      }
    };
    
    checkInitialAuth();

    return () => {
      if (cleanup) cleanup();
    };
  }, [user]);

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        // Update local state with the new display name
        setUser(mapFirebaseUser(userCredential.user));
      }
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Don't perform any toast-related actions here
      // Just authenticate the user
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // No need to dispatch login success events here
      // We'll show a welcome toast in the main app through onAuthStateChanged
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      // Don't perform any toast-related actions here
      // Just authenticate the user
      await signInWithPopup(auth, googleProvider);
      
      // No need to dispatch login success events here
      // We'll show a welcome toast in the main app through onAuthStateChanged
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoggingOut(true);
      // Save income hidden state to true for security before logging out
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userData = UserDataManager.loadUserData(userId);
        
        // Set income to hidden
        userData.isIncomeHidden = true;
        
        // Save the updated data
        UserDataManager.saveUserData(userId, userData);
      }
      
      await firebaseSignOut(auth);



      // Note: We don't clear user data here to preserve it for when they sign back in
      // Data is only cleared when explicitly requested by the user
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const clearUserData = async (): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in.');
      }

      const userId = auth.currentUser.uid;
      await FirebaseDataManager.clearUserData(userId);
    } catch (error: any) {
      throw new Error('Failed to clear user data. Please try again.');
    }
  };

  // Security authentication methods
  const completeSecurityAuth = (): void => {
    setRequiresSecurityAuth(false);
    if (user) {
      UserDataManager.setAppInForeground(user.uid);
      
      // Show welcome back message after security auth (subtle, not with name)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `Authentication successful`, type: 'success', duration: 2000 }
        }));
      }, 300);
    }
  };

  const requireSecurityAuth = (): void => {
    setRequiresSecurityAuth(true);
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string | null): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in.');
      }

      // Update Firebase profile
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

      // Handle profile picture
      if (photoURL) {
        // Store base64 image in localStorage
        localStorage.setItem(`profilePicture_${auth.currentUser.uid}`, photoURL);
      } else if (photoURL === null) {
        // Remove profile picture from localStorage
        localStorage.removeItem(`profilePicture_${auth.currentUser.uid}`);
      }

      // Update local state
      setUser(mapFirebaseUser(auth.currentUser));
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code) || 'Failed to update profile.');
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user is currently signed in.');
      }

      // Validate inputs
      if (!currentPassword || !newPassword) {
        throw new Error('Both current and new passwords are required.');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      // Log the actual error for debugging
      console.error('Password update error:', error);

      // Provide user-friendly error message
      if (error.code) {
        throw new Error(getAuthErrorMessage(error.code));
      } else {
        throw new Error(error.message || 'Failed to update password. Please try again.');
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isLoggingOut,
    requiresSecurityAuth,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    clearUserData,
    completeSecurityAuth,
    requireSecurityAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to provide user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect current password. Please try again.';
    case 'auth/invalid-credential':
      return 'The current password you entered is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/requires-recent-login':
      return 'For security reasons, please sign out and sign back in before changing your password.';
    case 'auth/user-mismatch':
      return 'The credentials do not match the current user.';
    case 'auth/invalid-password':
      return 'The current password is incorrect.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};
