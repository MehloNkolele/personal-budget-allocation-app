
import React from 'react';
import { XMarkIcon } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

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
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md relative max-h-[85vh] overflow-y-auto mt-8 mb-8 transform transition-all duration-200 scale-100 animate-in fade-in-0 zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-sky-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-sky-400 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-lg p-1"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
    