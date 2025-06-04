import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';
import LoadingSpinner from '../LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Authenticating..." />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
