import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';
import LoadingSpinner from '../LoadingSpinner';
import SplashScreen from '../SplashScreen';
import { UserDataManager } from '../../utils/userDataManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [splashCheckComplete, setSplashCheckComplete] = useState(false);

  useEffect(() => {
    // Check splash screen preference
    const checkSplashPreference = () => {
      // Check for global splash screen flag (for non-authenticated users)
      const globalHasSeenSplash = localStorage.getItem('hasSeenSplash');

      if (user?.uid) {
        // For authenticated users, only check their preferences (ignore global flag)
        const userPreferences = UserDataManager.loadUserPreferences(user.uid);
        if (!userPreferences.showSplashScreen) {
          setShowSplash(false);
        }
      } else {
        // For non-authenticated users, only check global flag
        if (globalHasSeenSplash) {
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

  return <>{children}</>;
};

export default ProtectedRoute;
