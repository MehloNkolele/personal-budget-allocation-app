import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const renderAuthForm = () => {
    switch (authMode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setAuthMode('register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setAuthMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={() => setAuthMode('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sky-400 tracking-tight mb-2">
            Personal Budget Planner
          </h1>
          <p className="text-slate-400">
            Take control of your finances with ease
          </p>
        </div>

        {/* Auth Form */}
        {renderAuthForm()}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Secure authentication powered by Firebase
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
