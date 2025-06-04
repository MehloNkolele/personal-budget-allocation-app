
import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, InfoIcon, XMarkIcon } from '../constants';

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Trigger enter animation

    const timer = setTimeout(() => {
      setIsVisible(false); // Trigger exit animation
      // Wait for animation to complete before actually removing
      setTimeout(() => onDismiss(toast.id), 300); 
    }, toast.duration || 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast, onDismiss]);

  const IconComponent = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon,
    info: InfoIcon,
  }[toast.type];

  const bgColor = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-sky-600',
  }[toast.type];

  const iconColor = {
    success: 'text-emerald-100',
    error: 'text-red-100',
    warning: 'text-amber-100',
    info: 'text-sky-100',
  }[toast.type];


  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`
        ${bgColor} text-white p-4 rounded-lg shadow-2xl flex items-start space-x-3
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}
      `}
    >
      <div className={`flex-shrink-0 ${iconColor}`}>
        <IconComponent className="w-6 h-6" />
      </div>
      <div className="flex-grow text-sm font-medium">
        {toast.message}
      </div>
      <button
        onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }}
        className={`ml-2 p-1 rounded-md ${iconColor} hover:bg-black/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ToastItem;
