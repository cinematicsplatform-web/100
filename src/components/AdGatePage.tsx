
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Content, Ad, View } from '../types';
import AdPlacement from './AdPlacement';
import { PlayIcon } from './icons/PlayIcon';
import { ChevronRightIcon } from './icons/ChevronRight';
import { BouncingDotsLoader } from './BouncingDotsLoader';

interface AdGatePageProps {
    content: Content;
    targetView: View;
    onDone: () => void;
    onCancel: () => void;
    ads: Ad[];
    adsEnabled: boolean;
    isRamadanTheme?: boolean;
    isEidTheme?: boolean;
    isCosmicTealTheme?: boolean;
    isNetflixRedTheme?: boolean;
}

const AdGatePage: React.FC<AdGatePageProps> = ({ 
    content, 
    onDone, 
    onCancel, 
    ads, 
    adsEnabled,
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme
}) => {
    // العثور على الإعلان النشط في مكان البريرول للحصول على الإعدادات الخاصة به
    const activePrerollAd = useMemo(() => {
        return ads.find(a => a.placement === 'watch-preroll' && (a.status === 'active' || a.isActive === true));
    }, [ads]);

    // الحصول على المدة المحددة من لوحة التحكم أو استخدام 15 ثانية كخيار افتراضي
    const configuredDuration = activePrerollAd?.timerDuration !== undefined ? activePrerollAd.timerDuration : 15;

    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [timeLeft, setTimeLeft] = useState(configuredDuration);
    const [canProceed, setCanProceed] = useState(false);
    const [isVastAd, setIsVastAd] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<any>(null);

    // تحديث timeLeft إذا تغير الإعلان المكتشف أو إعداداته
    useEffect(() => {
        if (!isWatchingAd) {
            setTimeLeft(configuredDuration);
        }
    }, [configuredDuration, isWatchingAd]);

    // تحقق مما إذا كان الإعلان عبارة عن رابط VAST (عادة يبدأ بـ http وينتهي بـ xml أو يتم تعريفه في الحقل code)
    useEffect(() => {
        if (activePrerollAd && activePrerollAd.code) {
            const code = activePrerollAd.code.trim();
            if (code.startsWith('http') && (code.includes('vast') || code.includes('xml'))) {
                setIsVastAd(true);
            } else {
                setIsVastAd(false);
            }
        }
    }, [activePrerollAd]);

    // تهيئة مشغل VAST عند بدء المشاهدة
    useEffect(() => {
        if (isWatchingAd && isVastAd && videoRef.current && activePrerollAd?.code) {
            const videoElement = videoRef.current;
            // @ts-ignore
            const videojs = window.videojs;
            
            if (videojs) {
                // تدمير المشغل القديم إن وجد
                if (playerRef.current) {
                    playerRef.current.dispose();
                }

                const player = videojs(videoElement, {
                    autoplay: true,
                    muted: false,
                    controls: true,
                    fluid: true
                });
                
                playerRef.current = player;

                const options = {
                    adTagUrl: activePrerollAd.code.trim(),
                    showCountdown: true,
                };

                // تهيئة IMA
                player.ima(options);

                // الاستماع لأحداث الإعلان
                player.on('ads-ad-started', () => {
                    console.log('VAST Ad Started');
                });

                player.on('ads-all-ads-completed', () => {
                    console.log('VAST All Ads Completed');
                    setCanProceed(true);
                    onDone(); // فتح المحتوى تلقائياً عند انتهاء الإعلان
                });

                player.on('ads-error', (event: any) => {
                    console.error('VAST Ad Error:', event);
                    // في حال الخطأ، نفتح المحتوى لضمان عدم توقف المستخدم
                    setCanProceed(true);
                    onDone();
                });

                // في حال انتهاء الفيديو الأساسي (إذا لم يبدأ الإعلان أو انتهى)
                player.on('ended', () => {
                    setCanProceed(true);
                    onDone();
                });

                // طلب الإعلانات وبدء التشغيل
                player.ima.initializeAdDisplayContainer();
                player.ima.requestAds();
                const playPromise = player.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error: any) => {
                        if (error.name !== 'AbortError') {
                            console.debug('VAST Ad Play Error:', error);
                        }
                    });
                }
            }
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [isWatchingAd, isVastAd, activePrerollAd]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        // إذا لم يكن إعلان VAST، نستخدم العداد الزمني التقليدي
        if (isWatchingAd && !isVastAd && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanProceed(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (isWatchingAd && !isVastAd && timeLeft === 0) {
            setCanProceed(true);
        }
        return () => clearInterval(timer);
    }, [isWatchingAd, isVastAd, timeLeft]);

    const handleWatchAd = () => {
        setIsWatchingAd(true);
        if (!isVastAd && configuredDuration <= 0) {
            setCanProceed(true);
            setTimeLeft(0);
        }
    };

    const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
    const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'bg-[#00A7F8]';
    const ringStroke = isRamadanTheme ? '#f59e0b' : isEidTheme ? '#a855f7' : isCosmicTealTheme ? '#35f18b' : isNetflixRedTheme ? '#e50914' : '#00a7f8';

    return (
        /* الحاوية الرئيسية: ثابتة، تمنع التمرير، خلفية سادة من هوية الموقع */
        <div className="fixed inset-0 w-full h-full bg-[var(--bg-body)] flex flex-col items-center justify-center p-4 md:p-8 z-[5000] overflow-hidden animate-fade-in touch-none select-none" dir="rtl">
            
            {/* طبقة حماية إضافية لضمان الخلفية السادة ومنع العناصر الخلفية من الظهور */}
            <div className="absolute inset-0 bg-[var(--bg-body)] z-0"></div>

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                
                {!isWatchingAd ? (
                    /* واجهة البداية: احترافية وبسيطة */
                    <div className="w-full space-y-10 animate-fade-in-up flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className={`absolute inset-0 ${bgAccent} opacity-20 blur-3xl rounded-full scale-150 group-hover:opacity-30 transition-opacity duration-700`}></div>
                            <div className="relative w-40 h-60 md:w-48 md:h-72 rounded-[2rem] overflow-hidden border-[6px] border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 hover:scale-105">
                                <img src={content.poster} className="w-full h-full object-cover" alt={content.title} />
                            </div>
                        </div>
                        
                        <div className="space-y-4 max-w-lg">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">جاهز للمشاهدة؟</h2>
                            <p className="text-gray-400 text-base md:text-xl leading-relaxed font-medium">
                                أنت على وشك الدخول لمشاهدة <span className={`${accentColor} font-bold`}>{content.title}</span>. 
                                <br className="hidden md:block" />
                                شاهد إعلاناً قصيراً لتفعيل رابط المشاهدة المجاني.
                            </p>
                        </div>

                        <div className="flex flex-col gap-5 w-full max-w-xs">
                            <button 
                                onClick={handleWatchAd}
                                className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-[0_15px_30px_rgba(0,0,0,0.3)] ${bgAccent} text-white`}
                            >
                                <PlayIcon className="w-6 h-6 fill-current" />
                                <span>تشغيل الإعلان</span>
                            </button>
                            <button 
                                onClick={onCancel}
                                className="flex items-center justify-center gap-2 text-gray-500 font-bold hover:text-white transition-colors py-2 text-sm group"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                                <span>إلغاء والعودة</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* واجهة العرض والعداد: مدمجة بالكامل في الصفحة */
                    <div className="w-full space-y-8 animate-fade-in flex flex-col items-center">
                        
                        {/* منطقة العداد الزمني - تصميم دائري احترافي (يظهر فقط إذا لم يكن VAST أو كإحتياطي) */}
                        {!isVastAd && (
                            <div className="flex flex-col items-center justify-center gap-4 mb-4">
                                <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
                                    <svg className="absolute w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(0,167,248,0.5)]">
                                        <circle cx="50%" cy="50%" r="44%" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                                        <circle 
                                            cx="50%" cy="50%" r="44%" stroke={ringStroke} strokeWidth="8" fill="transparent" 
                                            strokeDasharray="276"
                                            strokeDashoffset={276 - (276 * (configuredDuration - timeLeft)) / (configuredDuration || 1)}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 linear"
                                        />
                                    </svg>
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-3xl md:text-4xl font-black text-white font-mono leading-none">{timeLeft}</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">ثانية</span>
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">يتم الآن عرض الإعلان</h3>
                                    <p className="text-xs text-gray-500 font-bold">يرجى الانتظار حتى انتهاء العداد لتفعيل المشغل</p>
                                </div>
                            </div>
                        )}

                        {/* مساحة عرض الإعلان */}
                        <div className="w-full bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative min-h-[300px] flex items-center justify-center">
                             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
                             
                             {isVastAd ? (
                                <div className="w-full h-full relative z-10 vjs-container">
                                    <video 
                                        ref={videoRef} 
                                        className="video-js vjs-default-skin vjs-big-play-centered w-full h-full"
                                        playsInline
                                    ></video>
                                </div>
                             ) : (
                                <AdPlacement ads={ads} placement="watch-preroll" isEnabled={adsEnabled} className="m-0 relative z-10" />
                             )}
                             
                             {!adsEnabled && !isVastAd && (
                                <div className="flex flex-col items-center gap-4 text-center p-12 relative z-10">
                                    <BouncingDotsLoader size="lg" delayMs={0} colorClass="bg-[var(--color-accent)]" />
                                    <p className="text-gray-600 font-bold italic text-sm">جاري تحضير أفضل جودة بث لك...</p>
                                </div>
                             )}
                        </div>

                        {/* زر المتابعة: يظهر فقط عند انتهاء الوقت أو الإعلان */}
                        <div className="h-20 flex items-center justify-center w-full">
                            {canProceed && (
                                <button 
                                    onClick={onDone}
                                    className={`w-full max-w-xs py-5 rounded-[1.25rem] font-black text-xl animate-fade-in-up flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${bgAccent} text-white`}
                                >
                                    <span>اضغط للمتابعة الآن</span>
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .vjs-container { min-height: 350px; }
                .video-js .vjs-tech { position: relative !important; }
                .vjs-ad-container { direction: ltr !important; }
            `}} />
        </div>
    );
};

const ChevronLeftIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={props.className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

export default AdGatePage;
