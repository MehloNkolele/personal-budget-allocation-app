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
import { UserDataManager } from '../utils/userDataManager';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
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

      // Set a flag to indicate this was an intentional logout (not a page refresh)
      // This will trigger splash screen to show after logout
      localStorage.setItem('justLoggedOut', 'true');

      // Remove the global flag that prevents splash screen for non-authenticated users
      localStorage.removeItem('hasSeenSplash');

      // Note: We don't clear user data here to preserve it for when they sign back in
      // Data is only cleared when explicitly requested by the user
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
    }
  };

  const clearUserData = async (): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in.');
      }

      const userId = auth.currentUser.uid;
      UserDataManager.clearUserData(userId);
    } catch (error: any) {
      throw new Error('Failed to clear user data. Please try again.');
    }
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
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    clearUserData,
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
