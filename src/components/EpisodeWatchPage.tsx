
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Content, Episode, Server, Ad, View, Person } from '../types';
import { ContentType } from '../types';
import VideoPlayer from './VideoPlayer';
import AdPlacement from './AdPlacement';
import { PlayIcon } from './icons/PlayIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronRightIcon } from './icons/ChevronRight';
import { ClockIcon } from './icons/ClockIcon';
import SEO from './SeoMeta';
import AdWaiterModal from './AdWaiterModal';
import { BouncingDotsLoader } from './BouncingDotsLoader';
import ReportModal from './ReportModal';
import { getPeople } from '../firebase';
import { StarIcon } from './icons/StarIcon';

interface EpisodeWatchPageProps {
    content: Content;
    seasonNumber: number;
    episodeNumber: number;
    allContent: Content[];
    onSetView: (view: View, category?: string, params?: any) => void;
    onGoBack: (fallbackView: View) => void;
    isAdmin: boolean;
    ads: Ad[];
    adsEnabled: boolean;
    isRamadanTheme?: boolean;
    isEidTheme?: boolean;
    isCosmicTealTheme?: boolean;
    isNetflixRedTheme?: boolean;
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

const EpisodeWatchPage: React.FC<EpisodeWatchPageProps> = ({
    content,
    seasonNumber,
    episodeNumber,
    onSetView,
    onGoBack,
    isAdmin,
    ads,
    adsEnabled,
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme
}) => {
    const isBasicLoaded = !!content && !!content.id;
    const isEpisodic = content?.type === ContentType.Series || content?.type === ContentType.Program;
    const [people, setPeople] = useState<Person[]>([]);

    useEffect(() => {
        getPeople().then(setPeople);
    }, []);

    const currentSeason = useMemo(() => 
        content?.seasons?.find(s => s.seasonNumber === seasonNumber), 
    [content?.seasons, seasonNumber]);

    const selectedEpisode = useMemo(() => {
        if (!currentSeason?.episodes) return null;
        
        // Block access to upcoming seasons for non-admins
        if (!isAdmin && (currentSeason.isUpcoming || currentSeason.status === 'coming_soon')) return null;

        if (episodeNumber > 0 && episodeNumber <= currentSeason.episodes.length) {
            const ep = currentSeason.episodes[episodeNumber - 1];
            
            // تحقق من الجدولة
            if (!isAdmin && ep.isScheduled && ep.scheduledAt) {
                const now = new Date();
                if (now < new Date(ep.scheduledAt)) {
                    return null; // الحلقة غير منشورة بعد
                }
            }
            return ep;
        }
        return null;
    }, [currentSeason, episodeNumber, isAdmin]);

    const flipBackdrop = currentSeason?.flipBackdrop ?? content?.flipBackdrop ?? false;
    const displayBackdrop = currentSeason?.backdrop || content?.backdrop || '';
    const displayDescription = currentSeason?.description || content?.description || '';

    const canonicalUrl = isEpisodic ? `/watch/${content?.slug || content?.id}/الموسم${seasonNumber}/الحلقة${episodeNumber}` : `/watch/movie/${content?.slug || content?.id}`;

    const activeServers = useMemo(() => {
        const servers = selectedEpisode?.servers || [];
        return servers.filter(s => s.url && s.url.trim().length > 0);
    }, [selectedEpisode]);

    const [selectedServer, setSelectedServer] = useState<Server | null>(null);
    const [playerKey, setPlayerKey] = useState(0); 

    useEffect(() => {
        if (activeServers.length > 0) {
            const defaultServer = activeServers.find(s => s.isActive) || activeServers[0];
            setSelectedServer(defaultServer);
        }
    }, [activeServers]);

    // تأكيد جاهزية الصفحة كاملة: يجب توفر المحتوى والسيرفر النشط
    const isFullyReady = isBasicLoaded && !!selectedServer && !!selectedEpisode;

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDownloadErrorOpen, setIsDownloadErrorOpen] = useState(false);

    const accentColor = isRamadanTheme ? 'text-[#FFD700]' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
    const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'bg-[#00A7F8]';

    const handleDownload = () => {
        const episodeServers = selectedEpisode?.servers || [];
        const hasDownloadLinks = episodeServers.some(s => s.downloadUrl && s.downloadUrl.trim().length > 0);

        if (!hasDownloadLinks) {
            setIsDownloadErrorOpen(true);
            return;
        }

        onSetView('download', undefined, { 
            content: content,
            season: seasonNumber,
            episode: episodeNumber
        });
    };

    const cropStyle: React.CSSProperties = {
      '--mob-x': `${currentSeason?.mobileCropPositionX ?? currentSeason?.mobileCropPosition ?? content?.mobileCropPositionX ?? content?.mobileCropPosition ?? 50}%`,
      '--mob-y': `${currentSeason?.mobileCropPositionY ?? currentSeason?.mobileCropPositionY ?? content?.mobileCropPositionY ?? 50}%`,
      transform: flipBackdrop ? 'scaleX(-1)' : 'none'
    } as React.CSSProperties;

