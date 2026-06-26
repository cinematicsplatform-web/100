
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Story } from '@/types';
import { CloseIcon } from './icons/CloseIcon';
import { BouncingDotsLoader } from './BouncingDotsLoader';
import { ChevronRightIcon } from './icons/ChevronRight';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface StoryViewerProps {
    stories: Story[];
    initialIndex: number;
    onClose: () => void;
}

const STORY_DURATION = 8000; 

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
    const [groupIndex, setGroupIndex] = useState(initialIndex);
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
        setGroupIndex(initialIndex);
        setSlideIndex(0);
        setProgress(0);
        setIsLoaded(false);
        
        const timer = setTimeout(() => setIsLoaded(true), 3000);
        document.body.style.overflow = 'hidden';
        
        return () => { 
            clearTimeout(timer);
            document.body.style.overflow = '';
        };
    }, [initialIndex]);

    const activeGroup = stories && stories.length > groupIndex ? stories[groupIndex] : null;
    const mediaItems = Array.isArray(activeGroup?.mediaItems) ? activeGroup!.mediaItems : [];
    const activeSlide = mediaItems.length > slideIndex ? mediaItems[slideIndex] : (mediaItems[0] || null);
    
    const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const nextSlide = useCallback(() => {
        if (!activeGroup || mediaItems.length === 0) return;
        if (slideIndex < mediaItems.length - 1) {
            setSlideIndex(prev => prev + 1);
            setProgress(0);
            setIsLoaded(false);
        } else if (groupIndex < stories.length - 1) {
            setGroupIndex(prev => prev + 1);
            setSlideIndex(0);
            setProgress(0);
            setIsLoaded(false);
        } else {
            onClose();
        }
    }, [slideIndex, groupIndex, mediaItems.length, stories.length, onClose, activeGroup]);

    const prevSlide = useCallback(() => {
        if (slideIndex > 0) {
            setSlideIndex(prev => prev - 1);
            setProgress(0);
            setIsLoaded(false);
        } else if (groupIndex > 0) {
            const prevGroup = stories[groupIndex - 1];
            const prevGroupMedia = Array.isArray(prevGroup?.mediaItems) ? prevGroup.mediaItems : [];
            setGroupIndex(prev => prev - 1);
            setSlideIndex(Math.max(0, prevGroupMedia.length - 1));
            setProgress(0);
            setIsLoaded(false);
        }
    }, [slideIndex, groupIndex, stories]);

    useEffect(() => {
        if (!activeSlide || isPaused || !isLoaded || activeSlide.mediaType === 'video') {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            return;
        }
        const interval = 50;
        const increment = (interval / STORY_DURATION) * 100;
        progressTimerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    nextSlide();
                    return 100;
                }
                return prev + increment;
            });
        }, interval);
        return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
    }, [groupIndex, slideIndex, isPaused, isLoaded, activeSlide?.mediaType, nextSlide]);

    if (!activeGroup || !activeSlide) return null;

    const hasCTA = (activeSlide.ctaText && activeSlide.targetUrl) || (activeGroup as any).ctaText;
    const ctaText = activeSlide.ctaText || (activeGroup as any).ctaText || 'شاهد الآن';
    const targetUrl = activeSlide.targetUrl || (activeGroup as any).targetUrl || '#';

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black animate-fade-in pointer-events-auto">
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-10 pointer-events-none z-[70]">
                <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} disabled={groupIndex === 0 && slideIndex === 0} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white pointer-events-auto transition-all disabled:opacity-0"><ChevronRightIcon className="w-8 h-8" /></button>
                <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white pointer-events-auto transition-all"><ChevronLeftIcon className="w-8 h-8" /></button>
            </div>

            {/* Main Content Container - Full screen on mobile, max-width on desktop */}
            <div 
                className="relative w-full h-full md:max-w-[500px] md:h-[90vh] md:max-h-[900px] md:rounded-3xl md:mx-4 bg-black shadow-2xl overflow-hidden flex flex-col animate-fade-in-up"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress Bars - Higher padding for mobile status bars */}
                <div className="absolute top-4 md:top-6 inset-x-4 z-[60] flex gap-1.5 pt-safe">
                    {mediaItems.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-100 linear" style={{ width: idx === slideIndex ? `${progress}%` : idx < slideIndex ? '100%' : '0%' }} />
                        </div>
                    ))}
                </div>

                {/* Header Information */}
                <div className="absolute top-10 md:top-12 inset-x-4 z-[60] flex items-center justify-between pt-safe">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#00A7F8] p-0.5 shadow-lg overflow-hidden bg-gray-800">
                            <img src={activeGroup.thumbnailUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm md:text-base drop-shadow-md">{activeGroup.title}</span>
                            <span className="text-gray-400 text-[10px] md:text-xs opacity-80">سينماتيكس</span>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 text-white/70 hover:text-white transition-colors bg-black/20 backdrop-blur-md rounded-full"><CloseIcon className="w-6 h-6 md:w-8 md:h-8" /></button>
                </div>

                {/* Media Content - Ensures it fills the entire frame */}
                <div className="flex-1 w-full h-full relative z-0 bg-[#0f1014]">
                    {!isLoaded && <div className="absolute inset-0 flex items-center justify-center"><BouncingDotsLoader size="md" colorClass="bg-[var(--color-accent)]" delayMs={300} /></div>}
                    {activeSlide.mediaType === 'video' ? (
                        <video ref={videoRef} src={activeSlide.url} autoPlay playsInline muted={false} className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onLoadedData={() => setIsLoaded(true)} onEnded={() => nextSlide()} onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setProgress((v.currentTime / v.duration) * 100); }} />
                    ) : (
                        <img key={activeSlide.url} src={activeSlide.url} alt="" className={`w-full h-full object-cover animate-zoom-in transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setIsLoaded(true)} />
                    )}
                    {/* Shadow overlays for UI readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"></div>
                </div>

                {/* SLIDE-SPECIFIC CTA BUTTON - Centered and full width at bottom */}
                {hasCTA && (
                    <div className="absolute bottom-12 md:bottom-16 inset-x-6 z-[70] animate-fade-in-up pb-safe">
                        <a 
                            href={targetUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-white text-black font-black py-4 md:py-5 rounded-2xl text-center shadow-[0_10px_50px_rgba(0,0,0,0.7)] hover:scale-[1.03] transition-all flex items-center justify-center gap-3 active:scale-95 text-lg"
                        >
                            <span>{ctaText}</span>
                            <ChevronLeftIcon className="w-5 h-5" />
                        </a>
                    </div>
                )}

                {/* Invisible Touch Areas for Next/Prev */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="flex-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); prevSlide(); }}></div>
                    <div className="flex-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextSlide(); }}></div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StoryViewer;
