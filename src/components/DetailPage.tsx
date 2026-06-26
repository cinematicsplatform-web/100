import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { createPortal } from 'react-dom';
import type { Content, Ad, Episode, Server, AdPlacement, Season, View, Person } from '../types';
import { ContentType } from '../types';
import VideoPlayer from './VideoPlayer';
import ContentCarousel from './ContentCarousel';
import ActionButtons from './ActionButtons';
import SEO from './SeoMeta';
import ReportModal from './ReportModal';

// Icons
import { StarIcon } from './icons/StarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { ExpandIcon } from './icons/ExpandIcon';
import { CheckIcon } from './CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronRightIcon } from './icons/ChevronRight';

interface DetailPageProps {
  content: Content;
  people: Person[]; 
  ads: Ad[];
  adsEnabled: boolean;
  allContent: Content[];
  onSelectContent: (content: Content, seasonNum?: number, episodeNum?: number) => void;
  onPersonClick: (name: string) => void; 
  isLoggedIn: boolean;
  isAdmin: boolean;
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  onSetView: (view: View, category?: string, params?: any) => void;
  onGoBack: (fallbackView: View) => void;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isShahidTheme?: boolean;
  locationPath?: string; 
  initialSeasonNumber?: number;
  returnView?: View;
}

export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <circle cx="12" cy="7" r="5" />
    <path d="M12 13c-5 0-9 2-9 5v6h18v-6c0-3-4-5-9-5z" />
  </svg>
);

const SortIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 4v16M7 20l-4-4M7 20l4-4"/>
    <path d="M17 20V4M17 4l-4 4M17 4l4 4"/>
  </svg>
);

