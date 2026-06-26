import React, { useState } from 'react';
import type { Story } from '@/types';
import StoryViewer from './StoryViewer';

interface StoriesBarProps {
    stories: Story[];
}

const StoriesBar: React.FC<StoriesBarProps> = ({ stories }) => {
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    const handleOpenStory = (index: number, e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedStoryIndex(index);
    };

    const handleCloseStory = () => {
        setSelectedStoryIndex(null);
    };

    return (
        <div className="w-full relative z-[60] overflow-hidden">
            <div className="flex gap-4 overflow-x-auto px-4 md:px-12 lg:px-16 py-4 rtl-scroll no-scrollbar scroll-smooth">
                {stories.map((story, index) => (
                    <div
                        key={story.id}
                        onClick={(e) => handleOpenStory(index, e)}
                        className="flex flex-col items-center gap-2 flex-shrink-0 group animate-fade-in-up cursor-pointer outline-none active:scale-95 transition-all"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr from-[#00A7F8] to-[#00FFB0] group-hover:shadow-[0_0_15px_rgba(0,167,248,0.5)] transition-all duration-300">
                            <div className="w-full h-full rounded-full border-2 border-[#141b29] overflow-hidden bg-gray-800">
                                <img 
                                    src={story.thumbnailUrl} 
                                    alt={story.title} 
                                    className="w-full h-full object-cover transition-all"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white truncate max-w-[80px] text-center">
                            {story.title}
                        </span>
                    </div>
                ))}
            </div>

            {selectedStoryIndex !== null && (
                <StoryViewer 
                    stories={stories} 
                    initialIndex={selectedStoryIndex} 
                    onClose={handleCloseStory} 
                />
            )}
        </div>
    );
};

export default StoriesBar;