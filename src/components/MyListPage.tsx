
import React, { useMemo } from 'react';
import type { Content, Profile, View } from '@/types';
import ContentCard from './ContentCard';

interface MyListPageProps {
  allContent: Content[];
  activeProfile: Profile;
  onSelectContent: (content: Content) => void;
  isLoggedIn: boolean;
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const MyListPage: React.FC<MyListPageProps> = (props) => {
  const { allContent, activeProfile, onSelectContent, onSetView, onGoBack, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme } = props;
  const myListContent = activeProfile.myList
    .map(contentId => allContent.find(c => c.id === contentId))
    .filter((c): c is Content => c !== undefined)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white animate-fade-in-up">
      {/* UPDATED: w-full for Fluid Container (Removed max-w, removed margin auto for container) */}
      <div className="w-full max-w-none px-4 md:px-8 pt-8 pb-24">
        
        <div className="flex flex-row justify-between items-center mb-12 mt-4 w-full">
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                قائمتي
            </h1>

            <button 
                onClick={() => onGoBack('home')}
                className={`group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-transparent hover:text-black hover:scale-105 active:scale-95
                    ${isRamadanTheme 
                        ? 'hover:bg-[#FFD700]' 
                        : isEidTheme
                            ? 'hover:bg-purple-500'
                            : isCosmicTealTheme
                                ? 'hover:bg-[#35F18B]'
                                : isNetflixRedTheme
                                    ? 'hover:bg-[#E50914] hover:text-white'
                                    : 'hover:bg-gradient-to-r hover:from-[#00A7F8] hover:to-[#00FFB0]'}
                `}
            >
                <span className="transform rotate-180 transition-transform duration-300 group-hover:-translate-x-1">
                   <BackArrowIcon />
                </span>
                <span className="font-bold text-sm md:text-base">الرجوع</span>
            </button>
        </div>

        {myListContent.length > 0 ? (
          // Grid optimized for larger posters with Fluid Container
          // Capped at 6 columns (xl:grid-cols-6) to force expansion via 1fr
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 gap-y-6 w-full">
            {myListContent.map(content => (
              <ContentCard 
                key={content.id} 
                content={content} 
                onSelectContent={onSelectContent}
                isLoggedIn={props.isLoggedIn}
                myList={props.myList}
                onToggleMyList={props.onToggleMyList}
                isGridItem={true}
                isRamadanTheme={isRamadanTheme}
                isEidTheme={isEidTheme}
                isCosmicTealTheme={isCosmicTealTheme}
                isNetflixRedTheme={isNetflixRedTheme}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-60 w-full">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">قائمتك فارغة</h2>
            <p className="text-gray-500 max-w-md">أضف أفلامك ومسلسلاتك المفضلة هنا لتجدها بسهولة لاحقًا وتشاهدها في أي وقت.</p>
            <button onClick={() => onGoBack('home')} className={`mt-8 px-6 py-3 rounded-lg transition-all border ${isCosmicTealTheme ? 'text-[#35F18B] bg-[#35F18B]/10 border-[#35F18B]/30 hover:bg-[#35F18B] hover:text-black' : isNetflixRedTheme ? 'text-[#E50914] bg-[#E50914]/10 border-[#E50914]/30 hover:bg-[#E50914] hover:text-white' : 'text-[#00A7F8] bg-[#00A7F8]/10 border-[#00A7F8]/30 hover:bg-[#00A7F8] hover:text-white'}`}>
                تصفح المحتوى
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListPage;
