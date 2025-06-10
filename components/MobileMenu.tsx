import React, { useEffect, useState } from 'react';
import { XMarkIcon, PlusIcon } from '../constants';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentSection: string;
  onSectionChange: (section: string) => void;
  onAddCategory: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  currentSection,
  onSectionChange,
  onAddCategory
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = 'unset';
      // Delay setting isAnimating to false to allow exit animation
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    onClose();
  };

  const handleAddCategory = () => {
    onAddCategory();
    onClose();
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Enhanced Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Enhanced Mobile Menu */}
      <div className={`
        fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-gradient-to-b from-slate-800 to-slate-900
        shadow-2xl z-50 md:hidden transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">

          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
                  <span className="text-white font-bold text-sm">BP</span>
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl opacity-20 blur-sm"></div>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Navigation</h2>
                <p className="text-slate-400 text-xs">Tap logo for Dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-all duration-200 hover:scale-105 group"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>

          {/* Scrollable Navigation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center">
              <div className="w-4 h-px bg-gradient-to-r from-slate-600 to-transparent mr-2"></div>
              Navigation
            </h3>

            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <div
                  key={item.id}
                  className={`transform transition-all duration-300 ease-out ${
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => handleSectionClick(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left
                      transition-all duration-300 group relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-600/30 scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60 hover:scale-105'
                      }
                    `}
                  >
                    {/* Background glow effect for active item */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-600/20 to-sky-500/20 blur-xl"></div>
                    )}

                    <div className="relative flex items-center space-x-3 w-full">
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium">{item.label}</span>
                        {item.description && (
                          <p className={`text-xs mt-0.5 ${
                            isActive ? 'text-sky-100' : 'text-slate-500 group-hover:text-slate-400'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Area */}
          <div className="shrink-0">
            {/* Enhanced Quick Actions */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center">
                <div className="w-4 h-px bg-gradient-to-r from-slate-600 to-transparent mr-2"></div>
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={handleAddCategory}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:scale-105 group"
                >
                  <PlusIcon className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                  <span className="font-medium">Add Category</span>
                  <div className="ml-auto opacity-60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Enhanced App Info */}
            <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">BP</span>
                  </div>
                  <p className="text-slate-300 text-sm font-medium">
                    Budget Planner
                  </p>
                </div>
                <p className="text-slate-500 text-xs">
                  Take control of your finances with style
                </p>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <div className="w-1 h-1 bg-sky-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
