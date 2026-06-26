import React from 'react';
import type { View, Profile } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { TvIcon } from './icons/TvIcon';
import { FilmIcon } from './icons/FilmIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';

interface BottomNavigationProps {
  currentView: View;
  onSetView: (view: View) => void;
  activeProfile: Profile | null;
  isLoggedIn: boolean;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onSetView, activeProfile, isLoggedIn, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme }) => {
  
  // التحقق من ملف الطفل لتوجيه الرئيسية
  const isKid = activeProfile?.isKid;

  // القائمة المحدثة: الرئيسية، أفلام، مسلسلات، تصفح، (حسابي/زائر)
  const navItems = [
    { 
      id: 'home', 
      label: 'الرئيسية', 
      view: (isKid ? 'kids' : 'home') as View, 
      icon: HomeIcon 
    },
    { 
      id: 'movies', 
      label: 'أفلام', 
      view: 'movies' as View, 
      icon: FilmIcon 
    },
    { 
      id: 'series', 
      label: 'مسلسلات', 
      view: 'series' as View, 
      icon: TvIcon 
    },
    { 
      id: 'search', 
      label: 'تصفح', 
      view: 'search' as View, 
      icon: SearchIcon 
    },
    isLoggedIn
      ? { 
          id: 'account', 
          label: 'حسابي', 
          view: 'profileHub' as View, 
          icon: UserIcon,
          isProfile: true 
        }
      : { 
          id: 'account', 
          label: 'زائر', 
          view: 'welcome' as View, 
          icon: UserIcon,
          isProfile: false 
        }
  ];

  // تحديد ألوان الثيمات عند التفعيل
  const activeColorClass = isRamadanTheme 
    ? 'text-[#FFD700]' 
    : isEidTheme 
        ? 'text-purple-500' 
        : isCosmicTealTheme
            ? 'text-[#35F18B]'
            : isNetflixRedTheme
                ? 'text-[#E50914]'
                : 'text-[#00A7F8]';
        
  const activeRingColor = isRamadanTheme 
    ? 'ring-[#FFD700]' 
    : isEidTheme
        ? 'ring-purple-500'
        : isCosmicTealTheme
            ? 'ring-[#35F18B]'
            : isNetflixRedTheme
                ? 'ring-[#E50914]'
                : 'ring-[#00A7F8]';

  // THEME AWARE BACKGROUND
  const themedBg = "bg-[var(--bg-body)]/95 backdrop-blur-[20px]";

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[1000] md:hidden pb-safe transition-all duration-500 ${themedBg} border-t border-white/10 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]`}>
      <div className="flex justify-between items-center px-2 h-[76px] w-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.view || (item.id === 'home' && (currentView === 'home' || currentView === 'kids'));
          const Icon = item.icon;
          
          const showAvatar = item.id === 'account' && activeProfile?.avatar;

          return (
            <button
              key={item.id}
              onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onSetView(item.view);
              }}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1.5 active:scale-90 transition-all group relative"
            >
              <div className={`transition-all duration-300 relative ${isActive ? `-translate-y-1 ${activeColorClass}` : 'text-white/70'}`}>
                {showAvatar ? (
                   <div className={`w-[30px] h-[30px] md:w-[34px] md:h-[34px] rounded-full overflow-hidden ring-2 transition-all duration-300 ${isActive ? activeRingColor : 'ring-white/40 opacity-90'}`}>
                       <img src={activeProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                   </div>
                ) : (
                    <Icon 
                        className={`w-[28px] h-[28px] md:w-[32px] md:h-[32px] transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] opacity-100' : 'opacity-70 group-hover:opacity-100'}`} 
                    />
                )}
              </div>
              
              <span 
                className={`text-[12px] md:text-[13px] font-bold truncate max-w-[65px] transition-all duration-300 ${
                    isActive 
                    ? `${activeColorClass} opacity-100`
                    : 'text-white/50 group-hover:text-white opacity-100'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;