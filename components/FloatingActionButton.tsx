import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '../constants';

interface FloatingActionButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  tooltipText?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  ariaLabel = "Add new category",
  tooltipText = "Add Category",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const newRipple: Ripple = {
      id: Date.now(),
      size,
      x: event.clientX - rect.left - size / 2,
      y: event.clientY - rect.top - size / 2,
    };

    setRipples([...ripples, newRipple]);
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-label={ariaLabel}
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center h-14 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-500/50 overflow-hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        width: isHovered ? 'auto' : '56px',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25,
        delay: 0.2,
      }}
    >
      <div className="flex items-center px-4 z-10">
        <motion.div
          animate={{ rotate: isHovered ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <PlusIcon className="w-6 h-6 flex-shrink-0" />
        </motion.div>

        <AnimatePresence>
          {isHovered && (
            <motion.span
              className="ml-2 font-semibold text-sm whitespace-nowrap"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1, transition: { delay: 0.1 } }}
              exit={{ width: 0, opacity: 0, margin: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tooltipText}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ transform: 'scale(0)', opacity: 1 }}
            animate={{ transform: 'scale(2.5)', opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onAnimationComplete={() => {
              setRipples((prevRipples) => prevRipples.filter((r) => r.id !== ripple.id));
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
};

export default FloatingActionButton; 