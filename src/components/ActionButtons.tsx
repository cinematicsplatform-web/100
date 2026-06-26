import React, { useState, useEffect } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CheckIcon } from './CheckIcon';
import type { Content } from '@/types';

interface ActionButtonsProps {
  onWatch: () => void;
  onToggleMyList?: () => void;
  isInMyList?: boolean;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isShahidTheme?: boolean;
  showMyList?: boolean;
  className?: string;
  content?: Content; 
  isSoonOverride?: boolean; 
}

const CalendarIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="w-6 h-6 md:w-9 md:h-9 inline-block text-white" 
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onWatch, 
  onToggleMyList, 
  isInMyList, 
  showMyList = true,
  isRamadanTheme,
  isEidTheme,
  isCosmicTealTheme,
  isNetflixRedTheme,
  isShahidTheme,
  className = "",
  content,
  isSoonOverride
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
      if (!isInMyList) {
          setShowFeedback(false);
      }
  }, [isInMyList]);

  const handleToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onToggleMyList) {
          if (!isInMyList) {
              setShowFeedback(true);
              setTimeout(() => setShowFeedback(false), 2000);
          } else {
              setShowFeedback(false);
          }
          onToggleMyList();
      }
  };

  const isSoon = isSoonOverride ?? content?.categories?.includes('قريباً');

  // Logic for the primary button color
  let primaryBtnClass = "btn-primary";
  
  // شرط خاص لزر "قريباً" ليطابق الصورة المرفقة مع توحيد الأبعاد والظلال
  if (isShahidTheme) {
      primaryBtnClass = isSoon 
          ? "bg-[#182131]/60 text-[#00ffaa] hover:bg-[#1f2a3f]/70 border border-white/10 shadow-lg"
          : "bg-white text-black hover:bg-neutral-100 font-extrabold shadow-[0_4px_25px_rgba(255,255,255,0.15)] border-none";
  } else if (isSoon) {
      primaryBtnClass = "bg-[#374151] text-white hover:bg-[#4b5563] border-none shadow-lg hover:shadow-xl";
  } else if (isRamadanTheme) {
      primaryBtnClass = "bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:brightness-110 border-none";
  } else if (isEidTheme) {
      primaryBtnClass = "bg-gradient-to-r from-purple-800 to-purple-500 text-white shadow-[0_0_15px_rgba(106,13,173,0.4)] hover:brightness-110 border-none";
  } else if (isCosmicTealTheme) {
      primaryBtnClass = "bg-gradient-to-r from-[#35F18B] to-[#2596be] text-black shadow-[0_0_15px_rgba(53,241,139,0.4)] hover:brightness-110 border-none";
  } else if (isNetflixRedTheme) {
      primaryBtnClass = "bg-[#E50914] text-white hover:bg-[#b20710] border-none shadow-none";
  }

  let myListBaseClass = "bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-md";
  
  if (isShahidTheme) {
      myListBaseClass = "bg-white/10 border border-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded-full w-[48px] h-[48px] md:w-[64px] md:h-[64px] flex items-center justify-center p-0 shrink-0";
  } else if (isNetflixRedTheme) {
      myListBaseClass = "bg-[rgba(109,109,110,0.7)] border-none text-white hover:bg-[rgba(109,109,110,0.4)] backdrop-blur-md";
  }
  
  const myListActiveClass = isShahidTheme
      ? "bg-[#00ffaa]/25 border border-[#00ffaa]/50 text-[#00ffaa] hover:bg-[#00ffaa]/35 backdrop-blur-md rounded-full w-[48px] h-[48px] md:w-[64px] md:h-[64px] flex items-center justify-center p-0 shrink-0 shadow-[0_4px_15px_rgba(0,255,170,0.2)]"
      : "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]";

  let watchUrl = "#";
  if (content) {
      const slug = content.slug || content.id;
      watchUrl = content.type === 'movie' ? `/watch/movie/${slug}` : `/series/${slug}${isSoon ? '?targetSeason=upcoming' : ''}`;
  }

  return (
    <div className={`w-full md:w-auto flex flex-row items-center gap-3 md:gap-4 z-30 relative action-buttons-container ${className}`}>
      <a 
        href={watchUrl}
        aria-label={content ? `شاهد ${content.title}` : "شاهد الآن"}
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          onWatch?.(); 
        }}
        className={`
          flex-1 md:flex-none
          flex items-center justify-center gap-2 md:gap-3
          font-bold 
          ${isShahidTheme ? 'py-3 px-5 md:py-4.5 md:px-14 h-[48px] md:h-[64px]' : 'py-3.5 px-5 md:py-5 md:px-14'}
          rounded-full
          text-lg md:text-2xl
          transform transition-all duration-200
          active:scale-95
          no-underline
          whitespace-nowrap
          target-watch-btn
          shrink
          max-w-full
          ${primaryBtnClass}
        `}
      >
        {isSoon ? <CalendarIcon /> : <PlayIcon className="w-5 h-5 md:w-7 md:h-7 fill-current" />}
        <span>{isSoon ? 'قريباً' : 'شاهد الآن'}</span>
      </a>
      
      {showMyList && onToggleMyList && (
        <button 
          onClick={handleToggle}
          className={isShahidTheme ? `
            transition-all duration-200 transform active:scale-95 cursor-pointer
            ${isInMyList ? myListActiveClass : myListBaseClass}
          ` : `
            flex-1 md:flex-none
            flex items-center justify-center gap-2 md:gap-3
            font-bold
            py-3.5 px-5 md:py-5 md:px-14
            rounded-full
            text-lg md:text-2xl
            transition-all duration-200 transform active:scale-95 whitespace-nowrap
            shrink
            max-w-full
            ${isInMyList 
              ? myListActiveClass 
              : myListBaseClass
            }
          `}
        >
          {isInMyList ? <CheckIcon className="w-5 h-5 md:w-7 md:h-7" /> : <PlusIcon className="w-5 h-5 md:w-7 md:h-7" />}
          {!isShahidTheme && <span>{showFeedback ? 'تمت الإضافة' : 'قائمتي'}</span>}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;