import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Content, View } from '../types';
import { ContentType } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PlayIcon } from './icons/PlayIcon';
import SEO from './SeoMeta';

import { normalizeText } from '../utils/textUtils';

interface SearchPageProps {
    allContent: Content[];
    onSelectContent: (content: Content, seasonNumber?: number) => void;
    onSetView: (view: View, category?: string, params?: any) => void;
    onGoBack: (fallbackView: View) => void;
    onClose?: () => void;
}

// قائمة التصنيفات بالصور
const DISCOVER_CATEGORIES = [
    { name: 'مصري', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/EGYPTIAN_AR/original/EGYPTIAN_AR.png' },
    { name: 'عربي', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/Arabic_AR/original/Arabic_AR.png' },
    { name: 'تركي', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/TURKISH_AR/original/TURKISH_AR.png' },
    { name: 'أجنبي', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/Western_AR/original/Western_AR.png' },
    { name: 'برامج', image: 'https://shahid.mbc.net/mediaObject/6c144cf5-b749-4949-80d4-e0a526e934e2?width=150&version=1&type=avif&q=80', view: 'programs' },
    { name: 'رمضان', image: 'https://i.suar.me/Pzmwp/l', view: 'ramadan' },
    { name: 'أطفال', image: 'https://i.suar.me/5L97M/l', view: 'kids' },
    { name: 'رومانسي', image: 'https://shahid.mbc.net/mediaObject/8863e770-c5b3-4f39-9feb-458f28fe016e?width=150&version=1&type=avif&q=80' },
    { name: 'عائلي', image: 'https://shahid.mbc.net/mediaObject/45b5f1b0-0ea8-490c-9f1e-109a595980d7?width=150&version=1&type=avif&q=80' },
    { name: 'كوميديا', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/Comedy_AR/original/Comedy_AR.png' },
    { name: 'دراما', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/Drama_AR/original/Drama_AR.png' },
    { name: 'أكشن', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/ACTION_AR/original/ACTION_AR.png' },
    { name: 'جريمة', image: 'https://shahid.mbc.net/mediaObject/36a4d2df-1cd6-4a7f-bd0a-3926be7b7415?width=150&version=1&type=avif&q=80' },
    { name: 'خيال علمي', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/FANTASY_SCI_FI_AR/original/FANTASY_SCI_FI_AR.png' },
    { name: 'رعب', image: 'https://shahid.mbc.net/mediaObject/d53069d1-63a3-4e89-9f41-0ae1220b7eab?width=150&version=1&type=avif&q=80' },
    { name: 'تركي مدبلج', image: 'https://shahid.mbc.net/mediaObject/c7e6b36b-1b50-4a22-bbef-05288dd2d511' },
    { name: 'مسرح', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/THEATRE_AR/original/THEATRE_AR.png' },
    { name: 'قريباً', image: 'https://shahid.mbc.net/mediaObject/Curation_2024/Explore/Items/SOON_AR/original/SOON_AR.png', view: 'soon' },
];

const SearchResultCard: React.FC<{ content: any; onClick: () => void }> = ({ content, onClick }) => {
    const imageSrc = content.backdrop || content.poster;
    const seasonCount = content.seasons?.length || 0;
    const isSeasonItem = content.isSeasonItem;
    const isEpisodic = content.type === ContentType.Series || content.type === ContentType.Program;
    
    const displaySeasonLabel = isSeasonItem 
        ? `الموسم ${content.seasonNumber}`
        : (seasonCount > 2 ? `${seasonCount} مواسم` : (seasonCount > 0 ? "موسمين" : ""));
    
    const showSeasonBadge = isSeasonItem || (isEpisodic && seasonCount > 1);
    const genreText = content.genres?.slice(0, 2).join(' • ');
    const slug = content.slug || content.id;
    const detailUrl = !isEpisodic
      ? `/watch/movie/${slug}` 
      : `/${content.type}/${slug}/الموسم${content.seasonNumber || 1}`;

    const getTypeText = (type: string) => {
        switch(type) {
            case ContentType.Movie: return 'فيلم';
            case ContentType.Series: return 'مسلسل';
            case ContentType.Program: return 'برنامج';
            case ContentType.Concert: return 'حفل';
            case ContentType.Play: return 'مسرحية';
            default: return 'عمل';
        }
    }

    const displayTitleText = isSeasonItem 
        ? `${content._original?.title || content.title} - الموسم ${content.seasonNumber}`
        : content.title;

    return (
        <a 
            href={detailUrl}
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className="relative group block no-underline text-inherit w-full cursor-pointer overflow-hidden rounded-xl bg-[#1a2230] border border-gray-800 transition-all duration-300 hover:scale-[1.02] hover:border-gray-600 shadow-lg"
        >
            <div className="aspect-video w-full relative overflow-hidden">
                <img src={imageSrc} alt={content.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151922] via-transparent to-transparent opacity-90"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30"><PlayIcon className="w-8 h-8 text-white fill-white" /></div>
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {content.bannerNote && <span className="bg-[#E50914]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-sm border border-white/10">{content.bannerNote}</span>}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 flex flex-col items-start justify-end bg-gradient-to-t from-[#151922] via-[#151922]/80 to-transparent pt-12">
                <div className="mb-2">
                    {content.isLogoEnabled && content.logoUrl ? (
                        <img src={content.logoUrl} alt={content.logoUrl} className="h-8 md:h-12 object-contain drop-shadow-md" />
                    ) : (
                        <h3 className="text-white font-bold text-base md:text-lg leading-tight drop-shadow-md line-clamp-1">{displayTitleText}</h3>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[10px] md:text-xs font-medium text-gray-300">
                    <span className="bg-white/20 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-white font-bold shadow-sm">{getTypeText(content.type)}</span>
                    {showSeasonBadge && <><span className={`${isSeasonItem ? 'text-[#FFD700]' : 'text-[#00A7F8]'} font-bold`}>{displaySeasonLabel}</span><span className="opacity-50 text-[8px]">•</span></>}
                    <span className="text-white font-bold">{content.releaseYear}</span>
                    {genreText && <><span className="opacity-50 text-[8px]">•</span><span className="text-white opacity-90">{genreText}</span></>}
                </div>
            </div>
        </a>
    );
};

const SearchPage: React.FC<SearchPageProps> = ({ allContent, onSelectContent, onSetView, onGoBack, onClose }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const { results, relatedTags } = useMemo(() => {
        if (!query.trim()) return { results: [], relatedTags: [] };
        const normalizedQuery = normalizeText(query);
        
        const scoredParents = allContent.reduce((acc, c) => {
            const titleNorm = normalizeText(c.title);
            let score = 0;
            
            if (titleNorm === normalizedQuery) {
                score += 100;
            } else if (titleNorm.startsWith(normalizedQuery)) {
                score += 50;
            } else if (titleNorm.includes(normalizedQuery)) {
                score += 20;
            }
            
            if (c.cast && c.cast.some(actor => normalizeText(actor).includes(normalizedQuery))) score += 10;
            if (c.genres && c.genres.some(g => normalizeText(g).includes(normalizedQuery))) score += 5;
            if (c.categories && c.categories.some(cat => normalizeText(cat).includes(normalizedQuery))) score += 5;

            if (score > 0) {
                acc.push({ item: c, score });
            }
            return acc;
        }, [] as {item: any, score: number}[]);

        // Sort by relevance (highest score first)
        scoredParents.sort((a, b) => b.score - a.score);
        const matchedParents = scoredParents.map(x => x.item);

        const explodedResults: any[] = [];
        matchedParents.forEach(item => {
            const isEpisodic = item.type === ContentType.Series || item.type === ContentType.Program;
            if (isEpisodic && item.seasons && item.seasons.length > 0) {
                const sortedSeasons = [...item.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
                sortedSeasons.forEach(season => {
                    explodedResults.push({
                        ...item, 
                        id: `${item.id}_s${season.seasonNumber}`, 
                        _original: item, 
                        isSeasonItem: true,
                        seasonNumber: season.seasonNumber,
                        title: season.title || item.title,
                        poster: season.poster || item.poster,
                        backdrop: season.backdrop || item.backdrop,
                        releaseYear: season.releaseYear || item.releaseYear,
                        logoUrl: season.logoUrl || item.logoUrl,
                        isLogoEnabled: season.logoUrl ? true : item.isLogoEnabled,
                        description: season.description || item.description,
                    });
                });
            } else { explodedResults.push(item); }
        });

        const tags = new Set<string>();
        matchedParents.forEach(c => {
            if (normalizeText(c.title).includes(normalizedQuery)) tags.add(c.title);
            if (c.cast) c.cast.forEach(actor => { if (normalizeText(actor).includes(normalizedQuery)) tags.add(actor); });
            if (c.genres) c.genres.forEach(g => { if (normalizeText(g).includes(normalizedQuery)) tags.add(g); });
            if (c.categories) c.categories.forEach(cat => { if (normalizeText(cat).includes(normalizedQuery)) tags.add(cat); });
        });

        return { results: explodedResults, relatedTags: Array.from(tags).slice(0, 10) };
    }, [query, allContent]);

    // هذه الدالة تُستخدم الآن فقط للوسوم المرتبطة (Related Tags) لفتح صفحة نتائج
    const handleTagClick = (tag: string) => {
        onSetView('category', tag);
    };

    const handleClear = () => {
        setQuery('');
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-body)] animate-fade-in pb-20">
            <SEO 
                title="البحث - سينماتيكس"
                description="ابحث عن أفلامك ومسلسلاتك المفضلة على سينماتيكس واستمتع بالمشاهدة الحصرية."
                url="/search"
            />
            <div className="relative flex flex-col w-full h-full">
                {/* Header */}
                <div className="bg-[var(--bg-card)] border-b border-white/5 shadow-xl z-20">
                    <div className="max-w-[1920px] mx-auto px-4 md:px-8 h-20 flex flex-row items-center gap-6" dir="rtl">
                        
                        {/* THEMED SEARCH CONTAINER */}
                        <div className="flex-1 relative flex flex-row items-center bg-black/40 border border-white/10 rounded-full px-4 h-12 focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)] focus-within:shadow-[0_0_15px_var(--shadow-color)] transition-all">
                            <SearchIcon className="w-5 h-5 theme-accent-text" />
                            
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ابحث عن مسلسل، فيلم، برامج..."
                                className="flex-1 bg-transparent text-white text-base md:text-lg placeholder-gray-600 outline-none h-full px-3"
                            />
                            
                            {query && (
                                <button onClick={handleClear} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <button 
                            onClick={() => onGoBack('home')} 
                            className="hidden md:block text-gray-400 hover:theme-accent-text font-bold transition-colors text-lg whitespace-nowrap"
                        >
                            إلغاء
                        </button>
                    </div>

                    {query && relatedTags.length > 0 && (
                        <div className="w-full border-t border-white/5 bg-black/20">
                            <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-2 flex items-center justify-start overflow-x-auto rtl-scroll gap-2">
                                {relatedTags.map((tag, index) => (
                                    <button key={index} onClick={() => handleTagClick(tag)} className="px-3 py-1 rounded-full bg-white/5 hover:theme-accent-bg hover:text-black text-gray-400 text-xs whitespace-nowrap border border-white/10 hover:theme-accent-border transition-colors">{tag}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-[var(--bg-body)] w-full">
                    {query.trim() === '' ? (
                        <div className="max-w-[1920px] mx-auto px-4 md:px-8 pt-8 pb-12">
                            <h2 className="text-white text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="theme-accent-bg w-1 h-6 rounded-full inline-block"></span>
                                اكتشف المزيد
                            </h2>
                            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-1.5 md:gap-2">
                                {DISCOVER_CATEGORIES.map((category, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => (category as any).view ? onSetView((category as any).view as View) : onSetView('category', category.name)}
                                        className="relative group overflow-hidden rounded-xl aspect-square transition-all duration-300"
                                    >
                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-[1920px] mx-auto px-4 md:px-8 pt-6 pb-24">
                            {results.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {results.map(item => (
                                        <SearchResultCard key={item.id} content={item} onClick={() => onSelectContent(item._original || item, item.seasonNumber)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-gray-500 text-lg mb-4">لا توجد نتائج مطابقة لـ "{query}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;