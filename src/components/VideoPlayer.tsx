import React, { useState, useEffect, useMemo, useRef } from 'react';
import Hls from 'hls.js';
import { PlayIcon } from './icons/PlayIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { ExpandIcon } from './icons/ExpandIcon';
import { BouncingDotsLoader } from './BouncingDotsLoader';

interface VideoPlayerProps {
  poster: string;
  manualSrc?: string; 
  tmdbId?: string;    
  type?: string;      
  season?: number;    
  episode?: number;   
  ads?: any[];
  adsEnabled?: boolean;
  title?: string;
  onClose?: () => void;
}

const RotateIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const VideoPlayer: React.FC<VideoPlayerProps> = ({ poster, manualSrc, tmdbId, type, season, episode, title, onClose }) => {
  // Logic states
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [activeServerType, setActiveServerType] = useState<string>('server1'); 
  const [activeSource, setActiveSource] = useState<string | undefined>(undefined);
  const isEpisodic = type === 'series' || type === 'program';

  // Custom UI States
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('تلقائي');
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New States for Skip Indicators
  const [showForwardIndicator, setShowForwardIndicator] = useState(false);
  const [showBackwardIndicator, setShowBackwardIndicator] = useState(false);
  const forwardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backwardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  const qualities = [
    { id: 'full-hd', label: 'Full HD', sub: 'اشترك للتفعيل', disabled: true },
    { id: 'high', label: 'جودة عالية', value: '1080p' },
    { id: 'medium', label: 'جودة متوسطة', value: '720p' },
    { id: 'low', label: 'جودة منخفضة', value: '480p' },
    { id: 'auto', label: 'تلقائي', value: 'تلقائي' }
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  useEffect(() => {
    let finalUrl = manualSrc;
    let shouldUseIsolation = false;
    let loadingTimeout: NodeJS.Timeout;

    setActiveSource(undefined);

    if (!finalUrl || finalUrl.trim() === '') {
        if (tmdbId) {
            let domain = 'https://vidsrc.xyz/embed'; 
            if (activeServerType === 'server2') domain = 'https://vidsrc.vip/embed';
            if (activeServerType === 'server3') domain = 'https://www.2embed.cc/embed';

            if (activeServerType === 'server3') {
                 finalUrl = (type === 'movie' || type === 'video.movie')
                    ? `https://www.2embed.cc/embed/${tmdbId}`
                    : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season || 1}&e=${episode || 1}`;
            } else {
                finalUrl = (type === 'movie' || type === 'video.movie')
                    ? `${domain}/movie/${tmdbId}`
                    : `${domain}/tv/${tmdbId}/${season || 1}/${episode || 1}`;
            }
            shouldUseIsolation = true;
        }
    }

    if (finalUrl && finalUrl.trim() !== '') {
        setIsServerLoading(true);
        if (shouldUseIsolation) {
            const encodedUrl = encodeURIComponent(finalUrl);
            setActiveSource(`/embed.html?url=${encodedUrl}`);
        } else {
            setActiveSource(finalUrl);
        }
        
        // Force hide loading overlay quickly to prevent blocking the player, especially on mobile
        loadingTimeout = setTimeout(() => {
            setIsServerLoading(false);
        }, 100);
    } else {
        setActiveSource(undefined);
        setIsServerLoading(false);
    }

    return () => {
        if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [manualSrc, tmdbId, type, season, episode, activeServerType]);

  const isDirectVideo = useMemo(() => {
    if (!activeSource) return false;
    const cleanUrl = activeSource.split('?')[0].toLowerCase();
    const videoExtensions = ['.mp4', '.m3u8', '.ogg', '.webm', '.ts', '.mov']; 
    return videoExtensions.some(ext => cleanUrl.endsWith(ext));
  }, [activeSource]);

  // Handle HLS (.m3u8) Playback setup and cleanup
  useEffect(() => {
    let hls: Hls | null = null;
    const videoElement = videoRef.current;

    if (activeSource && isDirectVideo && activeSource.toLowerCase().includes('.m3u8') && videoElement) {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(activeSource);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (videoElement.duration) {
            setDuration(videoElement.duration);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                break;
            }
          }
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native fallback (Safari/iOS)
        videoElement.src = activeSource;
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [activeSource, isDirectVideo]);

  const skip = (seconds: number) => {
    if (isSettingsOpen) return;
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      
      // Trigger Indicators
      if (seconds > 0) {
        setShowForwardIndicator(true);
        if (forwardTimeoutRef.current) clearTimeout(forwardTimeoutRef.current);
        forwardTimeoutRef.current = setTimeout(() => setShowForwardIndicator(false), 800);
      } else {
        setShowBackwardIndicator(true);
        if (backwardTimeoutRef.current) clearTimeout(backwardTimeoutRef.current);
        backwardTimeoutRef.current = setTimeout(() => setShowBackwardIndicator(false), 800);
      }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSettingsOpen) return; 

    // منطق النقر المنفرد على الجوانب للتقديم والتأخير
    if (isDirectVideo && videoRef.current && containerRef.current && e) {
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        
        if (clickX < width * 0.3) {
            skip(-10);
            return;
        } else if (clickX > width * 0.7) {
            skip(10);
            return;
        }
    }

    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch((error: any) => {
          if (error.name !== 'AbortError') {
            console.debug('Playback prevented:', error);
          }
        });
      } else {
        setIsPlaying(true);
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsServerLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateVolume(val);
  };

  const updateVolume = (val: number) => {
    const newVolume = Math.max(0, Math.min(1, val));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (videoRef.current) {
      videoRef.current.muted = newMute;
    }
  };

  const toggleFullscreen = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    
    try {
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
            if (containerRef.current.requestFullscreen) {
                await containerRef.current.requestFullscreen();
            } else if ((containerRef.current as any).webkitRequestFullscreen) {
                (containerRef.current as any).webkitRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            }
            setIsFullscreen(false);
        }
    } catch (err: any) {
        console.error(`Error toggling fullscreen: ${err.message}`);
    }
  };

  const toggleLandscape = async (e: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        // Normal Fullscreen Request
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((videoRef.current as any)?.webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
          return;
        }

        // Attempt to lock orientation to landscape
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (err) {
            console.log('Screen orientation lock not supported or failed');
          }
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
        
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
        setIsFullscreen(false);
      }
    } catch (err: any) {
      console.error('Fullscreen Error:', err);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSettingsOpen) return;
    toggleFullscreen(e);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) setShowControls(false);
    }, 3000);
  };

  // --- KEYBOARD SHORTCUTS LOGIC ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        
        if (!isDirectVideo) return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                handleMouseMove();
                break;
            case 'ArrowRight':
                e.preventDefault();
                skip(10);
                handleMouseMove();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                skip(-10);
                handleMouseMove();
                break;
            case 'ArrowUp':
                e.preventDefault();
                updateVolume(volume + 0.1);
                handleMouseMove();
                break;
            case 'ArrowDown':
                e.preventDefault();
                updateVolume(volume - 0.1);
                handleMouseMove();
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                handleMouseMove();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                handleMouseMove();
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirectVideo, isPlaying, volume, isMuted, isSettingsOpen]);

  // --- ICONS ---
  const RewindIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="15" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">10</text></svg>
  );
  const ForwardIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="15" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">10</text></svg>
  );
  const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 md:w-6 md:h-6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  );

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef}
        className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl relative video-player-wrapper group border border-gray-800"
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
      >
        {/* Server Loading Overlay */}
        {isServerLoading && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black">
                <div className="mb-4">
                    <BouncingDotsLoader size="md" colorClass="bg-[#00cba9]" delayMs={0} />
                </div>
                <p className="text-white font-bold text-lg animate-pulse font-['Cairo']">جاري تحميل السيرفر يرجى الانتظار</p>
            </div>
        )}

        {/* Buffering Spinner */}
        {isBuffering && !isServerLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <BouncingDotsLoader size="lg" colorClass="bg-[#00cba9]" delayMs={0} />
            </div>
        )}

        {/* Skip Visual Indicators Overlays */}
        <div className="absolute inset-0 z-[90] flex pointer-events-none select-none">
            {/* Forward Indicator */}
            <div className="flex-1 flex items-center justify-center">
                <div className={`transition-all duration-300 transform bg-black/40 backdrop-blur-md p-6 rounded-full flex flex-col items-center gap-1 ${showForwardIndicator ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
                    <ForwardIcon />
                    <span className="text-white font-black text-sm">10+</span>
                </div>
            </div>
            {/* Backward Indicator */}
            <div className="flex-1 flex items-center justify-center">
                <div className={`transition-all duration-300 transform bg-black/40 backdrop-blur-md p-6 rounded-full flex flex-col items-center gap-1 ${showBackwardIndicator ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
                    <RewindIcon />
                    <span className="text-white font-black text-sm">10-</span>
                </div>
            </div>
        </div>

        {activeSource && (
            <div className="absolute inset-0 z-10">
                {isDirectVideo ? (
                    <div className="relative w-full h-full" onClick={togglePlay}>
                        <video
                            ref={videoRef}
                            key={activeSource} 
                            poster={poster}
                            className="w-full h-full bg-black object-contain"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onWaiting={() => setIsBuffering(true)}
                            onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            playsInline
                        >
                            {!activeSource.toLowerCase().includes('.m3u8') && (
                                <source src={activeSource} type="video/mp4" />
                            )}
                        </video>

                        <div className={`absolute inset-0 z-50 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${showControls || isSettingsOpen ? 'opacity-100' : 'opacity-0'}`} 
                             style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.9) 100%)' }}>
                            
                            {/* Top Bar - Info */}
                            <div className="flex items-start justify-between p-4 md:p-6 pointer-events-auto relative h-16 md:h-20">
                                <div className="w-8 md:w-10"></div> 
                                <div className="flex flex-col items-center text-center px-4 overflow-hidden">
                                    <h2 className="text-sm md:text-xl font-black text-white drop-shadow-lg font-['Cairo'] truncate w-full">{title || "اسم العمل"}</h2>
                                    <span className="text-[10px] md:text-xs text-gray-300 font-bold opacity-80 font-['Cairo']">{isEpisodic ? `الموسم ${season || 1}: الحلقة ${episode || 1}` : ""}</span>
                                </div>
                                <div className="w-8 md:w-10"></div> 
                            </div>

                            {/* Blocking Layer */}
                            {isSettingsOpen && (
                                <div 
                                    className="absolute inset-0 z-[150] bg-black/5 pointer-events-auto cursor-default"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSettingsOpen(false);
                                    }}
                                />
                            )}

                            {/* Middle Play Button */}
                            {!isPlaying && !isBuffering && !isSettingsOpen && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                                        <PlayIcon className="w-8 h-8 md:w-10 md:h-10 text-white translate-x-1" />
                                    </div>
                                </div>
                            )}

                            {/* Bottom Controls Area */}
                            <div className="p-4 md:p-6 space-y-3 md:space-y-4 pointer-events-auto" onClick={e => e.stopPropagation()} dir="ltr">
                                {/* Quality Menu */}
                                {isSettingsOpen && (
                                    <div className="absolute bottom-16 md:bottom-20 right-4 z-[200] w-56 md:w-64 bg-[#0a0c10]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up pointer-events-auto">
                                        <div className="bg-white/5 py-3 md:py-4 text-center border-b border-white/10">
                                            <span className="text-sm md:text-lg font-black text-white font-['Cairo'] tracking-wide">الجودة</span>
                                        </div>
                                        <div className="flex flex-col">
                                            {qualities.map((q) => (
                                                <button 
                                                    key={q.id}
                                                    disabled={(q as any).disabled}
                                                    onClick={() => { if(!(q as any).disabled) { setSelectedQuality(q.label); setIsSettingsOpen(false); } }}
                                                    className={`group relative py-2.5 md:py-3 px-4 md:px-6 text-center border-b border-white/5 last:border-0 transition-all hover:bg-white/5 flex flex-col items-center justify-center
                                                        ${(q as any).disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                                        ${selectedQuality === q.label ? 'text-[#00cba9]' : 'text-white'}
                                                    `}
                                                >
                                                    <div className="flex items-center justify-center gap-3 w-full">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-sm md:text-base font-bold font-['Cairo'] ${selectedQuality === q.label ? 'text-[#00cba9]' : ''}`}>{q.label}</span>
                                                            {(q as any).sub && (
                                                                <span className="text-[8px] md:text-[10px] text-gray-400 font-['Cairo'] mt-0.5">{(q as any).sub}</span>
                                                            )}
                                                        </div>
                                                        {selectedQuality === q.label && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00cba9]">
                                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Progress Bar */}
                                <div className="relative h-1 md:h-1.5 flex items-center group/progress cursor-pointer">
                                    <div className="absolute w-full h-full bg-white/20 rounded-full"></div>
                                    <div 
                                        className="absolute h-full bg-[#00cba9] rounded-full flex items-center justify-end"
                                        style={{ width: `${(currentTime/duration)*100}%` }}
                                    >
                                        <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-white rounded-full shadow-xl border border-gray-400 absolute right-0 translate-x-1/2 scale-100 md:scale-0 md:group-hover/progress:scale-100 transition-transform"></div>
                                    </div>
                                    <input 
                                        type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    {/* Left Group */}
                                    <div className="flex items-center gap-2 md:gap-6 w-fit md:w-1/3">
                                        <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform shrink-0">
                                            {isPlaying ? (
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-10 md:h-10"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                            ) : (
                                                <PlayIcon className="w-6 h-6 md:w-10 md:h-10" />
                                            )}
                                        </button>
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <button onClick={() => skip(-10)} className="text-white hover:text-[#00cba9] transition-colors shrink-0"><RewindIcon /></button>
                                            <button onClick={() => skip(10)} className="text-white hover:text-[#00cba9] transition-colors shrink-0"><ForwardIcon /></button>
                                        </div>
                                        
                                        <div 
                                            className="hidden md:flex items-center gap-2 group/volume relative"
                                            onMouseEnter={() => setIsVolumeHovered(true)}
                                            onMouseLeave={() => setIsVolumeHovered(false)}
                                        >
                                            <button onClick={() => toggleMute()} className="text-white hover:text-[#00cba9] transition-colors z-10">
                                                <SpeakerIcon isMuted={isMuted} className="w-7 h-7" />
                                            </button>
                                            <div className={`flex items-center relative transition-all duration-300 ease-in-out overflow-visible ${isVolumeHovered ? 'w-24 opacity-100 ml-2' : 'w-0 opacity-0 ml-0'}`}>
                                                <div className="absolute w-full h-1 bg-white/20 rounded-full"></div>
                                                <div 
                                                    className="absolute h-1 bg-[#00cba9] rounded-full flex items-center justify-end" 
                                                    style={{ width: `${volume * 100}%` }}
                                                >
                                                    <div className="w-3 h-3 bg-white rounded-full shadow-lg border border-gray-400 translate-x-1/2"></div>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                                                    className="relative w-full h-4 opacity-0 cursor-pointer z-20" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Time */}
                                    <div className="flex-1 flex justify-center items-center">
                                        <span className="text-[10px] md:text-base font-mono font-bold tracking-tighter opacity-90 text-white drop-shadow whitespace-nowrap" dir="ltr">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                    </div>

                                    {/* Right Group */}
                                    <div className="flex items-center justify-end gap-2 md:gap-6 w-fit md:w-1/3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
                                            className={`text-white hover:text-[#00cba9] transition-all transform shrink-0 ${isSettingsOpen ? 'rotate-90 text-[#00cba9]' : 'rotate-0'}`}
                                            title="جودة المشاهدة"
                                        >
                                            <SettingsIcon />
                                        </button>
                                        <button onClick={toggleLandscape} className="text-white hover:scale-110 transition-transform shrink-0"><ExpandIcon className="w-6 h-6 md:w-7 md:h-7" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <iframe
                        key={activeSource}
                        src={activeSource}
                        allowFullScreen
                        loading="eager" 
                        referrerPolicy="no-referrer" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        className="w-full h-full border-none" 
                        title="Cinematix Player"
                        onLoad={() => setIsServerLoading(false)}
                    />
                )}
            </div>
        )}
      </div>

      {!manualSrc && tmdbId && (
        <div className="flex flex-wrap gap-2 justify-center bg-gray-900/50 p-3 md:p-4 rounded-2xl border border-white/5 animate-fade-in-up" dir="rtl">
          <span className="text-[10px] md:text-xs text-gray-400 self-center ml-1 md:ml-2 font-black uppercase tracking-widest font-['Cairo']">سيرفرات تلقائية</span>
          {[
              { id: 'server1', label: 'VidSrc (XYZ)', color: 'bg-blue-600' },
              { id: 'server2', label: 'Cinematix VIP', color: 'bg-purple-600' },
              { id: 'server3', label: '2Embed (Backup)', color: 'bg-green-600' }
          ].map(srv => (
            <button 
                key={srv.id}
                onClick={() => setActiveServerType(srv.id)}
                className={`px-3 py-1.5 md:px-5 md:py-2 text-[10px] md:text-xs rounded-xl transition-all font-black font-['Cairo'] ${activeServerType === srv.id ? `${srv.color} text-white shadow-xl scale-105` : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
                {srv.label}
            </button>
          ))}
        </div>
      )}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid #00cba9;
            box-shadow: 0 0 10px rgba(0,203,169,0.4);
        }
        @media (max-width: 768px) {
            input[type=range]::-webkit-slider-thumb {
                width: 12px;
                height: 12px;
            }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;