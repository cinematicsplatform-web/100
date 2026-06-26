
import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { Content, SectionDisplayType } from '@/types';
import ContentCard from './ContentCard';
import HybridCard from './HybridCard';
import SkeletonCard from './SkeletonCard';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRight';

interface ContentCarouselProps {
  title: React.ReactNode;
  contents: Content[];
  onSelectContent: (content: Content, seasonNumber?: number, episodeNumber?: number, isSoon?: boolean) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean; // خاصية جديدة
  myList?: string[];
  onToggleMyList: (contentId: string) => void;
  isNew?: boolean;
  isRestricted?: boolean;
  containerClassName?: string;
  onSeeAll?: () => void;
  showRanking?: boolean;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isLoading?: boolean; 
  isHorizontal?: boolean; 
  displayType?: SectionDisplayType;
  isSoonCarousel?: boolean;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ 
    title, 
    contents, 
    onSelectContent, 
    isLoggedIn, 
    isAdmin = false,
    myList, 
    onToggleMyList, 
    isNew, 
    isRestricted, 
    containerClassName,
    onSeeAll,
    showRanking,
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme,
    isLoading,
    isHorizontal,
    displayType,
    isSoonCarousel
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    const [canScrollLeft, setCanScrollLeft] = useState(true);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollBoundaries = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const isAtStart = scrollLeft >= -5;
            const isAtEnd = Math.abs(scrollLeft) + clientWidth >= scrollWidth - 5;
            setCanScrollRight(!isAtStart);
            setCanScrollLeft(!isAtEnd);
        }
    }, []);

    useEffect(() => {
        checkScrollBoundaries();
        window.addEventListener('resize', checkScrollBoundaries);
        return () => window.removeEventListener('resize', checkScrollBoundaries);
    }, [checkScrollBoundaries, contents]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(checkScrollBoundaries, 400);
        }
    };

    const handleCardExpand = useCallback((index: number | null) => {
        setExpandedIndex(index);
    }, []);

  const isHybrid = displayType === 'hybrid';
  const isHorizontalCard = isHorizontal || displayType === 'horizontal_card';
  const gapClass = isHorizontalCard ? 'gap-1.5' : 'gap-2';
  const paddingClass = 'pb-2 pt-2';

  if (isLoading) {
      return (
        <div className={`mb-4 md:mb-6 relative z-0 ${containerClassName || ''}`}>
            <div className="flex justify-between items-center mb-2 px-4 md:px-8">
                <div className="h-7 w-40 bg-gray-800/60 rounded-lg animate-pulse"></div>
            </div>
            <div className={`flex overflow-x-auto ${gapClass} ${paddingClass} px-4 md:px-8 rtl-scroll`}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} displayType={isHorizontalCard ? 'horizontal_card' : displayType} />
                ))}
            </div>
        </div>
      );
  }

  return (
    <div 
        className={`mb-4 md:mb-6 relative group/carousel z-0 ${containerClassName || ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
            setIsHovered(false);
            setExpandedIndex(null);
        }}
    >
      {title && (
          <div className="flex justify-between items-center mb-2 px-4 md:px-8">
            <div className="flex items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    {typeof title === 'string' ? (
                        <>
                            <div className={`w-1.5 h-6 md:h-8 rounded-full shadow-[0_0_10px_rgba(0,167,248,0.6)] 
                                ${isRamadanTheme 
                                    ? 'bg-[#FFD700]' 
                                    : isEidTheme
                                        ? 'bg-purple-500'
                                        : isCosmicTealTheme
                                            ? 'bg-gradient-to-b from-[#35F18B] to-[#2596be]'
                                            : isNetflixRedTheme
                                                ? 'bg-[#E50914]'
                                                : 'bg-gradient-to-b from-[#00A7F8] to-[#00FFB0]'
                                }`}></div>
                            <span>{title}</span>
                        </>
                    ) : (
                        title
                    )}
                </h2>
                {isNew && (
                <span className="bg-[#FFC107] text-black text-xs md:text-sm font-bold px-3 py-1 rounded-md shadow-[0_0_10px_rgba(255,193,7,0.4)] transform -skew-x-6">
                    جديد
                </span>
                )}
            </div>

            {onSeeAll && !showRanking && (
                <button 
                    onClick={onSeeAll}
                    className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white text-xs md:text-sm font-medium px-4 py-1.5 md:px-5 md:py-2 rounded-full transition-all"
                >
                    <span>شاهد الكل</span>
                    <ChevronLeftIcon className={`w-3 h-3 md:w-4 md:h-4 opacity-80 ${isRamadanTheme ? 'text-[#FFD700]' : isEidTheme ? 'text-purple-400' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]'}`} />
                </button>
            )}
          </div>
      )}
      
      <div className="relative">
        <button 
            onClick={() => scroll('right')} 
            className={`hidden md:flex absolute z-[100] right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#141b29]/90 border border-gray-600 backdrop-blur-md text-white items-center justify-center transition-all duration-300 
            ${(isHovered && canScrollRight) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll Right"
        >
           <ChevronRightIcon className="w-6 h-6" />
        </button>
        
        <div 
            ref={scrollRef} 
            onScroll={checkScrollBoundaries}
            className={`flex items-stretch overflow-x-auto ${gapClass} ${paddingClass} px-4 md:px-8 rtl-scroll scroll-smooth`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {contents.map((content, index) => {
              if (isHybrid) {
                  return (
                      <HybridCard 
                          key={content.id}
                          content={content}
                          index={index}
                          totalItems={contents.length}
                          expandedIndex={expandedIndex}
                          onSetExpandedIndex={handleCardExpand}
                          onSelectContent={(content) => onSelectContent(content, undefined, undefined, isSoonCarousel)}
                          isLoggedIn={isLoggedIn}
                          myList={myList}
                          onToggleMyList={onToggleMyList}
                          isRamadanTheme={isRamadanTheme}
                          isEidTheme={isEidTheme}
                          isCosmicTealTheme={isCosmicTealTheme}
                          isNetflixRedTheme={isNetflixRedTheme}
                          isSoonCarousel={isSoonCarousel}
                      />
                  )
              }
              return (
                <ContentCard 
                    key={content.id} 
                    content={content} 
                    onSelectContent={(content) => onSelectContent(content, undefined, undefined, isSoonCarousel)}
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    myList={myList}
                    onToggleMyList={onToggleMyList}
                    showLatestBadge={isNew}
                    rank={showRanking ? index + 1 : undefined}
                    isRamadanTheme={isRamadanTheme}
                    isEidTheme={isEidTheme}
                    isCosmicTealTheme={isCosmicTealTheme}
                    isNetflixRedTheme={isNetflixRedTheme}
                    isHorizontal={isHorizontalCard}
                    isSoonCarousel={isSoonCarousel}
                />
              );
          })}
        </div>
        
         <button 
            onClick={() => scroll('left')} 
            className={`hidden md:flex absolute z-[100] left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#141b29]/90 border border-gray-600 backdrop-blur-md text-white items-center justify-center transition-all duration-300
            ${(isHovered && canScrollLeft) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll Left"
        >
           <ChevronLeftIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ContentCarousel;
