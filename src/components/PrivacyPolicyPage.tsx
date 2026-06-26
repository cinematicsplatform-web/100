
import React from 'react';
import type { View } from '@/types';
import { ChevronRightIcon } from './icons/ChevronRight';
import SEO from './SeoMeta';

interface PrivacyPolicyPageProps {
  content: string;
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  returnView?: View;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ content, onSetView, onGoBack, returnView, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme }) => {
  const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
  const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[#00A7F8]';

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-white animate-fade-in relative overflow-x-hidden">
      <SEO title="سياسة الخصوصية - سينماتيكس" description="اطلع على سياسة الخصوصية الخاصة بمنصة سينماتيكس وكيفية حمايتنا لبياناتك." />
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none">
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
            <h1 className="text-3xl md:text-5xl font-black">سياسة الخصوصية</h1>
            <div className="w-12"></div>
        </div>

        <div className="bg-[#1a2230]/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl">
            <div className="prose prose-invert prose-lg max-w-none">
                <div className="text-right space-y-12">
                    
                    <section className="space-y-4">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>1. التزامنا تجاه خصوصيتك</h2>
                        <p className="text-gray-300 leading-loose font-medium">
                            تعتبر خصوصية مستخدمينا من أولوياتنا القصوى في سينماتيكس. توضح هذه السياسة المعلومات التي نجمعها، وكيفية استخدامها، والخطوات التي نتخذها لضمان بقاء بياناتك الشخصية آمنة ومحمية وفقاً لأعلى المعايير الدولية.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>2. المعلومات التي نجمعها</h2>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                            <h3 className="text-white font-bold">أ. المعلومات التي تقدمها:</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">عند التسجيل، نحصل على اسمك وبريدك الإلكتروني. هذه البيانات ضرورية لمزامنة سجل المشاهدة الخاص بك وقائمتك المفضلة عبر جميع أجهزتك.</p>
                            
                            <h3 className="text-white font-bold">ب. المعلومات التلقائية:</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">نقوم بجمع بيانات تقنية مثل عنوان IP ونوع المتصفح وسجل التفاعلات مع المنصة لتحسين الأداء الفني وتخصيص التوصيات لتناسب ذوقك.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>3. كيف نستخدم بياناتك؟</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 text-sm font-bold">
                            <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><span className={accentColor}>✓</span> تفعيل ميزة "متابعة المشاهدة".</li>
                            <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><span className={accentColor}>✓</span> تحسين جودة البث بناءً على سرعة الإنترنت.</li>
                            <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><span className={accentColor}>✓</span> إرسال تنبيهات عند صدور حلقات جديدة.</li>
                            <li className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5"><span className={accentColor}>✓</span> منع محاولات الوصول غير المصرح بها.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>4. مشاركة المعلومات</h2>
                        <p className="text-gray-300 leading-loose font-medium">
                            نحن لا نقوم ببيع أو تأجير أو مشاركة معلوماتك الشخصية مع أي أطراف ثالثة لأغراض تسويقية. قد نشارك بيانات مجهولة الهوية ومجمعة مع شركائنا التقنيين (مثل خدمات الاستضافة والسحابة) لضمان استقرار الخدمة.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className={`text-2xl md:text-3xl font-black ${accentColor}`}>5. أمن البيانات والملفات الشخصية</h2>
                        <p className="text-gray-300 leading-loose font-medium">
                            نستخدم بروتوكولات تشفير متقدمة (SSL) لحماية البيانات أثناء الانتقال. كما نمنحك التحكم الكامل في حذف حسابك أو مسح سجل مشاهداتك في أي وقت من خلال إعدادات الحساب.
                        </p>
                    </section>

                    <section className="space-y-4 pt-8 border-t border-white/10">
                        <p className="text-gray-500 text-xs text-center font-bold">
                            آخر تحديث لسياسة الخصوصية: 20 مايو 2025. <br/>
                            باستخدامك لمنصة سينماتيكس، فإنك توافق على الشروط الموضحة في هذه الصفحة.
                        </p>
                    </section>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
