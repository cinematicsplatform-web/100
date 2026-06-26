
import React, { useState, useEffect, useMemo } from 'react';
import type { Content, Ad, View, SiteSettings } from '@/types';
import { ContentType } from '@/types';
import Hero from './Hero';
import ContentCarousel from './ContentCarousel';
import AdPlacement from './AdPlacement';
import SEO from './SeoMeta';
import AdZone from './AdZone'; 
import InlinePromoBanner from './InlinePromoBanner';

interface MoviesPageProps {
  allContent: Content[];
  pinnedContent: Content[];
  top10Content?: Content[];
  onSelectContent: (content: Content, seasonNumber?: number) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean; // تم الإضافة
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  ads: Ad[];
  adsEnabled: boolean;
  onNavigate: (view: View, category?: string) => void;
  isLoading?: boolean;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  siteSettings?: SiteSettings;
  promoBanners?: import('@/types').PromotionalBanner[];
}

const MoviesPage: React.FC<MoviesPageProps> = ({ 
  allContent, 
  pinnedContent, 
  top10Content,
  onSelectContent, 
  isLoggedIn, 
  isAdmin = false,
  myList, 
  onToggleMyList, 
  ads, 
  adsEnabled, 
  onNavigate, 
  isLoading, 
  isRamadanTheme, 
  isEidTheme, 
  isCosmicTealTheme, 
  isNetflixRedTheme, 
  siteSettings,
  promoBanners
}) => {
  const isShahidTheme = siteSettings?.activeTheme === 'shahid';
  const allMovies = useMemo(() => allContent.filter(c => c.type === ContentType.Movie), [allContent]);
  
  const heroContent = useMemo(() => {
    if (pinnedContent && pinnedContent.length > 0) {
        return pinnedContent;
    }
    const sortedMovies = [...allMovies].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sortedMovies.slice(0, 5);
  }, [pinnedContent, allMovies]);

  const heroIsPresent = heroContent.length > 0;
  const pageAdsEnabled = adsEnabled && !heroIsPresent;

  const carousels = useMemo(() => {
    const nowTimestamp = Date.now();

    const getEffectiveUpdateDate = (c: Content) => {
        let maxDate = new Date(c.updatedAt || c.createdAt).getTime();
        
        // Check content level schedule
        if (c.isScheduled && c.scheduledAt) {
            const sched = new Date(c.scheduledAt).getTime();
            if (nowTimestamp >= sched && sched > maxDate) maxDate = sched;
        }

        // Check episode level schedules (for consistency, though movies usually don't have them)
        if (c.seasons) {
            c.seasons.forEach(s => {
                s.episodes?.forEach(ep => {
                    if (ep.isScheduled && ep.scheduledAt) {
                        const epSched = new Date(ep.scheduledAt).getTime();
                        if (nowTimestamp >= epSched && epSched > maxDate) maxDate = epSched;
                    }
                });
            });
        }
        return maxDate;
    };

    const limit = (list: Content[]) => list.slice(0, 12);

    const recentMovies = limit([...allMovies]
      .sort((a, b) => getEffectiveUpdateDate(b) - getEffectiveUpdateDate(a)));

    const arabicMovies = limit(allMovies.filter(c => c.categories.includes('افلام عربية')));
    const turkishMovies = limit(allMovies.filter(c => c.categories.includes('افلام تركية')));
    const foreignMovies = limit(allMovies.filter(c => c.categories.includes('افلام اجنبية')));
    const indianMovies = limit(allMovies.filter(c => c.categories.includes('افلام هندية')));
    const animationMovies = limit(allMovies.filter(c => (c.categories as string[]).includes('أفلام أنيميشن') || (c.categories as string[]).includes('افلام أنميشن')));

    const top10Source = (top10Content && top10Content.length > 0) ? top10Content : pinnedContent;

    const pinnedMoviesCarousel = { 
        id: 'm_pinned_top', 
        title: 'أفضل 10 أفلام', 
        contents: top10Source, 
        showRanking: true 
    };

    const definedCarousels = [
      siteSettings?.showTop10Movies ? pinnedMoviesCarousel : null,
      { id: 'm1', title: 'أحدث الإضافات', contents: recentMovies, isNew: true, categoryKey: 'new-movies' },
      { id: 'm2', title: 'أفلام عربية', contents: arabicMovies, isNew: false, categoryKey: 'افلام عربية' },
      { id: 'm3', title: 'أفلام تركية', contents: turkishMovies, isNew: false, categoryKey: 'افلام تركية' },
      { id: 'm4', title: 'أفلام أجنبية', contents: foreignMovies, isNew: false, categoryKey: 'افلام اجنبية' },
      { id: 'm5', title: 'أفلام هندية', contents: indianMovies, isNew: false, categoryKey: 'افلام هندية' },
      { id: 'm6', title: 'أفلام أنيميشن', contents: animationMovies, isNew: false, categoryKey: 'أفلام أنيميشن' },
    ]
    .filter(Boolean)
    .filter(carousel => (carousel as any).contents.length > 0);

    return definedCarousels;
  }, [allMovies, pinnedContent, top10Content, siteSettings?.showTop10Movies]);

  const handleSeeAll = (categoryKey: string) => {
      onNavigate('category', categoryKey);
  };

  if (isLoading && allMovies.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-body)]">
        <Hero contents={[] as Content[]} onWatchNow={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isLoading={true} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={isShahidTheme} />
        <main className="pb-24 pt-0 z-30 relative bg-[var(--bg-body)]">
            <div className={`w-full h-px mb-6 animate-pulse ${isRamadanTheme ? 'bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent' : isNetflixRedTheme ? 'bg-gradient-to-r from-transparent via-[#E50914]/50 to-transparent' : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'}`}></div>
            
            <div className="space-y-4">
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
            </div>
        </main>
      </div>
    );
  }

  if (allMovies.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 animate-fade-in-up">لا يوجد أفلام لعرضها حالياً.</div>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-body)]">
        <SEO 
            title="أفلام" 
            description="مكتبة ضخمة من الأفلام العربية والأجنبية والتركية والهندية بجودة عالية على سينماتيكس (Cinematix)."
            keywords="افلام سينماتيكس, cinematix movies, cinematics movies, افلام عربية, افلام اجنبية, افلام تركية, افلام هندية, مشاهدة افلام"
            type="website"
        />

        <Hero 
            contents={heroContent} 
            onWatchNow={onSelectContent} 
            isLoggedIn={isLoggedIn} 
            isAdmin={isAdmin}
            myList={myList} 
            onToggleMyList={onToggleMyList} 
            autoSlideInterval={5000}
            isRamadanTheme={isRamadanTheme}
            isEidTheme={isEidTheme}
            isCosmicTealTheme={isCosmicTealTheme}
            isNetflixRedTheme={isNetflixRedTheme}
            isShahidTheme={isShahidTheme}
            disableVideo={heroIsPresent}
        />

        <main className="pb-24 z-30 relative bg-[var(--bg-body)]">
            <div className={`w-full h-px mt-0 mb-2 md:my-4 
                ${isRamadanTheme 
                    ? 'bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-80' 
                    : isEidTheme
                        ? 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-80'
                        : isCosmicTealTheme
                            ? 'bg-gradient-to-r from-transparent via-[#35F18B]/50 to-transparent opacity-80'
                            : isNetflixRedTheme
                                ? 'bg-gradient-to-r from-transparent via-[#E50914]/50 to-transparent opacity-80'
                                : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                }`}></div>

            <div className="flex flex-col lg:flex-row gap-6 px-0 md:px-0">
                <div className="flex-1 w-full">
                    {pageAdsEnabled && <AdZone position="page_movies_top" />}
                    <AdPlacement ads={ads} placement="listing-top" isEnabled={pageAdsEnabled} />
                    <AdPlacement ads={ads} placement="movies-page" isEnabled={pageAdsEnabled} />
                    
                    {carousels.map((carousel, index) => {
                        const targetCategory = typeof (carousel as any).title === 'string' ? (carousel as any).title : '';
                        const inlineBanner = promoBanners?.find(b => b.targetPage === 'movies' && (b.targetCarousel ? b.targetCarousel === targetCategory : b.positionIndex === index + 1));
                        
                        return (
                            <React.Fragment key={(carousel as any).id}>
                            <ContentCarousel
                                title={(carousel as any).title}
                                contents={(carousel as any).contents}
                                onSelectContent={onSelectContent}
                                isLoggedIn={isLoggedIn}
                                isAdmin={isAdmin}
                                myList={myList}
                                onToggleMyList={onToggleMyList}
                                isNew={(carousel as any).isNew}
                                onSeeAll={(carousel as any).categoryKey ? () => handleSeeAll((carousel as any).categoryKey) : undefined}
                                isRamadanTheme={isRamadanTheme}
                                isEidTheme={isEidTheme}
                                isCosmicTealTheme={isCosmicTealTheme}
                                isNetflixRedTheme={isNetflixRedTheme}
                                showRanking={(carousel as any).showRanking}
                            />
                            {inlineBanner && (
                                <InlinePromoBanner {...inlineBanner} allContent={allContent} onSelectContent={onSelectContent} />
                            )}
                            </React.Fragment>
                        );
                    })}
                    
                    <AdPlacement ads={ads} placement="listing-bottom" isEnabled={pageAdsEnabled} />
                </div>

                <div className="hidden lg:block w-[300px] flex-shrink-0 pt-4 pl-4 sticky top-24 h-fit">
                    <AdPlacement ads={ads} placement="listing-sidebar" isEnabled={pageAdsEnabled} />
                </div>
            </div>
        </main>
    </div>
  );
};

export default MoviesPage;
