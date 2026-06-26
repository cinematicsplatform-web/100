
import React, { useState, useEffect, useMemo } from 'react';
import type { Content, Ad, View, SiteSettings } from '@/types';
import { ContentType } from '@/types';
import Hero from './Hero';
import ContentCarousel from './ContentCarousel';
import AdPlacement from './AdPlacement';
import SEO from './SeoMeta';
import AdZone from './AdZone';
import InlinePromoBanner from './InlinePromoBanner';

interface SeriesPageProps {
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

const SeriesPage: React.FC<SeriesPageProps> = ({ 
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
  
  const allSeries = useMemo(() => allContent.filter(c => c.type === ContentType.Series), [allContent]);
  
  const heroContent = useMemo(() => {
    if (pinnedContent && pinnedContent.length > 0) {
        return pinnedContent;
    }
    const sortedSeries = [...allSeries].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedSeries.slice(0, 5);
  }, [pinnedContent, allSeries]);

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

        // Check episode level schedules
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

    const recentSeries = limit([...allSeries]
      .sort((a, b) => getEffectiveUpdateDate(b) - getEffectiveUpdateDate(a)));

    const arabicSeries = limit(allSeries.filter(c => c.categories.includes('مسلسلات عربية')));
    const turkishSeries = limit(allSeries.filter(c => c.categories.includes('مسلسلات تركية')));
    const foreignSeries = limit(allSeries.filter(c => c.categories.includes('مسلسلات اجنبية')));

    const ramadanSeriesContent = limit(allSeries.filter(c => c.categories.includes('رمضان') || c.categories.includes('مسلسلات رمضان')));

    const top10Source = (top10Content && top10Content.length > 0) ? top10Content : pinnedContent;

    const pinnedSeriesCarousel = { 
        id: 's_pinned_top', 
        title: 'أفضل 10 مسلسلات', 
        contents: top10Source, 
        showRanking: true 
    };

    const ramadanTitle = (
        <div className="flex items-center gap-3">
             <div className={`w-1.5 h-6 md:h-8 rounded-full shadow-[0_0_10px_rgba(0,167,248,0.6)] ${isRamadanTheme ? 'bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.6)]' : 'bg-gradient-to-b from-[#00A7F8] to-[#00FFB0]'}`}></div>
             <div className="flex items-center gap-2">
                 <span>رمضان معانا</span>
                 <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f31c/512.webp" alt="moon" className="w-6 h-6 md:w-8 md:h-8" />
             </div>
        </div>
    );

    const ramadanCarousel = { id: 's_ramadan', title: ramadanTitle, contents: ramadanSeriesContent, categoryKey: 'مسلسلات رمضان' };

    const definedCarousels = [
      siteSettings?.showTop10Series ? pinnedSeriesCarousel : null,
      siteSettings?.isShowRamadanCarousel ? ramadanCarousel : null,
      { id: 's_new', title: 'أحدث الإضافات', contents: recentSeries, isNew: true, categoryKey: 'new-series' },
      { id: 's2', title: 'مسلسلات عربية', contents: arabicSeries, isNew: false, categoryKey: 'مسلسلات عربية' },
      { id: 's3', title: 'مسلسلات تركية', contents: turkishSeries, isNew: false, categoryKey: 'مسلسلات تركية' },
      { id: 's4', title: 'مسلسلات أجنبية', contents: foreignSeries, isNew: false, categoryKey: 'مسلسلات اجنبية' },
    ]
    .filter(Boolean)
    .filter(carousel => (carousel as any).contents.length > 0);

    return definedCarousels;
  }, [allSeries, siteSettings?.isShowRamadanCarousel, siteSettings?.showTop10Series, isRamadanTheme, pinnedContent, top10Content]); 

  const handleSeeAll = (categoryKey: string) => {
      onNavigate('category', categoryKey);
  };

  if (isLoading && allSeries.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-body)]">
        < Hero contents={[] as Content[]} onWatchNow={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isLoading={true} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={isShahidTheme} />
        <main className="pb-24 pt-0 z-30 relative bg-[var(--bg-body)]">
            <div className={`w-full h-px mb-6 animate-pulse ${isRamadanTheme ? 'bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent' : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'}`}></div>
            
            <div className="space-y-4">
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
            </div>
        </main>
      </div>
    );
  }

  if (allSeries.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 animate-fade-in-up">لا يوجد مسلسلات لعرضها حالياً.</div>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white">
        <SEO 
            title="مسلسلات" 
            description="تصفح أحدث المسلسلات العربية والتركية والأجنبية بجودة عالية على سينماتيكس (Cinematix)."
            keywords="مسلسلات سينماتيكس, cinematix series, cinematics series, مسلسلات عربية, مسلسلات اجنبية, مسلسلات تركية, مشاهدة مسلسلات"
            type="website"
        />

        < Hero 
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

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 w-full">
                    {pageAdsEnabled && <AdZone position="page_series_top" />}
                    <AdPlacement ads={ads} placement="listing-top" isEnabled={pageAdsEnabled} />
                    <AdPlacement ads={ads} placement="series-page" isEnabled={pageAdsEnabled} />
                    
                    {carousels.map((carousel, index) => {
                        const targetCategory = typeof (carousel as any).title === 'string' ? (carousel as any).title : '';
                        const inlineBanner = promoBanners?.find(b => b.targetPage === 'series' && (b.targetCarousel ? b.targetCarousel === targetCategory : b.positionIndex === index + 1));
                        
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

export default SeriesPage;
