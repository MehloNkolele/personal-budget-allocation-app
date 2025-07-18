import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase.config';

export interface NetworkStatus {
  isOnline: boolean;
  isFirestoreConnected: boolean;
  lastSyncTime: Date | null;
}

export type NetworkStatusCallback = (status: NetworkStatus) => void;

export class NetworkService {
  private static listeners: Set<NetworkStatusCallback> = new Set();
  private static currentStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    isFirestoreConnected: true,
    lastSyncTime: null
  };

  // Initialize network monitoring
  static initialize(): void {
    // Listen for browser online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Set initial status
    this.updateStatus({
      isOnline: navigator.onLine,
      isFirestoreConnected: navigator.onLine,
      lastSyncTime: navigator.onLine ? new Date() : null
    });
  }

  // Clean up event listeners
  static cleanup(): void {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.listeners.clear();
  }

  // Subscribe to network status changes
  static subscribe(callback: NetworkStatusCallback): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current status
    callback(this.currentStatus);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Get current network status
  static getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  // Handle online event
  private static async handleOnline(): Promise<void> {
    try {
      await enableNetwork(db);
      this.updateStatus({
        isOnline: true,
        isFirestoreConnected: true,
        lastSyncTime: new Date()
      });
      console.log('Network restored - Firestore reconnected');
    } catch (error) {
      console.error('Failed to enable Firestore network:', error);
      this.updateStatus({
        isOnline: true,
        isFirestoreConnected: false,
        lastSyncTime: this.currentStatus.lastSyncTime
      });
    }
  }

  // Handle offline event
  private static async handleOffline(): Promise<void> {
    try {
      await disableNetwork(db);
      this.updateStatus({
        isOnline: false,
        isFirestoreConnected: false,
        lastSyncTime: this.currentStatus.lastSyncTime
      });
      console.log('Network lost - Firestore offline mode enabled');
    } catch (error) {
      console.error('Failed to disable Firestore network:', error);
      this.updateStatus({
        isOnline: false,
        isFirestoreConnected: false,
        lastSyncTime: this.currentStatus.lastSyncTime
      });
    }
  }

  // Update status and notify listeners
  private static updateStatus(newStatus: Partial<NetworkStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...newStatus };
    
    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(this.currentStatus);
      } catch (error) {
        console.error('Error in network status callback:', error);
      }
    });
  }

  // Manually force network reconnection
  static async forceReconnect(): Promise<boolean> {
    try {
      await enableNetwork(db);
      this.updateStatus({
        isOnline: navigator.onLine,
        isFirestoreConnected: true,
        lastSyncTime: new Date()
      });
      return true;
    } catch (error) {
      console.error('Failed to force reconnect:', error);
      return false;
    }
  }

  // Check if we're in offline mode
  static isOffline(): boolean {
    return !this.currentStatus.isOnline || !this.currentStatus.isFirestoreConnected;
  }

  // Check if we're online and connected
  static isOnline(): boolean {
    return this.currentStatus.isOnline && this.currentStatus.isFirestoreConnected;
  }

  // Get time since last sync
  static getTimeSinceLastSync(): number | null {
    if (!this.currentStatus.lastSyncTime) return null;
    return Date.now() - this.currentStatus.lastSyncTime.getTime();
  }

  // Format time since last sync for display
  static formatTimeSinceLastSync(): string {
    const timeSince = this.getTimeSinceLastSync();
    if (timeSince === null) return 'Never';
    
    const seconds = Math.floor(timeSince / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 30) return `${seconds}s ago`;
    return 'Just now';
  }

  // Test network connectivity
  static async testConnectivity(): Promise<boolean> {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get network quality estimate (basic implementation)
  static async getNetworkQuality(): Promise<'fast' | 'slow' | 'offline'> {
    if (!navigator.onLine) return 'offline';
    
    try {
      const startTime = Date.now();
      await this.testConnectivity();
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (latency < 500) return 'fast';
      return 'slow';
    } catch (error) {
      return 'offline';
    }
  }

  // Show network status notification
  static showNetworkStatus(): void {
    const status = this.getStatus();
    const message = status.isOnline 
      ? `Online - Last sync: ${this.formatTimeSinceLastSync()}`
      : 'Offline - Changes will sync when connection is restored';
    
    // Dispatch custom event for toast notification
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message,
        type: status.isOnline ? 'success' : 'warning',
        duration: 3000
      }
    }));
  }
}
