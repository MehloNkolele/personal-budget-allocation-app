import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, ExclamationTriangleIcon, InfoIcon, CheckCircleIcon } from '../constants';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read?: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState(notifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationList.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: number) => {
    setNotificationList(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotificationList(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      default:
        return <InfoIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-slate-800/50';
    
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-l-4 border-yellow-400';
      case 'error':
        return 'bg-red-500/10 border-l-4 border-red-400';
      case 'success':
        return 'bg-green-500/10 border-l-4 border-green-400';
      default:
        return 'bg-blue-500/10 border-l-4 border-blue-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sky-400 hover:text-sky-300 text-xs font-medium transition-colors duration-200"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notificationList.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No notifications</p>
                <p className="text-slate-500 text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              notificationList.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-slate-700/30 transition-colors duration-200 cursor-pointer ${
                    getNotificationBgColor(notification.type, notification.read || false)
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        notification.read ? 'text-slate-400' : 'text-white'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {!notification.read && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-sky-400 rounded-full"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notificationList.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-700/50">
              <button className="w-full text-center text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors duration-200">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
