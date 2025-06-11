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
import Logo from './Logo';

import { AppSection } from '../services/navigationService';

interface NavbarProps {
  onNewCategory: () => void;
  currentSection?: AppSection;
  onSectionChange?: (section: AppSection) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onNewCategory,
  currentSection = 'dashboard',
  onSectionChange
}) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

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
      onSectionChange(sectionId as AppSection);
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
          <div className="flex justify-between items-center py-3 h-16">
            {/* Left Side: Logo and Desktop Navigation */}
            <div className="flex items-center space-x-8">
              <Logo 
                size="medium"
                variant="full"
                onClick={handleLogoClick}
              />

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

            {/* Right Side - User, Add Button, Mobile Menu */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={onNewCategory}
                  className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:scale-105 group"
                >
                  <PlusIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                  <span>Category</span>
                </button>
              </div>

              {/* User Dropdown */}
              <UserDropdown 
                user={user}
                navItems={navItems}
                currentSection={currentSection}
                onSectionChange={handleSectionClick}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
