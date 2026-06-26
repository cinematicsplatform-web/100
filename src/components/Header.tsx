
import React, { useState, useEffect } from 'react';
import type { User, Profile, View, Content } from '@/types';
import { UserRole } from '@/types';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';
import { ChevronRightIcon } from './icons/ChevronRight';
import { BellIcon } from './icons/BellIcon';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';

interface HeaderProps {
  onSetView: (view: View, category?: string) => void;
  currentUser: User | null;
  activeProfile: Profile | null;
  onLogout: () => void;
  allContent: Content[];
  onSelectContent: (content: Content, seasonNumber?: number) => void;
  currentView?: View;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isShahidTheme?: boolean;
  returnView?: View;
  isKidProfile?: boolean;
  onOpenSearch?: () => void; 
  unreadNotificationsCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onSetView, currentUser, activeProfile, onLogout, allContent, onSelectContent, currentView, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme, isShahidTheme, returnView, isKidProfile, onOpenSearch, unreadNotificationsCount = 0 }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const baseMenuItems: { name: string; view: View, loggedIn?: boolean }[] = [
    { name: 'الرئيسية', view: 'home' },
    { name: 'المسلسلات', view: 'series' },
    { name: 'الأفلام', view: 'movies' },
    { name: 'الأطفال', view: 'kids' },
    { name: 'رمضان', view: 'ramadan' },
    { name: 'قريباً', view: 'soon' },
  ];

  // Logic to show simplified menu for kids
  const menuItems = isKidProfile 
    ? [{ name: 'الرئيسية', view: 'kids' as View }] 
    : baseMenuItems;

  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === UserRole.Admin;
  const isDetailView = currentView === 'detail';

  const displayCount = unreadNotificationsCount > 9 ? '+9' : String(unreadNotificationsCount);

  return (
    <header 
      className={`
        fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-in-out
        ${isScrolled 
            ? (isShahidTheme 
                ? 'bg-[#0b0f19]/90 border-b border-white/10 backdrop-blur-3xl shadow-lg' 
                : 'bg-black/10 backdrop-blur-3xl') 
            : 'bg-gradient-to-b from-black/80 to-transparent'}
      `}
    >
      <div className="w-full px-4 md:px-8 flex items-center justify-between h-16 md:h-20 gap-6">
        
        <div className="flex items-center gap-6 md:gap-10 lg:flex-1">
          <button 
            className="lg:hidden text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="w-7 h-7" />
          </button>

          <h1 onClick={() => onSetView(isKidProfile ? 'kids' : 'home')} className="text-2xl md:text-3xl font-extrabold cursor-pointer">
            {isNetflixRedTheme ? (
               <span className="text-[#E50914] font-['Lalezar'] tracking-wide">CINEMATIX</span>
            ) : (
               <><span className="text-white">سينما</span><span className="gradient-text font-['Lalezar'] tracking-wide">تيكس</span></>
            )}
          </h1>
          
          {!isShahidTheme && (
            <nav className="hidden lg:flex items-center gap-8">
              {menuItems.map((item) => {
                if (item.loggedIn && !isLoggedIn) return null;
                return (
                  <a 
                    key={item.name} 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onSetView(item.view); }} 
                    className={`font-bold hover-text-accent transition-all duration-200 text-md flex items-center target-nav-link ${isCosmicTealTheme ? 'text-gray-200 hover:text-[#35F18B]' : isNetflixRedTheme ? 'text-gray-300 hover:text-[#E50914]' : 'text-white'}`}
                  >
                    {item.name}
                  </a>
                )
              })}
            </nav>
          )}
        </div>

        {isShahidTheme && (
          <div className="hidden lg:flex items-center justify-center flex-none">
            <div className="flex items-center bg-[#131a26]/40 border border-white/10 backdrop-blur-md rounded-full px-4 py-1 gap-2 border-r border-[#1994e5]/10 shadow-2xl">
              {/* Highlight active with dark background capsule pill */}
              {[
                { name: 'الرئيسية', view: 'home' },
                { name: 'مسلسلات', view: 'series' },
                { name: 'أفلام', view: 'movies' },
                { name: 'رمضان', view: 'ramadan' },
                { name: 'الأطفال', view: 'kids', isKids: true },
                { name: 'تصفح', view: 'programs' },
                { name: 'قريباً', view: 'soon' }
              ].map((item, index) => {
                const isActive = currentView === item.view;
                if (item.isKids) {
                  return (
                    <a 
                      key={index} 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); onSetView('kids'); }} 
                      className={`font-semibold text-sm transition-all py-1.5 px-4 rounded-full flex items-center gap-1.5 duration-300 ${
                        isActive 
                          ? 'bg-neutral-800/80 text-white font-bold border border-white/10 hover:bg-white hover:text-black hover:font-bold' 
                          : 'text-gray-300 hover:bg-white hover:text-black hover:font-bold'
                      }`}
                    >
                      <span>الأطفال</span>
                      <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f423/512.webp" alt="kids" className="w-4 h-4" />
                    </a>
                  );
                }
                return (
                  <a 
                    key={index} 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onSetView(item.view as View); }} 
                    className={`font-semibold text-sm transition-all duration-300 py-1.5 px-4 rounded-full ${
                      isActive 
                        ? 'bg-neutral-800/80 text-white font-bold border border-white/10 shadow-md hover:bg-white hover:text-black hover:font-bold' 
                        : 'text-gray-300 hover:bg-white hover:text-black hover:font-bold'
                    }`}
                  >
                    {item.name}
                  </a>
                );
              })}

              {/* Separator */}
              <span className="text-white/20 text-sm">|</span>

              {/* Search Inside Pill */}
              <button
                onClick={() => {
                  if (onOpenSearch) onOpenSearch();
                  else onSetView('search');
                }}
                className="text-gray-300 hover:text-[#00ffaa] hover:scale-110 active:scale-95 transition-all p-1"
                title="بحث"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-5 md:gap-6 lg:flex-1 lg:justify-end">
          
          {/* Mute button or standard search icon */}
          {isShahidTheme ? (
            <>
              {/* Login Button (Capsule) - Desktop-only */}
              <div className="hidden lg:flex items-center gap-2">
                {!isLoggedIn && (
                  <>
                    <button 
                      onClick={() => onSetView('login')}
                      className="rounded-full bg-[#131a26]/60 hover:bg-white hover:text-black hover:font-bold border border-white/10 text-white font-bold px-4 py-1.5 text-xs transition-all duration-200 h-9"
                    >
                      تسجيل الدخول
                    </button>
                    <button 
                      onClick={() => onSetView('register')}
                      className="rounded-full bg-white hover:bg-neutral-100 text-black font-extrabold px-4 py-1.5 text-xs transition-all duration-200 h-9 shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
                    >
                      إنشاء حساب
                    </button>
                  </>
                )}
              </div>

              {/* Mobile-only search button */}
              <button 
                onClick={() => {
                    if (onOpenSearch) onOpenSearch();
                    else onSetView('search');
                }}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-gray-300 hover:text-white hover:bg-white/10"
                title="بحث"
              >
                <SearchIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                  if (onOpenSearch) onOpenSearch();
                  else onSetView('search');
              }}
              className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 
                  hover:bg-white/10
                  ${isRamadanTheme 
                      ? 'text-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.4)]' 
                      : isEidTheme
                          ? 'text-purple-400 hover:shadow-[0_0_15px_rgba(147,112,219,0.4)]'
                          : isCosmicTealTheme
                              ? 'text-[#35F18B] hover:shadow-[0_0_15px_rgba(53,241,139,0.4)]'
                              : isNetflixRedTheme 
                                  ? 'text-[#E50914] hover:shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }
              `}
              title="بحث"
            >
                <SearchIcon className="w-7 h-7" />
            </button>
          )}
          
          {isLoggedIn ? (
            <div className="relative z-50 hidden md:block" onMouseLeave={() => setIsMenuOpen(false)}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center text-white overflow-hidden ring-2 transition-all duration-300 relative
                  ${isMenuOpen 
                      ? (isRamadanTheme 
                          ? 'ring-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.6)]' 
                          : isEidTheme
                              ? 'ring-purple-500 shadow-[0_0_15px_rgba(147,112,219,0.6)]'
                              : isCosmicTealTheme
                                  ? 'ring-[#35F18B] shadow-[0_0_15px_rgba(53,241,139,0.6)]'
                                  : isNetflixRedTheme
                                      ? 'ring-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.6)]'
                                      : 'ring-[var(--color-accent)] shadow-[0_0_15px_var(--shadow-color)]') 
                      : (isRamadanTheme 
                          ? 'ring-transparent hover:ring-[#FFD700]' 
                          : isEidTheme 
                              ? 'ring-transparent hover:ring-purple-500'
                              : isCosmicTealTheme
                                  ? 'ring-transparent hover:ring-[#35F18B]'
                                  : isNetflixRedTheme
                                      ? 'ring-transparent hover:ring-[#E50914]'
                                      : 'ring-transparent hover:ring-gray-500')
                  }
                `}
              >
                  {activeProfile ? <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" /> : <UserIcon />}
                  
                  {/* Notification Badge */}
                  {unreadNotificationsCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#141b29] animate-bounce">
                      {displayCount}
                    </div>
                  )}
              </button>
              
              <div 
                 className={`
                     absolute left-0 top-full pt-3 w-72 
                     transition-all duration-200 origin-top-left
                     ${isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'}
                 `}
              >
                 <div className={`bg-[#162032] border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden 
                     ${isRamadanTheme 
                         ? 'border-amber-500/30' 
                         : isEidTheme 
                             ? 'border-purple-500/30' 
                             : isCosmicTealTheme 
                                 ? 'border-[#35F18B]/30'
                                 : isNetflixRedTheme
                                     ? 'border-[#E50914]/30'
                                     : 'border-gray-700/50'}
                 `}>
                     <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                         <p className={`font-bold text-lg ${isRamadanTheme ? 'text-[#FFD700]' : isEidTheme ? 'text-purple-400' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-white'}`}>{activeProfile?.name}</p>
                         <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{currentUser?.email}</p>
                     </div>
                     
                     <div className="p-2 flex flex-col gap-1">
                          <a href="#" onClick={(e) => {e.preventDefault(); onSetView('notifications'); setIsMenuOpen(false);}} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover-text-accent hover:bg-white/5 rounded-xl transition-all duration-200">
                             <div className="flex items-center gap-3">
                               <span>الإشعارات</span>
                             </div>
                             {unreadNotificationsCount > 0 && (
                               <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{displayCount}</span>
                             )}
                          </a>
                          <a href="#" onClick={(e) => {e.preventDefault(); onSetView('myList'); setIsMenuOpen(false);}} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover-text-accent hover:bg-white/5 rounded-xl transition-all duration-200">
                             <span>قائمتي</span>
                          </a>
                          <a href="#" onClick={(e) => {e.preventDefault(); onSetView('accountSettings'); setIsMenuOpen(false);}} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover-text-accent hover:bg-white/5 rounded-xl transition-all duration-200">
                             <span>إدارة الحساب</span>
                          </a>
                          <a href="#" onClick={(e) => {e.preventDefault(); onSetView('profileSelector'); setIsMenuOpen(false);}} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover-text-accent hover:bg-white/5 rounded-xl transition-all duration-200">
                             <span>تبديل الملف الشخصي</span>
                          </a>
                          {isAdmin && (
                             <a href="#" onClick={(e)=>{e.preventDefault(); onSetView('admin'); setIsMenuOpen(false);}} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover-text-accent hover:bg-white/5 rounded-xl transition-all duration-200">
                                 <span>لوحة التحكم</span>
                             </a>
                          )}
                     </div>

                     <div className="p-2 border-t border-white/5">
                          <a href="#" onClick={(e)=>{e.preventDefault(); onLogout(); setIsMenuOpen(false);}} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200">
                             <span>تسجيل الخروج</span>
                          </a>
                     </div>
                 </div>
              </div>
            </div>
          ) : (
            !isShahidTheme && (
              <button 
                onClick={() => onSetView('welcome')}
                className={`
                  hidden md:block rounded-full font-bold px-5 py-1.5 text-xs transition-colors duration-200 h-9 whitespace-nowrap
                  ${isRamadanTheme 
                    ? 'bg-[#FFD700] text-black hover:bg-[#D4AF37]' 
                    : isEidTheme 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : isCosmicTealTheme 
                        ? 'bg-[#35F18B] text-black hover:bg-[#2bc471]' 
                        : isNetflixRedTheme 
                          ? 'bg-[#E50914] text-white hover:bg-[#bf0810]' 
                          : 'bg-white text-black hover:bg-neutral-100'}
                `}
              >
                تسجيل الدخول
              </button>
            )
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`fixed top-0 right-0 h-full w-[280px] bg-[#111] shadow-2xl transition-transform duration-300 ease-out transform overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 flex items-center justify-between border-b border-gray-800">
            <h2 className="text-xl font-bold">
            {isNetflixRedTheme ? (
               <span className="text-[#E50914] font-['Lalezar'] tracking-wide">CINEMATIX</span>
            ) : (
               <><span className="text-white">سينما</span><span className="gradient-text font-['Lalezar'] tracking-wide">تيكس</span></>
            )}
            </h2>
            <button 
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="p-4 flex flex-col gap-2 relative">
            {menuItems.map((item) => {
              if (item.loggedIn && !isLoggedIn) return null;
              return (
                <a 
                  key={item.name} 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    onSetView(item.view);
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`font-bold p-3 rounded-xl transition-all duration-200 text-md flex items-center gap-3 ${
                    currentView === item.view 
                      ? (isCosmicTealTheme ? 'bg-[#35F18B]/10 text-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]/10 text-[#E50914]' : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]')
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.name}
                </a>
              )
            })}
            
            {!isLoggedIn && (
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    onSetView('welcome');
                    setIsMobileMenuOpen(false);
                  }} 
                  className="mt-4 text-center bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_15px_var(--shadow-color)]"
                >
                  تسجيل الدخول / إنشاء حساب
                </a>
            )}
            
            {isLoggedIn && (
              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
                 <div className="px-3 pb-3 mb-2 flex items-center gap-3 border-b border-gray-800/50">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800">
                      {activeProfile ? <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" /> : <UserIcon />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{activeProfile?.name}</p>
                      <p className="text-xs text-gray-500 font-mono truncate max-w-[160px]">{currentUser?.email}</p>
                    </div>
                 </div>

                 <a href="#" onClick={(e) => { e.preventDefault(); onSetView('notifications'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-xl flex items-center justify-between text-gray-300 hover:bg-white/5`}>
                    <span>الإشعارات</span>
                    {unreadNotificationsCount > 0 && <span className="bg-red-600 px-2 py-0.5 rounded-full text-xs text-white">{displayCount}</span>}
                 </a>
                 <a href="#" onClick={(e) => { e.preventDefault(); onSetView('myList'); setIsMobileMenuOpen(false); }} className={`p-3 rounded-xl text-gray-300 hover:bg-white/5`}>قائمتي</a>
                 <a href="#" onClick={(e) => { e.preventDefault(); onSetView('accountSettings'); setIsMobileMenuOpen(false); }} className="p-3 rounded-xl text-gray-300 hover:bg-white/5">إدارة الحساب</a>
                 <a href="#" onClick={(e) => { e.preventDefault(); onSetView('profileSelector'); setIsMobileMenuOpen(false); }} className="p-3 rounded-xl text-gray-300 hover:bg-white/5">تبديل الملف الشخصي</a>
                 {isAdmin && (
                    <a href="#" onClick={(e) => { e.preventDefault(); onSetView('admin'); setIsMobileMenuOpen(false); }} className="p-3 rounded-xl text-yellow-500 hover:bg-yellow-500/10 font-bold flex items-center justify-between">
                       <span>لوحة التحكم (Admins)</span>
                    </a>
                 )}
                 <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setIsMobileMenuOpen(false); }} className="p-3 rounded-xl text-red-500 hover:bg-red-500/10 mt-2 font-bold flex items-center justify-between transition-colors">
                    <span>تسجيل الخروج</span>
                 </a>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