    const enableCrop = currentSeason?.enableMobileCrop ?? content?.enableMobileCrop ?? false;

    // إذا لم يتم العثور على الحلقة (مجدولة) يتم عرض رسالة "غير متاحة"
    if (isBasicLoaded && !selectedEpisode && !isAdmin) {
        return (
            <div className="min-h-screen bg-[var(--bg-body)] text-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
                    <ClockIcon className="w-12 h-12 text-amber-500" />
                </div>
                <h1 className="text-2xl md:text-4xl font-black mb-4">هذه الحلقة غير متاحة حالياً</h1>
                <p className="text-gray-400 max-w-md mx-auto mb-8">عذراً، الحلقة التي تحاول الوصول إليها مجدولة للنشر في وقت لاحق. يرجى العودة لاحقاً للمشاهدة.</p>
                <button onClick={() => onGoBack('detail')} className={`px-8 py-3 rounded-full font-bold ${bgAccent} text-black active:scale-95 transition-all shadow-lg`}>العودة للتفاصيل</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-body)] text-white pb-20 animate-fade-in-up relative overflow-x-hidden overflow-y-auto">
            <SEO 
                type={isEpisodic ? "series" : "movie"} 
                title={content?.title} 
                seasonNumber={seasonNumber}
                episodeNumber={episodeNumber}
                description={selectedEpisode?.description || currentSeason?.description || content?.description} 
                keywords="سينماتيكس, cinematix, cinematics, مشاهدة حلقة, مسلسل, مشاهدة اونلاين"
                image={selectedEpisode?.thumbnail || currentSeason?.poster || content?.poster}
                // Corrected: canonicalPath -> canonicalUrl
                url={canonicalUrl}
            />

