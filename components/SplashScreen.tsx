import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  message?: string;
  onComplete: () => void;
  onDisable: () => void;
  isAuthenticated: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  message = 'Loading...', 
  onComplete,
  onDisable,
  isAuthenticated
}) => {
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Automatically complete after 2.5 seconds

    const disableTimer = setTimeout(() => {
      setShowDisable(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(disableTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-sky-500"></div>
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-slate-400 mb-8">Getting things ready for you.</p>
      </div>

      <div className="absolute bottom-8 text-center w-full px-4">
        {showDisable && isAuthenticated && (
           <button 
             onClick={onDisable}
             className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 focus:outline-none"
           >
             Don't show this again
           </button>
        )}
         <button 
            onClick={onComplete}
            className="mt-4 w-full max-w-xs mx-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none"
          >
            Proceed
          </button>
      </div>
    </div>
  );
};

export default SplashScreen;
