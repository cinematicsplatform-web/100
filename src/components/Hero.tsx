
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Content } from '@/types';
import ActionButtons from './ActionButtons';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { StarIcon } from './icons/StarIcon';
import { ClockIcon } from './icons/ClockIcon';

interface HeroProps {
  contents: Content[];
  onWatchNow: (content: Content, seasonNumber?: number, episodeNumber?: number, isSoon?: boolean) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean; // تم الإضافة
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  autoSlideInterval?: number;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isShahidTheme?: boolean;
  hideDescription?: boolean;
  disableVideo?: boolean; // Prop to disable background video playback
  isLoading?: boolean;
  isSoonCarousel?: boolean;
}

const Hero: React.FC<HeroProps> = ({ 
    contents, 
    onWatchNow, 
    isLoggedIn, 
    isAdmin = false,
    myList, 
    onToggleMyList, 
    autoSlideInterval = 3000, 
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme,
    isShahidTheme,
    hideDescription = false,
    disableVideo = false,
    isLoading,
    isSoonCarousel
}) => {
    const [unboundedIndex, setUnboundedIndex] = useState(0);
    const [isDirectJump, setIsDirectJump] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isInView, setIsInView] = useState(true); 
    const [videoEnded, setVideoEnded] = useState(false);
    
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [startPosY, setStartPosY] = useState(0);
    const [isScrollAttempt, setIsScrollAttempt] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const activeIframeRef = useRef<HTMLIFrameElement>(null);
    const forceStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const hasTransitionedRef = useRef<boolean>(false);
    const [isMobile, setIsMobile] = useState(false);

    const len = contents.length;
    const activeIndex = len > 0 ? ((unboundedIndex % len) + len) % len : 0;
    const activeContent = contents[activeIndex];
    const hasMultiple = len > 1;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); 
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.intersectionRatio > 0.3);
            },
            { threshold: [0, 0.3, 0.5, 1.0] }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleNext = useCallback(() => {
        setIsDirectJump(false);
        setUnboundedIndex(prev => prev + 1);
        hasTransitionedRef.current = false;
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                if (typeof event.data === 'string') {
                    const data = JSON.parse(event.data);
                    if ((data.event === 'infoDelivery' && data.info && data.info.playerState === 0) ||
                        (data.event === 'onStateChange' && data.info === 0)) {
                        
                        if (!hasTransitionedRef.current) {
                            hasTransitionedRef.current = true;
                            handleNext(); 
                        }
                    }
                }
            } catch (e) { }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleNext]);

    useEffect(() => {
        setShowVideo(false);
        setVideoEnded(false);
        setIsMuted(true);
        setIsPaused(false);
        setIsDirectJump(false);
        hasTransitionedRef.current = false;

        if (!activeContent || !activeContent.trailerUrl || isMobile || disableVideo) return;

        const trailerTimer = setTimeout(() => {
            setShowVideo(true);
        }, 1500);

        return () => {
            clearTimeout(trailerTimer);
        };
    }, [activeContent?.id, isMobile, disableVideo]);

    useEffect(() => {
        if (!showVideo || !activeIframeRef.current) return;

        const win = activeIframeRef.current.contentWindow;
        if (!win) return;

        try {
            if (isInView) {
                win.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
                win.postMessage(JSON.stringify({ event: 'command', func: isMuted ? 'mute' : 'unMute', args: '' }), '*');
            } else {
                win.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
            }
        } catch (e) {}
    }, [isInView, showVideo, isMuted]);

    useEffect(() => {
        if (showVideo && isInView) {
            forceStopTimerRef.current = setTimeout(() => {
                if (!hasTransitionedRef.current) {
                    hasTransitionedRef.current = true;
                    handleNext();
                }
            }, 60000);
        } else {
            if (forceStopTimerRef.current) {
                clearTimeout(forceStopTimerRef.current);
                forceStopTimerRef.current = null;
            }
        }
        return () => {
            if (forceStopTimerRef.current) clearTimeout(forceStopTimerRef.current);
        };
    }, [showVideo, isInView, handleNext]);

    useEffect(() => {
        if (showVideo && activeIframeRef.current) {
            const command = isMuted ? 'mute' : 'unMute';
            try {
                activeIframeRef.current.contentWindow?.postMessage(JSON.stringify({
                    event: 'command',
                    func: command,
                    args: ''
                }), '*');
            } catch (e) {}
        }
    }, [isMuted, showVideo]);

    useEffect(() => {
        if (!hasMultiple || isDragging || isPaused || showVideo) return;

        const timer = setTimeout(() => {
            handleNext();
        }, autoSlideInterval);

        return () => clearTimeout(timer);
    }, [hasMultiple, isDragging, isPaused, showVideo, handleNext, autoSlideInterval]);

    const getVideoId = (url: string | undefined) => {
        if (!url) return null;
        try {
            if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
            if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
            if (url.includes('embed/')) return url.split('embed/')[1].split('?')[0];
            return null;
        } catch (e) { return null; }
    };

    const handleManualSlide = useCallback((targetIndex: number) => {
        if (targetIndex === activeIndex) return;
        setIsDirectJump(true);
        const currentMod = activeIndex;
        let diff = targetIndex - currentMod;
        if (diff > len / 2) diff -= len;
        else if (diff < -len / 2) diff += len;
        setUnboundedIndex(prev => prev + diff);
        hasTransitionedRef.current = false;
    }, [activeIndex, len]);

    const handleStart = (clientX: number, clientY: number) => {
        if (!hasMultiple) return;
        setIsDragging(true);
        setIsScrollAttempt(false);
        setStartPos(clientX);
        setStartPosY(clientY);
        setDragOffset(0);
        setIsDirectJump(false);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging || isScrollAttempt) return;
        
        const diffX = clientX - startPos;
        const diffY = clientY - startPosY;

        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
            setIsScrollAttempt(true);
            setIsDragging(false);
            setDragOffset(0);
            return;
        }

        setDragOffset(diffX);
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const threshold = window.innerWidth * 0.15;
        if (dragOffset > threshold) {
            setUnboundedIndex(prev => prev - 1);
            hasTransitionedRef.current = false;
        } else if (dragOffset < -threshold) {
            setUnboundedIndex(prev => prev + 1);
            hasTransitionedRef.current = false;
        }
        setDragOffset(0);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMuted(prev => !prev);
    };

    if (isLoading) {
        const containerBgColor = isRamadanTheme ? 'bg-[#1a1000]' : isEidTheme ? 'bg-[#1a0b2e]' : isCosmicTealTheme ? 'bg-[#0b1116]' : isNetflixRedTheme ? 'bg-[#141414]' : 'bg-black';
        return (
            <div className={`relative min-h-[500px] h-[83vh] sm:h-[83vh] md:h-[90vh] lg:h-[90vh] w-full overflow-hidden ${containerBgColor}`}>
                <div className="absolute inset-0 bg-[#161b22] skeleton-shimmer"></div>
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[var(--bg-body)] via-[var(--bg-body)]/60 via-40% to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-4 md:pb-32 z-30">
                    <div className="max-w-3xl flex flex-col items-center md:items-start text-center md:text-right space-y-4">
                        <div className="w-64 md:w-96 h-12 md:h-20 bg-gray-800/40 rounded-xl skeleton-shimmer border border-white/5"></div>
                        <div className="w-48 h-6 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                        <div className="space-y-2 w-full">
                             <div className="w-full h-4 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                             <div className="w-3/4 h-4 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!contents || contents.length === 0) return null;

    const containerBgColor = isRamadanTheme ? 'bg-[#1a1000]' : isEidTheme ? 'bg-[#1a0b2e]' : isCosmicTealTheme ? 'bg-[#0b1116]' : isNetflixRedTheme ? 'bg-[#141414]' : 'bg-black';    

    return (
        <div 
            ref={containerRef}
            className={`relative min-h-[500px] h-[83vh] sm:h-[83vh] md:h-[90vh] lg:h-[90vh] w-full overflow-hidden group ${containerBgColor}`}
            onMouseDown={(e) => { if(e.button === 0) handleStart(e.clientX, e.clientY); }}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={(e) => { handleEnd(); setIsPaused(false); }}
            onMouseEnter={() => setIsPaused(true)}
            onTouchStart={(e) => handleStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY)}
            onTouchMove={(e) => handleMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY)}
            onTouchEnd={handleEnd}
            style={{ 
                cursor: isDragging ? 'grabbing' : 'pointer',
                touchAction: 'pan-y' 
            }}
        >
            {contents.map((content, index) => {
                const isActive = index === activeIndex;
                const isEpisodic = content.type === 'series' || content.type === 'program';
                const latestSeason = isEpisodic && content.seasons && content.seasons.length > 0
                    ? isSoonCarousel
                        ? [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0]
                        : [...content.seasons].filter(season => season.status !== 'coming_soon' && !season.isUpcoming).sort((a, b) => b.seasonNumber - a.seasonNumber)[0] || [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0]
                    : null;

                const displayBackdrop = latestSeason?.backdrop || content.backdrop;
                const displayMobileBackdrop = latestSeason?.mobileImageUrl || content.mobileBackdropUrl || displayBackdrop;
                const displayLogo = latestSeason?.logoUrl || content.logoUrl;

                const posX = content.mobileCropPositionX ?? content.mobileCropPosition ?? 50;
                const posY = content.mobileCropPositionY ?? 50;
                const flipBackdrop = latestSeason?.flipBackdrop ?? content.flipBackdrop ?? false;
                const imgStyle: React.CSSProperties = { 
                    '--mob-x': `${posX}%`, 
                    '--mob-y': `${posY}%`,
                    transform: flipBackdrop ? 'scaleX(-1)' : 'none'
                } as React.CSSProperties;
                
                const cropClass = content.enableMobileCrop ? 'mobile-custom-crop' : '';

                let embedUrl = '';
                const trailerUrl = latestSeason?.trailerUrl || content.trailerUrl;
                if (isActive && trailerUrl && !disableVideo) {
                    const videoId = getVideoId(trailerUrl);
                    if (videoId) {
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=0&playsinline=1&enablejsapi=1&origin=${origin}`;
                    }
                }
                const shouldShowVideo = isActive && showVideo && embedUrl && !isMobile && !disableVideo;

                let offset = (index - unboundedIndex) % len;
                if (offset < 0) offset += len; 
                if (offset > len / 2) offset -= len;
                const baseTranslate = offset * 100;
                const transitionStyle = (isDragging || isScrollAttempt) ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                const textOpacityClass = isDirectJump ? (isActive ? 'opacity-100' : 'opacity-0') : 'opacity-100';

                return (
                    <div 
                        key={`${content.id}-${index}`} 
                        className="absolute top-0 left-0 w-full h-full will-change-transform"
                        style={{ 
                            transform: `translateX(calc(${baseTranslate}% + ${dragOffset}px))`,
                            transition: transitionStyle,
                            zIndex: isActive ? 20 : 10 
                        }}
                    >
                        <div className="absolute inset-0 w-full h-full">
                            {shouldShowVideo && (
                                <div className="absolute inset-0 w-full h-full overflow-hidden z-0 animate-fade-in-up pointer-events-none"> 
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-video pointer-events-none">
                                        <iframe 
                                            ref={activeIframeRef}
                                            src={embedUrl} 
                                            className="w-full h-full pointer-events-none" 
                                            tabIndex={-1} 
                                            allow="autoplay; encrypted-media; picture-in-picture" 
                                            title={`Trailer for ${content.title}`}
                                            frameBorder="0"
                                            style={{ pointerEvents: 'none' }} 
                                        ></iframe>
                                    </div>
                                </div>
                            )}

                            <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${shouldShowVideo ? 'opacity-0' : 'opacity-100'}`}>
                                <img 
                                    src={displayBackdrop} 
                                    alt={content.title} 
                                    className="absolute inset-0 w-full h-full object-cover z-10 bg-only-desktop object-top"
                                    style={{ transform: flipBackdrop ? 'scaleX(-1)' : 'none' }}
                                    draggable={false}
                                    loading={isActive ? "eager" : "lazy"}
                                />
                                <img 
                                    src={displayMobileBackdrop} 
                                    alt={content.title} 
                                    className={`absolute inset-0 w-full h-full object-cover z-10 bg-only-mobile ${cropClass} object-top`}
                                    style={imgStyle}
                                    draggable={false}
                                    loading={isActive ? "eager" : "lazy"}
                                />
                            </div>

                            <div className={`absolute inset-0 z-20 pointer-events-none ${isRamadanTheme ? "bg-gradient-to-t from-black via-black/80 via-25% to-transparent" : "bg-gradient-to-t from-[var(--bg-body)] via-[var(--bg-body)]/60 via-40% to-transparent"}`}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-body)]/90 via-[var(--bg-body)]/40 via-50% to-transparent z-20 hidden md:block pointer-events-none"></div>
                        </div>

                        <div className={`absolute inset-0 z-30 flex flex-col justify-end md:justify-end px-4 md:px-12 pb-4 md:pb-32 text-white pointer-events-none transition-opacity duration-500 ease-in-out ${textOpacityClass}`}>
                            {isShahidTheme && shouldShowVideo && (
                                <button 
                                    onClick={toggleMute} 
                                    className="pointer-events-auto absolute left-4 md:left-8 lg:left-14 top-[18%] md:top-[22%] transform -translate-y-1/2 bg-white/10 border border-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md rounded-full w-[48px] h-[48px] md:w-[64px] md:h-[64px] flex items-center justify-center p-0 transition-all cursor-pointer z-50 group origin-center" 
                                    title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
                                >
                                    <SpeakerIcon isMuted={isMuted} className="h-5 w-5 md:h-7 md:w-7 text-white group-hover:text-black group-hover:scale-110 transition-transform transition-colors duration-200" />
                                </button>
                            )}
                            <div className="max-w-3xl w-full flex flex-col items-center md:items-start text-center md:text-right pointer-events-auto">
                                {content.bannerNote && (
                                    <div className={`mb-2 md:mb-2 text-sm font-medium shadow-sm w-fit animate-fade-in-up ${isRamadanTheme ? 'bg-[#D4AF37]/10 text-white border border-[#D4AF37]/10 px-3 py-1 rounded-lg backdrop-blur-md' : isEidTheme ? 'bg-purple-600/10 text-white border border-purple-500/10 px-3 py-1 rounded-lg backdrop-blur-md' : isCosmicTealTheme ? 'bg-[#35F18B]/10 text-white border border-[#35F18B]/10 px-3 py-1 rounded-lg backdrop-blur-md' : isNetflixRedTheme ? 'bg-[#E50914]/20 text-white border border-[#E50914]/20 px-3 py-1 rounded-lg backdrop-blur-md' : 'bg-[rgba(15,35,55,0.5)] text-[#00D2FF] border border-[rgba(0,210,255,0.3)] rounded-[6px] px-[12px] py-[4px] backdrop-blur-[4px]'}`}>
                                            {content.bannerNote}
                                    </div>
                                )}
                                
                                <div className={`transition-all duration-700 ease-in-out transform origin-center md:origin-right ${shouldShowVideo ? 'translate-y-4 scale-75 mb-1 md:mb-2' : 'translate-y-0 scale-100 mb-1 md:mb-6'}`}>
                                    {content.isLogoEnabled && displayLogo ? (
                                        <img src={displayLogo} alt={content.title} className="w-auto h-auto max-w-[190px] md:max-w-[380px] max-h-[165px] md:max-h-[245px] object-contain drop-shadow-2xl mx-auto md:mx-0" draggable={false} />
                                    ) : (
                                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">{content.title}</h1>
                                    )}
                                </div>

                                <div className={`flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 text-xs md:text-base font-medium text-gray-200 transition-all duration-700 ease-in-out w-full ${shouldShowVideo ? 'mb-1 md:mb-2 opacity-80' : 'mb-1 md:mb-3 opacity-100'}`}>
                                    <div className="flex items-center gap-1.5 text-yellow-400 bg-black/40 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-white/10">
                                        <StarIcon className="w-3 h-3 md:w-4 md:h-4" />
                                        <span className="font-bold text-white">{(Number(content.rating) || 0).toFixed(1)}</span>
                                    </div>
                                    
                                    <span className="text-gray-500 text-sm md:text-lg">|</span>
                                    
                                    <span className="text-white font-semibold">{content.releaseYear}</span>
                                    
                                    {content.type === 'movie' && content.duration && (
                                        <>
                                            <span className="text-gray-500 text-sm md:text-lg">|</span>
                                            <div className="flex items-center gap-1 px-2 py-0.5 border border-gray-500 rounded text-gray-300 text-[10px] md:text-xs backdrop-blur-sm bg-white/5">
                                                <ClockIcon className="w-3 h-3 md:w-4 md:h-4" />
                                                <span dir="ltr">{content.duration}</span>
                                            </div>
                                        </>
                                    )}

                                    {content.genres && content.genres.length > 0 && (
                                        <>
                                            <span className="text-gray-500 text-sm md:text-lg">|</span>
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                {content.genres.slice(0, 3).map((genre, index) => (
                                                    <React.Fragment key={index}>
                                                        <span className={`font-medium ${isRamadanTheme ? 'text-[#FFD700]' : isEidTheme ? 'text-purple-400' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]'}`}>
                                                                {genre}
                                                        </span>
                                                        {index < Math.min(content.genres.length, 3) - 1 && <span className="text-gray-500 text-[10px] md:text-xs">|</span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {content.ageRating && (
                                        <>
                                            <span className="text-gray-500 text-sm md:text-lg">|</span>
                                            <span className="border border-gray-500 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-[10px] md:text-xs backdrop-blur-sm bg-white/5 font-bold">{content.ageRating}</span>
                                        </>
                                    )}
                                </div>

                                {!hideDescription && (
                                    <div className={`overflow-hidden transition-all duration-700 ease-in-out w-full ${shouldShowVideo ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-40 mb-2 md:mb-4'}`}>
                                        <p className="text-gray-300 text-xs sm:text-sm md:text-lg line-clamp-2 md:line-clamp-3 leading-relaxed mx-auto md:mx-0 font-medium">{content.description}</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 w-full justify-center md:justify-start relative z-40 mt-1 md:mt-2">
                                    <ActionButtons onWatch={() => onWatchNow(content, undefined, undefined, isSoonCarousel)} onToggleMyList={() => onToggleMyList(content.id)} isInMyList={!!myList?.includes(content.id)} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={isShahidTheme} showMyList={isLoggedIn} content={content} isSoonOverride={isSoonCarousel} />
                                    {shouldShowVideo && !isShahidTheme && (
                                        <button onClick={toggleMute} className="p-3.5 md:p-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all z-50 group origin-center cursor-pointer" title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}>
                                            <SpeakerIcon isMuted={isMuted} className="h-6 w-6 md:h-9 md:w-9 text-white group-hover:scale-110 transition-transform" />
                                        </button>
                                    )}
                                </div>

                                {hasMultiple && (
                                    <div className="flex gap-1.5 pointer-events-none justify-center w-full mt-2 md:hidden" dir="rtl">
                                        {contents.map((_, idx) => (
                                            <button key={idx} className={`h-1.5 transition-all duration-300 pointer-events-auto cursor-pointer rounded-full ${activeIndex === idx ? (isRamadanTheme ? 'bg-amber-500 w-6' : isEidTheme ? 'bg-purple-500 w-6' : isCosmicTealTheme ? 'bg-[#35F18B] w-6 shadow-[0_0_10px_#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914] w-6 shadow-[0_0_10px_rgba(229,9,20,0.5)]' : 'bg-[#00A7F8] w-6') : 'bg-white/30 hover:bg-white/60 w-2'}`} onClick={(e) => { e.stopPropagation(); handleManualSlide(idx); }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {hasMultiple && (
                <div className="hidden md:flex absolute bottom-0 left-0 right-0 w-full z-40 justify-center items-end gap-10 animate-fade-in-up px-4 pb-0 pointer-events-none">
                    {contents.map((c, idx) => {
                        const isActiveItem = idx === activeIndex;
                        const indicatorColor = isRamadanTheme ? 'bg-[#FFD700]' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[#00A7F8]';
                        return (
                            <button key={`thumb-${c.id}`} onClick={(e) => { e.stopPropagation(); handleManualSlide(idx); }} className={`relative transition-all duration-500 ease-out group flex flex-col items-center gap-2 pb-2 pointer-events-auto cursor-pointer ${isActiveItem ? `opacity-100 scale-110 filter-none` : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105'}`}>
                                {c.logoUrl ? <img src={c.logoUrl} alt={c.title} className="h-20 w-auto object-contain max-w-[140px] drop-shadow-lg" loading="lazy" /> : <span className="text-sm font-bold text-white max-w-[100px] truncate block bg-black/50 px-3 py-1 rounded">{c.title}</span>}
                                <div className={`h-[3px] rounded-full transition-all duration-300 mt-1 ${isActiveItem ? `w-12 opacity-100 ${indicatorColor} shadow-[0_0_8px_rgba(255,255,255,0.3)]` : 'w-0 opacity-0 bg-transparent'}`}></div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
      );
};

export default Hero;
