import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '../constants';
import AboutScreen from './AboutScreen';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-50 flex flex-col"
        >
          <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-4">
              {user.photoURL ? (
                <div className="relative">
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-14 h-14 rounded-2xl shadow-lg ring-2 ring-violet-500/30 object-cover" 
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/10 via-sky-500/10 to-purple-600/10"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-violet-500/30">
                    <span className="text-white font-bold text-xl bg-gradient-to-br from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-sm">
                      {user.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/20 via-purple-500/15 to-fuchsia-600/20"></div>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{user.displayName || 'User Profile'}</h2>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </header>
          <div className="flex-grow overflow-y-auto">
            <AboutScreen onClose={() => {}} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfile;
