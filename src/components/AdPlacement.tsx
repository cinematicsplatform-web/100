
import React, { useEffect, useState } from 'react';
import type { Ad } from '@/types';
import AdDisplay from './AdDisplay';

interface AdPlacementProps {
  ads: Ad[];
  placement: string;
  isEnabled: boolean;
  className?: string;
}

const AdPlacement: React.FC<AdPlacementProps> = ({ ads, placement, isEnabled, className }) => {
  // 1. تحديد نوع الجهاز بشكل حيوي
  const [isMobile, setIsMobile] = useState<boolean>(
     typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. تصفية الإعلانات الصالحة للجهاز والنشطة
  const validAds = ads.filter(adItem => {
    const isAdActive = adItem.status === 'active' || adItem.isActive === true;
    if (!isAdActive) return false;

    const target = adItem.targetDevice || 'all';
    if (target === 'mobile' && !isMobile) return false;
    if (target === 'desktop' && isMobile) return false;

    return true;
  });

  // 3. البحث عن إعلان مخصص لهذا المكان تحديداً
  let activeAd = validAds.find(ad => ad.placement === placement || ad.position === placement);

  // 4. إذا لم يوجد إعلان مخصص، نبحث عن إعلان "عالمي" (Global) كإحتياطي
  if (!activeAd) {
    activeAd = validAds.find(ad => ad.isGlobal === true);
  }

  if (!isEnabled || !activeAd) return null;

  // التأكد من وجود w-full و justify-center و items-center بشكل دائم لضمان التوسيط
  const defaultClasses = "ad-container w-full flex justify-center items-center my-4 overflow-hidden z-10";
  const finalClasses = className ? `${defaultClasses} ${className}` : defaultClasses;

  // في حال كان الإعلان بانر صوري
  if (activeAd.type === 'banner' && activeAd.imageUrl) {
      return (
          <div className={finalClasses}>
              <a 
                href={activeAd.destinationUrl || '#'} 
                target="_blank" 
                rel="nofollow noopener noreferrer"
                className="block transition-all hover:scale-[1.01] active:scale-[0.98] max-w-full mx-auto"
              >
                  <img 
                    src={activeAd.imageUrl} 
                    alt={activeAd.title || "Cinematix Ad"} 
                    className="max-w-full h-auto rounded-2xl shadow-xl object-contain border border-white/5 mx-auto"
                    style={{ maxHeight: '250px' }}
                  />
              </a>
          </div>
      );
  }

  // تحديد ارتفاع افتراضي بناءً على مكان الإعلان لضمان "الرؤية" الفورية
  const getMinHeight = () => {
      if (placement.includes('top') || placement.includes('footer')) return isMobile ? '60px' : '100px';
      if (placement.includes('sidebar')) return '260px';
      return '1px';
  };

  // في حال كان الإعلان كود برمجي (Adsterra, Monetag, etc)
  return (
    <AdDisplay 
      adCode={activeAd.code || activeAd.scriptCode || ''} 
      className={finalClasses} 
      style={{ minHeight: getMinHeight() }}
    />
  );
};

export default AdPlacement;
