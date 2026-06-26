
import React, { useMemo, useState, useEffect } from 'react';
import type { Content, Category, Ad, SiteSettings, View, Profile, Story, PromotionalBanner } from '@/types';
import { ContentType, UserRole } from '@/types'; 
import Hero from './Hero';
import ContentCarousel from './ContentCarousel';
import AdPlacement from './AdPlacement';
import ShoutBarComponent from './ShoutBar';
import SEO from './SeoMeta';
import AdZone from './AdZone';
import StoriesBar from './StoriesBar';
import InlinePromoBanner from './InlinePromoBanner';

interface HomePageProps {
  allContent: Content[];
  pinnedContent: Content[];
  top10Content?: Content[]; 
  stories?: Story[]; 
  promoBanners?: PromotionalBanner[];
  onSelectContent: (content: Content, seasonNumber?: number) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean; // تم الإضافة
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  ads: Ad[];
  siteSettings: SiteSettings;
  onNavigate: (view: View, category?: string) => void;
  isLoading?: boolean;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  activeProfile?: Profile | null;
}

const HomePage: React.FC<HomePageProps> = (props) => {
  const isKidMode = props.activeProfile?.isKid || false;

  const isRamadan = props.isRamadanTheme ?? props.siteSettings.isRamadanModeEnabled;
  const isEid = props.isEidTheme ?? props.siteSettings.activeTheme === 'eid';
  const isCosmicTeal = props.isCosmicTealTheme ?? props.siteSettings.activeTheme === 'cosmic-teal';
  const isNetflixRed = props.isNetflixRedTheme ?? props.siteSettings.activeTheme === 'netflix-red';
  const isShahid = props.siteSettings.activeTheme === 'shahid';

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const safeContent = useMemo(() => {
      if (!isKidMode) return props.allContent;
      return props.allContent.filter(c => 
          c.visibility === 'kids' || 
          (c.categories as string[]).includes('أفلام أنيميشن') || 
          (c.categories as string[]).includes('افلام أنميشن') || 
          (c.categories as string[]).includes('افلام انميشن') || 
          (c.categories as string[]).includes('مسلسلات أنيميشن') || 
          (c.categories as string[]).includes('مسلسلات أنميشن') || 
          (c.categories as string[]).includes('مسلسلات انميشن') || 
          c.genres.includes('أطفال') || 
          c.genres.includes('عائلي')
      );
  }, [props.allContent, isKidMode]);

  const activeStories = useMemo(() => {
    if (!props.stories) return [];
    return props.stories.filter(s => s.isActive === true);
  }, [props.stories]);

  const safePinnedContent = useMemo(() => {
      if (!isKidMode) return props.pinnedContent;
      return props.pinnedContent.filter(c => 
          c.visibility === 'kids' || 
          (c.categories as string[]).includes('أفلام أنيميشن') || 
          (c.categories as string[]).includes('افلام أنميشن') || 
          (c.categories as string[]).includes('افلام انميشن') || 
          (c.categories as string[]).includes('مسلسلات أنيميشن') || 
          (c.categories as string[]).includes('مسلسلات أنميشن') || 
          (c.categories as string[]).includes('مسلسلات انميشن') || 
          c.genres.includes('أطفال') || 
          c.genres.includes('عائلي')
      );
  }, [props.pinnedContent, isKidMode]);

  const heroContent = useMemo(() => {
    if (safePinnedContent && safePinnedContent.length > 0) return safePinnedContent;
    return [...safeContent]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [safePinnedContent, safeContent]);

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

    const getLatest = (list: Content[]) => {
        return list
            .sort((a, b) => getEffectiveUpdateDate(b) - getEffectiveUpdateDate(a))
            .slice(0, 12);
    };

    if (isKidMode) {
        const recentKids = getLatest([...safeContent]);
        const animationMovies = getLatest(safeContent.filter(c => (c.categories as string[]).includes('أفلام أنيميشن') || (c.categories as string[]).includes('افلام أنميشن')));
        const familyContent = getLatest(safeContent.filter(c => c.genres.includes('عائلي')));
        const kidsSeries = getLatest(safeContent.filter(c => c.type === ContentType.Series));

        const animationTitle = (
            <div className="flex items-center gap-3">
                <div className={`w-1.5 h-6 md:h-8 rounded-full shadow-[0_0_10px_rgba(0,167,248,0.6)] ${isRamadan ? 'bg-[#FFD700]' : 'bg-gradient-to-b from-[#00A7F8] to-[#00FFB0]'}`}></div>
                <div className="flex items-center gap-2"><span>أفلام أنيميشن</span><img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f423/512.webp" alt="chick" className="w-5 h-5" /></div>
            </div>
        );

        const top10Source = (props.top10Content && props.top10Content.length > 0) ? props.top10Content : safePinnedContent;
        const pinnedCarousel = { id: 'h_pinned_top_kids', title: 'أفضل 10 للأطفال', contents: top10Source, showRanking: true };
        let kidsList = [];
        if (pinnedCarousel.contents.length > 0 && props.siteSettings.showTop10Home) kidsList.push(pinnedCarousel);
        kidsList.push(
            { id: 'k_new', title: 'أحدث الإضافات', contents: recentKids, isNew: true, categoryKey: 'new-kids' },
            { id: 'k_anim', title: animationTitle, contents: animationMovies, specialRoute: 'kids' },
            { id: 'k_series', title: 'مسلسلات كرتون', contents: kidsSeries },
            { id: 'k_family', title: 'أفلام عائلية', contents: familyContent }
        );
        return kidsList.filter(carousel => carousel.contents.length > 0);
    }

    const recentAdditions = getLatest([...props.allContent]);
    const arabicSeries = getLatest(props.allContent.filter(c => c.type === ContentType.Series && c.categories.includes('مسلسلات عربية')));
    const turkishSeries = getLatest(props.allContent.filter(c => c.type === ContentType.Series && c.categories.includes('مسلسلات تركية')));
    const foreignSeries = getLatest(props.allContent.filter(c => c.type === ContentType.Series && c.categories.includes('مسلسلات اجنبية')));
    const arabicMovies = getLatest(props.allContent.filter(c => c.type === ContentType.Movie && c.categories.includes('افلام عربية')));
    const turkishMovies = getLatest(props.allContent.filter(c => c.type === ContentType.Movie && c.categories.includes('افلام تركية')));
    const foreignMovies = getLatest(props.allContent.filter(c => c.type === ContentType.Movie && c.categories.includes('افلام اجنبية')));
    const indianMovies = getLatest(props.allContent.filter(c => c.type === ContentType.Movie && c.categories.includes('افلام هندية')));
    const animationMovies = getLatest(props.allContent.filter(c => c.type === ContentType.Movie && ((c.categories as string[]).includes('أفلام أنيميشن') || (c.categories as string[]).includes('افلام أنميشن'))));
    const tvPrograms = getLatest(props.allContent.filter(c => c.type === ContentType.Program || c.categories.includes('برامج تلفزيونية')));
    const plays = getLatest(props.allContent.filter(c => c.type === ContentType.Play || c.categories.includes('مسرحيات')));
    const concerts = getLatest(props.allContent.filter(c => c.type === ContentType.Concert || c.categories.includes('حفلات')));
    const ramadanContent = getLatest(props.allContent.filter(c => c.categories.includes('رمضان')));
    const comedyContent = getLatest(props.allContent.filter(c => c.genres.includes('كوميديا')));

    const ramadanTitle = (
        <div className="flex items-center gap-3">
             <div className={`w-1.5 h-6 md:h-8 rounded-full shadow-[0_0_10px_rgba(0,167,248,0.6)] ${isRamadan ? 'bg-[#FFD700]' : 'bg-gradient-to-b from-[#00A7F8] to-[#00FFB0]'}`}></div>
             <div className="flex items-center gap-2"><span>رمضان معانا</span><img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f31c/512.webp" alt="moon" className="w-6 h-6 md:w-8 md:h-8" /></div>
        </div>
    );

    const restCarousels = [
      { id: 'h3', title: 'مسلسلات عربية', contents: arabicSeries, categoryKey: 'مسلسلات عربية' },
      { id: 'h4', title: 'مسلسلات تركية', contents: turkishSeries, categoryKey: 'مسلسلات تركية' },
      { id: 'h5', title: 'مسلسلات أجنبية', contents: foreignSeries, categoryKey: 'مسلسلات اجنبية' },
      { id: 'h6', title: 'افلام عربية', contents: arabicMovies, categoryKey: 'افلام عربية' },
      { id: 'h7', title: 'افلام تركية', contents: turkishMovies, categoryKey: 'افلام تركية' },
      { id: 'h8', title: 'أفلام أجنبية', contents: foreignMovies, categoryKey: 'افلام اجنبية' },
      { id: 'h9', title: 'افلام هندية', contents: indianMovies, categoryKey: 'افلام هندية' },
      { id: 'h11', title: 'البرامج التلفزيونية', contents: tvPrograms, specialRoute: 'programs' },
      { id: 'h12', title: 'حفلات', contents: concerts, categoryKey: 'حفلات' },
      { id: 'h13', title: 'مسرحيات', contents: plays, categoryKey: 'مسرحيات' },
      { id: 'h_comedy_hybrid', title: 'كوميديا على طول الخط', contents: comedyContent, displayType: isMobile ? 'vertical_poster' : 'hybrid', categoryKey: 'كوميديا' },
    ];

    const top10Source = (props.top10Content && props.top10Content.length > 0) ? props.top10Content : props.pinnedContent;
    const pinnedCarousel = { id: 'h_pinned_top', title: 'أفضل 10 أعمال', contents: top10Source, showRanking: true };
    const ramadanCarousel = { id: 'h_ramadan', title: ramadanTitle, contents: ramadanContent, specialRoute: 'ramadan' };

    let finalList = [];
    if (pinnedCarousel.contents.length > 0 && props.siteSettings.showTop10Home) finalList.push(pinnedCarousel);
    if (props.siteSettings.isShowRamadanCarousel) finalList.push(ramadanCarousel);
    finalList.push({ id: 'h2', title: 'أحدث الإضافات', contents: recentAdditions, isNew: true, categoryKey: 'new-content' });
    finalList.push(...restCarousels);
    return finalList.filter(carousel => carousel.contents.length > 0);
  }, [props.allContent, props.pinnedContent, props.top10Content, props.siteSettings.isShowRamadanCarousel, props.siteSettings.showTop10Home, isRamadan, isKidMode, safeContent, safePinnedContent, isMobile]);

  const handleSeeAll = (carousel: any) => {
      if (carousel.specialRoute) props.onNavigate(carousel.specialRoute as View);
      else if (carousel.categoryKey) props.onNavigate('category', carousel.categoryKey);
      else props.onNavigate('movies'); 
  };

  const renderContent = () => {
    if (props.isLoading && props.allContent.length === 0) {
        return (
            <>
                <Hero contents={[] as Content[]} onWatchNow={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} isLoading={true} isRamadanTheme={isRamadan} isEidTheme={isEid} isCosmicTealTheme={isCosmicTeal} isNetflixRedTheme={isNetflixRed} isShahidTheme={isShahid} />
                <main className="pb-24 pt-0 z-30 relative bg-[var(--bg-body)]">
                    <div className={`w-full h-px mb-6 animate-pulse ${isRamadan ? 'bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent' : isEid ? 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent' : isCosmicTeal ? 'bg-gradient-to-r from-transparent via-[#35F18B]/50 to-transparent' : isNetflixRed ? 'bg-gradient-to-r from-transparent via-[#E50914]/50 to-transparent' : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'}`}></div>
                    
                    <div className="space-y-8">
                        <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
                        <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} />
                        <ContentCarousel isLoading={true} title="جاري التحميل" contents={[]} onSelectContent={()=>{}} isLoggedIn={false} onToggleMyList={()=>{}} displayType="hybrid" />
                    </div>
                </main>
            </>
        );
    }

    if (props.allContent.length === 0) {
        return <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 animate-fade-in"><p className="text-xl font-bold">لا يوجد محتوى متاح حالياً</p></div>;
    }

    return (
        <>
            <Hero contents={heroContent} onWatchNow={props.onSelectContent} isLoggedIn={props.isLoggedIn} isAdmin={props.isAdmin} myList={props.myList} onToggleMyList={props.onToggleMyList} autoSlideInterval={5000} isRamadanTheme={isRamadan} isEidTheme={isEid} isCosmicTealTheme={isCosmicTeal} isNetflixRedTheme={isNetflixRed} isShahidTheme={isShahid} />
            <main className="pb-24 z-30 relative bg-[var(--bg-body)] overflow-visible">
              <div className={`w-full h-px mt-0 mb-2 md:my-4 ${isRamadan ? 'bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-80' : isEid ? 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-80' : isCosmicTeal ? 'bg-gradient-to-r from-transparent via-[#35F18B]/50 to-transparent opacity-80' : isNetflixRed ? 'bg-gradient-to-r from-transparent via-[#E50914]/50 to-transparent opacity-80' : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'}`}></div>
              
              <div className="pt-2">
                {props.siteSettings.shoutBar.isVisible && (
                    <div className="px-4 md:px-12 lg:px-16">
                        < ShoutBarComponent text={props.siteSettings.shoutBar.text} isRamadanTheme={isRamadan} isEidTheme={isEid} isCosmicTealTheme={isCosmicTeal} isNetflixRedTheme={isNetflixRed} />
                    </div>
                )}
                {!isKidMode && activeStories.length > 0 && (
                    <div className="mb-6 block md:hidden">
                        <StoriesBar stories={activeStories} />
                    </div>
                )}
                {props.siteSettings.adsEnabled && <AdZone position="home-top" />}
                <AdPlacement ads={props.ads} placement="home-below-hero" isEnabled={props.siteSettings.adsEnabled}/>
                {carousels.map((carousel, index) => {
                    const showAd = index === 2;
                    // Check if there is a promo banner meant to be displayed after this row
                    const targetCategory = typeof (carousel as any).title === 'string' ? (carousel as any).title : '';
                    const inlineBanner = props.promoBanners?.find(b => b.isActive !== false && b.targetPage === 'home' && (b.targetCarousel ? b.targetCarousel === targetCategory : b.positionIndex === index + 1));

                    return (
                        <React.Fragment key={(carousel as any).id}>
                            <ContentCarousel title={(carousel as any).title} contents={(carousel as any).contents} onSelectContent={props.onSelectContent} isLoggedIn={false} isAdmin={props.isAdmin} onToggleMyList={props.onToggleMyList} isNew={(carousel as any).isNew} onSeeAll={() => handleSeeAll(carousel)} isRamadanTheme={isRamadan} isEidTheme={isEid} isCosmicTealTheme={isCosmicTeal} isNetflixRedTheme={isNetflixRed} showRanking={(carousel as any).showRanking} displayType={(carousel as any).displayType} />
                            
                            {inlineBanner && (
                                <InlinePromoBanner {...inlineBanner} allContent={props.allContent} onSelectContent={props.onSelectContent} />
                            )}

                            {showAd && <AdPlacement ads={props.ads} placement="home-carousel-3-4" isEnabled={props.siteSettings.adsEnabled}/>}
                        </React.Fragment>
                    );
                })}
                <AdPlacement ads={props.ads} placement="home-bottom" isEnabled={props.siteSettings.adsEnabled}/>
              </div>
            </main>
        </>
    );
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-body)]">
        <SEO 
            title="الرئيسية" 
            description="سينماتيكس (Cinematix) - مشاهدة أحدث الأفلام والمسلسلات العربية والأجنبية والتركية اون لاين بجودة عالية." 
            keywords="سينماتيكس, cinematix, cinematics, افلام سينماتيكس, مسلسلات سينماتيكس, مشاهدة افلام, الرئيسية سينماتيكس"
            type="website" 
        />
        {renderContent()}
    </div>
  );
};

export default HomePage;
