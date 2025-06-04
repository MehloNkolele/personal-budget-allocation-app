import React from 'react';
import { ExclamationTriangleIcon } from '../constants';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
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
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md relative transform transition-all duration-200 scale-100 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 ${isDangerous ? 'text-red-400' : 'text-amber-400'}`}>
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              {title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {message}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  isDangerous
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 hover:shadow-lg hover:shadow-red-500/25'
                    : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 hover:shadow-lg hover:shadow-sky-500/25'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
