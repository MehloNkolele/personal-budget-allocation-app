import { useState, useEffect, useCallback } from 'react';
import navigationService, { AppSection } from '../services/navigationService';

export interface UseNavigationReturn {
  currentSection: AppSection;
  navigateToSection: (section: AppSection) => void;
  goBack: () => boolean;
  navigationHistory: Array<{ section: AppSection; timestamp: number }>;
  canGoBack: boolean;
}

export const useNavigation = (): UseNavigationReturn => {
  const [currentSection, setCurrentSection] = useState<AppSection>(
    navigationService.getCurrentSection()
  );
  const [navigationHistory, setNavigationHistory] = useState(
    navigationService.getNavigationHistory()
  );

  // Update local state when navigation service changes
  useEffect(() => {
    const unsubscribe = navigationService.addNavigationListener((section) => {
      setCurrentSection(section);
      setNavigationHistory(navigationService.getNavigationHistory());
    });

    return unsubscribe;
  }, []);

  // Initialize navigation from URL on mount
  useEffect(() => {
    navigationService.initializeFromUrl();
    navigationService.enableSwipeGestures();
    
    // Cleanup on unmount
    return () => {
      // Don't disable swipe gestures on unmount as it might be used by other components
    };
  }, []);

  const navigateToSection = useCallback((section: AppSection) => {
    navigationService.navigateToSection(section);
  }, []);

  const goBack = useCallback(() => {
    return navigationService.goBack();
  }, []);

  const canGoBack = navigationHistory.length > 1;

  return {
    currentSection,
    navigateToSection,
    goBack,
    navigationHistory,
    canGoBack,
  };
};
