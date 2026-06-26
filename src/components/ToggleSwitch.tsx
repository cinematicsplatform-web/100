
import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, className = '' }) => {
  return (
    <div 
        className={`flex items-center gap-3 cursor-pointer group select-none ${className}`}
        onClick={() => onChange(!checked)}
    >
      {/* Track */}
      <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out ${checked ? 'bg-green-500' : 'bg-red-500'}`}>
        {/* Thumb */}
        <div 
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
                checked ? 'left-1' : 'right-1'
            }`}
        />
      </div>
      {label && <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>}
    </div>
  );
};

export default ToggleSwitch;
