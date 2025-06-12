import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  InfoIcon,
  UserIcon as UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  PencilIcon
} from '../constants';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const developerInfo = {
  name: "Bennet Nkolele",
  contact: {
    phone: "+27 81 090 3232",
    email: "bennet.nkolele1998@gmail.com"
  },
  links: [
    { name: "Portfolio", url: "https://react-personal-portfolio-alpha.vercel.app/", Icon: HomeIcon },
    { name: "GitHub", url: "https://github.com/BennetNkolele", Icon: PencilIcon },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/bennetnkolele", Icon: UserCircleIcon }
  ]
};

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="user-profile"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-50 flex flex-col"
        >
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 flex-shrink-0"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {user.photoURL ? (
                <div className="relative flex-shrink-0">
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg ring-2 ring-violet-500/30 object-cover"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/10 via-sky-500/10 to-purple-600/10"></div>
                </div>
              ) : (
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-violet-500/30">
                    <span className="text-white font-bold text-lg sm:text-xl bg-gradient-to-br from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-sm">
                      {user.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/20 via-purple-500/15 to-fuchsia-600/20"></div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  {user.displayName || 'User Profile'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0"
              aria-label="Close profile"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </motion.header>

          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6"
          >
            {/* App Information Section */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <InfoIcon className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">About Personal Budget Planner</h3>
                  <p className="text-xs sm:text-sm text-slate-400">Version 1.0.0</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-700">
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Take control of your finances with ease. This app helps you manage budget categories,
                  track expenses, and gain powerful insights into your spending patterns to achieve your financial goals.
                </p>
              </div>
            </motion.div>

            {/* Developer Information Section */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <UserCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl font-bold text-white">Developer Details</h3>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-700 space-y-4">
                <div>
                  <p className="text-lg sm:text-xl font-bold text-sky-400 mb-3">{developerInfo.name}</p>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <a
                        href={`tel:${developerInfo.contact.phone}`}
                        className="text-sm sm:text-base text-slate-300 hover:text-sky-400 transition-colors break-all"
                      >
                        {developerInfo.contact.phone}
                      </a>
                    </div>

                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <a
                        href={`mailto:${developerInfo.contact.email}`}
                        className="text-sm sm:text-base text-slate-300 hover:text-sky-400 transition-colors break-all"
                      >
                        {developerInfo.contact.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-4 border-t border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Connect with me</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {developerInfo.links.map(({ name, url, Icon }) => (
                      <motion.a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-700/50 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-semibold text-white hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-600/20 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate">{name}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-3 sm:p-4 text-center text-xs text-slate-500 border-t border-slate-700 bg-slate-900/50 flex-shrink-0"
          >
            &copy; {new Date().getFullYear()} Bennet Nkolele. All rights reserved.
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfile;
