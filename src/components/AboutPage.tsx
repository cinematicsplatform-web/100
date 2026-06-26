
import React from 'react';
import type { View } from '@/types';
import { ChevronRightIcon } from './icons/ChevronRight';
import SEO from './SeoMeta';

interface AboutPageProps {
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  returnView?: View;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const AboutPage: React.FC<AboutPageProps> = ({ onSetView, onGoBack, returnView, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme }) => {
  const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
  const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[#00A7F8]';

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white animate-fade-in relative overflow-x-hidden">
      <SEO title="من نحن - سينماتيكس" description="تعرف على رؤية ورسالة منصة سينماتيكس الرائدة في عالم الترفيه الرقمي." />
      
      {/* Background Container - Same as Welcome Page */}
      <div className="fixed inset-0 z-0 h-screen w-full">
          <img 
            src="https://shahid.mbc.net/mediaObject/436ea116-cdae-4007-ace6-3c755df16856?width=1920&type=avif&q=80" 
            className="w-full h-full object-cover opacity-100"
            alt=""
          />
          {/* Top Shadow */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[var(--bg-body)] via-transparent to-transparent z-10"></div>
          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-body)] via-[var(--bg-body)]/40 to-transparent z-10"></div>
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-4 pt-24 pb-24">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-16">
            <button 
                onClick={() => onGoBack(returnView || 'home')} 
                className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all border border-white/10 shadow-lg group"
                title="رجوع"
            >
                <ChevronRightIcon className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-3xl md:text-5xl font-black drop-shadow-2xl">من نحن</h1>
            <div className="w-12"></div>
        </div>

        {/* Content Sections */}
        <div className="space-y-20">
            
            {/* Vision & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fade-in-up">
                <div className="space-y-6 text-right">
                    <h2 className={`text-2xl md:text-4xl font-black ${accentColor}`}>رؤيتنا</h2>
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium drop-shadow-md">
                        في سينماتيكس، نؤمن بأن الترفيه حق للجميع. رؤيتنا هي بناء أكبر مجتمع ترفيهي رقمي في العالم العربي، حيث يلتقي الشغف بالسينما مع التكنولوجيا الحديثة لتقديم تجربة مشاهدة لا تُنسى، وبدون أي حواجز مالية.
                    </p>
                </div>
                <div className="relative group">
                    <div className={`absolute inset-0 ${bgAccent} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700`}></div>
                    <img 
                        src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop" 
                        className="rounded-3xl shadow-2xl border border-white/10 relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500"
                        alt="Vision"
                    />
                </div>
            </div>

            {/* Platform Values */}
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-16 text-center space-y-12 shadow-2xl animate-fade-in-up">
                <h2 className="text-3xl md:text-5xl font-black">قيمنا الأساسية</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
                    <div className="space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-2xl ${bgAccent} flex items-center justify-center text-black text-3xl shadow-xl`}>🚀</div>
                        <h3 className="text-xl font-black text-white">السرعة الفائقة</h3>
                        <p className="text-gray-300 text-sm leading-relaxed font-bold">نستخدم أحدث تقنيات البث لضمان تشغيل المحتوى فوراً وبدون انقطاع.</p>
                    </div>
                    <div className="space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-2xl ${bgAccent} flex items-center justify-center text-black text-3xl shadow-xl`}>💎</div>
                        <h3 className="text-xl font-black text-white">الجودة العالية</h3>
                        <p className="text-gray-300 text-sm leading-relaxed font-bold">نوفر المحتوى بدقة 4K و HD لنضمن لك أفضل تجربة بصرية ممكنة.</p>
                    </div>
                    <div className="space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-2xl ${bgAccent} flex items-center justify-center text-black text-3xl shadow-xl`}>🛡️</div>
                        <h3 className="text-xl font-black text-white">أمان العائلة</h3>
                        <p className="text-gray-300 text-sm leading-relaxed font-bold">نظام رقابة متطور وملفات شخصية خاصة للأطفال لمشاهدة آمنة تماماً.</p>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-8 pt-10 animate-fade-in-up">
                <h2 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-2xl">انضم إلى مجتمع الترفيه الأكبر</h2>
                <p className="text-gray-300 text-lg md:text-xl font-bold max-w-2xl mx-auto drop-shadow-lg">أكثر من 10,000 فيلم ومسلسل في انتظارك. ابدأ رحلتك الآن.</p>
                <button
                    onClick={() => onSetView('home')}
                    className={`${bgAccent} text-white font-black px-12 py-5 rounded-full text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]`}
                >
                    ابدأ المشاهدة الآن
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
