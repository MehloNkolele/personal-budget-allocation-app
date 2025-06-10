import React from 'react';
import { motion } from 'framer-motion';
import {
    HomeIcon,
    PencilIcon,
    UserIcon as UserCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    XMarkIcon,
    InfoIcon,
} from '../constants';

interface AboutScreenProps {
  onClose: () => void;
}

const aboutVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
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

const AboutScreen: React.FC<AboutScreenProps> = ({ onClose }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={aboutVariants}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-50"
    >
      <div className="w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] bg-slate-800/50 rounded-2xl border border-slate-700 shadow-2xl shadow-sky-900/20 flex flex-col overflow-hidden">
        <header className="p-6 flex items-center justify-between border-b border-slate-700 flex-shrink-0">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <InfoIcon className="w-8 h-8 text-sky-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">About Personal Budget Planner</h1>
              <p className="text-slate-400 text-sm">Version 1.0.0</p>
            </div>
          </motion.div>
          <motion.button
            variants={itemVariants}
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Close about screen"
          >
            <XMarkIcon className="w-6 h-6" />
          </motion.button>
        </header>

        <div className="p-8 grid md:grid-cols-2 gap-8 overflow-y-auto flex-grow">
            {/* Left side: App Info */}
            <motion.div variants={itemVariants} className="space-y-6">
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">App Information</h2>
                <p className="text-slate-300 leading-relaxed">
                    Take control of your finances with ease. This app helps you manage budget categories, track expenses, and gain powerful insights into your spending patterns to achieve your financial goals.
                </p>
            </motion.div>

            {/* Right side: Developer Info */}
            <motion.div variants={itemVariants} className="space-y-6">
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 flex items-center gap-2"><UserCircleIcon className="w-5 h-5"/>Developer Details</h2>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-lg font-bold text-sky-400">{developerInfo.name}</p>
                    <div className="text-slate-400 mt-2 space-y-2">
                        <p className="flex items-center gap-2 text-sm">
                            <PhoneIcon className="w-5 h-5 text-slate-500"/>
                            <span>{developerInfo.contact.phone}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm">
                            <EnvelopeIcon className="w-5 h-5 text-slate-500"/>
                            <a href={`mailto:${developerInfo.contact.email}`} className="hover:text-sky-400 transition-colors">{developerInfo.contact.email}</a>
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {developerInfo.links.map(({name, url, Icon}) => (
                        <motion.a 
                            key={name}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-700/50 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-semibold text-white hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-600/20 transition-all transform hover:-translate-y-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Icon className="w-5 h-5"/>
                            {name}
                        </motion.a>
                    ))}
                </div>
            </motion.div>
        </div>
        
        <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-700 bg-slate-900/50 flex-shrink-0">
          &copy; {new Date().getFullYear()} Bennet Nkolele. All rights reserved.
        </footer>
      </div>
    </motion.div>
  );
};

export default AboutScreen; 