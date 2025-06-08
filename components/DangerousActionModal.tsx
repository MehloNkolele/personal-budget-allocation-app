import React from 'react';
import { ExclamationTriangleIcon } from '../constants';

interface DangerousActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  warningItems?: string[];
  isActionInProgress?: boolean;
}

const DangerousActionModal: React.FC<DangerousActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes, I understand',
  cancelText = 'No, Keep My Data',
  warningItems = [],
  isActionInProgress = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 min-h-screen"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 border-2 border-red-500/50 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Multiple warning indicators */}
        <div className="absolute -top-3 -left-3 bg-red-500 rounded-full p-2 shadow-lg">
          <ExclamationTriangleIcon className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -top-3 -right-3 bg-red-500 rounded-full p-2 shadow-lg">
          <ExclamationTriangleIcon className="w-6 h-6 text-white" />
        </div>
        
        {/* Header with large warning */}
        <div className="text-center mb-6">
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-400 mb-2">
            ⚠️ DANGER ZONE ⚠️
          </h3>
          <h4 className="text-xl font-semibold text-slate-100">
            {title}
          </h4>
        </div>

        {/* Warning message */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-slate-200 text-base leading-relaxed mb-4 whitespace-pre-line">
            {message}
          </p>
          
          {warningItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-red-300 font-semibold text-sm">This will permanently delete:</p>
              <ul className="space-y-1">
                {warningItems.map((item, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-center">
                    <span className="text-red-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Emphasis warning */}
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 mb-6">
          <p className="text-yellow-300 text-sm font-medium text-center">
            🚨 This action cannot be undone! 🚨
          </p>
        </div>

        {/* Action buttons - reversed styling */}
        <div className="flex justify-center space-x-4">
          {/* Cancel button - now prominent and red */}
          <button
            onClick={onClose}
            className="px-6 py-3 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/50 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 border-2 border-red-500"
          >
            {cancelText}
          </button>
          
          {/* Confirm button - now muted and gray */}
          <button
            onClick={handleConfirm}
            disabled={isActionInProgress}
            className="px-6 py-3 text-base font-medium text-slate-400 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActionInProgress ? 'Deleting...' : confirmText}
          </button>
        </div>

        {/* Additional warning text */}
        <p className="text-slate-400 text-xs text-center mt-4">
          Think carefully before proceeding. Your data will be gone forever.
        </p>
      </div>
    </div>
  );
};

export default DangerousActionModal;
