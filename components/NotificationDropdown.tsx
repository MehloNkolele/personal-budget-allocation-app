import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, ExclamationTriangleIcon, InfoIcon, CheckCircleIcon, XMarkIcon } from '../constants';

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
    
    return 'bg-sky-500/10';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-all duration-300 hover:scale-105 group"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md shadow-red-600/30 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 z-50 overflow-hidden flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sky-400 hover:text-sky-300 text-xs font-semibold transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-grow overflow-y-auto">
            {notificationList.length === 0 ? (
              <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                <BellIcon className="w-10 h-10 text-slate-600 mb-4" />
                <p className="text-slate-300 font-medium">No new notifications</p>
                <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {notificationList.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-4 hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer ${
                      getNotificationBgColor(notification.type, notification.read || false)
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-400 rounded-full shadow-lg shadow-sky-400/50"></div>
                    )}
                    <div className="flex items-start space-x-3 pl-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          notification.read ? 'text-slate-400' : 'text-slate-100'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1.5">
                          {notification.time}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-1 -mr-2 text-slate-500 hover:text-slate-300 rounded-full transition-colors"
                        aria-label="Dismiss notification"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificationList.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-700 bg-slate-800/50 flex-shrink-0">
              <button className="w-full text-center text-sky-400 hover:text-sky-300 text-sm font-semibold transition-colors py-1.5 rounded-lg hover:bg-slate-700/50">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
