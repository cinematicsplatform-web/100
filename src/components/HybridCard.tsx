
import React, { useState, useRef, useEffect } from 'react';
import type { Content } from '@/types';
import { PlayIcon } from './icons/PlayIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CheckIcon } from './CheckIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface HybridCardProps {
    content: Content;
    index: number;
    totalItems: number;
    expandedIndex: number | null;
    onSetExpandedIndex: (index: number | null) => void;
    onSelectContent: (content: Content) => void;
    isLoggedIn: boolean;
    myList?: string[];
    onToggleMyList: (contentId: string) => void;
    isRamadanTheme?: boolean;
    isEidTheme?: boolean;
    isCosmicTealTheme?: boolean;
    isNetflixRedTheme?: boolean;
    isSoonCarousel?: boolean;
}

const HybridCard: React.FC<HybridCardProps> = ({
    content,
    index,
    totalItems,
    expandedIndex,
    onSetExpandedIndex,
    onSelectContent,
    isLoggedIn,
    myList,
    onToggleMyList,
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme,
    isSoonCarousel
}) => {
    const [showVideo, setShowVideo] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
    const isInMyList = !!myList?.includes(content.id);
    const isExpanded = expandedIndex === index;
    const isEpisodic = content.type === 'series' || content.type === 'program';

    // تحديد الموسم الأخير بناءً على نوع الكاروسيل:
    // - في كاروسيل "قريباً": نعرض الموسم الأخير المضاف (حتى لو كان قريباً).
    // - في باقي الكاروسيلات (مثل أحدث الإضافات): نعرض آخر موسم مفعل (ليس قريباً).
    const latestSeason = isEpisodic && content.seasons && content.seasons.length > 0
        ? isSoonCarousel
            ? [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0]
            : [...content.seasons].filter(season => season.status !== 'coming_soon' && !season.isUpcoming).sort((a, b) => b.seasonNumber - a.seasonNumber)[0] || [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0]
        : null;

    const posterSrc = (isEpisodic && latestSeason?.poster) ? latestSeason.poster : content.poster;
    const backdropSrc = (isEpisodic && latestSeason?.backdrop) ? latestSeason.backdrop : (content.backdrop || content.poster);
    const logoSrc = (isEpisodic && latestSeason?.logoUrl) ? latestSeason.logoUrl : content.logoUrl;

    const getVideoId = (url: string | undefined) => {
        if (!url) return null;
        try {
            if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
            if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
            if (url.includes('embed/')) return url.split('embed/')[1].split('?')[0];
            return null;
        } catch (e) { return null; }
    };

    const trailerUrl = (isEpisodic && latestSeason?.trailerUrl) ? latestSeason.trailerUrl : content.trailerUrl;
    const trailerId = getVideoId(trailerUrl);
    const hasTrailer = !!trailerId;

    const handleMouseEnter = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
            onSetExpandedIndex(index);
        }, 600);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        if (videoTimerRef.current) {
            clearTimeout(videoTimerRef.current);
            videoTimerRef.current = null;
        }
        if (isExpanded) {
            onSetExpandedIndex(null);
            setShowVideo(false);
            setIsMuted(true);
        }
    };

    useEffect(() => {
        if (isExpanded && hasTrailer) {
            videoTimerRef.current = setTimeout(() => {
                setShowVideo(true);
            }, 400); 
        } else {
            setShowVideo(false);
        }
        return () => {
            if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
        };
    }, [isExpanded, hasTrailer]);

    useEffect(() => {
        if (showVideo && iframeRef.current) {
            const command = isMuted ? 'mute' : 'unMute';
            try {
                iframeRef.current.contentWindow?.postMessage(JSON.stringify({
                    event: 'command',
                    func: command,
                    args: ''
                }), '*');
            } catch (e) {}
        }
    }, [isMuted, showVideo]);

    const seasonNumber = latestSeason ? latestSeason.seasonNumber : null;
    const watchSubtitle = isEpisodic && seasonNumber ? `الموسم ${seasonNumber}، الحلقة 1` : content.releaseYear;
    const genres = content.genres?.slice(0, 3).join(' • ');

    const idleWidthClass = 'w-[calc((100vw-40px)/2.25)] md:w-[calc((100vw-64px)/4.2)] lg:w-[calc((100vw-64px)/6)]';
    const expandedWidthClass = 'w-[90vw] md:w-[calc(((100vw-64px)/4.2)*2.8)] lg:w-[calc(((100vw-64px)/6)*2.8)]';

    const detailUrl = content.type === 'movie' 
        ? `/watch/movie/${content.slug || content.id}` 
        : `/series/${content.slug || content.id}${latestSeason ? `/الموسم${latestSeason.seasonNumber}` : ''}${isSoonCarousel ? '?targetSeason=upcoming' : ''}`;

    const flipStyle = { transform: content.flipBackdrop ? 'scaleX(-1)' : 'none' };

    return (
        <a 
            href={detailUrl}
            aria-label={`مشاهدة ${content.title}`}
            className={`relative flex-shrink-0 block no-underline text-inherit transition-[width] duration-500 ease-in-out ${isExpanded ? expandedWidthClass : idleWidthClass} z-0`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              if(isExpanded) {
                e.preventDefault();
                onSelectContent(content);
              } else {
                e.preventDefault();
                onSetExpandedIndex(index);
              }
            }}
        >
            <div className={`relative w-full h-full rounded-lg overflow-hidden transition-all duration-500 ${isExpanded ? 'shadow-2xl' : 'shadow-lg'}`}>
                <div className={`${idleWidthClass} ${isExpanded ? 'aspect-video' : 'aspect-[2/3]'} invisible pointer-events-none float-left transition-all duration-500`} aria-hidden="true" />

                <div className="absolute inset-0 w-full h-full">
                    <div className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        {showVideo && hasTrailer ? (
                            <div className="relative w-full h-full overflow-hidden bg-black">
                                <iframe 
                                    ref={iframeRef}
                                    src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&enablejsapi=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${trailerId}&playsinline=1&disablekb=1&iv_load_policy=3&fs=0`}
                                    className="absolute top-1/2 left-0 w-full h-[120%] -translate-y-1/2 pointer-events-none border-none scale-[1.05]" 
                                    style={flipStyle}
                                    title={content.title}
                                    allow="autoplay; encrypted-media"
                                />
                            </div>
                        ) : (
                            <img src={backdropSrc} style={flipStyle} alt={content.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent"></div>
                    </div>

                    <div className={`absolute inset-0 w-full h-full z-20 transition-opacity duration-500 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <img src={posterSrc} alt={content.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>

                    <div className={`absolute inset-0 z-30 flex flex-col justify-end p-4 md:p-6 transition-opacity duration-300 delay-100 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="absolute bottom-4 left-4 z-40">
                             {showVideo && (
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
                                    className="w-9 h-9 rounded-full border border-gray-500 hover:border-white flex items-center justify-center text-white bg-black/40 backdrop-blur-sm transition-colors"
                                >
                                    <SpeakerIcon isMuted={isMuted} className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col items-start gap-1 w-full relative z-30 pr-0 pb-1">
                            <div className="pr-2 flex flex-col items-start gap-1 w-full">
                                <div className="mb-2">
                                    {content.isLogoEnabled && logoSrc ? (
                                        <img src={logoSrc} alt={content.title} className="h-14 md:h-20 object-contain self-start drop-shadow-md" />
                                    ) : (
                                        <h3 className="text-white font-bold text-xl md:text-3xl leading-tight drop-shadow-md line-clamp-1">{content.title}</h3>
                                    )}
                                </div>
                                {content.bannerNote && <div className="text-[#46d369] text-[10px] md:text-xs font-bold mb-1">{content.bannerNote}</div>}
                                <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-medium text-gray-300 mb-2">
                                    {seasonNumber && (
                                        <>
                                            <span className="text-[#3b82f6] font-bold">الموسم {seasonNumber}</span>
                                            <div className="w-px h-3 bg-gray-500"></div>
                                        </>
                                    )}
                                    {genres && <span>{genres}</span>}
                                </div>
                            </div>

                            <div className="mt-2 w-fit bg-white/10 backdrop-blur-[2px] border border-white/10 rounded-full p-2 flex items-center gap-3 shadow-lg relative z-50">
                                <div className="flex items-center gap-3 pr-1 cursor-pointer group/play">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#00A7F8] flex items-center justify-center shadow-[0_0_20px_rgba(0,167,248,0.5)] group-hover/play:scale-110 transition-transform">
                                        <PlayIcon className="w-5 h-5 md:w-6 md:h-6 fill-white text-white ml-0.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-sm md:text-base leading-tight group-hover/play:text-[#00A7F8] transition-colors">شاهد الآن</span>
                                        <span className="text-[10px] md:text-xs text-gray-400 font-medium leading-tight">{watchSubtitle}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleMyList(content.id); }}
                                    className="flex items-center gap-2 rounded-full hover:bg-white/5 transition-colors group/list pr-2 pl-1 translate-x-1"
                                >
                                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center transition-all ${isInMyList ? 'bg-white border-white text-black' : 'bg-transparent border-gray-400 text-white group-hover/list:border-white'}`}>
                                        {isInMyList ? <CheckIcon className="w-4 h-4 md:w-5 md:h-5" /> : <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />}
                                    </div>
                                    <span className="text-xs md:text-sm font-bold text-gray-300 group-hover/list:text-white transition-colors">قائمتي</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default HybridCard;
