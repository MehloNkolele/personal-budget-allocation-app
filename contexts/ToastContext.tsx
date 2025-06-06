
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage, ToastType } from '../types';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  // Listen for custom toast events from auth context
  React.useEffect(() => {
    const handleShowToast = (event: any) => {
      if (event.detail && event.detail.message) {
        addToast(event.detail.message, event.detail.type || 'info', event.detail.duration);
      }
    };
    
    window.addEventListener('show-toast', handleShowToast);
    
    return () => {
      window.removeEventListener('show-toast', handleShowToast);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
    </ToastContext.Provider>
  );
};
