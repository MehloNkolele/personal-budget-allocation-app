import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';
import LoadingSpinner from '../LoadingSpinner';
import SplashScreen from '../SplashScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if user has seen the splash screen
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash && !user) {
      setShowSplash(true);
    }
  }, [user]);

  const handleSplashComplete = () => {
    localStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Authenticating..." />
      </div>
    );
  }

  if (showSplash && !user) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
