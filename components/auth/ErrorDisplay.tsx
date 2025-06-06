import React from 'react';

interface ErrorDisplayProps {
  message: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
      <p className="text-red-300 text-sm">{message}</p>
    </div>
  );
};

export default ErrorDisplay; 