            <div className="sticky top-0 z-50 bg-[var(--bg-body)]/95 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4 w-full">
                    <button onClick={() => onGoBack('detail')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ChevronRightIcon className="w-5 h-5 transform rotate-180 text-white" />
                    </button>
                    <div className="flex flex-col min-w-0 items-start">
                        {isFullyReady ? (
                            <>
                                <h1 className="text-sm md:text-base font-bold text-gray-200 truncate">{content.title}</h1>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] md:text-xs font-bold ${accentColor}`}>الموسم {seasonNumber} | الحلقة {episodeNumber}</span>
                                    {(() => {
                                        if (!selectedEpisode) return null;
                                        const badges = [];
                                        if (selectedEpisode.isLastEpisode) {
                                            badges.push({ text: 'الحلقة الأخيرة', type: 'last' });
                                        }
                                        if (selectedEpisode.badgeText) {
                                            const customBadges = selectedEpisode.badgeText.split(',').map((b: string) => b.trim()).filter(Boolean);
                                            customBadges.forEach((b: string) => {
                                                if (b.toUpperCase() === 'VIP') badges.push({ text: 'VIP', type: 'vip' });
                                                else if (b === 'حصري') badges.push({ text: 'حصري', type: 'exclusive' });
                                                else if (b === 'جديد') badges.push({ text: 'جديد', type: 'new' });
                                                else if (b === 'قريباً') badges.push({ text: 'قريباً', type: 'soon' });
                                                else if (b === 'مترجم') badges.push({ text: 'مترجم', type: 'translated' });
                                                else badges.push({ text: b, type: 'custom' });
                                            });
                                        }
                                        
                                        return badges.map((badge, idx) => {
                                            let badgeClasses = "";
                                            switch (badge.type) {
                                                case 'last': badgeClasses = "bg-red-600/20 text-red-500 border border-red-500/30"; break;
                                                case 'vip': badgeClasses = "bg-yellow-600/20 text-yellow-500 border border-yellow-500/30"; break;
                                                case 'exclusive': badgeClasses = "bg-orange-600/20 text-orange-400 border border-orange-500/30"; break;
                                                case 'new': badgeClasses = "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"; break;
                                                case 'soon': badgeClasses = "bg-purple-600/20 text-purple-400 border border-purple-500/30"; break;
                                                case 'translated': badgeClasses = "bg-slate-600/20 text-slate-400 border border-slate-500/30"; break;
                                                default: badgeClasses = "bg-amber-600/20 text-amber-500 border border-amber-500/30"; break;
                                            }
                                            return (
                                                <span key={idx} className={`${badgeClasses} text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-md ${badge.type === 'last' ? 'animate-pulse' : ''}`}>
                                                    {badge.text}
                                                </span>
                                            );
                                        });
                                    })()}
                                    {selectedEpisode?.isScheduled && isAdmin && (
                                        <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full">معاينة (مجدولة)</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="w-32 md:w-48 h-4 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                                <div className="w-20 md:w-32 h-3 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-0 pt-6 text-center">
                
                <div className="w-full mb-6">
                    <div className="flex items-center justify-start md:justify-start gap-3 overflow-x-auto no-scrollbar pb-3">
                        <span className="text-sm text-gray-400 font-black ml-2 whitespace-nowrap">سيرفر المشاهدة:</span>
                        {isFullyReady && activeServers.length > 0 ? activeServers.map((server, idx) => (
                            <button key={server.id} onClick={() => setSelectedServer(server)} className={`flex-shrink-0 px-8 py-3 rounded-2xl font-black text-sm transition-all border target-server-btn ${selectedServer?.id === server.id ? `${bgAccent} text-black border-transparent shadow-[0_0_20px_var(--shadow-color)] scale-105` : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-800 hover:border-gray-600'}`}>
                                سيرفر {idx + 1}
                            </button>
                        )) : (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-12 w-28 bg-gray-800/40 rounded-2xl skeleton-shimmer border border-white/5 flex-shrink-0"></div>
                            ))
                        )}
                    </div>
                </div>

                {/* Video Container - لا يظهر إلا عند جاهزية السيرفر الأول */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5 z-10 mx-auto video-player-wrapper">
                    {isFullyReady ? (
                        <VideoPlayer 
                            key={playerKey}
                            tmdbId={content.id} 
                            type={content.type} 
                            season={seasonNumber} 
                            episode={episodeNumber} 
                            manualSrc={selectedServer?.url} 
                            poster={selectedEpisode?.thumbnail || displayBackdrop} 
                            title={content.title}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[#0f1014] skeleton-shimmer flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <BouncingDotsLoader size="lg" delayMs={300} colorClass="bg-[#00cba9]" />
                                <span className="text-gray-400 font-bold text-sm animate-pulse">جاري تأمين اتصال السيرفر...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-5 relative flex flex-col items-center gap-2 animate-fade-in-up">
                    <div className="flex justify-center w-full">
                        {isFullyReady && selectedEpisode?.servers.some(s => s.downloadUrl && s.downloadUrl.trim().length > 0) && (
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
                                        ? "bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-black" 
                                        : isEidTheme 
                                            ? "bg-gradient-to-r from-purple-800 to-purple-500 text-white" 
                                            : "bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-black"
                                    }
                                `}
                            >
                                <DownloadIcon className="h-5 w-5 md:w-6 md:h-6 fill-current" />
                                <span>تحميل الآن</span>
                            </button>
                        )}
                    </div>

                    <div className="w-full flex justify-center md:justify-start">
                        <button 
                            onClick={() => setIsReportModalOpen(true)} 
                            className="px-4 py-1.5 rounded-lg text-red-500/60 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center shrink-0"
                        >
                            <span className="text-xs font-bold">⚠️ إبلاغ عن عطل</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center md:items-start gap-6 text-center md:text-right">
                    {isFullyReady ? (
                        <div className="space-y-6 w-full">
                            <div className="flex justify-center md:justify-between items-start">
                                <h2 className="text-2xl font-bold text-white text-center md:text-right">{selectedEpisode?.title || `الحلقة ${episodeNumber}`}</h2>
                            </div>
                            <p className="text-sm text-gray-400 max-w-3xl leading-loose mx-auto md:mx-0">{selectedEpisode?.description || displayDescription}</p>
                            
                            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-xl max-w-4xl mt-4 mx-auto md:mx-0">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap divide-x divide-y md:divide-y-0 divide-white/10 rtl:divide-x-reverse">
                                    <div className="p-4 flex flex-col items-center md:items-start gap-1 flex-1 min-w-[120px]">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">سنة العرض</span>
                                        <span className="text-white font-black text-sm md:text-base">{currentSeason?.releaseYear || content.releaseYear}</span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center md:items-start gap-1 flex-1 min-w-[120px]">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">مدة الحلقة</span>
                                        <span className="text-white font-black text-sm md:text-base" dir="ltr">{selectedEpisode?.duration || '45m+'}</span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center md:items-start gap-1 flex-1 min-w-[120px]">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">التصنيف</span>
                                        <div className="w-fit border border-gray-600 rounded px-1.5 py-0.5 text-[10px] font-black text-gray-200">{content.ageRating}</div>
                                    </div>
                                    <div className="p-4 flex flex-col items-center md:items-start gap-1 flex-1 min-w-[120px]">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">التقييم</span>
                                        <div className="flex items-center gap-1.5 text-yellow-500">
                                            <StarIcon className="w-3 h-3" />
                                            <span className="font-black text-sm md:text-base">{(Number(content.rating) || 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 w-full">
                            <div className="w-64 h-8 bg-gray-800/40 rounded skeleton-shimmer border border-white/5 mx-auto md:mx-0"></div>
                            <div className="space-y-2">
                                <div className="w-full h-4 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                                <div className="w-3/4 h-4 bg-gray-800/40 rounded skeleton-shimmer border border-white/5"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReportModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                contentId={content?.id} 
                contentTitle={content?.title} 
                episode={`الموسم ${seasonNumber} الحلقة ${episodeNumber}`}
                isCosmicTealTheme={isCosmicTealTheme}
                isNetflixRedTheme={isNetflixRedTheme}
            />
        </div>
    );
};

export default EpisodeWatchPage;
