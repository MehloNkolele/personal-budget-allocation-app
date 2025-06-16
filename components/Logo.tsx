import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'full' | 'icon-only';
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'full',
  className = '',
  onClick 
}) => {
  const sizeClasses = {
    small: {
      container: 'h-8 w-8',
      icon: 'w-4 h-4',
      title: 'text-lg font-bold',
      subtitle: 'text-[10px]'
    },
    medium: {
      container: 'h-12 w-12',
      icon: 'w-6 h-6',
      title: 'text-xl font-bold',
      subtitle: 'text-xs'
    },
    large: {
      container: 'h-16 w-16',
      icon: 'w-8 h-8',
      title: 'text-2xl font-bold',
      subtitle: 'text-sm'
    },
    xl: {
      container: 'h-20 w-20',
      icon: 'w-10 h-10',
      title: 'text-3xl font-bold',
      subtitle: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  const logoIcon = (
    <div className={`relative flex items-center justify-center ${currentSize.container} transition-all duration-200 group-hover:scale-105`}>
      {/* Simplified background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-600 to-sky-700 rounded-2xl shadow-lg"></div>

      {/* Simple icon */}
      <div className="relative flex items-center justify-center h-full w-full z-10">
        <svg className={`${currentSize.icon} text-white`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 14.1 11 13 11S11 10.1 11 9V7.5L5 7V9C5 10.1 4.1 11 3 11S1 10.1 1 9V7C1 5.9 1.9 5 3 5H21C22.1 5 23 5.9 23 7V9C23 10.1 22.1 11 21 11S19 10.1 19 9ZM3 13H21V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V13ZM12 15C10.9 15 10 15.9 10 17S10.9 19 12 19 14 18.1 14 17 13.1 15 12 15Z"/>
        </svg>
      </div>
    </div>
  );
  if (variant === 'icon-only') {
    return onClick ? (
      <button onClick={onClick} className={`group ${className}`}>
        {logoIcon}
      </button>
    ) : (
      <div className={`${className}`}>
        {logoIcon}
      </div>
    );
  }

  return onClick ? (
    <button onClick={onClick} className={`flex items-center space-x-3 group ${className}`}>
      {logoIcon}
      <div className="hidden sm:block">
        <h1 className={`${currentSize.title} leading-tight font-bold text-white group-hover:text-sky-400 transition-colors duration-200`}>
          BudgetFlow
        </h1>
        <p className={`${currentSize.subtitle} text-slate-400 font-medium mt-0.5 group-hover:text-slate-300 transition-colors duration-200`}>
          Smart Budget Tracker
        </p>
      </div>
    </button>
  ) : (
    <div className={`flex items-center space-x-3 ${className}`}>
      {logoIcon}
      <div className="hidden sm:block">
        <h1 className={`${currentSize.title} leading-tight font-bold text-white`}>
          BudgetFlow
        </h1>
        <p className={`${currentSize.subtitle} text-slate-400 font-medium mt-0.5`}>
          Smart Budget Tracker
        </p>
      </div>
    </div>
  );
};

export default Logo;
