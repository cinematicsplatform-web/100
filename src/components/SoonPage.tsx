
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { Content, Ad, View } from '@/types';
import Hero from './Hero';
import ContentCarousel from './ContentCarousel';
import AdPlacement from './AdPlacement';
import SEO from './SeoMeta';
import { BouncingDotsLoader } from './BouncingDotsLoader';

interface SoonPageProps {
  allContent: Content[];
  pinnedContent: Content[];
  onSelectContent: (content: Content, seasonNumber?: number, episodeNumber?: number, isSoon?: boolean) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean; // تم الإضافة
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  ads: Ad[];
  adsEnabled: boolean;
  isLoading?: boolean;
  isRamadanTheme?: boolean; 
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isShahidTheme?: boolean;
  onNavigate?: (view: View, category?: string) => void;
}

const SoonPage: React.FC<SoonPageProps> = ({ 
  allContent, 
  pinnedContent, 
  onSelectContent, 
  isLoggedIn, 
  isAdmin = false,
  myList, 
  onToggleMyList, 
  ads, 
  adsEnabled, 
  isLoading, 
  isRamadanTheme, 
  isEidTheme, 
  isCosmicTealTheme, 
  isNetflixRedTheme,
  isShahidTheme
}) => {
  
  const { allSoonContent, soonAndRamadan, soonOnly } = useMemo(() => {
    const allSoon = allContent.filter(c => c.categories.includes('قريباً') || (c.seasons && c.seasons.some(s => s.isUpcoming || s.status === 'coming_soon')));
    const soonAndRamadan = allSoon.filter(c => c.categories.includes('رمضان'));
    const soonOnly = allSoon.filter(c => !c.categories.includes('رمضان'));
    
    return { allSoonContent: allSoon, soonAndRamadan, soonOnly };
  }, [allContent]);
  
  const heroSoonContents = useMemo(() => {
    if (pinnedContent && pinnedContent.length > 0) {
        return pinnedContent;
    }
    const sortedContent = [...allSoonContent].sort((a, b) => new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sortedContent.slice(0, 5);
  }, [pinnedContent, allSoonContent]);


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

    const sortedSoonRamadan = [...soonAndRamadan].sort((a, b) => getEffectiveUpdateDate(b) - getEffectiveUpdateDate(a));
    const sortedSoonOnly = [...soonOnly].sort((a, b) => getEffectiveUpdateDate(b) - getEffectiveUpdateDate(a));
    
    const definedCarousels = [
      { id: 's1', title: 'قريباً في رمضان', contents: sortedSoonRamadan, isRestricted: false, isSoonCarousel: true },
      { id: 's2', title: 'قريباً', contents: sortedSoonOnly, isRestricted: false, isSoonCarousel: true }, 
    ].filter(carousel => carousel.contents.length > 0);

    return definedCarousels;
  }, [soonAndRamadan, soonOnly]);

  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!isLoading && allSoonContent.length === 0) {
        timer = setTimeout(() => {
            setShowEmptyMessage(true);
        }, 750);
    } else {
        setShowEmptyMessage(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading, allSoonContent.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)]">
        <BouncingDotsLoader size="lg" delayMs={300} colorClass={isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[var(--color-accent)]'} />
      </div>
    );
  }
  
  if (allSoonContent.length === 0) {
    if (!showEmptyMessage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)]">
                <BouncingDotsLoader size="lg" delayMs={300} colorClass={isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[var(--color-accent)]'} />
            </div>
        );
    }
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 animate-fade-in-up">لا يوجد محتوى قادم لعرضها حالياً.</div>
  }


  return (
    <div className="min-h-screen bg-[var(--bg-body)]">
      <SEO 
        title="قريباً - سينماتيكس" 
        description="تعرف على أحدث الإصدارات القادمة من الأفلام والمسلسلات على سينماتيكس (Cinematix)."
        keywords="قريبا سينماتيكس, cinematix coming soon, cinematics soon, افلام قادمة, مسلسلات قادمة, جديد سينماتيكس"
        type="website"
      />

      <Hero 
          contents={heroSoonContents} 
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
          isSoonCarousel={true}
      />
      
      <main className="pb-24 text-right bg-[var(--bg-body)]">
        <div className={`w-full h-px mt-0 mb-2 md:my-4 
            ${isRamadanTheme 
                ? 'bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-80' 
                : isCosmicTealTheme
                    ? 'bg-gradient-to-r from-transparent via-[#35F18B]/50 to-transparent opacity-80'
                    : isNetflixRedTheme
                        ? 'bg-gradient-to-r from-transparent via-[#E50914]/50 to-transparent opacity-80'
                        : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
            }`}></div>

        <AdPlacement ads={ads} placement="soon-page-top" isEnabled={adsEnabled} />
        
        {carousels.map((carousel) => {
            return (
                <ContentCarousel
                key={carousel.id}
                title={carousel.title}
                contents={carousel.contents}
                onSelectContent={onSelectContent}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                myList={myList}
                onToggleMyList={onToggleMyList}
                isRamadanTheme={isRamadanTheme}
                isEidTheme={isEidTheme}
                isCosmicTealTheme={isCosmicTealTheme}
                isNetflixRedTheme={isNetflixRedTheme}
                isSoonCarousel={carousel.isSoonCarousel}
                />
            );
        })}
        
        <AdPlacement ads={ads} placement="soon-page-bottom" isEnabled={adsEnabled} />
      </main>
    </div>
  );
};

export default SoonPage;
