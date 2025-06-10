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
    <div className={`relative flex items-center justify-center ${currentSize.container} transition-all duration-500 group-hover:scale-110 group-hover:rotate-2`}>
      {/* Multi-layered background with enhanced gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 rounded-3xl shadow-2xl shadow-violet-500/40 group-hover:shadow-violet-400/60 transition-all duration-500"></div>
      <div className="absolute inset-0.5 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-3xl"></div>
      <div className="absolute inset-1 bg-gradient-to-br from-emerald-400/10 via-sky-500/10 to-purple-600/10 rounded-2xl"></div>
      
      {/* Central icon container */}
      <div className="relative flex items-center justify-center h-full w-full z-10">
        {/* Custom Financial Symbol - Enhanced Pie Chart + Dollar */}
        <svg className={`${currentSize.icon} text-transparent`} viewBox="0 0 32 32" fill="none">
          {/* Pie chart segments */}
          <defs>
            <linearGradient id="segment1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="segment2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="segment3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="dollar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          
          {/* Outer ring - Pie chart representation */}
          <circle cx="16" cy="16" r="14" fill="none" stroke="url(#segment1)" strokeWidth="3" strokeDasharray="26 62" strokeDashoffset="0" className="animate-spin-slow" style={{animationDuration: '8s'}} />
          <circle cx="16" cy="16" r="14" fill="none" stroke="url(#segment2)" strokeWidth="3" strokeDasharray="20 68" strokeDashoffset="-26" className="animate-spin-slow" style={{animationDuration: '10s', animationDirection: 'reverse'}} />
          <circle cx="16" cy="16" r="14" fill="none" stroke="url(#segment3)" strokeWidth="3" strokeDasharray="16 72" strokeDashoffset="-46" className="animate-spin-slow" style={{animationDuration: '12s'}} />
          
          {/* Central dollar symbol */}
          <path d="M16 4 L16 6 M16 26 L16 28 M11 8 L20 8 C21.5 8 22 9.5 22 11 C22 12.5 21.5 14 20 14 L12 14 M12 14 L20 14 C21.5 14 22 15.5 22 17 C22 18.5 21.5 20 20 20 L11 20 M16 6 L16 26" 
                stroke="url(#dollar)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          
          {/* Inner accent dots */}
          <circle cx="12" cy="12" r="1.5" fill="#10B981" className="animate-pulse" />
          <circle cx="20" cy="12" r="1.5" fill="#0EA5E9" className="animate-pulse" style={{animationDelay: '0.3s'}} />
          <circle cx="16" cy="22" r="1.5" fill="#8B5CF6" className="animate-pulse" style={{animationDelay: '0.6s'}} />
        </svg>
        
        {/* Floating money particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 left-2 w-1 h-1 bg-emerald-400 rounded-full animate-float" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-2 right-1 w-0.5 h-0.5 bg-sky-400 rounded-full animate-float" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-2 left-1 w-0.5 h-0.5 bg-purple-400 rounded-full animate-float" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          <div className="absolute bottom-1 right-2 w-1 h-1 bg-orange-400 rounded-full animate-float" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
        </div>
      </div>
      
      {/* Enhanced glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-sky-500/20 to-purple-600/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
      <div className="absolute inset-2 bg-gradient-to-tr from-violet-400/20 via-fuchsia-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm"></div>
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
    <button onClick={onClick} className={`flex items-center space-x-4 group ${className}`}>
      {logoIcon}
      <div className="hidden sm:block">
        <h1 className={`${currentSize.title} leading-none tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent group-hover:from-emerald-400 group-hover:via-sky-400 group-hover:to-purple-400 transition-all duration-500`}>
          FinanceFlow
        </h1>
        <p className={`${currentSize.subtitle} text-slate-400 font-medium tracking-wider mt-0.5 group-hover:text-slate-300 transition-colors duration-300`}>
          Smart Budget Management
        </p>
      </div>
    </button>
  ) : (
    <div className={`flex items-center space-x-4 ${className}`}>
      {logoIcon}
      <div className="hidden sm:block">
        <h1 className={`${currentSize.title} leading-none tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent`}>
          FinanceFlow
        </h1>
        <p className={`${currentSize.subtitle} text-slate-400 font-medium tracking-wider mt-0.5`}>
          Smart Budget Management
        </p>
      </div>
    </div>
  );
};

export default Logo;
