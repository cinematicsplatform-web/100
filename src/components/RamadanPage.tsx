
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Content, SiteSettings, Ad, View } from '@/types';
import Hero from './Hero';
import ContentCarousel from './ContentCarousel';
import AdPlacement from './AdPlacement';
import SEO from './SeoMeta';
import AdZone from './AdZone';

interface RamadanPageProps {
  allContent: Content[];
  pinnedContent: Content[];
  top10Content?: Content[];
  onSelectContent: (content: Content, seasonNumber?: number) => void;
  siteSettings: SiteSettings;
  isLoggedIn: boolean;
  isAdmin?: boolean; // تم الإضافة
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  ads: Ad[];
  adsEnabled: boolean;
  onNavigate: (view: View, category?: string) => void;
  isLoading?: boolean;
}

const GoldenTitle = ({text, showNewBadge, iconSrc}: {text: string, showNewBadge?: boolean, iconSrc?: string}) => (
    <div className="flex items-center gap-3 ramadan-section-title">
        <div className="h-8 w-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]"></div>
        <span className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-md flex items-center gap-3">
            {text}
            {iconSrc && (
               <img src={iconSrc} alt="icon" className="w-8 h-8 object-contain" />
            )}
        </span>
    </div>
);

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: Record<string, number> = {};

        if (difference > 0) {
            timeLeft = {
                أيام: Math.floor(difference / (1000 * 60 * 60 * 24)),
                ساعات: Math.floor((difference / (1000 * 60 * 60)) % 24),
                دقائق: Math.floor((difference / 1000 / 60) % 60),
                ثواني: Math.floor((difference / 1000) % 60)
            };
        } else {
             timeLeft = { أيام: 0, ساعات: 0, دقائق: 0, ثواني: 0 };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        if (Object.values(timeLeft).every(v => v === 0)) return () => clearTimeout(timer);
        return () => clearTimeout(timer);
    }, [timeLeft, targetDate]);

    const timeComponents = Object.entries(timeLeft).reverse();

    return (
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-center">
            {timeComponents.map(([unit, value]) => (
                <div 
                    key={unit} 
                    className={`relative group ${unit === 'ثواني' ? 'hidden md:block' : ''}`}
                >
                    <div className="w-20 h-24 md:w-28 md:h-32 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl rounded-2xl border border-amber-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <span className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 font-mono mb-1">
                            {String(value).padStart(2, '0')}
                        </span>
                        <span className="text--[10px] md:text-xs uppercase tracking-widest text-amber-100/60 font-semibold">{unit}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                </div>
            ))}
        </div>
    );
};


