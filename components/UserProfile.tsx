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
                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{user.displayName?.charAt(0) || 'U'}</span>
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
