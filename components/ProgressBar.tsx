
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  heightClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, colorClass = 'bg-sky-500', heightClass = 'h-2' }) => {
  const percentage = max > 0 ? (Math.min(value, max) / max) * 100 : 0;
  const cappedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={`w-full bg-slate-700 rounded-full ${heightClass} overflow-hidden`}>
      <div
        className={`${colorClass} ${heightClass} rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${cappedPercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
    