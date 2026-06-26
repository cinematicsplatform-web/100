
import React from 'react';
import type { SectionDisplayType } from '@/types';

interface SkeletonCardProps {
  displayType?: SectionDisplayType | 'horizontal_card';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ displayType = 'vertical_poster' }) => {
  // استخدام نفس فئات الأبعاد الدقيقة المستخدمة في البطاقات الحقيقية
  const verticalWidth = 'w-[calc((100vw-40px)/2.25)] md:w-[calc((100vw-64px)/4.2)] lg:w-[calc((100vw-64px)/6)]';
  const horizontalWidth = 'w-[calc((100vw-40px)/1.2)] md:w-[calc((100vw-64px)/2.2)] lg:w-[calc((100vw-64px)/3.4)]';
  
  let widthClass = verticalWidth;
  let aspectClass = 'aspect-[2/3]';

  if (displayType === 'horizontal_card') {
    widthClass = horizontalWidth;
    aspectClass = 'aspect-video';
  } else if (displayType === 'hybrid') {
    widthClass = verticalWidth;
    aspectClass = 'aspect-[2/3]';
  }

  return (
    <div className={`relative ${widthClass} flex-shrink-0 mb-0 animate-fade-in`}>
      <div className={`relative rounded-xl overflow-hidden bg-gray-800/40 ${aspectClass} w-full border border-white/5`}>
        {/* Shimmer Effect */}
        <div className="absolute inset-0 skeleton-shimmer"></div>
        
        {/* Content Placeholders */}
        <div className="absolute bottom-3 right-3 left-3 space-y-2 z-10">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-2.5 bg-white/5 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
