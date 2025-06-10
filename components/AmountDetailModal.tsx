import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AmountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  formatCurrency: (amount: number) => string;
}

const AmountDetailModal: React.FC<AmountDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  formatCurrency,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 w-full max-w-sm text-center"
          >
            <p className="text-slate-400 text-lg mb-2">{title}</p>
            <p className="text-4xl font-bold text-white tracking-tight">
              {formatCurrency(amount)}
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-full transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AmountDetailModal;
