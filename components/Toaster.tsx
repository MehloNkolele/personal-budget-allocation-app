
import React, { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';
import ToastItem from './ToastItem';

const Toaster: React.FC = () => {
  const context = useContext(ToastContext);

  if (!context) {
    // This should ideally not happen if App is wrapped correctly
    return null;
  }
  const { toasts, removeToast } = context;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-xs sm:max-w-sm space-y-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default Toaster;
