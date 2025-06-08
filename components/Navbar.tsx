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
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '../constants';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import MobileMenu from './MobileMenu';
import { useNotifications } from '../hooks/useNotifications';

interface NavbarProps {
  onNewCategory: () => void;
  currentSection?: 'dashboard' | 'categories' | 'reports' | 'planning' | 'history' | 'savings';
  onSectionChange?: (section: 'dashboard' | 'categories' | 'reports' | 'planning' | 'history' | 'savings') => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onNewCategory,
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
    { id: 'savings', label: 'Savings', icon: CurrencyDollarIcon, href: '#savings', description: 'Savings Calculator' },
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
    if (onSectionChange && (sectionId === 'dashboard' || sectionId === 'categories' || sectionId === 'reports' || sectionId === 'planning' || sectionId === 'history' || sectionId === 'savings')) {
      onSectionChange(sectionId as 'dashboard' | 'categories' | 'reports' | 'planning' | 'history' | 'savings');
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
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-md' : 'bg-slate-900'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <button 
                onClick={handleLogoClick}
                className="flex items-center space-x-3 group"
              >
                <div className="flex items-center justify-center h-10 w-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg shadow-sky-600/30 transition-transform duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-lg">BP</span>
                </div>
                <div>
                  <h1 className="text-white text-lg font-bold leading-tight">Budget Planner</h1>
                  <p className="text-slate-400 text-xs">Financial Control</p>
                </div>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                      currentSection === item.id
                        ? 'bg-slate-800 text-sky-400'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-sky-300'
                    }`}
                    aria-label={item.description}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - User, Notifications, etc. */}
            <div className="flex items-center space-x-3 lg:space-x-4">

              {/* Enhanced Quick Add Buttons - More Compact */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="relative group">
                  <button
                    onClick={onNewCategory}
                    className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:scale-105 group"
                  >
                    <PlusIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                    <span>Category</span>
                  </button>
                </div>
              </div>

              {/* Compact Add Buttons for Medium Screens */}
              <div className="hidden md:flex lg:hidden items-center space-x-2">
                <div className="relative group">
                  <button
                    onClick={onNewCategory}
                    className="flex items-center justify-center p-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:scale-105"
                    title="Add Category"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
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
        onAddCategory={onNewCategory}
      />
    </>
  );
};

export default Navbar;
