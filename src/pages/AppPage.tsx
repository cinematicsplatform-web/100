import React, { useState, useEffect, useRef } from 'react';
import type { View, AppConfig } from '@/types';
import SEO from '../components/SeoMeta';
import { ChevronRightIcon } from '../components/icons/ChevronRight';
import { StarIcon } from '../components/icons/StarIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';

interface AppPageProps {
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  appConfig?: AppConfig;
  returnView?: View;
}

// Custom Icons for Play Store Mobile Look
const MoreIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

const AppPage: React.FC<AppPageProps> = ({ onSetView, onGoBack, appConfig, returnView }) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Menu States
  const [showMenu, setShowMenu] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fallback to control panel values or empty if not set
  const apkUrl = appConfig?.apkUrl || '';
  const appSize = appConfig?.appSize || '12 MB';
  const appVersion = appConfig?.version || '1.0.0';
  const screenshots = appConfig?.screenshots || [];
  const reviews = appConfig?.reviews || [];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowShareOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startInstallation = () => {
    if (isInstalling) return;

    if (apkUrl) {
      const link = document.createElement('a');
      link.href = apkUrl;
      link.download = 'cinematix.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setIsInstalling(true);
    setProgress(0);
    setShowSuccessMessage(false);

    const duration = 15000;
    const intervalTime = 100;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment + (Math.random() * 0.5);
        if (next >= 100) {
          clearInterval(timer);
          finishInstallation();
          return 100;
        }
        return next;
      });
    }, intervalTime);
  };

  const finishInstallation = () => {
    setIsInstalling(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 15000);
  };

  // Action Handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ الرابط!');
    setShowMenu(false);
    setShowShareOptions(false);
  };

  const handleWhatsAppShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${url}`, '_blank');
    setShowMenu(false);
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#010101] text-[#e8eaed] font-['Cairo'] pb-20 animate-fade-in overflow-x-hidden" dir="rtl">
      <SEO title="تطبيق سينماتيكس - Google Play" description="تحميل تطبيق سينماتيكس الرسمي للأندرويد." />

      {/* Header */}
      <div className="w-full px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#010101] z-50">
        <button 
          onClick={() => onGoBack(returnView || 'home')}
          className="p-2 -mr-2"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>
        <div className="flex gap-4 relative" ref={menuRef}>
           <button 
            onClick={() => {
                setShowMenu(!showMenu);
                setShowShareOptions(false);
            }} 
            className="p-2"
           >
            <MoreIcon />
           </button>

           {/* Dropdown Menu */}
           {showMenu && (
               <div className="absolute top-full left-0 mt-2 w-48 bg-[#1f2937] border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up z-[60]">
                   {!showShareOptions ? (
                       <div className="flex flex-col">
                           <button 
                            onClick={() => setShowShareOptions(true)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-right font-bold transition-colors border-b border-white/5"
                           >
                               <span>🔗</span>
                               <span>مشاركة</span>
                           </button>
                           <button 
                            onClick={() => onSetView('home')}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-right font-bold transition-colors"
                           >
                               <span>🌐</span>
                               <span>فتح الموقع</span>
                           </button>
                       </div>
                   ) : (
                       <div className="flex flex-col animate-fade-in">
                           <button 
                            onClick={handleCopyLink}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-right font-bold transition-colors border-b border-white/5 text-sm"
                           >
                               <span>📄</span>
                               <span>نسخ الرابط</span>
                           </button>
                           <button 
                            onClick={handleWhatsAppShare}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-right font-bold transition-colors border-b border-white/5 text-sm"
                           >
                               <span className="text-green-500">
                                   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-1.557-.519-2.614-1.462-1.341-1.199-1.612-2.103-1.615-2.122-.003-.018-.232-.307-.232-.614 0-.307.162-.458.22-.519.057-.06.154-.075.249-.075.095 0 .19.001.27.004.083.003.193-.031.302.235.113.276.386.94.419 1.008.033.069.054.149.009.239-.045.09-.068.145-.136.223-.068.078-.143.174-.205.234-.07.068-.145.142-.06.29.085.147.38.627.817 1.017.562.503 1.036.659 1.186.732.15.073.237.06.325-.042.087-.101.378-.44.479-.589.101-.15.203-.126.342-.075.139.051.882.416 1.034.492.153.076.255.114.293.178.036.064.036.371-.108.776zM12 1c-6.075 0-11 4.925-11 11s4.925 11 11 11 11-4.925 11-11-4.925-11-11-11zm0 20c-4.963 0-9-4.037-9-9s4.037-9 9-9 9 4.037 9 9-4.037 9-9 9z"/></svg>
                               </span>
                               <span>واتساب</span>
                           </button>
                           <button 
                            onClick={handleFacebookShare}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-right font-bold transition-colors text-sm"
                           >
                               <span className="text-blue-500">
                                   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                               </span>
                               <span>فيسبوك</span>
                           </button>
                       </div>
                   )}
               </div>
           )}
        </div>
      </div>

      <main className="px-6">
        
        {/* App Meta Section */}
        <section className="flex gap-5 mb-8 items-center h-24">
          <div className="relative flex-shrink-0 flex items-center justify-center w-24 h-24">
             {isInstalling && (
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#1e2124" strokeWidth="4" />
                    <circle
                        cx="50" cy="50" r="46" fill="none" stroke="#01875f" strokeWidth="4"
                        strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100}
                        strokeLinecap="round" className="transition-all duration-300 ease-linear"
                    />
                </svg>
             )}

             {/* Squircle Shape for Icon */}
             <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[22%] overflow-hidden shadow-lg border border-white/5 bg-black p-0.5 z-10 transition-transform duration-500 ease-in-out ${isInstalling ? 'scale-75' : 'scale-100'}`}>
                <img src="https://i.suar.me/GErAg/l" alt="Cinematix" className="w-full h-full object-contain" />
             </div>
             
             {isInstalling && (
                 <div className="absolute -bottom-2 text-[10px] font-bold text-[#01875f]">
                    {Math.floor(progress)}%
                 </div>
             )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className={`text-2xl md:text-3xl font-medium transition-colors duration-300 ${isInstalling ? 'text-[#01875f]' : 'text-white'} mb-0.5`}>
                Cinematix
            </h1>
            <p className="text-[#01875f] font-bold text-sm md:text-base">Cinematix Entertainment</p>
            <p className="text-gray-400 text-xs mt-0.5">يتضمن إعلانات</p>
          </div>
        </section>

        {/* Success Notification */}
        {showSuccessMessage && (
            <div className="mb-6 bg-[#01875f]/10 border border-[#01875f]/30 p-4 rounded-xl animate-fade-in-up">
                <p className="text-white text-sm font-bold flex items-center gap-2">
                    <span className="text-lg">✅</span> تم تحميل التطبيق بنجاح!
                </p>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                    يمكنك تثبيت التطبيق الآن من مجلد <b>الملفات</b> أو قائمة <b>التحميلات</b> في متصفحك.
                </p>
            </div>
        )}

        {/* Stats Row - Reordered as requested: Rating -> Age -> Downloads -> Size (Far Left) */}
        <section className="mb-8 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-stretch gap-4 min-w-max">
            
            {/* 1. Rating */}
            <div className="flex flex-col items-center justify-center px-4">
              <div className="flex items-center gap-1 font-bold text-white text-sm">
                  <span>4.8</span>
                  <StarIcon className="w-3 h-3 fill-white" />
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 whitespace-nowrap">
                  <span>82 ألف مراجعة</span>
                  <InfoIcon />
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-800 self-center"></div>

            {/* 2. Age Rating */}
            <div className="flex flex-col items-center justify-center px-4">
               <div className="border border-gray-400 px-1 rounded-sm text-[10px] font-bold text-white mb-1">12+</div>
               <span className="text-gray-400 text-[10px] whitespace-nowrap font-normal">مناسب لـ 12 عامًا+</span>
            </div>

            <div className="w-px h-8 bg-gray-800 self-center"></div>

            {/* 3. Downloads */}
            <div className="flex flex-col items-center justify-center px-4">
               <span className="text-white font-bold text-sm">+1 مليون</span>
               <span className="text-gray-400 text-[10px] mt-1 whitespace-nowrap">عملية تنزيل</span>
            </div>

            <div className="w-px h-8 bg-gray-800 self-center"></div>

            {/* 4. File Size */}
            <div className="flex flex-col items-center justify-center px-4">
              <div className="p-0.5 border border-gray-400 rounded-sm mb-1">
                  <DownloadIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-sm font-normal">{appSize}</span>
            </div>

          </div>
        </section>

        {/* Action Button */}
        <section className="mb-10">
          <button 
            onClick={startInstallation}
            disabled={isInstalling}
            className={`w-full font-bold py-2.5 rounded-full flex items-center justify-center text-sm transition-all shadow-md min-h-[44px] ${isInstalling ? 'bg-gray-800 text-[#01875f] cursor-not-allowed' : 'bg-[#01875f] text-black active:scale-95'}`}
          >
            {isInstalling ? `جاري التحميل... ${Math.floor(progress)}%` : "تثبيت"}
          </button>
        </section>

        {/* Screenshots Carousel */}
        {screenshots.length > 0 && (
            <section className="mb-10 -mx-6 px-6 overflow-hidden">
                <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2">
                    {screenshots.map((s, i) => (
                        <div key={i} className="flex-shrink-0 w-[140px] md:w-[180px] aspect-[9/18.5] bg-gray-900 rounded-xl overflow-hidden border border-white/5">
                            <img src={s} alt={`Screen ${i}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* About this app */}
        <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">لمحة عن هذا التطبيق</h2>
                <button className="p-2 -ml-2"><ChevronRightIcon className="w-5 h-5 transform rotate-180 opacity-60" /></button>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">سينماتيكس هي منصة المشاهدة الرائدة التي تمنحك وصولاً غير محدود لأحدث الأفلام والمسلسلات بجودة عالية وسرعة فائقة.</p>
            <div className="flex flex-wrap gap-2">
                <span className="border border-gray-700 text-gray-300 px-4 py-1.5 rounded-full text-xs font-normal">ترفيه</span>
                <span className="border border-gray-700 text-gray-300 px-4 py-1.5 rounded-full text-xs font-normal">محتوى البث</span>
                <span className="border border-gray-700 text-gray-300 px-4 py-1.5 rounded-full text-xs font-normal">التطبيقات المصغّرة</span>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span>الإصدار: {appVersion}</span>
                <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                <span>حجم الملف: {appSize}</span>
            </div>
        </section>

        {/* Individual Comments Section */}
        {reviews.length > 0 && (
            <section className="mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-white">التقييمات والمراجعات</h2>
                    <button className="text-[#01875f] text-sm font-bold">عرض الكل</button>
                </div>
                <div className="space-y-6">
                    {reviews.map(comment => (
                        <div key={comment.id} className="border-b border-gray-800 pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                        {comment.user.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-white">{comment.user}</span>
                                </div>
                                <span className="text-[10px] text-gray-500">{comment.date}</span>
                            </div>
                            <div className="flex gap-0.5 text-[#01875f] mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <StarIcon key={i} className={`w-2.5 h-2.5 ${i < comment.rating ? 'fill-current' : 'text-gray-700'}`} />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{comment.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Data Safety Section */}
        <section className="mb-16">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">أمان البيانات</h2>
                <button className="p-2 -ml-2"><ChevronRightIcon className="w-5 h-5 transform rotate-180 opacity-60" /></button>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-6 font-normal">يبدأ الحفاظ على أمان بياناتك بفهم كيفية جمع المطورين لبياناتك ومشاركتها.</p>
            <div className="space-y-4 bg-transparent border border-gray-800 rounded-xl p-4">
                <div className="flex items-start gap-4">
                    <div className="mt-1 text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-300">لا يتم جمع أي بيانات</p>
                        <p className="text-xs text-gray-500 font-normal">لا يجمع هذا المطور أي بيانات من المستخدمين.</p>
                    </div>
                </div>
            </div>
        </section>

      </main>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0B0B0B] border-t border-gray-800 flex items-center justify-around z-[60] px-4">
          <div className="flex flex-col items-center text-gray-500 gap-1">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
             <span className="text-[10px]">الألعاب</span>
          </div>
          <div className="flex flex-col items-center text-[#01875f] gap-1">
             <div className="bg-[#01875f]/10 px-6 py-1 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
             </div>
             <span className="text-[10px] font-bold">التطبيقات</span>
          </div>
          <div className="flex flex-col items-center text-gray-500 gap-1">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
             <span className="text-[10px]">الكتب</span>
          </div>
      </div>
    </div>
  );
};

export default AppPage;