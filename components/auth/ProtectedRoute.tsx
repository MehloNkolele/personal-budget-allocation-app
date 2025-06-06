import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';
import SecurityGate from './SecurityGate';
import LoadingSpinner from '../LoadingSpinner';
import SplashScreen from '../SplashScreen';
import { UserDataManager } from '../../utils/userDataManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, requiresSecurityAuth, completeSecurityAuth } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [splashCheckComplete, setSplashCheckComplete] = useState(false);

  useEffect(() => {
    // Check splash screen preference
    const checkSplashPreference = () => {
      // Check for global splash screen flag and logout flag
      const globalHasSeenSplash = localStorage.getItem('hasSeenSplash');
      const justLoggedOut = localStorage.getItem('justLoggedOut');

      if (user?.uid) {
        // For authenticated users, only show splash screen if they just logged out
        // or if they have explicitly enabled it in their preferences
        if (justLoggedOut) {
          const userPreferences = UserDataManager.loadUserPreferences(user.uid);
          // Even if they just logged out, respect their preference to not see splash
          setShowSplash(userPreferences.showSplashScreen);
          localStorage.removeItem('justLoggedOut');
        } else {
          // Normal page load/refresh - don't show splash screen
          setShowSplash(false);
        }
      } else {
        // For non-authenticated users, show splash only if:
        // 1. They just logged out, OR
        // 2. They've never seen the splash before (first-time visitors)
        if (justLoggedOut || !globalHasSeenSplash) {
          setShowSplash(true);
        } else {
          setShowSplash(false);
        }
      }
      setSplashCheckComplete(true);
    };

    if (!loading) {
      checkSplashPreference();
    }
  }, [user, loading]);

  const handleSplashComplete = () => {
    // Set global flag for non-authenticated users
    localStorage.setItem('hasSeenSplash', 'true');

    // Clear the logout flag since splash has been completed
    localStorage.removeItem('justLoggedOut');

    // For authenticated users, also update their preferences
    if (user?.uid) {
      const preferences = UserDataManager.loadUserPreferences(user.uid);
      // Don't automatically disable splash for authenticated users - let them choose
      UserDataManager.saveUserPreferences(user.uid, preferences);
    }

    setShowSplash(false);
  };

  const handleSplashDisable = () => {
    // Set global flag
    localStorage.setItem('hasSeenSplash', 'true');

    // Clear the logout flag since splash has been disabled
    localStorage.removeItem('justLoggedOut');

    // For authenticated users, update their preferences to disable splash
    if (user?.uid) {
      UserDataManager.updateSplashScreenPreference(user.uid, false);
    }

    setShowSplash(false);
  };

  if (loading || !splashCheckComplete) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={handleSplashComplete} 
        onDisable={handleSplashDisable}
        isAuthenticated={!!user}
      />
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Check if security authentication is required
  if (requiresSecurityAuth && UserDataManager.isSecurityEnabled(user.uid)) {
    return (
      <SecurityGate
        userId={user.uid}
        onAuthenticated={completeSecurityAuth}
        reason="Please authenticate to access your budget data"
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
