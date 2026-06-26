
import React from 'react';

interface ShoutBarProps {
    text: string;
    isRamadanTheme?: boolean;
    isEidTheme?: boolean;
    isCosmicTealTheme?: boolean;
    isNetflixRedTheme?: boolean;
}

const ShoutBar: React.FC<ShoutBarProps> = ({ text, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme }) => {
  let gradientClass = 'bg-gradient-to-r from-[#00A7F8] to-[#00FFB0]'; // Default gradient

  if (isRamadanTheme) {
      gradientClass = 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] shadow-[0_0_15px_rgba(212,175,55,0.4)]';
  } else if (isEidTheme) {
      gradientClass = 'bg-gradient-to-r from-purple-800 to-purple-500 text-white shadow-[0_0_15px_rgba(147,112,219,0.4)]';
  } else if (isCosmicTealTheme) {
      gradientClass = 'bg-gradient-to-r from-[#35F18B] to-[#2596be] text-black shadow-[0_0_15px_rgba(53,241,139,0.4)]';
  } else if (isNetflixRedTheme) {
      gradientClass = 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]';
  }

  return (
    <div 
        className={`${gradientClass} text-black font-bold h-10 flex items-center overflow-hidden mb-8 rounded-lg transition-all duration-500 ${isEidTheme || isNetflixRedTheme ? 'text-white' : 'text-black'}`}
    >
      <div className="shout-bar-content whitespace-nowrap">
        <span className="px-8">{text}</span>
        <span className="px-8">{text}</span>
      </div>
    </div>
  );
};

// Inject styles into the document head only once
if (!document.getElementById('shoutbar-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'shoutbar-styles';
    styleSheet.innerText = `
    .shout-bar-content {
      display: inline-block;
      animation: marquee 30s linear infinite;
    }

    @keyframes marquee {
      0% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    `;
    document.head.appendChild(styleSheet);
}

export default ShoutBar;
