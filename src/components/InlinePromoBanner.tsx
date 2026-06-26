import React from 'react';
// التعديل هنا: استيراد الواجهة الأصلية باسم مختلف لتوسيعها محلياً
import { PromotionalBanner as OriginalPromotionalBanner, Content, Episode } from '../types';
import { PlayIcon } from './icons/PlayIcon';

// إضافة المتغيرات الجديدة محلياً لتخطي خطأ Vercel
export interface PromotionalBanner extends OriginalPromotionalBanner {
    bannerType?: string;
    logoUrl?: string;
}

interface InlinePromoBannerProps extends PromotionalBanner {
    allContent?: Content[];
    onSelectContent?: (content: Content, seasonNumber?: number, episodeNumber?: number) => void;
}

const InlinePromoBanner: React.FC<InlinePromoBannerProps> = ({
    title, subtitle, backgroundImage, items, contentId, bannerType, logoUrl: manualLogoUrl, allContent, onSelectContent
}) => {
    let logoUrl = manualLogoUrl || '';
    let targetContent: Content | undefined;
    let displayItems = items || [];
    let displayBgImage = backgroundImage;
    let latestSeasonNumber = 1;

    if (contentId && allContent) {
        targetContent = allContent.find(c => c.id === contentId);
        if (targetContent) {
            displayBgImage = displayBgImage || targetContent.backdrop || targetContent.poster || '';
            logoUrl = logoUrl || targetContent.logoUrl || '';
            
            // Only auto-fill items if bannerType is NOT custom
            if (bannerType !== 'custom') {
                if (targetContent.type === 'series' || targetContent.type === 'program') {
                    const seasons = [...(targetContent.seasons || [])].sort((a,b) => b.seasonNumber - a.seasonNumber);
                    const latestSeason = seasons[0];
                    if (latestSeason) {
                        latestSeasonNumber = latestSeason.seasonNumber;
                        logoUrl = manualLogoUrl || latestSeason.logoUrl || targetContent.logoUrl || '';
                        if (latestSeason.backdrop && !backgroundImage) {
                            displayBgImage = latestSeason.backdrop;
                        }
                        if (latestSeason.episodes && latestSeason.episodes.length > 0) {
                            // التعديل 1 و 2: استخدام الاسم الفعلي للحلقة وإزالة الحد الأقصى .slice(0,10)
                            displayItems = latestSeason.episodes.map((ep: Episode, idx: number) => ({
                                title: ep.title || `الحلقة ${(ep as any).originalNumber || idx + 1}`,
                                description: ep.description || targetContent?.description || '',
                                thumbnail: ep.thumbnail || latestSeason.backdrop || targetContent?.backdrop || '',
                                duration: ep.duration || '',
                                videoUrl: ''
                            }));
                        }
                    }
                } else {
                    logoUrl = manualLogoUrl || targetContent.logoUrl || '';
                    displayItems = [{
                        title: targetContent.title,
                        description: targetContent.description || '',
                        thumbnail: targetContent.backdrop || targetContent.poster || '',
                        duration: targetContent.duration || '',
                        videoUrl: ''
                    }];
                }
            }
        }
    }

    // التعديل 3: مضاعفة الحلقات لعمل التمرير اللانهائي فقط إذا كان عدد الحلقات أكبر من 3
    const loopedItems = displayItems.length > 3 ? [...displayItems, ...displayItems] : displayItems;

    return (
        <div className="hidden lg:block relative w-full h-[650px] mb-12 rounded-xl group bg-[var(--bg-body)]">
            {/* Background context (Clipped) */}
            <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/5 pointer-events-none z-0">
                {/* Background Image - Occupies left side in RTL (right side in LTR), fading towards the text area */}
                <div className="absolute inset-y-0 ltr:right-0 rtl:left-0 w-[60%] select-none pointer-events-none">
               <img 
                   src={displayBgImage} 
                   alt={title} 
                   className="w-full h-full object-cover" 
               />
               <div className="absolute inset-0 bg-[var(--bg-body)] opacity-10 transform-gpu"></div>
               {/* Gradient to blend the image perfectly into the dark background on the text side */}
               <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-1/3 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-[var(--bg-body)] to-transparent"></div>
               <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-1/2 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-[var(--bg-body)] to-transparent opacity-50"></div>
            </div>
            
            {/* Extra gradient for text readability over the whole banner, ensuring no cut-offs */}
            <div className="absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-[var(--bg-body)] via-[var(--bg-body)]/60 to-transparent opacity-90 z-0 pointer-events-none w-1/2 ltr:left-0 rtl:right-0"></div>
            </div>

            {/* Content Container (Unclipped) */}
            <div className="absolute inset-0 flex flex-col px-12 pb-12 pt-8 z-10 w-full pointer-events-none">
                
                {/* اللوجو: تم إضافة my-auto لتوسيطه في المساحة الفارغة بين الأعلى والعنوان */}
                {logoUrl && (
                    <div className="w-1/2 rtl:text-right ltr:text-left relative z-20 pointer-events-auto my-auto">
                        <div className="max-w-[200px] inline-block">
                            <img src={logoUrl} alt="Logo" className="w-full h-auto drop-shadow-2xl object-contain rtl:object-right ltr:object-left" />
                        </div>
                    </div>
                )}

                {/* العنوان الرئيسي والفرعي: تم إضافة mt-auto لدفعهما للأسفل فوق الحلقات */}
                <div className="w-1/2 rtl:text-right ltr:text-left flex flex-col gap-4 relative z-20 pointer-events-auto mt-auto mb-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-xl">
                        {title}
                    </h2>
                    <p className="text-base lg:text-lg text-gray-300 font-medium drop-shadow-lg max-w-xl rtl:pr-2 ltr:pl-2">
                        {subtitle}
                    </p>
                </div>

                {/* Episodes Strip */}
                <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-4 pb-48 -mb-44 pt-16 -mt-16 px-12 -mx-12 snap-x relative z-30 justify-start h-auto items-end pointer-events-none">
                        {loopedItems.map((item, idx) => {
                            // حساب الاندكس الأصلي للحلقة حتى لو كانت مكررة في الدائرة اللانهائية
                            const originalIdx = idx % displayItems.length;

                            return (
                            <div 
                                key={`${item.title}-${idx}`} 
                                className="relative flex-none w-[300px] aspect-[16/9] rounded-xl overflow-visible group/item cursor-pointer snap-start hover:z-50 pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    
                                    // Custom banner types handle item clicks independently
                                    if (bannerType === 'custom') {
                                        if (item.videoUrl && item.videoUrl.startsWith('/watch/') && allContent && onSelectContent) {
                                            const slug = item.videoUrl.replace('/watch/', '');
                                            const itemContent = allContent.find(c => c.slug === slug);
                                            if (itemContent) {
                                                onSelectContent(itemContent);
                                                return;
                                            }
                                        }
                                        if (item.videoUrl) {
                                            window.open(item.videoUrl, '_blank');
                                            return;
                                        }
                                    }

                                    if (onSelectContent && targetContent) {
                                        let seasonNum = latestSeasonNumber;
                                        let epNum = originalIdx + 1;
                                        const sMatch = item.title?.match(/الموسم (\d+)/);
                                        if (sMatch) seasonNum = parseInt(sMatch[1], 10);
                                        const eMatch = item.title?.match(/الحلقة (\d+)/);
                                        if (eMatch) {
                                            epNum = parseInt(eMatch[1], 10);
                                        } else if (item.title?.includes('الحلقة')) {
                                            const rawNum = item.title.replace(/[^\d]/g, '');
                                            if (rawNum) epNum = parseInt(rawNum, 10);
                                        } else {
                                            epNum = originalIdx + 1;
                                        }
                                        
                                        // This normally opens Detail page or Watch page depending on app routing.
                                        onSelectContent(targetContent, seasonNum, epNum);
                                    } else if (item.videoUrl) {
                                        window.open(item.videoUrl, '_blank');
                                    }
                                }}
                            >
                                {/* Expanding Card on hover */}
                                <div className="absolute top-0 inset-x-0 w-full rounded-xl overflow-hidden border border-transparent bg-[#1e232d] group-hover/item:bg-[#2a303d] transition-all duration-300 md:group-hover/item:scale-110 flex flex-col origin-[50%_15%] z-10 md:group-hover/item:shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
                                    {/* Thumbnail region */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
                                        <img src={item.thumbnail} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" />
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover/item:opacity-0 transition-opacity duration-300" />
                                        
                                        {item.duration && (
                                            /* التعديل 5: تم نقل التوقيت إلى أسفل أقصى اليسار bottom-2 left-2 */
                                            <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] bg-black/50 backdrop-blur-sm opacity-100 group-hover/item:opacity-0 transition-opacity duration-300">
                                                <span dir="rtl">{item.duration}</span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-black/10">
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/30">
                                                <PlayIcon className="w-6 h-6 text-white ml-1" />
                                            </div>
                                        </div>

                                        {/* Title when not hovered (Overlay on Image) */}
                                        <div className="absolute bottom-3 right-3 rtl:left-16 ltr:left-3 flex items-end justify-between opacity-100 group-hover/item:opacity-0 transition-opacity duration-300 pointer-events-none">
                                            <h4 className="leading-none text-base md:text-lg font-bold text-white drop-shadow-md w-full rtl:text-right ltr:text-left">
                                                {item.title}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Detailed view (Revealed on hover below the image) */}
                                    <div className="grid grid-rows-[0fr] group-hover/item:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out bg-[#2a303d]">
                                        <div className="overflow-hidden">
                                            <div className="flex flex-col p-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 delay-100">
                                                <h4 className="leading-none text-base font-bold text-white rtl:text-right ltr:text-left mb-2">
                                                    {item.title}
                                                </h4>
                                                
                                                {item.description && (
                                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3 rtl:text-right ltr:text-left">
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-row items-center justify-end">
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); if (onSelectContent && targetContent) onSelectContent(targetContent); }}
                                                      className="flex focus:outline-none items-center gap-2 text-gray-300 hover:text-[var(--color-primary)] transition-colors group/btn"
                                                    >
                                                        <span className="text-xs font-bold order-2 md:order-1">المزيد من المعلومات</span>
                                                        <div className="w-7 h-7 rounded-full border border-gray-500 group-hover/btn:border-[var(--color-primary)] flex items-center justify-center order-1 md:order-2 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M12 16v-4"/><path d="M12 8h.01"/>
                                                            </svg>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
            </div>
        </div>
    );
};

export default InlinePromoBanner;