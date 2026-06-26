
import React from 'react';
import type { Content } from '@/types';
import { ContentType } from '@/types';
import { PlayIcon } from './icons/PlayIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CheckIcon } from './CheckIcon';

interface ContentCardProps {
  content: Content;
  onSelectContent: (content: Content) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean; // خاصية جديدة لتحديد صلاحية الإدارة
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  showLatestBadge?: boolean;
  isGridItem?: boolean;
  rank?: number;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isHorizontal?: boolean;
  isSoonCarousel?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
    content, 
    onSelectContent, 
    isLoggedIn, 
    isAdmin = false,
    myList, 
    onToggleMyList, 
    showLatestBadge, 
    isGridItem, 
    rank, 
    isRamadanTheme, 
    isEidTheme, 
    isCosmicTealTheme, 
    isNetflixRedTheme, 
    isHorizontal,
    isSoonCarousel
}) => {
  const isInMyList = !!myList?.includes(content.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    onToggleMyList(content.id);
  };

  const isEpisodic = content.type === ContentType.Series || content.type === ContentType.Program;

  // تحديد الموسم الأخير بناءً على نوع الكاروسيل:
  // - في كاروسيل "قريباً": نعرض الموسم الأخير المضاف (حتى لو كان قريباً).
  // - في باقي الكاروسيلات (مثل أحدث الإضافات): نعرض آخر موسم مفعل (ليس قريباً).
  const latestSeason = isEpisodic && content.seasons && content.seasons.length > 0
    ? isSoonCarousel
        ? [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0]
        : [...content.seasons].filter(season => season.status !== 'coming_soon' && !season.isUpcoming).sort((a, b) => b.seasonNumber - a.seasonNumber)[0] || [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0]
    : null;
  
  // --- منطق احتساب الحلقات المنشورة فقط ---
  const getPublishedEpisodesCount = () => {
    if (!latestSeason) return 0;
    if (isAdmin) return latestSeason.episodes.length;
    
    const now = new Date();
    return latestSeason.episodes.filter(ep => {
        if (!ep.isScheduled || !ep.scheduledAt) return true;
        return now >= new Date(ep.scheduledAt);
    }).length;
  };

  const publishedEpCount = getPublishedEpisodesCount();
  const logoSrc = (isEpisodic && latestSeason?.logoUrl) ? latestSeason.logoUrl : content.logoUrl;

  let displayPoster = content.poster;
  let isBackdropFallback = false;
  
  if (rank && content.top10Poster) {
      displayPoster = content.top10Poster;
  } else if (isHorizontal) {
      if (isEpisodic && latestSeason) {
          if (latestSeason.horizontalPoster) {
              displayPoster = latestSeason.horizontalPoster;
          } else if (latestSeason.backdrop) {
              displayPoster = latestSeason.backdrop;
              isBackdropFallback = true;
          } else if (content.horizontalPoster) {
              displayPoster = content.horizontalPoster;
          } else if (content.backdrop) {
              displayPoster = content.backdrop;
              isBackdropFallback = true;
          } else {
              displayPoster = content.poster;
          }
      } else {
          if (content.horizontalPoster) {
              displayPoster = content.horizontalPoster;
          } else if (content.backdrop) {
              displayPoster = content.backdrop;
              isBackdropFallback = true;
          } else {
              displayPoster = content.poster;
          }
      }
  } else {
      displayPoster = (isEpisodic && latestSeason?.poster) 
        ? latestSeason.poster 
        : content.poster;
  }

  const showOverlayMetadata = (isHorizontal && isBackdropFallback) || (rank && content.top10Poster);
  const displayYear = (isEpisodic && latestSeason?.releaseYear) 
    ? latestSeason.releaseYear 
    : content.releaseYear;

  const showStandardBadges = !rank;
  const topLeftBadge = content.bannerNote;
  const showSeasonBadge = isEpisodic && content.seasons && content.seasons.length > 1 && latestSeason;
  const seasonBadgeText = showSeasonBadge ? `الموسم ${latestSeason.seasonNumber}` : null;
  
  let bottomRightBadge: string | null = null;
  if (showLatestBadge) {
      if (isEpisodic && latestSeason && publishedEpCount > 0) {
          bottomRightBadge = `الحلقة ${publishedEpCount}`;
      } else if (isEpisodic && latestSeason) {
          bottomRightBadge = `الموسم ${latestSeason.seasonNumber}`;
      } else {
          bottomRightBadge = 'جديد';
      }
  }

  const verticalWidthClass = 'w-[calc((100vw-40px)/2.25)] md:w-[calc((100vw-64px)/4.2)] lg:w-[calc((100vw-64px)/6)] flex-shrink-0 mb-0';
  const horizontalWidthClass = 'w-[calc((100vw-40px)/1.2)] md:w-[calc((100vw-64px)/2.2)] lg:w-[calc((100vw-64px)/3.4)] flex-shrink-0 mb-0';

  let widthClass = isGridItem ? 'w-full mb-2' : verticalWidthClass;
  if (isHorizontal && !isGridItem) {
      widthClass = horizontalWidthClass;
  }

  let buttonClass = '';
  if (isInMyList) {
      if (isRamadanTheme) buttonClass = 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-black';
      else if (isEidTheme) buttonClass = 'bg-gradient-to-r from-purple-700 to-purple-400 text-white';
      else if (isCosmicTealTheme) buttonClass = 'bg-gradient-to-r from-[#35F18B] to-[#2596be] text-black';
      else if (isNetflixRedTheme) buttonClass = 'bg-[#E50914] text-white';
      else buttonClass = 'bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black';
  } else {
      buttonClass = 'bg-black/60 text-white border border-white/30 hover:bg-white hover:text-black';
  }

  const cropStyle: React.CSSProperties = (content.enableMobileCrop && !isHorizontal) ? {
      '--mob-x': `${content.mobileCropPositionX ?? content.mobileCropPosition ?? 50}%`,
      '--mob-y': `${content.mobileCropPositionY ?? 50}%`,
  } as React.CSSProperties : {};

  const aspectRatioClass = isHorizontal ? 'aspect-video' : 'aspect-[2/3]';

  const slug = content.slug || content.id;
  let detailUrl = '#';
  if (!isEpisodic) {
      detailUrl = `/watch/movie/${slug}`;
  } else {
      const sNum = latestSeason?.seasonNumber || 1;
      detailUrl = `/${content.type}/${slug}/الموسم${sNum}${isSoonCarousel ? '?targetSeason=upcoming' : ''}`;
  }

  const getTypeText = (type: string) => {
      switch(type) {
          case ContentType.Movie: return 'فيلم';
          case ContentType.Series: return 'مسلسل';
          case ContentType.Program: return 'برنامج';
          case 'concert': return 'حفل';
          case 'play': return 'مسرحية';
          default: return 'عمل';
      }
  };

  return (
    <a 
        href={detailUrl}
        onClick={(e) => { 
          e.preventDefault(); 
          onSelectContent(content); 
        }} 
        aria-label={`مشاهدة ${content.title}`}
        className={`relative ${widthClass} block no-underline text-inherit cursor-pointer group transition-transform duration-300 ease-out transform hover:scale-105 hover:z-50 origin-center`}
    >
      <div className="relative rounded-xl overflow-hidden transition-colors duration-300">
        <div className={`${aspectRatioClass} w-full relative`}>
            <img 
                src={displayPoster} 
                alt={content.title} 
                className={`w-full h-full object-cover transition-transform duration-500 ${content.enableMobileCrop && !isHorizontal ? 'mobile-custom-crop' : ''}`} 
                style={cropStyle}
                loading="lazy"
            />

            {showOverlayMetadata && (
                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 flex flex-col justify-end bg-gradient-to-t from-[var(--bg-body)] via-[var(--bg-body)]/70 to-transparent pt-12 z-20 pointer-events-none ${isHorizontal ? 'items-start text-right' : 'items-center text-center'}`}>
                    <div className={`mb-2 w-full flex ${isHorizontal ? 'justify-start' : 'justify-center'}`}>
                        {logoSrc ? (
                            <img src={logoSrc} alt={content.title} className="h-10 md:h-20 object-contain drop-shadow-md" />
                        ) : (
                            <h3 className="text-white font-black text-xl md:text-3xl leading-tight drop-shadow-md line-clamp-1">{content.title}</h3>
                        )}
                    </div>
                    
                    {!content.top10Poster && (
                        <div className={`flex flex-wrap items-center gap-x-2 gap-y-2 text-[10px] md:text-xs font-medium text-gray-300 w-full ${isHorizontal ? 'justify-start' : 'justify-center'}`}>
                            <span className="bg-white/20 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-white font-bold shadow-sm">{getTypeText(content.type)}</span>
                            {seasonBadgeText && (
                                <>
                                    <span className={isRamadanTheme ? 'text-amber-500 font-bold' : 'text-[#00A7F8] font-bold'}>{seasonBadgeText}</span>
                                    <span className="opacity-50 text-[8px]">•</span>
                                </>
                            )}
                            <span className="text-white font-bold">{displayYear}</span>
                        </div>
                    )}
                </div>
            )}

            {rank && rank <= 10 && (
                <div className="absolute top-0 left-0 z-40 w-[20%] md:w-[22%] pointer-events-none">
                    <div className="relative w-full h-full">
                        <img src="https://shahid.mbc.net/staticFiles/production/static/images/top10.svg" alt="Top 10" className="w-full h-auto" draggable={false} />
                        <div className="absolute inset-x-0 top-0 h-[74%] flex items-center justify-center translate-y-[22%] pt-[2%]">
                            <span className="rank-font text-white select-none" style={{ fontSize: 'clamp(22px, 4.6vw, 44px)', lineHeight: '1', letterSpacing: '-1px', textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{rank}</span>
                        </div>
                    </div>
                </div>
            )}

            {showStandardBadges && (
                <>
                    <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-stretch pointer-events-none max-w-[80%]">
                        {seasonBadgeText && !showOverlayMetadata && <div className={`backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-[10px] md:text-xs font-bold px-2 py-1 rounded-md border border-white/10 text-center whitespace-nowrap ${isRamadanTheme ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white' : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white'}`}>{seasonBadgeText}</div>}
                        {topLeftBadge && <div className="backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-[10px] md:text-xs font-bold px-2 py-1 rounded-md border bg-[#6366f1] text-white border-[#6366f1]/50 text-center whitespace-nowrap">{topLeftBadge}</div>}
                    </div>
                    {!showOverlayMetadata && <div className="absolute top-2 right-2 bg-[#fbbf24]/90 backdrop-blur-sm text-black text-[10px] md:text-xs font-extrabold px-2 py-1 rounded shadow-md z-20">{displayYear}</div>}
                    {bottomRightBadge && !showOverlayMetadata && <div className={`absolute bottom-2 right-2 backdrop-blur-sm text-[10px] md:text-xs font-bold px-2 py-1 rounded shadow-md z-20 ${isNetflixRedTheme ? 'bg-[#E50914]/90 text-white' : 'bg-[#8b5cf6]/90 text-white'}`}>{bottomRightBadge}</div>}
                </>
            )}

            {isLoggedIn && (
                <button 
                  onClick={handleToggle} 
                  className={`absolute bottom-2 left-2 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-200 z-30 ${buttonClass} opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`} 
                  title={isInMyList ? "إزالة من القائمة" : "إضافة للقائمة"}
                >
                    {isInMyList ? <CheckIcon className="w-4 h-4 md:w-5 md:h-5" /> : <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
            )}
        </div>
      </div>
    </a>
  );
};

export default ContentCard;