const RamadanPage: React.FC<RamadanPageProps> = ({ 
    allContent, 
    pinnedContent, 
    top10Content,
    onSelectContent, 
    siteSettings, 
    isLoggedIn, 
    isAdmin = false,
    myList, 
    onToggleMyList, 
    ads, 
    adsEnabled, 
    onNavigate, 
    isLoading 
}) => {
  
  const allRamadanContent = useMemo(() => 
    allContent.filter(c => c.categories.includes('رمضان'))
  , [allContent]);
  
  const processHeroContent = useCallback((contentList: Content[]) => {
      return contentList.map(c => {
          if (c.type === 'series' && c.seasons && c.seasons.length > 0) {
              const latestSeason = [...c.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0];
              if (latestSeason) {
                  return {
                      ...c,
                      poster: latestSeason.poster || c.poster,
                      backdrop: latestSeason.backdrop || c.backdrop,
                      logoUrl: latestSeason.logoUrl || c.logoUrl,
                      isLogoEnabled: !!(latestSeason.logoUrl || c.logoUrl),
                      description: latestSeason.description || c.description
                  };
              }
          }
          return c;
      });
  }, []);

  const heroContents = useMemo(() => {
    if (pinnedContent && pinnedContent.length > 0) {
        return pinnedContent;
    }
    if (allRamadanContent.length === 0) return [];
    
    const sorted = [...allRamadanContent].sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
    
    return processHeroContent(sorted.slice(0, 5));
  }, [pinnedContent, allRamadanContent, processHeroContent]);

  const isCountdownActive = siteSettings.isCountdownVisible && (+new Date(siteSettings.countdownDate) - +new Date()) > 0;
  
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
    const recentAdditions = limit([...allRamadanContent]
      .sort((a, b) => getEffectiveUpdateDate(b) - getEffectiveUpdateDate(a)));

    let topRatedContent = (top10Content && top10Content.length > 0) ? top10Content : pinnedContent;
    
    if (topRatedContent.length === 0) {
        topRatedContent = [...allRamadanContent]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10);
    } else {
        topRatedContent = topRatedContent.slice(0, 10);
    }

    const ramadanSeries = limit(allRamadanContent.filter(c => c.type === 'series'));
    const ramadanPrograms = limit(allRamadanContent.filter(c => c.type === 'program' || c.categories?.includes('برامج رمضان') || c.categories?.includes('برامج تلفزيونية')));
    
    const definedCarousels = [
        {
            id: 'r_new',
            title: <GoldenTitle text="أحدث الإضافات" />,
            contents: recentAdditions,
            isNew: true,
            categoryKey: 'new-ramadan'
        },
        {
            id: 'r_top_10',
            title: <GoldenTitle text="أفضل 10 أعمال" iconSrc="https://fonts.gstatic.com/s/e/notoemoji/latest/1f31c/512.webp" />,
            contents: topRatedContent,
            showRanking: true,
            categoryKey: 'top-rated-ramadan'
        },
        {
            id: 'r_series',
            title: <GoldenTitle text="مسلسلات رمضان" />,
            contents: ramadanSeries,
            categoryKey: 'مسلسلات رمضان'
        },
        {
            id: 'r_programs',
            title: <GoldenTitle text="برامج رمضان" />,
            contents: ramadanPrograms,
            categoryKey: 'برامج رمضان'
        }
    ].filter(c => c.contents.length > 0);

    return definedCarousels;
  }, [allRamadanContent, pinnedContent, top10Content]);

  const handleSeeAll = (categoryKey: string) => {
      onNavigate('category', categoryKey);
  };

  if (isLoading && allRamadanContent.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Hero contents={[] as Content[]} onWatchNow={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isLoading={true} isRamadanTheme={true} />
        <main className="pb-24 pt-0 z-30 relative bg-black">
            <div className="w-full h-px mb-8 animate-pulse bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            
            <div className="space-y-4">
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isRamadanTheme={true} />
                <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isRamadanTheme={true} />
            </div>
        </main>
      </div>
    );
  }

  if (heroContents.length === 0 && carousels.length === 0) {
      return <div className="min-h-screen flex items-center justify-center text-xl text-amber-500 animate-fade-in-up">لا يوجد محتوى رمضاني حالياً.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
        <SEO 
            title="مسلسلات رمضان" 
            description="تغطية حصرية لمسلسلات وبرامج رمضان 2026. تابع أحدث الحلقات والبرامج الدينية والترفيهية على سينماتيكس (Cinematix)."
            keywords="رمضان سينماتيكس, مسلسلات رمضان سينماتيكس, cinematix ramadan, cinematics ramadan, مسلسلات رمضان 2026, برامج رمضان"
            type="website"
        />

        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-repeat opacity-20"></div>
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]"></div>
        </div>

        <Hero 
            contents={heroContents} 
            onWatchNow={onSelectContent} 
            isLoggedIn={isLoggedIn} 
            isAdmin={isAdmin}
            myList={myList} 
            onToggleMyList={onToggleMyList} 
            autoSlideInterval={5000}
            isRamadanTheme={true} 
        />

        <main className="pb-24 z-30 relative bg-black">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-60 mt-0 mb-2 md:my-4"></div>
            {adsEnabled && <AdZone position="page_ramadan_top" />}
            <AdPlacement ads={ads} placement="ramadan-top" isEnabled={adsEnabled} />
            
            {carousels.map((carousel) => (
                <React.Fragment key={carousel.id}>
                    {carousel.id === 'r_new' && isCountdownActive && (
                        <div className="container mx-auto px-4 mb-12 mt-4 relative animate-fade-in-up">
                            <div className="text-center">
                                <p className="text-amber-200/80 text-lg mb-4 tracking-widest uppercase font-bold">يبدأ الماراثون الرمضاني خلال</p>
                                <CountdownTimer targetDate={siteSettings.countdownDate} />
                            </div>
                        </div>
                    )}
                    <ContentCarousel
                        title={carousel.title}
                        contents={carousel.contents}
                        onSelectContent={onSelectContent}
                        isLoggedIn={isLoggedIn}
                        isAdmin={isAdmin}
                        myList={myList}
                        onToggleMyList={onToggleMyList}
                        isNew={carousel.isNew}
                        isRestricted={false} 
                        showRanking={carousel.showRanking}
                        onSeeAll={() => carousel.categoryKey && handleSeeAll(carousel.categoryKey)}
                        isRamadanTheme={true}
                    />
                </React.Fragment>
            ))}
            
            <AdPlacement ads={ads} placement="ramadan-bottom" isEnabled={adsEnabled} />
        </main>
    </div>
  );
};

export default RamadanPage;
