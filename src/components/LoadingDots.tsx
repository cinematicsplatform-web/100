import React, { useState, useEffect } from 'react';

interface LoadingDotsProps {
  className?: string; // Additional classes for container
  size?: 'sm' | 'md' | 'lg'; // Controls the size of the dots
  delayMs?: number; // How long to wait before showing the loader to prevent flicker
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className = '', 
  size = 'md',
  delayMs = 300 
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (delayMs > 0) {
      timeout = setTimeout(() => setShow(true), delayMs);
    } else {
      setShow(true);
    }
    return () => clearTimeout(timeout);
  }, [delayMs]);

  if (!show) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3 md:w-4 md:h-4',
    lg: 'w-4 h-4 md:w-5 md:h-5'
  };

  const dotClass = sizeClasses[size];

  return (
    <div className={`flex justify-center items-center gap-2 md:gap-3 ${className}`}>
      <div 
        className={`${dotClass} rounded-full bg-gradient-to-b from-[var(--color-primary-from)] to-[var(--color-primary-to)] shadow-[0_4px_10px_var(--shadow-color)]`}
        style={{ animation: 'jump 0.8s ease-in-out infinite' }}
      ></div>
      <div 
        className={`${dotClass} rounded-full bg-gradient-to-b from-[var(--color-primary-from)] to-[var(--color-primary-to)] shadow-[0_4px_10px_var(--shadow-color)]`}
        style={{ animation: 'jump 0.8s ease-in-out infinite 0.15s' }}
      ></div>
      <div 
        className={`${dotClass} rounded-full bg-gradient-to-b from-[var(--color-primary-from)] to-[var(--color-primary-to)] shadow-[0_4px_10px_var(--shadow-color)]`}
        style={{ animation: 'jump 0.8s ease-in-out infinite 0.3s' }}
      ></div>
      <style>{`
        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-70%); }
        }
      `}</style>
    </div>
  );
};
