import median from 'median-js-bridge';

export type AppSection = 'dashboard' | 'categories' | 'reports' | 'planning' | 'history' | 'savings';

export interface NavigationState {
  section: AppSection;
  timestamp: number;
}

class NavigationService {
  private currentSection: AppSection = 'dashboard';
  private navigationHistory: NavigationState[] = [];
  private listeners: ((section: AppSection) => void)[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeMedianBridge();
  }

  private initializeMedianBridge() {
    if (this.isInitialized) return;

    try {
      // Initialize Median JavaScript Bridge
      if (typeof median !== 'undefined' && median.isNativeApp()) {
        // Add listener for native navigation events (swipe gestures, back button, etc.)
        median.jsNavigation.url.addListener((url: string) => {
          console.log('Median navigation event:', url);
          this.handleNativeNavigation(url);
        });

        // Add listener for app resume events
        median.appResumed.addListener(() => {
          console.log('App resumed');
          // Handle app resume if needed
        });

        console.log('Median JavaScript Bridge initialized successfully');
        this.isInitialized = true;
      } else {
        console.log('Median JavaScript Bridge not available (running in web mode)');
      }
    } catch (error) {
      console.error('Error initializing Median JavaScript Bridge:', error);
    }
  }

  private handleNativeNavigation(url: string) {
    // Parse the URL to determine which section to navigate to
    const section = this.parseSectionFromUrl(url);
    if (section) {
      this.navigateToSection(section, false); // false = don't push to browser history
    }
  }

  private parseSectionFromUrl(url: string): AppSection | null {
    // Extract section from URL hash or path
    const hash = url.includes('#') ? url.split('#')[1] : '';
    const path = url.includes('/') ? url.split('/').pop() : '';
    
    const sectionFromHash = hash as AppSection;
    const sectionFromPath = path as AppSection;
    
    const validSections: AppSection[] = ['dashboard', 'categories', 'reports', 'planning', 'history', 'savings'];
    
    if (validSections.includes(sectionFromHash)) {
      return sectionFromHash;
    }
    
    if (validSections.includes(sectionFromPath)) {
      return sectionFromPath;
    }
    
    return null;
  }

  public navigateToSection(section: AppSection, updateHistory: boolean = true) {
    const previousSection = this.currentSection;
    this.currentSection = section;

    // Update browser history for proper back/forward navigation
    if (updateHistory && typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#${section}`;
      window.history.pushState({ section }, '', url);
    }

    // Add to navigation history
    this.navigationHistory.push({
      section,
      timestamp: Date.now()
    });

    // Keep history manageable (last 50 entries)
    if (this.navigationHistory.length > 50) {
      this.navigationHistory = this.navigationHistory.slice(-50);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(section);
      } catch (error) {
        console.error('Error in navigation listener:', error);
      }
    });

    console.log(`Navigated from ${previousSection} to ${section}`);
  }

  public goBack(): boolean {
    if (this.navigationHistory.length > 1) {
      // Remove current state
      this.navigationHistory.pop();
      
      // Get previous state
      const previousState = this.navigationHistory[this.navigationHistory.length - 1];
      
      if (previousState) {
        this.navigateToSection(previousState.section, true);
        return true;
      }
    }
    
    // If no history, try browser back
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return true;
    }
    
    return false;
  }

  public getCurrentSection(): AppSection {
    return this.currentSection;
  }

  public getNavigationHistory(): NavigationState[] {
    return [...this.navigationHistory];
  }

  public addNavigationListener(listener: (section: AppSection) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public initializeFromUrl() {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as AppSection;
      const validSections: AppSection[] = ['dashboard', 'categories', 'reports', 'planning', 'history', 'savings'];
      
      if (validSections.includes(hash)) {
        this.navigateToSection(hash, false);
      } else {
        // Default to dashboard and update URL
        this.navigateToSection('dashboard', true);
      }

      // Listen for browser back/forward events
      window.addEventListener('popstate', (event) => {
        const section = event.state?.section || 'dashboard';
        this.navigateToSection(section, false);
      });
    }
  }

  public enableSwipeGestures() {
    try {
      if (typeof median !== 'undefined' && median.isNativeApp()) {
        // Note: Swipe gestures are typically enabled by default in Median apps
        // This is more for documentation and potential future use
        console.log('Swipe gestures should be enabled by default in Median apps');
      }
    } catch (error) {
      console.error('Error enabling swipe gestures:', error);
    }
  }

  public disableSwipeGestures() {
    try {
      if (typeof median !== 'undefined' && median.isNativeApp()) {
        // Note: Disabling swipe gestures might not be available in all versions
        console.log('Swipe gestures disable requested');
      }
    } catch (error) {
      console.error('Error disabling swipe gestures:', error);
    }
  }
}

// Create singleton instance
export const navigationService = new NavigationService();

// Export for use in components
export default navigationService;
