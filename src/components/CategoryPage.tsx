import React, { useMemo, useState } from 'react';
import type { Content, Category, View, Ad, Genre } from '../types';
import { ContentType } from '../types';
import ContentCard from './ContentCard';
import { ChevronRightIcon } from './icons/ChevronRight';
import { SearchIcon } from './icons/SearchIcon';
import AdPlacement from './AdPlacement';
import SEO from './SeoMeta';

import { normalizeText } from '../utils/textUtils';

interface CategoryPageProps {
  categoryTitle: string;
  allContent: Content[];
  onSelectContent: (content: Content) => void;
  isLoggedIn: boolean;
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  returnView?: View; // Prop to know where to return
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  ads?: Ad[];
  adsEnabled?: boolean;
  onRequestOpen?: () => void; // Handler for request modal
}

const CategoryPage: React.FC<CategoryPageProps> = ({ 
    categoryTitle, 
    allContent, 
    onSelectContent, 
    isLoggedIn, 
    myList, 
    onToggleMyList, 
    onSetView,
    onGoBack,
    returnView,
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme,
    ads = [],
    adsEnabled = false,
    onRequestOpen
}) => {

  const [searchQuery, setSearchQuery] = useState('');

  const { displayTitle, filteredContent, showRank } = useMemo(() => {
    let title = categoryTitle;
    let content = [...allContent];
    let isRanked = false;

    // --- People Filtering ---
    if (categoryTitle.startsWith('person:')) {
      const personName = categoryTitle.replace('person:', '');
      title = `أعمال ${personName}`;
      content = content.filter(c => 
        c.cast?.includes(personName) || 
        c.director === personName || 
        c.writer === personName
      );
    }
    // --- Special Static Keys ---
    else if (categoryTitle === 'top-rated-content') {
        title = 'الأعلى تقييماً';
        content = content.sort((a, b) => b.rating - a.rating);
    }
    else if (categoryTitle === 'new-content') {
        title = 'أحدث الإضافات';
        content = content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    else if (categoryTitle === 'top-rated-movies') {
        title = 'الأفلام الأعلى تقييماً';
        content = content
            .filter(c => c.type === ContentType.Movie)
            .sort((a, b) => b.rating - a.rating);
    } 
    else if (categoryTitle === 'new-movies') {
        title = 'أحدث الأفلام';
        content = content
            .filter(c => c.type === ContentType.Movie)
            .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }
    else if (categoryTitle === 'top-rated-series') {
        title = 'المسلسلات الأعلى تقييماً';
        content = content
            .filter(c => c.type === ContentType.Series)
            .sort((a, b) => b.rating - a.rating);
    }
    else if (categoryTitle === 'new-series') {
        title = 'أحدث المسلسلات';
        content = content
            .filter(c => c.type === ContentType.Series)
            .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }
    else if (categoryTitle === 'top-rated-kids') {
        title = 'أفضل محتوى للأطفال';
        content = content
            .filter(c => 
                (c.categories as string[]).includes('أفلام أنيميشن') || 
                (c.categories as string[]).includes('افلام أنميشن') || 
                (c.categories as string[]).includes('افلام انميشن') || 
                (c.categories as string[]).includes('مسلسلات أنيميشن') || 
                (c.categories as string[]).includes('مسلسلات أنميشن') || 
                (c.categories as string[]).includes('مسلسلات انميشن') || 
                c.visibility === 'kids'
            )
            .sort((a, b) => b.rating - a.rating);
    }
    else if (categoryTitle === 'new-kids') {
        title = 'جديد الأطفال';
        content = content
            .filter(c => 
                (c.categories as string[]).includes('أفلام أنيميشن') || 
                (c.categories as string[]).includes('افلام أنميشن') || 
                (c.categories as string[]).includes('افلام انميشن') || 
                (c.categories as string[]).includes('مسلسلات أنيميشن') || 
                (c.categories as string[]).includes('مسلسلات أنميشن') || 
                (c.categories as string[]).includes('مسلسلات انميشن') || 
                c.visibility === 'kids'
            )
            .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }
    else if (categoryTitle === 'top-rated-ramadan') {
        title = 'الأفضل في رمضان';
        content = content
            .filter(c => c.categories.includes('رمضان'))
            .sort((a, b) => b.rating - a.rating);
    }
    else if (categoryTitle === 'new-ramadan') {
        title = 'أحدث ما في رمضان';
        content = content
            .filter(c => c.categories.includes('رمضان'))
            .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }
    else if (categoryTitle === 'مسلسلات رمضان') {
        title = 'مسلسلات رمضان';
        content = content
            .filter(c => c.categories.includes('رمضان') && c.type === 'series')
            .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }
    else if (categoryTitle === 'برامج رمضان') {
        title = 'برامج رمضان';
        content = content
            .filter(c => c.categories.includes('رمضان') && (c.type === 'program' || c.categories?.includes('برامج رمضان') || c.categories?.includes('برامج تلفزيونية')))
            .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }
    else if (categoryTitle === 'newly-added') {
        title = 'أحدث الإضافات (الكل)';
        content = content.sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }
    else if (categoryTitle === 'top-10') {
        title = 'الأكثر مشاهدة TOP 10';
        isRanked = true;
        // In a real scenario we use actual view counts. Here we sort by views.
        content = content.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 50);
    }
    else {
        // --- Smart Broad Filtering (Matches Search Behavior) ---
        const normalizedTerm = normalizeText(categoryTitle);
        content = content
            .filter(c => 
                c.categories.includes(categoryTitle as Category) || 
                (c.genres && (c.genres as string[]).includes(categoryTitle)) ||
                normalizeText(c.title).includes(normalizedTerm) ||
                (c.cast && c.cast.some(actor => normalizeText(actor).includes(normalizedTerm))) ||
                (c.director && normalizeText(c.director).includes(normalizedTerm))
            )
            .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0);
    }

    // --- Internal Page Search Filtering ---
    if (searchQuery.trim()) {
        const normalizedQuery = normalizeText(searchQuery);
        content = content.filter(c => normalizeText(c.title).includes(normalizedQuery));
    }

    return { displayTitle: title, filteredContent: content, showRank: isRanked };
  }, [allContent, categoryTitle, searchQuery]);

  // Check if there is a sidebar ad to show
  const hasSidebarAd = useMemo(() => {
      if (!adsEnabled) return false;
      return ads.some(a => 
          a.placement === 'listing-sidebar' && 
          a.status === 'active' &&
          (a.targetDevice === 'all' || a.targetDevice === 'desktop')
      );
  }, [ads, adsEnabled]);

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white animate-fade-in-up">
      <SEO 
          title={`${displayTitle} - سينماتيكس`} 
          description={`تصفح وشاهد أفضل ${displayTitle} على سينماتيكس. نوفر لك قائمة متجددة باستمرار لأحدث العروض المميزة بجودة عالية.`}
          keywords={`سينماتيكس, افلام, مسلسلات, ${displayTitle}`}
          url={`/category/${encodeURIComponent(categoryTitle)}`}
      />
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-50 bg-[var(--bg-body)]/95 backdrop-blur-xl border-b border-white/5 pb-4 pt-6 px-4 md:px-8 shadow-lg w-full">
          
          <div className="w-full flex flex-col gap-6">
              
              {/* THEMED SEARCH BAR */}
              <div className="w-full max-w-3xl mx-auto">
                  <div className={`relative group flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-3 transition-all duration-300 focus-within:bg-black/60 focus-within:shadow-[0_0_20px_var(--shadow-color)] focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]`}>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`ابحث في ${displayTitle}...`}
                            className="w-full bg-transparent outline-none text-white text-sm md:text-base placeholder-gray-500"
                        />
                        <SearchIcon className="w-5 h-5 theme-accent-text" />
                  </div>
              </div>

              {/* 2. Title & Back Button Row (Below Search) */}
              <div className="flex flex-row justify-between items-center w-full">
                    <h1 className={`text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text truncate max-w-[70%] leading-tight
                        ${isRamadanTheme 
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B]' 
                            : isEidTheme 
                                ? 'bg-gradient-to-r from-purple-400 to-purple-600' 
                                : isCosmicTealTheme
                                    ? 'bg-gradient-to-r from-[#35F18B] to-[#2596be]'
                                    : isNetflixRedTheme
                                        ? 'text-[#E50914]' 
                                        : 'bg-gradient-to-r from-white to-gray-400'
                        }`}>
                        {displayTitle}
                    </h1>

                    <button 
                        onClick={() => onGoBack(returnView || 'home')}
                        className={`group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 hover:theme-accent-border hover:text-black hover:scale-105 active:scale-95 shadow-md
                            ${isRamadanTheme 
                                ? 'hover:bg-[#FFD700]' 
                                : isEidTheme 
                                    ? 'hover:bg-purple-500' 
                                    : isCosmicTealTheme
                                        ? 'hover:bg-[#35F18B]'
                                        : isNetflixRedTheme
                                            ? 'hover:bg-[#E50914] hover:text-white'
                                            : 'hover:bg-white'
                            }`}
                    >
                        <span className="transform rotate-180 transition-transform duration-300 group-hover:-translate-x-1">
                            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </span>
                        <span className="font-bold text-xs md:text-sm">رجوع</span>
                    </button>
              </div>
          </div>
      </div>

      {/* Main Layout */}
      <div className="w-full max-w-none px-4 md:px-8 pt-6 pb-24 flex flex-col lg:flex-row gap-6">
        
        <div className="flex-1 w-full">
            <AdPlacement ads={ads} placement="listing-top" isEnabled={adsEnabled} />

            {filteredContent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-4 gap-y-4 md:gap-y-8 w-full">
                {filteredContent.map((content, index) => (
                <ContentCard 
                    key={content.id} 
                    content={content} 
                    onSelectContent={onSelectContent}
                    isLoggedIn={isLoggedIn}
                    myList={myList}
                    onToggleMyList={onToggleMyList}
                    isGridItem={true}
                    rank={showRank ? index + 1 : undefined}
                    isRamadanTheme={isRamadanTheme}
                    isEidTheme={isEidTheme}
                    isCosmicTealTheme={isCosmicTealTheme}
                    isNetflixRedTheme={isNetflixRedTheme}
                />
                ))}
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center py-6 md:py-20 text-center opacity-80 animate-fade-in-up">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <SearchIcon className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-1">لا توجد نتائج</h2>
                <p className="text-sm text-gray-500 mb-6 md:mb-8 max-w-sm mx-auto">لم يتم العثور على محتوى مطابق لبحثك في هذا القسم.</p>
                
                {/* Request Feature Entry Point - Made more compact for mobile */}
                {onRequestOpen && (
                    <div className="bg-gray-800/50 p-4 md:p-6 rounded-2xl border border-gray-700 max-w-md w-full">
                        <h3 className="text-base md:text-lg font-bold text-white mb-1">لم تجد ما تبحث عنه؟</h3>
                        <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">يمكنك طلب إضافة الفيلم أو المسلسل الذي تريده.</p>
                        <button 
                            onClick={onRequestOpen}
                            className={`w-full py-2.5 md:py-3 rounded-xl font-bold text-black transition-all hover:scale-[1.02] shadow-lg
                                ${isRamadanTheme 
                                    ? 'bg-[#FFD700] hover:bg-amber-400' 
                                    : isEidTheme 
                                        ? 'bg-purple-500 text-white hover:bg-purple-400' 
                                        : isCosmicTealTheme
                                            ? 'bg-[#35F18B] hover:bg-[#2596be]'
                                            : isNetflixRedTheme
                                                ? 'bg-[#E50914] text-white hover:bg-[#b20710]'
                                                : 'bg-[#00A7F8] hover:bg-[#00FFB0]'
                                }
                            `}
                        >
                            اطلبه الآن
                        </button>
                    </div>
                )}
            </div>
            )}

            <AdPlacement ads={ads} placement="listing-bottom" isEnabled={adsEnabled} />
        </div>

        {/* Sidebar (Desktop Only) */}
        {hasSidebarAd && (
            <div className="hidden lg:block w-[300px] flex-shrink-0 sticky top-48 h-fit">
                <AdPlacement ads={ads} placement="listing-sidebar" isEnabled={adsEnabled} />
            </div>
        )}

      </div>
    </div>
  );
};

export default CategoryPage;