
import React, { useEffect, useRef } from 'react';
// @ts-ignore
import postscribe from 'postscribe';

interface AdDisplayProps {
  adCode: string;       // الكود البرمجي الخام القادم من قاعدة البيانات
  className?: string;
  style?: React.CSSProperties; // للسماح بحجز المساحة (minHeight)
}

/**
 * مكون AdDisplay المتطور:
 * 1. يستخدم postscribe لحقن السكربتات بشكل متوافق مع React.
 * 2. يسمح بحجز مساحة (minHeight) لمنع الشبكات الإعلانية من اعتبار الإعلان مخفياً.
 * 3. يطلق أحداث scroll/resize وهمية "لإيقاظ" السكربتات الكسولة.
 * 4. يضمن توسيط المحتوى المحقون في منتصف الحاوية تماماً.
 */
const AdDisplay: React.FC<AdDisplayProps> = ({ adCode, className = '', style }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adCode) {
      const container = adRef.current;
      
      // 1. تنظيف الحاوية
      container.innerHTML = '';
      
      // 2. حقن الإعلان باستخدام Postscribe
      try {
        postscribe(container, adCode, {
          done: () => {
            // 3. الحل الجذري: إرسال أحداث وهمية لتنبيه السكربتات "الكسولة"
            // هذا يحل مشكلة الإعلانات التي لا تظهر إلا بعد التمرير
            setTimeout(() => {
              window.dispatchEvent(new Event('scroll'));
              window.dispatchEvent(new Event('resize'));
            }, 150); 
          },
          error: (err: any) => {
             console.error("Ad Injection Error:", err);
          }
        });
      } catch (err) {
        console.error("Critical Ad Render Failure:", err);
      }
    }

    return () => {
        // Cleanup if necessary
    };
  }, [adCode]);

  return (
    <div 
      ref={adRef} 
      className={`ad-container flex justify-center items-center overflow-hidden ${className}`}
      // تعديل display إلى flex مع justify-content لضمان توسيط الإعلان برمجياً
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%',
        minHeight: '1px',
        ...style 
      }} 
    />
  );
};

export default AdDisplay;
