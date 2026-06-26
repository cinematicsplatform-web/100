import React, { useState, useEffect } from 'react';

interface BouncingDotsLoaderProps {
  className?: string;     // For wrapping container class (e.g. alignment)
  colorClass?: string;    // E.g. "bg-[var(--color-accent)]" or specific tailwind bg-color
  size?: 'sm' | 'md' | 'lg';
  delayMs?: number;       // Wait before showing loader (default 300)
}

export const BouncingDotsLoader: React.FC<BouncingDotsLoaderProps> = ({ 
  className = '', 
  colorClass = 'bg-[var(--color-accent)]',
  size = 'md',
  delayMs = 300
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // delay showing the loader to prevent flicker
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) return null;

  let dotSize = 'w-3 h-3';
  let dotGap = 'gap-1.5';
  
  if (size === 'sm') {
    dotSize = 'w-1.5 h-1.5';
    dotGap = 'gap-1';
  } else if (size === 'lg') {
    dotSize = 'w-4 h-4';
    dotGap = 'gap-2.5';
  }

  return (
    <div className={`flex items-center justify-center loader-dot-container ${className} ${dotGap}`}>
      <div className={`rounded-full loader-dot ${dotSize} ${colorClass}`}></div>
      <div className={`rounded-full loader-dot ${dotSize} ${colorClass}`}></div>
      <div className={`rounded-full loader-dot ${dotSize} ${colorClass}`}></div>
    </div>
  );
};
