import React, { useState, useMemo } from 'react';
import type { Content, View } from '@/types';
import { ChevronRightIcon } from './icons/ChevronRight';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface WelcomePageProps {
    allContent: Content[];
    onSetView: (view: View, category?: string, params?: any) => void;
    isRamadanTheme?: boolean;
    isEidTheme?: boolean;
    isCosmicTealTheme?: boolean;
    isNetflixRedTheme?: boolean;
    isShahidTheme?: boolean;
    returnView?: View;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ 
    allContent, 
    onSetView,
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme,
    isShahidTheme,
    returnView
}) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const kidsPosters = useMemo(() => {
        const uniqueKids = allContent
            .filter(c => 
                (c.categories as string[]).includes('أفلام أنيميشن') || 
                (c.categories as string[]).includes('افلام أنميشن') || 
                c.genres.includes('أطفال') || 
                c.visibility === 'kids'
            )
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
        
        return uniqueKids.length > 0 ? [...uniqueKids, ...uniqueKids] : [];
    }, [allContent]);

    const faqs = [
        { 
            q: "ما هو سينماتيكس؟", 
            a: "سينماتيكس هو وجهتك الأولى للترفيه الرقمي. نحن منصة توفر مكتبة متجددة يومياً من أحدث الأفلام والمسلسلات العربية والعالمية، بجودة عالية وترجمة احترافية، وكل ذلك متاح لك مجاناً دون الحاجة لدفع أي رسوم." 
        },
        { 
            q: "هل الموقع مجاني أم توجد اشتراكات مدفوعة؟", 
            a: "الموقع مجاني 100%. لا توجد لدينا أي باقات مدفوعة أو اشتراكات شهرية مخفية. جميع الأفلام والمسلسلات متاحة للمشاهدة والتحميل للجميع بلا قيود أو حدود." 
        },
        { 
            q: "هل يجب أن أدفع لكي أشاهد المحتوى؟", 
            a: "إطلاقاً! لا يُطلب منك دفع أي مليم. نحن نؤمن بأن الترفيه حق للجميع. يمكنك ببساطة تصفح الموقع، اختيار ما تحب، والبدء بالمشاهدة فوراً." 
        },
        { 
            q: "لماذا توجد إعلانات في الموقع؟", 
            a: "الإعلانات هي المصدر الوحيد الذي يساعدنا على دفع تكاليف وصيانة الموقع، لنضمن لك استمرار الخدمة مجاناً وبأعلى جودة ممكنة. نحن نبذل جهدنا دائماً لجعلها محدودة وغير مزعجة لتجربتك." 
        },
        { 
            q: "هل يمكنني المشاهدة من أجهزة متعددة؟", 
            a: "نعم، وبلا حدود! يمكنك فتح حسابك والمشاهدة من هاتفك، اللابتوب، التابلت، أو حتى الشاشة الذكية في أي وقت وفي نفس الوقت، دون أي قيود على نوع أو عدد الأجهزة." 
        },
        { 
            q: "ما هي فائدة إنشاء حساب في الموقع؟", 
            a: "التسجيل مجاني ويمنحك تحكماً كاملاً في تجربتك، حيث يمكنك: إنشاء ما يصل إلى 5 ملفات شخصية (Profiles) داخل الحساب الواحد، ليحتفظ كل فرد من العائلة بسجل مشاهداته وقائمته الخاصة بشكل مستقل، تخصيص ملف آمن للأطفال يعرض فقط المحتوى المناسب لأعمارهم، وإضافة الأفلام والمسلسلات إلى 'قائمتي' لاستكمال مشاهدتها لاحقاً بسهولة." 
        },
        { 
            q: "هل يمكنني تحميل فيلم أو مسلسل بأكثر من جودة؟", 
            a: "بالتأكيد. نحن نوفر روابط تحميل مباشرة وسريعة بدقات متعددة (بدءاً من الجودات المنخفضة المناسبة لباقات الموبايل وحتى جودة 4K الفائقة) لتناسب سرعة الإنترنت لديك ومساحة التخزين في جهازك." 
        }
    ];

    const features = [
        { icon: "https://shahid.mbc.net/mediaObject/NSF_2024/Icon_5/Shape-3/original/Shape-3.png?width=56&type=avif&q=80", title: "تقلية HD" },
        { icon: "https://shahid.mbc.net/mediaObject/NSF_2024/Icon_1/Shape-2/original/Shape-2.png?width=56&type=avif&q=80", title: "تحميل مباشر" },
        { icon: "https://shahid.mbc.net/mediaObject/NSF_2024/Icon_2/Shape/original/Shape.png?width=56&type=avif&q=80", title: "أجهزة متعددة" },
        { 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="#00A7F8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ), 
            title: "5 ملفات شخصية" 
        },
        { icon: "https://shahid.mbc.net/mediaObject/NSF_2024/Icon_4/Group/original/Group.png?width=56&type=avif&q=80", title: "محتوى آمن للأطفال" }
    ];

    const platforms = [
        { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
        { name: "Disney+", logo: "https://bs.cimanow.cc/wp-content/themes/Cima%20Now%20New/Assets/imgs/dis.png" },
        { name: "BluTV", logo: "https://bs.cimanow.cc/wp-content/themes/Cima%20Now%20New/Assets/imgs/hu.png" },
        { name: "Amazon Prime", logo: "https://bs.cimanow.cc/wp-content/themes/Cima%20Now%20New/Assets/imgs/pv.png" },
        { name: "Shahid", logo: "https://shahid.mbc.net/mediaObject/shahidlogo/light/Shahid_logo_light/original/Shahid_logo_light.png?height=178&width=auto&croppingPoint=mc&type=webp" },
        { name: "Watch IT", logo: "https://www.watchit.com/assets/images/logo.png" }
    ];

    const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
    const borderAccent = isRamadanTheme ? 'border-amber-500' : isEidTheme ? 'border-purple-500' : isCosmicTealTheme ? 'border-[#35F18B]' : isNetflixRedTheme ? 'border-[#E50914]' : 'border-[#00A7F8]';

    return (
        <div className="min-h-screen bg-[var(--bg-body)] text-white font-['Cairo'] overflow-x-hidden selection:bg-[var(--color-primary-from)] selection:text-black" dir="rtl">
            
            {/* HERO SECTION */}
            <section className="relative h-[85vh] md:h-screen w-full flex flex-col overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://shahid.mbc.net/mediaObject/436ea116-cdae-4007-ace6-3c755df16856?width=1920&type=avif&q=80" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60 md:object-top"
                    />
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[var(--bg-body)] via-[var(--bg-body)]/60 to-transparent z-10 hidden md:block"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-body)]"></div>
                </div>

                {/* Mobile Back Button */}
                <div className="flex md:hidden absolute top-6 right-4 z-[100] pointer-events-auto">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            const target = (returnView && returnView !== 'welcome') ? returnView : 'home';
                            onSetView(target);
                        }}
                        className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 active:scale-90 transition-all"
                        aria-label="Back"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Navbar - hidden in Shahid theme because global header is active */}
                {!isShahidTheme && (
                    <nav className="relative z-50 w-full px-4 md:px-12 py-6 hidden md:flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 onClick={() => onSetView('home')} className="text-2xl md:text-3xl font-extrabold cursor-pointer">
                                <span className="text-white">سينما</span><span className="gradient-text font-['Lalezar'] tracking-wide">تيكس</span>
                            </h1>
                            <div className="hidden lg:flex items-center gap-6 text-md font-bold text-white">
                                <button onClick={() => onSetView('home')} className="hover-text-accent transition-all duration-200">الرئيسية</button>
                                <button onClick={() => onSetView('series')} className="hover-text-accent transition-all duration-200">المسلسلات</button>
                                <button onClick={() => onSetView('movies')} className="hover-text-accent transition-all duration-200">الأفلام</button>
                                <button onClick={() => onSetView('kids')} className="hover-text-accent transition-all duration-200">الأطفال</button>
                                <button onClick={() => onSetView('ramadan')} className="hover-text-accent transition-all duration-200">رمضان</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6">
                            <button onClick={() => onSetView('login')} className="text-sm font-bold text-white hover-text-accent transition-all duration-200">تسجيل الدخول</button>
                            <button onClick={() => onSetView('register')} className="btn-primary font-bold px-6 py-2.5 rounded-full text-sm shadow-lg transform active:scale-95 transition-all">انشاء حساب</button>
                        </div>
                    </nav>
                )}

                <div className={`relative z-10 flex-1 flex flex-col items-center justify-start ${isShahidTheme ? 'pt-24 md:pt-40' : 'pt-44 md:pt-80'} text-center px-4 max-w-4xl mx-auto animate-fade-in-up`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight drop-shadow-2xl">أحدث الأعمال السينمائية.. فور صدورها.</h2>
                    <p className="text-base md:text-2xl text-gray-200 mb-12 leading-relaxed drop-shadow-lg max-w-2xl px-2">تابع كل ما هو جديد في عالم السينما والدراما. نوفر لك أحدث الإصدارات بجودة عالية، مجاناً وبدون تعقيدات.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                        <button onClick={() => onSetView('register')} className={`w-full sm:w-auto ${isShahidTheme ? 'bg-white hover:bg-neutral-100 text-black shadow-[0_0_30px_rgba(255,255,255,0.15)] font-extrabold' : 'btn-primary text-black font-black'} px-12 py-4 rounded-full text-lg transition-all hover:scale-105 active:scale-95`}>إنشاء حساب جديد</button>
                        <button onClick={() => onSetView('login')} className="text-white font-black text-lg hover:text-white hover:opacity-80 transition-all">تسجيل الدخول</button>
                    </div>
                </div>

                <div className="relative z-10 w-full bg-gradient-to-t from-[var(--bg-body)] via-[var(--bg-body)]/95 to-transparent py-10 md:py-10 md:bg-black/60 md:backdrop-blur-lg mt-auto">
                    <div className="max-w-6xl mx-auto px-4 flex flex-wrap md:flex-nowrap items-center justify-center gap-y-10 md:gap-y-0">
                        {features.map((feat, i) => (
                            <React.Fragment key={i}>
                                <div className={`flex flex-col items-center gap-2.5 text-center group transition-all ${i < 3 ? 'w-1/3' : 'w-1/2'} ${(i === 0 || i === 1) ? 'border-l border-white/20' : ''} ${(i === 3) ? 'border-l border-white/20' : ''} md:flex-1 md:w-auto md:border-none`}>
                                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-transform group-hover:scale-110">{typeof feat.icon === 'string' ? (<img src={feat.icon} alt={feat.title} className="w-full h-full object-contain" />) : (feat.icon)}</div>
                                    <span className="text-[11px] md:text-sm font-black text-white/90 group-hover:text-white transition-colors tracking-tight whitespace-nowrap">{feat.title}</span>
                                </div>
                                {i < features.length - 1 && (<div className="hidden md:block h-12 w-px bg-white/10 mx-1 md:mx-4"></div>)}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTENT PREVIEW */}
            <section className="py-20 bg-[var(--bg-body)] relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/5 to-transparent"></div>
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex items-center justify-between mb-10 px-6 md:px-12">
                        <h3 className={`text-2xl md:text-4xl font-black text-white text-right border-r-4 ${borderAccent} pr-4`}>أقوى الأفلام العالمية</h3>
                    </div>
                    {/* FIXED: No more fading - opacity 100 */}
                    <div className="scrolling-banner h-44 md:h-60 shadow-2xl opacity-100 transition-opacity" style={{ backgroundImage: "url('https://bs.cimanow.cc/wp-content/themes/Cima%20Now%20New/Assets/imgs/zGoZB4CboMzY1z4G3nU6BWnMDB2.png')" }}></div>
                </div>
            </section>

            {/* ACCOUNT BANNER */}
            <section className="py-24 px-6 md:px-12 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-body)] to-[var(--bg-body)] relative overflow-hidden">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="flex-1 space-y-6 text-center md:text-right">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white">حساب واحد يضم الكثير...</h2>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl md:mr-0">شاهد كل جديد المنصات في مكان واحد فقط، بدون الحاجة لتعدد الحسابات والاشتراكات المكلفة.</p>
                        <button onClick={() => onSetView('register')} className="bg-white text-black font-black px-12 py-4 rounded-full text-lg hover:bg-gray-200 transition-all transform active:scale-95 shadow-xl">أنشئ حسابك الآن</button>
                    </div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {platforms.map(p => (
                            <div key={p.name} className="bg-[#1a2230] border border-white/10 p-6 rounded-3xl flex items-center justify-center h-28 md:h-32 hover:bg-[#1f2937] transition-all transform hover:scale-105 group shadow-lg">
                                <img src={p.logo} alt={p.name} className="max-w-full max-h-[60%] object-contain transition-all brightness-100 group-hover:brightness-110" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-[var(--bg-body)] relative">
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex items-center justify-between mb-10 px-6 md:px-12">
                        <h3 className={`text-2xl md:text-4xl font-black text-white text-right border-r-4 ${borderAccent} pr-4`}>أقوى المسلسلات العالمية</h3>
                    </div>
                    {/* FIXED: No more fading - opacity 100 */}
                    <div className="scrolling-banner h-44 md:h-60 shadow-2xl opacity-100 transition-opacity" style={{ backgroundImage: "url('https://bs.cimanow.cc/wp-content/themes/Cima%20Now%20New/Assets/imgs/2zjEYhbPKhyMZdLFMh44kXr6MZt.png')" }}></div>
                </div>
            </section>

            {/* KIDS SECTION */}
            <section className="py-24 bg-[var(--bg-body)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none"></div>
                <div className="max-w-1920px mx-auto relative z-10">
                    <div className="text-center mb-16 px-4">
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-4 animate-fade-in">لم ننس الأطفال...</h3>
                        <p className="text-lg md:text-xl text-gray-400 font-bold max-w-2xl mx-auto">محتوى مُختار خصيصاً لجميع أفراد عائلتك</p>
                    </div>
                    
                    <div className="relative overflow-hidden h-44 md:h-72 w-full">
                        {/* FIXED: Vibrant Colors - No opacity or brightness filtering */}
                        <div className="flex w-fit gap-4 animate-infinite-scroll-rtl whitespace-nowrap">
                            {kidsPosters.length > 0 ? (
                                kidsPosters.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="h-44 md:h-72 aspect-[2/3] flex-shrink-0">
                                        <img src={item.poster} alt={item.title} className="w-full h-full object-cover rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 border border-white/5 opacity-100" loading="lazy" />
                                    </div>
                                ))
                            ) : (
                                <div className="w-screen h-44 md:h-72 bg-gray-800/20 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center"><span className="text-gray-500 font-bold">لا يوجد محتوى أطفال حالياً</span></div>
                            )}
                        </div>
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--bg-body)] to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--bg-body)] to-transparent z-10 pointer-events-none"></div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="py-24 px-6 md:px-12 bg-[var(--bg-body)]">
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-3xl md:text-5xl font-black text-center mb-16">الأسئلة الشائعة</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-white/5 rounded-2xl overflow-hidden transition-all">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 md:p-8 bg-white/5 hover:bg-white/10 transition-colors text-right">
                                    <span className="text-lg md:text-xl font-bold">{faq.q}</span>
                                    <div className={`transition-transform duration-300 ${openFaq === i ? 'rotate-90' : 'rotate-0'} ${accentColor}`}><ChevronLeftIcon className="w-6 h-6" /></div>
                                </button>
                                <div className={`transition-all duration-300 ease-in-out bg-white/[0.02] overflow-hidden ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}><div className="p-6 md:p-8 pt-0 text-gray-400 leading-relaxed text-base md:text-lg text-right">{faq.a}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-12 px-6 md:px-12 bg-black/40 border-t border-white/5">
                <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
                    <div className="flex gap-8 text-sm font-bold">
                        <button onClick={() => onSetView('home')} className="hover-text-accent transition-colors">الرئيسية</button>
                        <button onClick={() => onSetView('movies')} className="hover-text-accent transition-colors">الأفلام</button>
                        <button onClick={() => onSetView('series')} className="hover-text-accent transition-colors">المسلسلات</button>
                        <button onClick={() => onSetView('about')} className="hover-text-accent transition-colors">حولنا</button>
                    </div>
                    <div className="text-sm font-bold opacity-50" dir="ltr">&copy; {new Date().getFullYear()} Cinematix. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
};

export default WelcomePage;