const DetailPage: React.FC<DetailPageProps> = ({
  content,
  people,
  ads,
  adsEnabled,
  allContent,
  onSelectContent,
  onPersonClick,
  isLoggedIn,
  isAdmin,
  myList,
  onToggleMyList,
  onSetView,
  onGoBack,
  isRamadanTheme,
  isEidTheme,
  isCosmicTealTheme,
  isNetflixRedTheme,
  isShahidTheme,
  locationPath,
  initialSeasonNumber,
  returnView
}) => {
  const isLoaded = !!content && !!content.id;
  const safeTitle = content?.title || 'جاري التحميل...';
  const seriesSlug = content?.slug || content?.id;
  const isSoon = content?.categories?.includes('قريباً');

  const isEpisodic = content?.type === ContentType.Series || content?.type === ContentType.Program;

  const [activeTab, setActiveTab] = useState<'episodes' | 'trailer' | 'details' | 'related'>(isSoon ? 'details' : 'episodes');
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSoon) {
        setActiveTab('details');
    } else {
        setActiveTab('episodes');
    }
  }, [content?.id, isSoon]);

  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showVideo, setShowVideo] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDownloadErrorOpen, setIsDownloadErrorOpen] = useState(false);
  const [isInView, setIsInView] = useState(true);
  
  const [isDescending, setIsDescending] = useState(() => {
      try {
          return localStorage.getItem('cinematix_pref_sort_desc') === 'true';
      } catch (e) {
          return false;
      }
  });

  useEffect(() => {
      localStorage.setItem('cinematix_pref_sort_desc', String(isDescending));
  }, [isDescending]);
   
  const heroRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const forceStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasTransitionedRef = useRef<boolean>(false);

  const handleNext = useCallback(() => {
      setShowVideo(false);
      setVideoEnded(true);
      hasTransitionedRef.current = false;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
            setIsInView(entry.isIntersecting);
        },
        { threshold: 0.1 }
    );

    if (heroRef.current) {
        observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getEpisodeDescription = (description: string | undefined, epNumber: number, sNumber: number) => {
      if (description && description.trim().length > 0) return description;
      return `شاهد أحداث الحلقة ${epNumber} من الموسم ${sNumber}. استمتع بمشاهدة تطورات الأحداث في هذه الحلقة.`;
  };

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsSeasonDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    if (isLoaded && isEpisodic && content.seasons && content.seasons.length > 0) {
        let targetSeason = null;
        if (initialSeasonNumber) {
            targetSeason = content.seasons.find(s => s.seasonNumber === initialSeasonNumber);
        }
        if (!targetSeason) {
            const path = decodeURIComponent(locationPath || window.location.pathname);
            const seasonMatch = path.match(/\/(?:الموسم|season|series|program)\/.*?(?:\/(\d+))?$/i);
            if (seasonMatch && seasonMatch[1]) {
                const sNum = parseInt(seasonMatch[1]);
                targetSeason = content.seasons.find(s => s.seasonNumber === sNum);
            }
        }
        if (!targetSeason) {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('targetSeason') === 'upcoming') {
                targetSeason = [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0];
            }
        }
        if (!targetSeason) {
            targetSeason = [...content.seasons].filter(s => s.status !== 'coming_soon' && !s.isUpcoming).sort((a, b) => b.seasonNumber - a.seasonNumber)[0] || [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0];
        }

        if (targetSeason) {
            setSelectedSeasonId(targetSeason.id);
            if (targetSeason.episodes && targetSeason.episodes.length > 0) {
                const now = new Date();
                const lastEpId = sessionStorage.getItem(`lastEpisode_${content.id}`);
                let targetEp = null;
                if (lastEpId) {
                    targetEp = targetSeason.episodes.find(ep => ep.id.toString() === lastEpId);
                }
                if (!targetEp) {
                    targetEp = targetSeason.episodes.find(ep => 
                        isAdmin || !ep.isScheduled || !ep.scheduledAt || now >= new Date(ep.scheduledAt)
                    ) || targetSeason.episodes[0];
                }
                setSelectedEpisode(targetEp);
            }
        }
    }
  }, [content?.id, isLoaded, initialSeasonNumber, locationPath, isEpisodic, isAdmin]);

  useEffect(() => {
      if (selectedEpisode && content?.id) {
          sessionStorage.setItem(`lastEpisode_${content.id}`, selectedEpisode.id.toString());
      }
  }, [selectedEpisode, content?.id]);

  const currentSeason = useMemo(() => content?.seasons?.find(s => s.id === selectedSeasonId), [content?.seasons, selectedSeasonId]);
  
  const episodes = useMemo(() => {
    const rawEpisodes = currentSeason?.episodes || [];
    if (isAdmin) return rawEpisodes;
    
    const now = new Date();
    return rawEpisodes.filter(ep => {
        if (!ep.isScheduled || !ep.scheduledAt) return true;
        return now >= new Date(ep.scheduledAt);
    });
  }, [currentSeason, isAdmin]);

  const sortedEpisodes = useMemo(() => {
    const list = episodes.map((ep, idx) => ({ ...ep, originalNumber: idx + 1 }));
    return isDescending ? [...list].reverse() : list;
  }, [episodes, isDescending]);
  
  const displayBackdrop = currentSeason?.backdrop || content?.backdrop || '';
  const displayLogo = currentSeason?.logoUrl || content?.logoUrl || '';
  const displayPoster = currentSeason?.poster || content?.poster || '';
  const displayDescription = currentSeason?.description || content?.description || '';
   
  const activeServers = useMemo(() => {
      return (content?.servers || []).filter(s => s.url && s.url.trim().length > 0);
  }, [content?.servers]);

  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [playerKey, setPlayerKey] = useState(0);

  useEffect(() => {
      if (!isEpisodic && activeServers.length > 0) {
          setSelectedServer(activeServers.find(s => s.isActive) || activeServers[0]);
      }
  }, [activeServers, isEpisodic]); 
   
  const [isMobile, setIsMobile] = useState(false);
  useLayoutEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const accentColor = isRamadanTheme ? 'text-[#FFD700]' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
  const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'bg-[#00A7F8]';
  const borderAccent = isRamadanTheme ? 'border-amber-500/30' : isEidTheme ? 'border-purple-500/30' : isCosmicTealTheme ? 'border-[#35F18B]/30' : isNetflixRedTheme ? 'border-[#E50914]/30' : 'border-[#00A7F8]/30';

  const seoData = useMemo(() => {
    if (!isLoaded || !content) return { title: '', keywords: '' };
    const tags = [...(content.genres || []), ...(content.categories || []), content.type === 'movie' ? 'Movie' : 'Series'];
    const hasTag = (key: string) => tags.some(t => t.toLowerCase().includes(key.toLowerCase()) || t.includes(key));
    
    let prefix = "شاهد";
    if (hasTag("مسرحيات") || hasTag("Theater") || content.type === ContentType.Play) prefix = "شاهد مسرحية";
    else if (hasTag("حفلات") || hasTag("Concert") || hasTag("Music") || content.type === ContentType.Concert) prefix = "شاهد حفل";
    else if (hasTag("برامج") || hasTag("Program") || content.type === ContentType.Program) prefix = "شاهد برنامج";
    else if (content.type === ContentType.Movie) prefix = "شاهد فيلم";
    else if (content.type === ContentType.Series) prefix = "شاهد مسلسل";
    
    const seasonPart = (isEpisodic && currentSeason) ? ` - الموسم ${currentSeason.seasonNumber}` : "";
    const seoTitle = `${prefix} ${content.title}${seasonPart} | سينماتيكس Cinematix`;
    const keywordsArray = [content.title, "سينماتيكس", "Cinematix", "cinematics", "مشاهدة اونلاين", `${prefix} ${content.title}`];
    
    return { title: seoTitle, keywords: keywordsArray.join(', ') };
  }, [isLoaded, content, currentSeason, isEpisodic]);

  const structuredData = useMemo(() => {
    if (!isLoaded || !content) return '';

    const schema: any = {
      "@context": "https://schema.org",
      "@type": isEpisodic ? "TVSeries" : "Movie",
      "name": content.title,
      "image": displayPoster,
      "description": displayDescription,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": content.rating,
        "bestRating": "5",
        "worstRating": "0",
        "ratingCount": "100"
      }
    };

    if (content.director) {
      schema.director = {
        "@type": "Person",
        "name": content.director
      };
    }

    if (content.cast && content.cast.length > 0) {
      schema.actor = content.cast.map(name => ({
        "@type": "Person",
        "name": name
      }));
    }

    return JSON.stringify(schema);
  }, [content, isLoaded, isEpisodic, displayPoster, displayDescription]);

  const canonicalPath = !isEpisodic ? `/watch/movie/${seriesSlug}` : `/${content.type}/${seriesSlug}/الموسم${currentSeason?.seasonNumber || initialSeasonNumber || 1}`;

  const getVideoId = (url: string | undefined) => {
      if (!url) return null;
      try {
          if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
          if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
          if (url.includes('embed/')) return url.split('embed/')[1].split('?')[0];
          return null;
      } catch (e) { return null; }
  };

  const trailerVideoId = useMemo(() => {
    if (isEpisodic) {
        return getVideoId(currentSeason?.trailerUrl);
    }
    return getVideoId(content?.trailerUrl);
  }, [isEpisodic, currentSeason?.trailerUrl, content?.trailerUrl]);

  const heroEmbedUrl = useMemo(() => {
      if (!trailerVideoId) return '';
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return `https://www.youtube.com/embed/${trailerVideoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=0&playsinline=1&enablejsapi=1&origin=${origin}`;
  }, [trailerVideoId]);

  const modalEmbedUrl = trailerVideoId ? `https://www.youtube.com/embed/${trailerVideoId}?autoplay=1&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1` : '';

  useEffect(() => {
      setShowVideo(false);
      setVideoEnded(false);
      setIsMuted(true);
      if (!trailerVideoId || isMobile) return;
      const timer = setTimeout(() => { setShowVideo(true); }, 2000); 
      return () => clearTimeout(timer);
  }, [content?.id, trailerVideoId, isMobile, selectedSeasonId]);

  useEffect(() => {
    if (!showVideo || !iframeRef.current) return;
    const win = iframeRef.current.contentWindow;
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
      const handleMessage = (event: MessageEvent) => {
          try {
              if (typeof event.data === 'string') {
                  const data = JSON.parse(event.data);
                  if ((data.event === 'infoDelivery' && data.info && data.info.playerState === 0) || 
                      (data.event === 'onStateChange' && data.info === 0)) {
                      handleNext();
                  }
              }
          } catch (e) { }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
  }, [handleNext]);

  const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if (iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: newMuted ? 'mute' : 'unMute', args: '' }), '*');
      }
  };

  const handleDownload = () => {
      const hasDownloadLinks = (content.servers || []).some(s => s.downloadUrl && s.downloadUrl.trim().length > 0);
      if (!isEpisodic && !hasDownloadLinks) {
          setIsDownloadErrorOpen(true);
          return;
      }
      onSetView('download', undefined, { content: content });
  };

  const similarContent = useMemo(() => {
    if (!content?.id) return [];
    return allContent.filter(c => c.id !== content.id && c.categories.some(cat => content.categories.includes(cat))).slice(0, 10);
  }, [content, allContent]);

  const activeTabClass = isRamadanTheme 
    ? 'text-white border-[#FFD700]' 
    : isEidTheme 
        ? 'text-white border-purple-500' 
        : isCosmicTealTheme 
            ? 'text-white border-[#35F18B]' 
            : isNetflixRedTheme 
                ? 'text-white border-[#E50914]' 
                : 'text-white border-[#00A7F8]';
                
  const tabHoverClass = 'text-gray-400 border-transparent hover:text-white';

  const activeSeasonHighlight = isRamadanTheme ? 'text-[#FFD700]' : isEidTheme ? 'text-purple-400' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';

  const handleSeasonSelect = (seasonId: number) => {
      const season = content.seasons?.find(s => s.id === seasonId);
      if (season) {
          if(onSetView) onSetView('detail', undefined, { season: season.seasonNumber });
          setSelectedSeasonId(seasonId);
          setIsSeasonDropdownOpen(false);
      }
  };

  const handleEpisodeSelect = (episode: Episode, seasonNum?: number, episodeIndex?: number) => {
      setSelectedEpisode(episode);
      const sNum = seasonNum ?? currentSeason?.seasonNumber ?? 1;
      const eNum = episodeIndex || currentSeason?.episodes.findIndex(e => e.id === episode.id) + 1;
      onSelectContent(content, sNum, eNum);
  };

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  const PersonCard: React.FC<{ name: string, label?: string }> = ({ name, label }) => {
    const personProfile = people.find(p => p.name === name);
    const arabic = isArabic(name);
    return (
      <div 
        key={name}
        onClick={() => onPersonClick(name)}
        className="cursor-pointer group flex flex-col"
      >
        <div className="w-full aspect-square rounded-xl bg-[#1f2937]/80 border border-white/5 overflow-hidden mb-2 transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--color-accent)] relative flex flex-col justify-end shadow-2xl">
          {personProfile?.image ? (
            <img 
              src={personProfile.image} 
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-end justify-center">
              <UserIcon className="w-full h-full text-gray-700/50" />
            </div>
          )}
          <div className={`relative z-10 pb-3 px-3 ${arabic ? 'text-right' : 'text-left'}`} dir={arabic ? 'rtl' : 'ltr'}>
            <span className="text-sm md:text-base font-bold text-white truncate block drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">{name}</span>
          </div>
        </div>
        {label && (
          <span className="text-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">{label}</span>
        )}
      </div>
    );
  };

  const PeopleGrid: React.FC<{ title: string, names: string[] }> = ({ title, names }) => {
    if (!names || names.length === 0) return null;
    return (
      <div className="mb-12 w-full">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="h-6 md:h-8 w-1.5 bg-[var(--color-accent)] rounded-full"></div>
          <span>{title}</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 w-full">
          {names.map((name, idx) => (
            <PersonCard key={idx} name={name} />
          ))}
        </div>
      </div>
    );
  };

  const cropPosX = currentSeason?.mobileCropPositionX ?? currentSeason?.mobileCropPosition ?? content?.mobileCropPositionX ?? content?.mobileCropPosition ?? 50;
  const cropPosY = currentSeason?.mobileCropPositionY ?? currentSeason?.mobileCropPositionY ?? content?.mobileCropPositionY ?? 50;
  const enableCrop = currentSeason?.enableMobileCrop ?? content?.enableMobileCrop ?? false;
  const flipBackdrop = currentSeason?.flipBackdrop ?? content?.flipBackdrop ?? false;
  const imgStyle: React.CSSProperties = { 
      '--mob-x': `${cropPosX}%`, 
      '--mob-y': `${cropPosY}%`,
      transform: flipBackdrop ? 'scaleX(-1)' : 'none'
  } as React.CSSProperties;

  const isSeasonUpcoming = currentSeason?.isUpcoming || currentSeason?.status === 'coming_soon' || false;
  const effectiveIsSoon = isSoon || isSeasonUpcoming;

  useEffect(() => {
    if (effectiveIsSoon && activeTab === 'episodes') {
      setActiveTab('details');
    }
  }, [effectiveIsSoon, activeTab]);

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white pb-0 relative overflow-x-hidden w-full">
      <Helmet>
        <script type="application/ld+json">{structuredData}</script>
      </Helmet>
      <SEO 
        type={isEpisodic ? 'series' : 'movie'} 
        title={seoData.title} 
        keywords={seoData.keywords}
        seasonNumber={isEpisodic ? currentSeason?.seasonNumber : undefined}
        description={currentSeason?.description || content?.description} 
        image={displayPoster} 
        banner={displayBackdrop}
        url={canonicalPath}
      />

      <div ref={heroRef} className="relative h-[83vh] md:h-[90vh] lg:h-[90vh] w-full group z-[45]">
        <div className="flex md:hidden absolute top-6 right-4 z-[100] pointer-events-auto">
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    onGoBack(returnView || 'home');
                }}
                className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-all shadow-lg group"
                aria-label="Back"
            >
                <ChevronRightIcon className="w-6 h-6 transform rotate-0 text-white" />
            </button>
        </div>

        <div className="absolute inset-0 bg-black overflow-hidden">
            {isLoaded ? (
                <div key={`season-backdrop-${selectedSeasonId}`} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}>
                    <img 
                        src={displayBackdrop} 
                        alt={content.title} 
                        className="absolute inset-0 w-full h-full object-cover z-10 bg-only-desktop object-top"
                        style={{ transform: flipBackdrop ? 'scaleX(-1)' : 'none' }}
                    />
                    <img 
                        src={currentSeason?.mobileImageUrl || content.mobileBackdropUrl || displayBackdrop} 
                        alt={content.title} 
                        className={`absolute inset-0 w-full h-full object-cover z-10 bg-only-mobile ${enableCrop ? 'mobile-custom-crop' : 'object-top'} md:object-top`}
                        style={imgStyle}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 bg-[#161b22] skeleton-shimmer"></div>
            )}
            
            {showVideo && !videoEnded && heroEmbedUrl && !isMobile && isLoaded && (
                <div key={`season-ad-container-${selectedSeasonId}`} className="absolute inset-0 w-full h-full overflow-hidden animate-fade-in-up pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-video pointer-events-none">
                        <iframe 
                            ref={iframeRef} 
                            src={heroEmbedUrl} 
                            className="w-full h-full pointer-events-none" 
                            allow="autoplay; encrypted-media; picture-in-picture" 
                            title="Trailer"
                            frameBorder="0"
                        ></iframe>
                    </div>
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-body)] via-[var(--bg-body)]/80 via-20% to-transparent z-10"></div>
        </div>

        {isShahidTheme && showVideo && (
            <button 
                onClick={toggleMute} 
                className="pointer-events-auto absolute left-4 md:left-8 lg:left-14 top-[18%] md:top-[22%] transform -translate-y-1/2 bg-white/10 border border-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md rounded-full w-[48px] h-[48px] md:w-[64px] md:h-[64px] flex items-center justify-center p-0 transition-all cursor-pointer z-50 group origin-center" 
                title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
                <SpeakerIcon isMuted={isMuted} className="h-5 w-5 md:h-7 md:w-7 text-white group-hover:text-black group-hover:scale-110 transition-transform transition-colors duration-200" />
            </button>
        )}

        <div className="absolute bottom-0 left-0 w-full px-4 md:px-8 pb-4 md:pb-6 flex flex-col justify-end items-start z-20">
            <div className="max-w-4xl w-full flex flex-col items-center md:items-start text-center md:text-right pointer-events-auto">
                
                {isLoaded ? (
                    content.isLogoEnabled ? (
                        displayLogo ? (
                            <img 
                                src={displayLogo} 
                                alt={content.title} 
                                className={`w-auto h-auto max-w-[190px] md:max-w-[435px] max-h-[190px] md:max-h-[300px] mb-3 object-contain drop-shadow-2xl transition-transform duration-700 mx-auto md:mx-0 ${showVideo ? 'scale-90 origin-bottom-right' : 'scale-100'}`}
                            />
                        ) : (
                            <div className="h-12 md:h-20 mb-3"></div>
                        )
                    ) : (
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-3 leading-tight text-white drop-shadow-lg text-center md:text-right">{content.title}</h1>
                    )
                ) : (
                    <div className="w-64 md:w-96 h-12 md:h-20 bg-gray-800/40 rounded-xl skeleton-shimmer mb-4 border border-white/5"></div>
                )}

                {isLoaded && isEpisodic && content.seasons && content.seasons.length > 1 && (
                    <div className="relative mt-1 mb-2 z-50 w-full md:w-auto flex justify-center md:justify-start" ref={dropdownRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSeasonDropdownOpen(!isSeasonDropdownOpen);
                            }}
                            className={`flex items-center gap-2 text-xl md:text-2xl font-bold transition-colors duration-200 group ${isRamadanTheme ? 'text-white hover:text-[#FFD700]' : isEidTheme ? 'text-white hover:text-purple-400' : isCosmicTealTheme ? 'text-white hover:text-[#35F18B]' : isNetflixRedTheme ? 'text-white hover:text-[#E50914]' : 'text-white hover:text-[#00A7F8]'}`}
                        >
                            <span>{`الموسم ${currentSeason?.seasonNumber}`}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSeasonDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-[#1f2937] border border-gray-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-fade-in-up origin-top-right">
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {[...content.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber).map(season => (
                                        <button
                                            key={season.id}
                                            onClick={() => {
                                                handleSeasonSelect(season.id);
                                            }}
                                            className={`w-full text-right px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group ${selectedSeasonId === season.id ? 'bg-white/5' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-lg font-bold ${selectedSeasonId === season.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {`الموسم ${season.seasonNumber}`}
                                                    {(season.isUpcoming || season.status === 'coming_soon') && <span className="mr-2 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-black animate-pulse">قريباً</span>}
                                                </span>
                                                {selectedSeasonId === season.id && <CheckIcon className={`w-4 h-4 ${activeSeasonHighlight}`} />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mb-2 text-sm md:text-base font-medium text-gray-200 w-full transition-all duration-700 ease-in-out">
                    {isLoaded ? (
                        <>
                            <div className="flex items-center gap-1.5 text-yellow-400 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <StarIcon className="h-5 w-5" />
                                <span className="font-bold text-white">{(Number(content.rating) || 0).toFixed(1)}</span>
                            </div>

                            <span className="text-gray-500 opacity-60">|</span>

                            <span className="text-white font-semibold tracking-wide">{currentSeason?.releaseYear || content.releaseYear}</span>

                            {!isEpisodic && content.duration && (
                                <>
                                    <span className="text-gray-500 opacity-60">|</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 border border-gray-600/50 rounded text-gray-200 text-xs backdrop-blur-sm bg-white/5">
                                        <ClockIcon className="h-4 w-4" />
                                        <span dir="ltr">{content.duration}</span>
                                    </div>
                                </>
                            )}

                            <span className="text-gray-500 opacity-60">|</span>
                            <span className="px-2 py-0.5 border border-gray-500 rounded text-gray-300 text-xs font-bold">{content.ageRating}</span>

                            {content.genres && content.genres.length > 0 && (
                                <>
                                    <span className="text-gray-500 opacity-60">|</span>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        {content.genres.slice(0, 3).map((genre, index) => (
                                            <React.Fragment key={index}>
                                                <span className={`font-medium ${isRamadanTheme ? 'text-[#FFD700]' : isEidTheme ? 'text-purple-400' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]'}`}>
                                                    {genre}
                                                </span>
                                                {index < Math.min(content.genres.length, 3) - 1 && <span className="text-gray-600 text-[10px]">•</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-48 h-6 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                    )}
                </div>

                <div className="overflow-hidden transition-all duration-700 ease-in-out w-full opacity-100 max-h-40 mb-3 md:mb-4">
                    {isLoaded ? (
                        <p className="text-gray-300 text-xs sm:text-sm md:text-lg line-clamp-3 leading-relaxed mx-auto md:mx-0 font-medium text-center md:text-right">{displayDescription}</p>
                    ) : (
                        <div className="space-y-2 w-full max-w-xl">
                            <div className="h-4 bg-gray-800/40 rounded skeleton-shimmer w-full border border-white/5"></div>
                            <div className="h-4 bg-gray-800/40 rounded skeleton-shimmer w-3/4 border border-white/5"></div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center md:justify-start w-full md:w-auto relative z-40 mt-1">
                    {isLoaded ? (
                        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                            <ActionButtons 
                                onWatch={() => { 
                                    if (effectiveIsSoon) {
                                        setActiveTab('details');
                                    } else {
                                        setActiveTab('episodes'); 
                                    }
                                    tabsRef.current?.scrollIntoView({ behavior: 'smooth' }); 
                                }}
                                onToggleMyList={() => onToggleMyList(content.id)}
                                isInMyList={!!myList?.includes(content.id)}
                                showMyList={isLoggedIn}
                                isRamadanTheme={isRamadanTheme}
                                isEidTheme={isEidTheme}
                                isCosmicTealTheme={isCosmicTealTheme}
                                isNetflixRedTheme={isNetflixRedTheme}
                                isShahidTheme={isShahidTheme}
                                content={content}
                                isSoonOverride={effectiveIsSoon}
                            />

                            {showVideo && !isShahidTheme && (
                                <button 
                                    onClick={toggleMute} 
                                    className="p-3.5 md:p-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all z-50 group origin-center" 
                                    title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
                                >
                                    <SpeakerIcon isMuted={isMuted} className="h-6 w-6 md:h-9 md:w-9 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                            
                            {trailerVideoId && (showVideo || videoEnded) && !isShahidTheme && (
                                <button 
                                    onClick={() => { setActiveTab('trailer'); tabsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                                    className="p-3.5 md:p-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all z-50 group origin-center"
                                    title="عرض الإعلان"
                                >
                                    <ExpandIcon className="h-6 w-6 md:h-9 md:w-9 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <div className="w-32 md:w-40 h-10 md:h-14 bg-gray-800/40 rounded-full skeleton-shimmer border border-white/5"></div>
                            <div className="w-32 md:w-40 h-10 md:h-14 bg-gray-800/40 rounded-full skeleton-shimmer border border-white/5"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div ref={tabsRef} className="sticky top-16 md:top-20 z-40 bg-[var(--bg-body)]/95 backdrop-blur-xl border-b border-white/5 shadow-md w-full">
          <div className="flex h-14 w-full flex-row items-center justify-between px-4 md:h-16 md:px-8">
              <div className="custom-scrollbar flex h-full items-center gap-6 overflow-x-auto no-scrollbar md:gap-8">
                  {!effectiveIsSoon && (
                      <>
                        <button onClick={() => setActiveTab('episodes')} className={`py-4 px-2 border-b-[3px] font-bold transition-all duration-300 text-sm md:text-lg whitespace-nowrap ${activeTab === 'episodes' ? activeTabClass : tabHoverClass}`}>{!isEpisodic ? 'المشاهدة' : (isLoaded ? `الحلقات (${episodes.length})` : 'الحلقات')}</button>
                        
                        {trailerVideoId && (
                            <button 
                                onClick={() => setActiveTab('trailer')}
                                className={`py-4 px-2 border-b-[3px] font-bold transition-all duration-300 text-sm md:text-lg whitespace-nowrap ${activeTab === 'trailer' ? activeTabClass : tabHoverClass}`}
                            >
                                الإعلان
                            </button>
                        )}
                      </>
                  )}

                  <button onClick={() => setActiveTab('details')} className={`py-4 px-2 border-b-[3px] font-bold transition-all duration-300 text-sm md:text-lg whitespace-nowrap ${activeTab === 'details' ? activeTabClass : tabHoverClass}`}>التفاصيل</button>
                  <button onClick={() => setActiveTab('related')} className={`py-4 px-2 border-b-[3px] font-bold transition-all duration-300 text-sm md:text-lg whitespace-nowrap ${activeTab === 'related' ? activeTabClass : tabHoverClass}`}>أعمال مشابهة</button>
              </div>

              {activeTab === 'episodes' && isEpisodic && (
                <button 
                  onClick={() => setIsDescending(!isDescending)}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 border border-transparent ${isDescending ? 'bg-white/10 text-white border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                  title={isDescending ? "ترتيب تنازلي (الأحدث أولاً)" : "ترتيب تصاعدي (الأقدم أولاً)"}
                >
                  <span className="text-xs font-bold hidden sm:block">
                    {isDescending ? 'الأحدث أولاً' : 'الأقدم أولاً'}
                  </span>
                  <SortIcon className={`w-6 h-6 ${isDescending ? (isRamadanTheme ? 'text-[#FFD700]' : isNetflixRedTheme ? 'text-[#E50914]' : isCosmicTealTheme ? 'text-[#35F18B]' : 'text-[#00A7F8]') : ''}`} />
                </button>
              )}
          </div>
      </div>

      <div className="relative min-h-[400px] w-full bg-[var(--bg-body)]">
          {activeTab === 'episodes' && !effectiveIsSoon && (
              <div className="w-full px-4 pt-8 md:px-8 animate-fade-in-up">
                  {isEpisodic ? (
                      <div className="mb-10 grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                          {isLoaded ? sortedEpisodes.map((ep: any, index) => {
                              const eNum = ep.originalNumber;
                              const sNum = currentSeason?.seasonNumber || 1;
                              const watchUrl = `/watch/${seriesSlug}/${sNum}/${eNum}`;
                              
                              // منطق تحديد هل الجدولة في المستقبل أم مرت
                              const isFutureScheduled = ep.isScheduled && ep.scheduledAt && new Date() < new Date(ep.scheduledAt);
                              
                              return (
                                  <a 
                                    key={ep.id} 
                                    href={watchUrl}
                                    onClick={(e) => { e.preventDefault(); handleEpisodeSelect(ep, sNum, eNum); }}
                                    aria-label={`شاهد ${content.title} الموسم ${sNum} الحلقة ${eNum}`}
                                    className="episode-card-hover group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-800 bg-[var(--bg-card)] text-inherit no-underline"
                                  >
                                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                                          <img src={ep.thumbnail || displayBackdrop} alt={ep.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                          
                                          {(() => {
                                              const badges = [];
                                              if (ep.isLastEpisode) {
                                                  badges.push({ text: 'الحلقة الأخيرة', type: 'last' });
                                              }
                                              if (ep.badgeText) {
                                                  const customBadges = ep.badgeText.split(',').map((b: string) => b.trim()).filter(Boolean);
                                                  customBadges.forEach((b: string) => {
                                                      if (b.toUpperCase() === 'VIP') badges.push({ text: 'VIP', type: 'vip' });
                                                      else if (b === 'حصري') badges.push({ text: 'حصري', type: 'exclusive' });
                                                      else if (b === 'جديد') badges.push({ text: 'جديد', type: 'new' });
                                                      else if (b === 'قريباً') badges.push({ text: 'قريباً', type: 'soon' });
                                                      else if (b === 'مترجم') badges.push({ text: 'مترجم', type: 'translated' });
                                                      else badges.push({ text: b, type: 'custom' });
                                                  });
                                              }
                                              
                                              if (badges.length === 0) return null;

                                              return (
                                                  <div className="absolute top-2 right-2 z-10 flex flex-wrap gap-1 max-w-[80%] dir-rtl">
                                                      {badges.map((badge, idx) => {
                                                          let badgeClasses = "";
                                                          switch (badge.type) {
                                                              case 'last': badgeClasses = "border-red-500/50 bg-red-600/90 text-white"; break;
                                                              case 'vip': badgeClasses = "border-yellow-500/50 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black"; break;
                                                              case 'exclusive': badgeClasses = "border-orange-500/50 bg-orange-600/90 text-white"; break;
                                                              case 'new': badgeClasses = "border-emerald-500/50 bg-emerald-600/90 text-white"; break;
                                                              case 'soon': badgeClasses = "border-purple-500/50 bg-purple-600/90 text-white"; break;
                                                              case 'translated': badgeClasses = "border-slate-500/50 bg-slate-700/90 text-white"; break;
                                                              default: badgeClasses = "border-amber-500/50 bg-amber-600/90 text-white"; break;
                                                          }
                                                          return (
                                                              <span key={idx} className={`rounded-md border backdrop-blur-md px-2 py-0.5 text-[9px] sm:text-[10px] font-bold shadow-lg ${badgeClasses}`}>
                                                                  {badge.text}
                                                              </span>
                                                          );
                                                      })}
                                                  </div>
                                              );
                                          })()}

                                          {/* Scheduled Label for Admins - Updated Logic: Hide if time passed */}
                                          {isFutureScheduled && isAdmin && (
                                              <div className="absolute top-10 right-2 z-10">
                                                  <span className="rounded-md border border-blue-500/50 bg-blue-600/90 backdrop-blur-sm px-2 py-0.5 text-[8px] font-black text-white shadow-lg uppercase">مجدولة</span>
                                              </div>
                                          )}

                                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                              <h4 className="leading-none text-xl font-bold text-white drop-shadow-md">{ep.title || `الحلقة ${eNum}`}</h4>
                                              {ep.duration && <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white">{ep.duration}</span>}
                                          </div>
                                      </div>
                                      <div className="flex-1 p-3 md:p-4"><p className="leading-relaxed line-clamp-3 text-xs md:text-sm text-gray-400">{getEpisodeDescription(ep.description, eNum, sNum)}</p></div>
                                  </a>
                              );
                          }) : (
                              Array.from({ length: 10 }).map((_, i) => (
                                  <div key={i} className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 skeleton-shimmer">
                                      <div className="relative aspect-video w-full bg-gray-700/30"></div>
                                      <div className="space-y-3 p-4">
                                          <div className="h-4 w-1/2 rounded bg-gray-700/40"></div>
                                          <div className="space-y-2">
                                              <div className="h-2 w-full rounded bg-gray-700/40"></div>
                                              <div className="h-2 5/6 rounded bg-gray-700/40"></div>
                                          </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  ) : (
                      <div className="mx-auto w-full max-w-6xl py-8 text-center">
                           {!isLoaded ? (
                               <div className="space-y-8 animate-fade-in">
                                   <div className="w-full flex flex-col gap-6">
                                        <div className="h-8 w-48 bg-gray-800/40 rounded skeleton-shimmer mx-auto md:mx-0"></div>
                                        <div className="relative z-10 mx-auto aspect-video w-full overflow-hidden rounded-2xl border border-gray-800 bg-[#0f1014] skeleton-shimmer shadow-2xl"></div>
                                        <div className="flex justify-center mt-6">
                                            <div className="w-48 h-14 bg-gray-800/40 rounded-full skeleton-shimmer"></div>
                                        </div>
                                   </div>
                               </div>
                           ) : (
                               <>
                                <div className="block mb-8 w-full">
                                        <div className="custom-scrollbar flex items-center justify-start gap-3 overflow-x-auto pb-3 no-scrollbar">
                                            <span className="ml-2 whitespace-nowrap text-sm font-black text-gray-400">سيرفر المشاهدة:</span>
                                            {activeServers.length > 0 ? activeServers.map((server, idx) => (
                                                <button key={server.id} onClick={() => setSelectedServer(server)} className={`flex-shrink-0 border px-8 py-3 rounded-2xl font-black text-sm transition-all target-server-btn ${selectedServer?.id === server.id ? `scale-105 border-transparent ${bgAccent} text-black shadow-[0_0_20px_var(--shadow-color)]` : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800'}`}>
                                                    سيرفر {idx + 1}
                                                </button>
                                            )) : (
                                                <span className="text-xs text-gray-600">جاري تحميل السيرفرات...</span>
                                            )}
                                        </div>
                                </div>

                                <div className="relative z-10 mx-auto aspect-video w-full overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl video-player-wrapper">
                                        <VideoPlayer key={playerKey} tmdbId={content.id} type={content.type} manualSrc={selectedServer?.url} poster={displayBackdrop} />
                                </div>

                                <div className="relative mt-6 flex flex-col items-center gap-2 animate-fade-in-up">
                                        <div className="flex w-full justify-center">
                                            {activeServers.some(s => s.downloadUrl && s.downloadUrl.trim().length > 0) && (
                                                <button 
                                                    onClick={handleDownload}
                                                    className={`
                                                        inline-flex items-center justify-center gap-3
                                                        font-bold 
                                                        py-3 px-8 md:py-4 md:px-12
                                                        rounded-full
                                                        text-base md:text-lg
                                                        transform transition-all duration-200
                                                        active:scale-95
                                                        shadow-lg hover:shadow-2xl
                                                        target-download-btn
                                                        ${isRamadanTheme 
                                                            ? "bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                                                            : isEidTheme 
                                                                ? "bg-gradient-to-r from-purple-800 to-purple-500 text-white shadow-[0_0_15px_rgba(106,13,173,0.4)]" 
                                                                : isCosmicTealTheme 
                                                                    ? "bg-gradient-to-r from-[#35F18B] to-[#2596be] text-black shadow-[0_0_15px_rgba(53,241,139,0.4)]" 
                                                                    : isNetflixRedTheme 
                                                                        ? "bg-[#E50914] text-white" 
                                                                        : "bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-black shadow-[0_0_15px_var(--shadow-color)]"
                                                        }
                                                    `}
                                                >
                                                    <DownloadIcon className="h-5 w-5 fill-current md:h-6 md:w-6" />
                                                    <span>تحميل الآن</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex w-full justify-start">
                                            <button 
                                                onClick={() => setIsReportModalOpen(true)} 
                                                className="flex shrink-0 items-center justify-center rounded-lg px-4 py-1.5 text-red-500/60 transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-95"
                                                title="إبلاغ عن مشكلة"
                                            >
                                                <span className="text-xs font-bold">⚠️ إبلاغ عن مشكلة</span>
                                            </button>
                                        </div>
                                </div>
                               </>
                           )}
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'trailer' && trailerVideoId && (
              <div className="w-full px-4 py-8 md:px-8 animate-fade-in-up">
                  <div className="mx-auto w-full max-w-5xl">
                      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl video-player-wrapper">
                          <iframe 
                              src={modalEmbedUrl} 
                              className="h-full w-full" 
                              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" 
                              allowFullScreen
                              title="Official Trailer"
                          ></iframe>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'details' && (
              <div className="w-full animate-fade-in-up">
                  <div className="px-4 py-8 md:px-8">
                    <div className="flex w-full flex-col gap-12">
                        <div className="flex flex-col gap-10">
                            <div className="order-1 space-y-10 w-full">
                                {isLoaded ? (
                                    <>
                                        <div className="text-right">
                                            <h3 className="mb-4 flex items-center justify-start gap-3 text-xl font-bold text-white md:text-2xl">
                                                <div className="h-6 w-1.5 rounded-full bg-[var(--color-accent)] md:h-8"></div>
                                                <span>القصة</span>
                                            </h3>
                                            <p className="leading-loose text-justify text-sm md:text-lg text-gray-300 text-right">{displayDescription}</p>
                                        </div>
                                        
                                        <div className="text-right">
                                            <h3 className="mb-4 flex items-center justify-start gap-3 text-xl font-bold text-white md:text-2xl">
                                                <div className="h-6 w-1.5 rounded-full bg-[var(--color-accent)] md:h-8"></div>
                                                <span>التصنيف النوعي</span>
                                            </h3>
                                            <div className="flex flex-wrap gap-2 justify-start">
                                                {content?.genres?.map((genre, index) => (
                                                    <div key={index} className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-bold text-gray-300 transition-colors hover:border-gray-500">
                                                        {genre}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-12">
                                        <div className="space-y-4">
                                            <div className="h-6 w-32 rounded bg-gray-800/40 skeleton-shimmer"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-full rounded bg-gray-800/40 skeleton-shimmer"></div>
                                                <div className="h-4 w-full rounded bg-gray-800/40 skeleton-shimmer"></div>
                                                <div className="h-4 w-2/3 rounded bg-gray-800/40 skeleton-shimmer"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="order-2 w-full">
                                {isLoaded ? (
                                    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
                                        <div className="flex flex-col divide-y divide-white/10">
                                            <div className="flex flex-col items-center md:items-start gap-1 p-4">
                                                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">سنة الإنتاج</span>
                                                <span className="text-base font-black text-white">{currentSeason?.releaseYear || content.releaseYear}</span>
                                            </div>
                                            
                                            <div className="flex flex-col items-center md:items-start gap-1 p-4">
                                                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">وقت العمل</span>
                                                <span className="text-base font-black text-white" dir="ltr">{content.duration || (isEpisodic ? '45m+' : 'N/A')}</span>
                                            </div>

                                            <div className="flex flex-col items-center md:items-start gap-1 p-4">
                                                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">التصنيف العمري</span>
                                                <div className="w-fit rounded border border-gray-600 px-2 py-0.5 text-xs font-black text-gray-200">
                                                    {content.ageRating}
                                                </div>
                                            </div>

                                            {isEpisodic && (
                                                <>
                                                    <div className="flex flex-col items-center md:items-start gap-1 p-4">
                                                        <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">عدد المواسم</span>
                                                        <span className="text-base font-black text-white">{content.seasons?.length || 0}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-64 bg-gray-800/20 rounded-2xl skeleton-shimmer border border-white/5"></div>
                                )}
                            </div>
                        </div>
                    </div>
                  </div>

                  {isLoaded && (
                    <div className="relative z-10 px-4 md:px-8 py-12 mt-12 border-t border-white/5 bg-black/20 w-full">
                        <div className="w-full text-right">
                            {content.cast && content.cast.length > 0 && <PeopleGrid title="طاقم التمثيل" names={content.cast} />}
                            
                            {(content.director || content.writer) && (
                            <div className="mb-12 w-full text-right">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center justify-center md:justify-start gap-3">
                                <div className="h-6 md:h-8 w-1.5 bg-[var(--color-accent)] rounded-full"></div>
                                <span>صنّاع العمل</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 w-full">
                                {content.director && <PersonCard name={content.director} label="إخراج" />}
                                {content.writer && <PersonCard name={content.writer} label="تأليف" />}
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                  )}
              </div>
          )}

          {activeTab === 'related' && (
              <div className="w-full px-4 py-8 md:px-8 animate-fade-in-up">
                  <ContentCarousel 
                      title="أعمال مشابهة" 
                      contents={similarContent} 
                      onSelectContent={onSelectContent} 
                      isLoggedIn={isLoggedIn} 
                      myList={similarContent.length > 0 ? (myList || []) : []} 
                      onToggleMyList={onToggleMyList}
                      isRamadanTheme={isRamadanTheme}
                      isEidTheme={isEidTheme}
                      isCosmicTealTheme={isCosmicTealTheme}
                      isNetflixRedTheme={isNetflixRedTheme}
                  />
              </div>
          )}
      </div>

      <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          contentId={content.id} 
          contentTitle={content.title}
          isCosmicTealTheme={isCosmicTealTheme}
          isNetflixRedTheme={isNetflixRedTheme}
      />

      {isDownloadErrorOpen && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsDownloadErrorOpen(false)}>
                    <div className="bg-[#1f2937] border border-gray-700 rounded-2xl shadow-2xl w-full max-sm overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">عذراً، الرابط غير متوفر</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">التحميل غير متوفر حالياً لهذا العمل، يرجى تجربة وقت آخر أو سيرفر آخر إن وجد.</p>
                            <button 
                                onClick={() => setIsDownloadErrorOpen(false)}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg
                                    ${isNetflixRedTheme ? 'bg-[#E50914] hover:bg-[#b20710]' : isCosmicTealTheme ? 'bg-[#35F18B] hover:bg-[#2596be] !text-black' : 'bg-[#00A7F8] hover:bg-[#008ecf]'}`}
                            >
                                حسنًا، فهمت
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
    </div>
  );
};

export default DetailPage;