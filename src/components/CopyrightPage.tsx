
import React from 'react';
import type { View } from '@/types';
import { ChevronRightIcon } from './icons/ChevronRight';
import SEO from './SeoMeta';

interface CopyrightPageProps {
  content: string;
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  returnView?: View;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const CopyrightPage: React.FC<CopyrightPageProps> = ({ content, onSetView, onGoBack, returnView, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme }) => {
  const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
  const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[#00A7F8]';

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white animate-fade-in relative overflow-x-hidden">
      <SEO title="حقوق الملكية - سينماتيكس" description="سياسة حقوق الملكية الفكرية وقانون حقوق الألفية الرقمية (DMCA) لمنصة سينماتيكس." />
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-10 pointer-events-none">
          <div className={`absolute inset-0 ${bgAccent} rounded-full blur-[150px]`}></div>
      </div>

      <div className="relative z-20 max-w-4xl mx-auto px-4 pt-24 pb-24">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-16">
            <button 
                onClick={() => onGoBack(returnView || 'home')} 
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white transition-all border border-white/10 shadow-lg group"
                title="رجوع"
            >
                <ChevronRightIcon className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-3xl md:text-5xl font-black">حقوق الملكية</h1>
            <div className="w-12"></div>
        </div>

        <div className="bg-[#1a2230]/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl">
            <div className="prose prose-invert prose-lg max-w-none">
                <div className="text-right space-y-12">
                    
                    <section className="space-y-4 text-center pb-8 border-b border-white/10">
                        <div className={`w-20 h-20 mx-auto rounded-full ${bgAccent} flex items-center justify-center text-black text-4xl mb-6 shadow-2xl`}>©</div>
                        <h2 className="text-2xl md:text-4xl font-black text-white">إخلاء المسؤولية القانوني</h2>
                        <p className="text-gray-400 leading-relaxed font-bold max-w-2xl mx-auto">
                            سينماتيكس هي منصة لتنظيم الفهارس وتسهيل الوصول للمحتوى المرئي. نحن لا نقوم بتخزين أي ملفات فيديو على خوادمنا الخاصة.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>1. طبيعة المحتوى</h2>
                        <p className="text-gray-300 leading-loose font-medium">
                            جميع المحتويات المتوفرة على سينماتيكس يتم جلبها من مصادر أطراف ثالثة عامة ومتوفرة على الإنترنت. المنصة تعمل كمحرك بحث متطور يقوم بتوفير الروابط للمستخدمين لسهولة الوصول إليها في مكان واحد.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>2. العلامة التجارية</h2>
                        <p className="text-gray-300 leading-loose font-medium">
                            اسم "سينماتيكس" والشعارات المرتبطة به هي علامات تجارية خاصة بنا. أما أسماء الأفلام، المسلسلات، والبوسترات فهي ملك لأصحابها من شركات الإنتاج والتوزيع الأصلية ويتم استخدامها هنا لأغراض العرض والتعريف فقط.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>3. بلاغات الانتهاك (DMCA)</h2>
                        <p className="text-gray-300 leading-loose font-medium">
                            نحن نحترم حقوق الملكية الفكرية للآخرين. إذا كنت مالكاً لحقوق طبع ونشر وتعتقد أن هناك محتوى على موقعنا ينتهك هذه الحقوق، يرجى مراسلتنا فوراً. سنتخذ الإجراءات اللازمة لإزالة الروابط المخالفة خلال أقل من 48 ساعة عمل.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-4">
                            <h3 className="text-white font-bold mb-2">كيف تبلغ عن انتهاك؟</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">يجب أن يتضمن طلبك: وصفاً للمادة المنتهكة، ورابط الصفحة على موقعنا، ومعلومات الاتصال بك.</p>
                            <a href="#" className={`font-black text-sm underline ${accentColor}`}>راسلنا الآن للتبليغ</a>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>4. الاستخدام المقبول</h2>
                        <p className="text-gray-300 leading-loose font-medium">
                            يُمنح المستخدم حق الوصول للمنصة للاستخدام الشخصي وغير التجاري فقط. يُحظر تماماً محاولة سحب البيانات آلياً (Scraping) أو إعادة استخدام كود المنصة أو محاولة تخريب أي من خدماتها الفنية.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-white/10 text-center">
                        <p className="text-gray-500 text-xs font-bold">
                            جميع الحقوق محفوظة © {new Date().getFullYear()} سينماتيكس.
                        </p>
                    </section>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CopyrightPage;
