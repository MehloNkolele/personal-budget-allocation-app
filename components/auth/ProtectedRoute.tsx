import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';
import SecurityGate from './SecurityGate';
import LoadingSpinner from '../LoadingSpinner';
import { UserDataManager } from '../../utils/userDataManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, requiresSecurityAuth, completeSecurityAuth } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
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
