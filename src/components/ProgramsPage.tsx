import React, { useState, useEffect, useMemo } from 'react';
import type { Content, Ad, View, Profile } from '@/types';
import { ContentType } from '@/types';
import ContentCarousel from './ContentCarousel';
import AdPlacement from './AdPlacement';
import SEO from './SeoMeta';
import AdZone from './AdZone';

interface ProgramsPageProps {
  allContent: Content[];
  onSelectContent: (content: Content, seasonNumber?: number) => void;
  isLoggedIn: boolean;
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
  activeProfile?: Profile | null;
}

const ProgramsPage: React.FC<ProgramsPageProps> = ({ 
  allContent, 
  onSelectContent, 
  isLoggedIn, 
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
  activeProfile
}) => {

  // تصفية المحتوى ليشمل البرامج والمسرحيات والحفلات فقط
  const relevantContent = useMemo(() => 
    allContent.filter(c => 
      c.type === ContentType.Program || 
      c.type === ContentType.Play || 
      c.type === ContentType.Concert ||
      c.categories.includes('برامج تلفزيونية') ||
      c.categories.includes('برامج رمضان') ||
      c.categories.includes('مسرحيات') ||
      c.categories.includes('حفلات')
    )
  , [allContent]);

  // تحضير الأقسام المطلوبة حصرياً: برامج تلفزيونية، برامج رمضان، مسرحيات، حفلات
  const carousels = useMemo(() => {
    const limit = (list: Content[]) => list.slice(0, 12);

    const tvPrograms = limit(relevantContent.filter(c => 
        c.type === ContentType.Program || 
        c.categories.includes('برامج تلفزيونية')
    ));

    const ramadanPrograms = limit(relevantContent.filter(c => 
        c.categories.includes('برامج رمضان')
    ));

    const plays = limit(relevantContent.filter(c => 
        c.type === ContentType.Play || 
        c.categories.includes('مسرحيات')
    ));

    const concerts = limit(relevantContent.filter(c => 
        c.type === ContentType.Concert || 
        c.categories.includes('حفلات')
    ));

    const definedCarousels = [
      { id: 'p_tv', title: 'برامج تلفزيونية', contents: tvPrograms, categoryKey: 'برامج تلفزيونية' },
      { id: 'p_ramadan', title: 'برامج رمضان', contents: ramadanPrograms, categoryKey: 'برامج رمضان' },
      { id: 'p_plays', title: 'مسرحيات', contents: plays, categoryKey: 'مسرحيات' },
      { id: 'p_concerts', title: 'حفلات', contents: concerts, categoryKey: 'حفلات' },
    ].filter(carousel => carousel.contents.length > 0);

    return definedCarousels;
  }, [relevantContent]);

  const handleSeeAll = (carousel: any) => {
      if (carousel.categoryKey) onNavigate('category', carousel.categoryKey);
  };

  if (isLoading && relevantContent.length === 0) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-body)] pt-24">
          {/* LOADING SEPARATOR LINE */}
          <div className="w-full h-px mb-8 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="p-8 space-y-8 z-30 relative">
              <ContentCarousel title="Loading..." contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isLoading={true} />
              <ContentCarousel title="Loading..." contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isLoading={true} />
          </div>
      </div>
    );
  }

  if (relevantContent.length === 0 && !isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 animate-fade-in-up">لا يوجد برامج أو عروض حالياً.</div>
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-body)]">
        <SEO 
            title="البرامج والعروض" 
            description="شاهد أحدث البرامج التلفزيونية والمسرحيات والحفلات الغنائية بجودة عالية على سينماتيكس (Cinematix)."
            keywords="برامج سينماتيكس, عروض سينماتيكس, cinematix programs, cinematics shows, برامج تلفزيونية, مسرحيات, حفلات"
            type="website"
        />

        <main className="pb-24 pt-20 md:pt-24 z-30 relative bg-[var(--bg-body)]">
            <div className={`w-full h-px mt-0 mb-6 md:my-8 
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

            <div className="pt-2">
                {adsEnabled && <AdZone position="listing-top" />}
                
                {carousels.map((carousel, index) => {
                    const showAd = index === 2;
                    return (
                        <React.Fragment key={carousel.id}>
                            <ContentCarousel
                                title={carousel.title}
                                contents={carousel.contents}
                                onSelectContent={onSelectContent}
                                isLoggedIn={isLoggedIn}
                                myList={myList}
                                onToggleMyList={onToggleMyList}
                                isNew={false}
                                onSeeAll={() => handleSeeAll(carousel)}
                                isRamadanTheme={isRamadanTheme}
                                isEidTheme={isEidTheme}
                                isCosmicTealTheme={isCosmicTealTheme}
                                isNetflixRedTheme={isNetflixRedTheme}
                                isLoading={isLoading}
                            />
                            {showAd && <AdPlacement ads={ads} placement="home-carousel-3-4" isEnabled={adsEnabled}/>}
                        </React.Fragment>
                    );
                })}

                <AdPlacement ads={ads} placement="home-bottom" isEnabled={adsEnabled}/>
            </div>
        </main>
    </div>
  );
};

export default ProgramsPage;