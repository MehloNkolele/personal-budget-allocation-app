import React, { useEffect } from 'react';
import median from 'median-js-bridge';

interface MedianBridgeProps {
  children: React.ReactNode;
}

const MedianBridge: React.FC<MedianBridgeProps> = ({ children }) => {
  useEffect(() => {
    // Initialize Median JavaScript Bridge
    const initializeMedian = () => {
      try {
        if (typeof median !== 'undefined' && median.isNativeApp()) {
          console.log('Median JavaScript Bridge detected - running in native app');

          // Add app lifecycle listeners
          median.appResumed.addListener(() => {
            console.log('App resumed from background');
          });

          // Add device info logging (for debugging)
          median.deviceInfo().then((info: any) => {
            console.log('Device info:', info);
          }).catch((error: any) => {
            console.log('Could not get device info:', error);
          });

          console.log('Median JavaScript Bridge initialized successfully');
        } else {
          console.log('Median JavaScript Bridge not available (running in web mode)');
        }
      } catch (error) {
        console.error('Error initializing Median JavaScript Bridge:', error);
      }
    };

    // Initialize immediately if available, or wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeMedian);
    } else {
      initializeMedian();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initializeMedian);
    };
  }, []);

  return <>{children}</>;
};

export default MedianBridge;
