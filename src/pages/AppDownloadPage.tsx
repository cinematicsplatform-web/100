import React, { useState } from 'react';
import type { View } from '@/types';
import { ChevronRightIcon } from '../components/icons/ChevronRight';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import SEO from '../components/SeoMeta';

interface AppDownloadPageProps {
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  apkUrl?: string;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  returnView?: View;
}

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
);

const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.008v.008H6.75V6.75Zm0 9.75h.008v.008H6.75v-.008Zm9.75-9.75h.008v.008h-.008V6.75ZM13.5 13.5h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm-.75.75h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm-.75.75h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75ZM17.25 13.5h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm-.75.75h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm-.75.75h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75ZM13.5 17.25h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm-3 1.5h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Zm.75 0h.75v.75h-.75v-.75Z" />
    </svg>
);

const AppDownloadPage: React.FC<AppDownloadPageProps> = ({ 
    onSetView, 
    onGoBack,
    apkUrl, 
    isRamadanTheme, 
    isEidTheme, 
    isCosmicTealTheme, 
    isNetflixRedTheme,
    returnView 
}) => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    
    const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
    const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[#00A7F8]';
    const borderAccent = isRamadanTheme ? 'border-amber-500/50' : isEidTheme ? 'border-purple-500/50' : isCosmicTealTheme ? 'border-[#35F18B]/50' : isNetflixRedTheme ? 'border-[#E50914]/50' : 'border-[#00A7F8]/50';

    const appIconUrl = "https://i.suar.me/GErAg/l";

    const screenshots = [
        "https://i.suar.me/KBMA2/l",
        "https://i.suar.me/62YMx/l",
        "https://i.suar.me/ZvOjw/l",
        "https://i.suar.me/yE0Kq/l",
        "https://i.suar.me/mp1KW/l",
        "https://i.suar.me/4AV3v/l",
        "https://i.suar.me/Br1yY/l"
    ];

    const features = [
        { 
            title: "محرك تشغيل ذكي", 
            desc: "تقنيات متقدمة تضمن تشغيل الفيديو بسلاسة تامة حتى مع اتصالات الإنترنت المتقلبة.",
            icon: (
                <svg className={`w-12 h-12 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
            )
        },
        { 
            title: "دقة سينمائية 4K", 
            desc: "استمتع بأدق التفاصيل مع دعم كامل لدقة 4K وتقنيات HDR لتجربة بصرية مذهلة.",
            icon: (
                <svg className={`w-12 h-12 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
            )
        },
        { 
            title: "نظام تنبيهات ذكي", 
            desc: "تلقى إشعارات فورية مخصصة لاهتماماتك عند صدور حلقات جديدة من مسلسلاتك المفضلة.",
            icon: (
                <svg className={`w-12 h-12 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
            )
        },
        { 
            title: "توفير فائق للبيانات", 
            desc: "خوارزميات ضغط متطورة تمنحك جودة عالية مع استهلاك أقل بنسبة 40% من بيانات الموبايل.",
            icon: (
                <svg className={`w-12 h-12 ${accentColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
            )
        }
    ];

    const steps = [
        { 
            title: "تحميل ملف الـ APK", 
            desc: "ابدأ بالضغط على زر التحميل المباشر. تأكد من أن هاتفك يسمح بالتحميل من متصفحك الحالي.",
            icon: <DownloadIcon className="w-6 h-6" />
        },
        { 
            title: "السماح بالمصادر غير المعروفة", 
            desc: "عند محاولة التثبيت، قد يطلب هاتفك إذناً. اذهب إلى الإعدادات > الحماية، وقم بتفعيل 'تثبيت تطبيقات من مصادر غير معروفة'.",
            icon: <ShieldCheckIcon className="w-6 h-6" />
        },
        { 
            title: "التثبيت والاستمتاع", 
            desc: "افتح ملف الـ APK الذي قمت بتحميله واضغط على 'تثبيت'. بمجرد الانتهاء، ستجد أيقونة سينماتيكس في قائمة تطبيقاتك.",
            icon: <ChevronLeftIcon className="w-6 h-6 transform rotate-180" />
        }
    ];

    const appFaqs = [
        { q: "هل التطبيق آمن على هاتفي؟", a: "نعم، التطبيق مفحوص بالكامل وخالٍ من أي برمجيات ضارة. نستخدم بروتوكولات حماية متطورة لضمان أمان بياناتك." },
        { q: "لماذا لا يتوفر التطبيق على متجر Google Play؟", a: "بسبب سياسات النشر الخاصة بالمحتوى المرئي، نوفر التطبيق عبر رابط مباشر لضمان وصول التحديثات إليك بشكل أسرع وبدون قيود." },
        { q: "هل أحتاج إلى إنشاء حساب جديد للتطبيق؟", a: "لا، يمكنك استخدام نفس بيانات حسابك على الموقع لمزامنة 'قائمتي' وسجل المشاهدة الخاص بك." },
        { q: "كيف أقوم بتحديث التطبيق مستقبلاً؟", a: "سيصلك تنبيه داخل التطبيق عند توفر نسخة جديدة، ويمكنك تحميلها بنفس الطريقة من هذه الصفحة." }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-body)] text-white font-['Cairo'] pb-20 animate-fade-in" dir="rtl">
            <SEO title="تحميل التطبيق الرسمي" description="حمل تطبيق سينماتيكس الرسمي للأندرويد واستمتع بتجربة مشاهدة فائقة السرعة وبجودة عالية لأحدث الأفلام والمسلسلات." />

            {/* Top Navigation */}
            <div className="w-full px-6 md:px-12 py-6 flex items-center justify-between relative z-50">
                <h1 onClick={() => onSetView('home')} className="text-2xl md:text-3xl font-extrabold cursor-pointer">
                    <span className="text-white">سينما</span><span className="gradient-text font-['Lalezar'] tracking-wide">تيكس</span>
                </h1>
                
                <button 
                    onClick={() => onGoBack(returnView || 'home')}
                    className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    aria-label="رجوع"
                >
                    <ChevronRightIcon className="w-6 h-6 transform rotate-180 text-white group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-24">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-right space-y-8 animate-fade-in-up">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        {/* App Icon */}
                        <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-3xl border-[3px] ${borderAccent} shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden transform hover:rotate-3 transition-transform duration-500 bg-black p-1`}>
                            <img 
                                src={appIconUrl} 
                                alt="Cinematix App Icon" 
                                className="w-full h-full object-cover rounded-2xl" 
                            />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-4xl md:text-6xl font-black leading-tight">تطبيق سينماتيكس</h2>
                            <p className={`text-xl font-bold ${accentColor} tracking-widest uppercase`}>النسخة الاحترافية V1.2.5</p>
                        </div>
                    </div>
                    
                    <p className="text-lg md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                        انقل تجربة المشاهدة إلى مستوى آخر. تطبيقنا مصمم خصيصاً ليمنحك سرعة فائقة، استهلاك بيانات أقل، ودعماً كاملاً للمشاهدة بدون إنترنت.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-2">
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                            <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] md:text-xs font-bold text-green-400">آمن بالكامل</span>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                            <ClockIcon className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] md:text-xs font-bold text-green-400">تحديثات دورية</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-start gap-6 w-full">
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
                            <a 
                                href={apkUrl || '#'} 
                                download 
                                className={`inline-flex items-center justify-center gap-4 px-10 py-5 rounded-2xl font-black text-xl md:text-2xl shadow-[0_0_40px_var(--shadow-color)] transition-all hover:scale-105 active:scale-95 btn-primary w-full sm:w-auto`}
                            >
                                <DownloadIcon className="w-8 h-8" />
                                <span>تحميل مباشر (APK)</span>
                            </a>
                            
                            {/* QR Code Simulation for Desktop */}
                            <div className="hidden xl:flex items-center gap-4 bg-white/5 border border-white/10 p-2 pr-6 rounded-2xl">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400">امسح الكود</p>
                                    <p className="text-sm font-black text-white">للتحميل على هاتفك</p>
                                </div>
                                <div className="w-16 h-16 bg-white p-1 rounded-lg">
                                    <QrCodeIcon className="w-full h-full text-black" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 opacity-50 text-xs font-bold uppercase tracking-widest">
                            <span>متوافق مع أندرويد 6.0+</span>
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            <span>حجم الملف: 24.8 MB</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Phone Mockup */}
                <div className="hidden lg:flex justify-center relative animate-fade-in">
                    <div className="absolute inset-0 bg-[var(--color-primary-from)]/10 rounded-full blur-[120px] pointer-events-none scale-75"></div>
                    <div className="relative w-[340px] h-[680px] bg-[#050505] border-[12px] border-[#1a1a1a] rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-white/10">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-2xl z-20"></div>
                        
                        {/* Screen Content */}
                        <div className="w-full h-full bg-[#0f1014] relative">
                            <img src={screenshots[0]} alt="App Screen Mockup" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="bg-black/40 py-24 border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                    <h3 className="text-3xl md:text-5xl font-black text-center mb-16">مميزات لا تجدها إلا في التطبيق</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feat, i) => (
                            <div key={i} className={`bg-[#1a2230]/60 backdrop-blur-md border border-white/5 p-8 rounded-3xl text-center group hover:bg-[#1a2230]/80 transition-all duration-300 hover:-translate-y-2 shadow-xl`}>
                                <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                                    {feat.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Installation Guide - Simplified */}
            <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <h3 className="text-3xl md:text-5xl font-black mb-4">دليل التثبيت خطوة بخطوة</h3>
                    <p className="text-gray-400 text-lg">ثلاث خطوات بسيطة وتبدأ رحلة الترفيه</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center relative z-10 group">
                            <div className={`w-20 h-20 rounded-2xl ${bgAccent} text-black flex items-center justify-center mb-8 shadow-[0_0_30px_var(--shadow-color)] transform transition-transform group-hover:rotate-6 group-hover:scale-110`}>
                                {step.icon}
                            </div>
                            <div className="bg-[#1a2230]/20 p-8 rounded-[2rem] border border-white/5 h-full transition-all group-hover:border-white/10">
                                <h4 className="text-2xl font-bold mb-4 text-white">{step.title}</h4>
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Screenshots Section - No frame, natural size */}
            <section className="py-24 overflow-hidden bg-gradient-to-b from-transparent to-black/30">
                <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12 flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl md:text-5xl font-black">واجهة عصرية</h3>
                        <p className="text-gray-500 mt-2 font-bold text-lg">تصميم يضع المحتوى في المقدمة</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                        <div className={`w-8 h-2 rounded-full ${bgAccent}`}></div>
                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    </div>
                </div>
                
                <div className="flex gap-8 overflow-x-auto px-6 md:px-12 no-scrollbar scroll-smooth pb-12">
                    {screenshots.map((shot, i) => (
                        <div key={i} className="flex-shrink-0 w-auto group cursor-pointer relative bg-transparent transition-all hover:scale-105">
                            <img 
                                src={shot} 
                                alt={`App Screen ${i+1}`} 
                                className="h-[400px] md:h-[600px] w-auto block object-contain" 
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                                <span className="text-white font-bold bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs">لقطة شاشة {i+1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* App FAQ - Centered and Larger */}
            <section className="py-24 max-w-4xl mx-auto px-6 md:px-12">
                <div className="text-center mb-12">
                    <h3 className="text-3xl md:text-5xl font-black mb-8 flex items-center justify-center gap-3">
                        <span className={`text-4xl ${accentColor}`}>?</span>
                        الأسئلة الشائعة حول التطبيق
                    </h3>
                </div>
                
                <div className="space-y-6">
                    {appFaqs.map((faq, i) => (
                        <div key={i} className="border border-white/10 rounded-3xl overflow-hidden bg-white/[0.03] backdrop-blur-sm">
                            <button 
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className="w-full p-6 md:p-8 text-right font-bold flex justify-between items-center hover:bg-white/5 transition-all text-lg md:text-xl"
                            >
                                <span>{faq.q}</span>
                                <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''} ${accentColor}`} />
                            </button>
                            <div className={`transition-all duration-300 overflow-hidden ${activeFaq === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-8 pt-0 text-gray-300 text-base md:text-lg leading-loose border-t border-white/5">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Support Link - Repositioned CTA */}
                <div className="mt-20 p-8 md:p-12 bg-gradient-to-r from-[var(--color-primary-from)]/20 to-transparent border-r-8 border-[var(--color-primary-from)] rounded-2xl shadow-2xl animate-fade-in-up">
                    <h4 className="text-2xl md:text-3xl font-black text-white mb-4">تواجه مشكلة في التثبيت أو تشغيل التطبيق؟</h4>
                    <p className="text-gray-300 text-lg mb-8">فريق الدعم الفني متواجد لمساعدتك في أي وقت لحل أي عطل أو استفسار.</p>
                    <a 
                        href="https://t.me/your_telegram_link" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`inline-flex items-center gap-3 px-10 py-4 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95 ${bgAccent} text-black`}
                    >
                        <span>تواصل مع الدعم الفني عبر تليجرام</span>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.35 3.68-1.57 4.44-1.84 4.94-1.85.11 0 .35.03.5.16.13.1.17.24.18.33.01.06.02.21.01.27z"/>
                        </svg>
                    </a>
                </div>
            </section>

            {/* Footer Notice */}
            <div className="text-center mt-12 px-6 opacity-40">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <img src={appIconUrl} alt="logo small" className="w-10 h-10 rounded-2xl grayscale" />
                    <span className="text-xl font-bold">سينماتيكس للموبايل</span>
                </div>
                <p className="text-sm font-bold text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    هذا التطبيق مخصص للأغراض التعليمية والترفيهية. نحن لا نقوم بتخزين أي ملفات فيديو على خوادمنا. جميع المحتويات مقدمة من قبل أطراف ثالثة غير تابعة للمنصة.
                    <br />
                    جميع الحقوق محفوظة © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

export default AppDownloadPage;