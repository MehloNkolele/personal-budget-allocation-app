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
    <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-200 ${
      isScrolled
        ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50'
        : 'bg-slate-900/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
                  className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors duration-150 ${
                    currentSection === item.id
                      ? 'bg-slate-800 text-sky-400 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                  aria-label={item.description}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Add Button and User */}
          <div className="flex items-center space-x-3">
            {/* Add Category Button */}
            <button
              onClick={onNewCategory}
              className="hidden lg:flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Category</span>
            </button>

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
  );
};

export default Navbar;
