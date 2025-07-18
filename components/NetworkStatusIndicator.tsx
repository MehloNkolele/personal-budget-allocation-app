import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkService, NetworkStatus } from '../services/networkService';
import { 
  WifiIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowPathIcon 
} from '../constants';

interface NetworkStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(NetworkService.getStatus());
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Initialize network service
    NetworkService.initialize();

    // Subscribe to network status changes
    const unsubscribe = NetworkService.subscribe((status) => {
      setNetworkStatus(status);
      setIsReconnecting(false);
    });

    return () => {
      unsubscribe();
      NetworkService.cleanup();
    };
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    const success = await NetworkService.forceReconnect();
    if (!success) {
      setIsReconnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (isReconnecting) {
      return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
    }
    
    if (networkStatus.isOnline && networkStatus.isFirestoreConnected) {
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }
    
    if (networkStatus.isOnline && !networkStatus.isFirestoreConnected) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    }
    
    return <WifiIcon className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isReconnecting) return 'Reconnecting...';
    
    if (networkStatus.isOnline && networkStatus.isFirestoreConnected) {
      return `Online • Last sync: ${NetworkService.formatTimeSinceLastSync()}`;
    }
    
    if (networkStatus.isOnline && !networkStatus.isFirestoreConnected) {
      return 'Connection issues';
    }
    
    return 'Offline';
  };

  const getStatusColor = () => {
    if (isReconnecting) return 'text-blue-500';
    
    if (networkStatus.isOnline && networkStatus.isFirestoreConnected) {
      return 'text-green-500';
    }
    
    if (networkStatus.isOnline && !networkStatus.isFirestoreConnected) {
      return 'text-yellow-500';
    }
    
    return 'text-red-500';
  };

  const getBgColor = () => {
    if (isReconnecting) return 'bg-blue-500/10 border-blue-500/20';
    
    if (networkStatus.isOnline && networkStatus.isFirestoreConnected) {
      return 'bg-green-500/10 border-green-500/20';
    }
    
    if (networkStatus.isOnline && !networkStatus.isFirestoreConnected) {
      return 'bg-yellow-500/10 border-yellow-500/20';
    }
    
    return 'bg-red-500/10 border-red-500/20';
  };

  if (showDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg border ${getBgColor()} ${className}`}
      >
        {getStatusIcon()}
        <div className="flex-1">
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          {!networkStatus.isOnline && (
            <div className="text-xs text-gray-400 mt-1">
              Changes will sync when connection is restored
            </div>
          )}
        </div>
        {(!networkStatus.isOnline || !networkStatus.isFirestoreConnected) && !isReconnecting && (
          <button
            onClick={handleReconnect}
            className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
          >
            Retry
          </button>
        )}
      </motion.div>
    );
  }

  // Compact indicator
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${getBgColor()}`}
      >
        {getStatusIcon()}
        {!networkStatus.isOnline && (
          <span className="text-xs font-medium text-red-400">Offline</span>
        )}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute top-full right-0 mt-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <div>Browser: {navigator.onLine ? 'Online' : 'Offline'}</div>
              <div>Database: {networkStatus.isFirestoreConnected ? 'Connected' : 'Disconnected'}</div>
              {networkStatus.lastSyncTime && (
                <div>Last sync: {networkStatus.lastSyncTime.toLocaleTimeString()}</div>
              )}
            </div>

            {(!networkStatus.isOnline || !networkStatus.isFirestoreConnected) && (
              <div className="mt-3 pt-2 border-t border-slate-700">
                <button
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="w-full text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  {isReconnecting ? 'Reconnecting...' : 'Try to reconnect'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkStatusIndicator;
