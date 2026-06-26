
import React from 'react';
import type { View, Profile } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { TvIcon } from './icons/TvIcon';
import { FilmIcon } from './icons/FilmIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';
import { SmileIcon } from './icons/SmileIcon';
import { PlusIcon } from './icons/PlusIcon';

interface TvSidebarProps {
  onSetView: (view: View) => void;
  currentView: View;
  activeProfile: Profile | null;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const TvSidebar: React.FC<TvSidebarProps> = ({ 
  onSetView, 
  currentView, 
  activeProfile, 
  isRamadanTheme, 
  isEidTheme, 
  isCosmicTealTheme, 
  isNetflixRedTheme 
}) => {
  // Navigation items updated according to requirements
  const navItems = [
    { id: 'home', icon: HomeIcon, view: 'home' as View, label: 'الرئيسية' },
    { id: 'series', icon: TvIcon, view: 'series' as View, label: 'المسلسلات' },
    { id: 'movies', icon: FilmIcon, view: 'movies' as View, label: 'الأفلام' },
    { id: 'kids', icon: SmileIcon, view: 'kids' as View, label: 'الأطفال' },
    { id: 'category', icon: PlusIcon, view: 'category' as View, label: 'خياراتي' },
    { id: 'search', icon: SearchIcon, view: 'search' as View, label: 'البحث' },
    { id: 'profile', icon: UserIcon, view: 'profileHub' as View, label: 'الملف الشخصي', isProfile: true },
  ];

  const activeColorClass = isRamadanTheme 
    ? 'text-[#FFD700]' 
    : isEidTheme 
        ? 'text-purple-500' 
        : isCosmicTealTheme
            ? 'text-[#35F18B]'
            : isNetflixRedTheme
                ? 'text-[#E50914]'
                : 'text-[#00A7F8]';

  const activeBgClass = isRamadanTheme 
    ? 'bg-[#FFD700]/10' 
    : isEidTheme 
        ? 'bg-purple-500/10' 
        : isCosmicTealTheme
            ? 'bg-[#35F18B]/10'
            : isNetflixRedTheme
                ? 'bg-[#E50914]/10'
                : 'bg-[#00A7F8]/10';

  const activeIndicatorClass = isRamadanTheme 
    ? 'bg-[#FFD700]' 
    : isEidTheme 
        ? 'bg-purple-500' 
        : isCosmicTealTheme
            ? 'bg-[#35F18B]'
            : isNetflixRedTheme
                ? 'bg-[#E50914]'
                : 'bg-[#00A7F8]';

  // Dynamic Sidebar Container Theme Background
  const sidebarContainerBg = isRamadanTheme 
    ? 'bg-[#0a0a0a]/95' 
    : isEidTheme 
        ? 'bg-[#1a0b2e]/95' 
        : isCosmicTealTheme
            ? 'bg-[#0b1116]/95'
            : isNetflixRedTheme
                ? 'bg-[#141414]/95'
                : 'bg-[#141b29]/95';

  // Dynamic Sidebar Border Color
  const sidebarBorderClass = isRamadanTheme 
    ? 'border-[#FFD700]/20' 
    : isEidTheme 
        ? 'border-purple-500/20' 
        : isCosmicTealTheme
            ? 'border-[#35F18B]/20'
            : isNetflixRedTheme
                ? 'border-[#E50914]/20'
                : 'border-white/10';

  return (
    <div className={`fixed top-0 right-0 bottom-0 w-20 ${sidebarContainerBg} backdrop-blur-2xl border-l ${sidebarBorderClass} z-[1000] flex flex-col items-center justify-center gap-8 animate-fade-in`}>
      {/* Platform Logo Placeholder removed per request */}

      <nav className="flex flex-col gap-6 w-full items-center">
        {navItems.map((item) => {
          // Precise active logic: Highlight only the specific active page
          const isActive = currentView === item.view;
          const Icon = item.icon;
          const showAvatar = item.isProfile && activeProfile?.avatar;

          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.view)}
              className={`relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 target-nav-link group ${isActive ? `${activeBgClass} ${activeColorClass}` : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              title={item.label}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className={`absolute right-0 top-1/4 bottom-1/4 w-1 rounded-l-full ${activeIndicatorClass} shadow-[0_0_10px_currentColor] animate-fade-in`}></div>
              )}

              {showAvatar ? (
                <div className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-300 ${isActive ? `border-current` : 'border-transparent opacity-60 group-hover:opacity-100'}`}>
                   <img src={activeProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <Icon className={`w-7 h-7 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_currentColor]' : 'opacity-70 group-hover:opacity-100'}`} />
              )}
              
              {/* Tooltip Label - Hidden (display: none) to remove "black dot" appearance while keeping code intact */}
              <div className="hidden absolute left-full mr-4 px-3 py-1 bg-black/90 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[1001]">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info Placeholder removed per request */}
    </div>
  );
};

export default TvSidebar;
