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
      container: 'h-6 w-6',
      icon: 'w-3 h-3',
      title: 'text-sm font-semibold',
      subtitle: 'text-[10px]'
    },
    medium: {
      container: 'h-8 w-8',
      icon: 'w-4 h-4',
      title: 'text-lg font-semibold',
      subtitle: 'text-xs'
    },
    large: {
      container: 'h-10 w-10',
      icon: 'w-5 h-5',
      title: 'text-xl font-semibold',
      subtitle: 'text-sm'
    },
    xl: {
      container: 'h-12 w-12',
      icon: 'w-6 h-6',
      title: 'text-2xl font-semibold',
      subtitle: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  const logoIcon = (
    <div className={`relative flex items-center justify-center ${currentSize.container} transition-all duration-200 group-hover:scale-105`}>
      {/* Clean, minimal background */}
      <div className="absolute inset-0 bg-sky-600 rounded-lg shadow-sm"></div>

      {/* Simple, clean icon */}
      <div className="relative flex items-center justify-center h-full w-full z-10">
        <svg className={`${currentSize.icon} text-white`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
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
    <button onClick={onClick} className={`flex items-center space-x-2 group ${className}`}>
      {logoIcon}
      <div className="hidden sm:block">
        <h1 className={`${currentSize.title} leading-tight text-white group-hover:text-sky-400 transition-colors duration-200`}>
          BudgetFlow
        </h1>
        <p className={`${currentSize.subtitle} text-slate-400 font-normal mt-0.5 group-hover:text-slate-300 transition-colors duration-200`}>
          Budget Tracker
        </p>
      </div>
    </button>
  ) : (
    <div className={`flex items-center space-x-2 ${className}`}>
      {logoIcon}
      <div className="hidden sm:block">
        <h1 className={`${currentSize.title} leading-tight text-white`}>
          BudgetFlow
        </h1>
        <p className={`${currentSize.subtitle} text-slate-400 font-normal mt-0.5`}>
          Budget Tracker
        </p>
      </div>
    </div>
  );
};

export default Logo;
