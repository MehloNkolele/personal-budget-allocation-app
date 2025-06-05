import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  ChartBarIcon,
  Bars3Icon,
  PlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  TagIcon,
  ArrowTrendingUpIcon
} from '../constants';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import MobileMenu from './MobileMenu';
import { useNotifications } from '../hooks/useNotifications';

interface NavbarProps {
  onAddCategory: () => void;
  onAddTransaction?: () => void;
  currentSection?: 'dashboard' | 'categories' | 'reports' | 'planning' | 'history';
  onSectionChange?: (section: 'dashboard' | 'categories' | 'reports' | 'planning' | 'history') => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onAddCategory,
  onAddTransaction,
  currentSection = 'dashboard',
  onSectionChange
}) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { notifications } = useNotifications();

  // Enhanced navigation items with better icons (removed Dashboard since logo will handle it)
  const navItems = [
    { id: 'categories', label: 'Categories', icon: TagIcon, href: '#categories', description: 'Manage categories' },
    { id: 'planning', label: 'Planning', icon: CalendarIcon, href: '#planning', description: 'Budget planning' },
    { id: 'history', label: 'History', icon: DocumentTextIcon, href: '#history', description: 'Transaction history' },
    { id: 'reports', label: 'Reports', icon: ArrowTrendingUpIcon, href: '#reports', description: 'Analytics & reports' },
  ];

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange && (sectionId === 'dashboard' || sectionId === 'categories' || sectionId === 'reports' || sectionId === 'planning' || sectionId === 'history')) {
      onSectionChange(sectionId);
    }
  };

  const handleLogoClick = () => {
    if (onSectionChange) {
      onSectionChange('dashboard');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Main Navbar */}
      <nav className={`
        sticky top-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled
          ? 'bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/60 shadow-2xl shadow-slate-900/20'
          : 'bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 shadow-lg'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Left Section - Clickable Logo & Navigation */}
            <div className="flex items-center space-x-8 lg:space-x-12">
              {/* Enhanced Clickable Logo */}
              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-3 flex-shrink-0 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-xl p-1 -m-1"
                title="Go to Dashboard"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-sm">BP</span>
                  </div>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white tracking-tight group-hover:text-sky-100 transition-colors duration-200">
                    Budget Planner
                  </h1>
                  <p className="text-xs text-slate-400 -mt-0.5 group-hover:text-slate-300 transition-colors duration-200">
                    Financial Control
                  </p>
                </div>
              </button>

              {/* Enhanced Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => handleSectionClick(item.id)}
                        className={`
                          relative flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-300 ease-out group
                          ${isActive
                            ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-600/30 scale-105 ring-1 ring-sky-400/20'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/60 hover:scale-105 hover:shadow-md'
                          }
                        `}
                        title={item.description}
                      >
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="relative">
                          {item.label}
                          {isActive && (
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full"></div>
                          )}
                        </span>
                      </button>

                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {item.description}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-slate-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tablet Navigation (md breakpoint) */}
              <div className="hidden md:flex lg:hidden items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={`
                        flex items-center justify-center p-2.5 rounded-xl transition-all duration-200
                        ${isActive
                          ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25 scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-105'
                        }
                      `}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Section - Actions & User (Better Spacing) */}
            <div className="flex items-center space-x-3 lg:space-x-4">

              {/* Enhanced Quick Add Buttons - More Compact */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="relative group">
                  <button
                    onClick={onAddCategory}
                    className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:scale-105 group"
                  >
                    <PlusIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                    <span>Category</span>
                  </button>
                </div>

                {onAddTransaction && (
                  <div className="relative group">
                    <button
                      onClick={onAddTransaction}
                      className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-105 group"
                    >
                      <PlusIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                      <span>Transaction</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Compact Add Buttons for Medium Screens */}
              <div className="hidden md:flex lg:hidden items-center space-x-2">
                <div className="relative group">
                  <button
                    onClick={onAddCategory}
                    className="flex items-center justify-center p-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:scale-105"
                    title="Add Category"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {onAddTransaction && (
                  <div className="relative group">
                    <button
                      onClick={onAddTransaction}
                      className="flex items-center justify-center p-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-105"
                      title="Add Transaction"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced Mobile Menu Button - Now positioned before notifications */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-all duration-300 hover:scale-105 group"
                aria-label="Open menu"
              >
                <Bars3Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />

                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 bg-slate-700/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>

              {/* Enhanced Divider */}
              <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

              {/* Notifications */}
              <NotificationDropdown notifications={notifications} />

              {/* User Dropdown - Now positioned at the far right */}
              <UserDropdown user={user} />
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        currentSection={currentSection}
        onSectionChange={handleSectionClick}
        onAddCategory={onAddCategory}
        onAddTransaction={onAddTransaction}
      />
    </>
  );
};

export default Navbar;
