import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      addToast('Please enter your email address.', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      addToast('Password reset email sent! Check your inbox.', 'success');
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-sky-400 mb-4">Check Your Email</h2>
            <p className="text-slate-400 mb-6">
              We've sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Try Different Email
              </button>
              <button
                onClick={onBackToLogin}
                className="w-full text-sky-400 hover:text-sky-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-sky-400 mb-2">Reset Password</h2>
          <p className="text-slate-400">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-slate-400"
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            disabled={isLoading}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
