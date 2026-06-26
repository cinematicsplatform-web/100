import React, { useState, useMemo } from 'react';
import type { Content, Profile, View } from '@/types';
import { StarIcon } from './icons/StarIcon';
import { maleAvatars, femaleAvatars } from '@/data';
import SEO from './SeoMeta';

interface OnboardingPageProps {
  onFinish: (profileData: Partial<Profile>, extraData: any) => void;
  onSetView: (view: View) => void;
  activeProfile: Profile | null;
  allContent: Content[];
}

const StepIndicator = ({ step }: { step: number }) => (
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step === i ? 'bg-[#00FFB0] w-4' : 'bg-white/20'}`}></div>
      ))}
    </div>
);

const OnboardingLayout = ({ title, subtitle, children, step, onNext, onPrev, onSkip, isFirstStep, hideActions }: any) => (
    <div className="min-h-screen bg-[#071113] flex flex-col items-center justify-start pt-20 md:pt-24 px-4 text-center animate-fade-in relative overflow-hidden">
        <SEO title="إعداد الحساب - سينماتيكس" noIndex={true} />
        {/* LOGO IN TOP RIGHT */}
        <div className="absolute top-6 right-6 md:top-8 md:right-12 z-[100]">
            <h1 className="text-xl md:text-2xl font-extrabold cursor-default">
                <span className="text-white font-['Lalezar'] tracking-wide">سينما</span>
                <span className="text-[#00FFB0] font-['Lalezar'] tracking-wide">تيكس</span>
            </h1>
        </div>

        {/* Abstract Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00FFB0]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00A7F8]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
            <h1 className="text-2xl md:text-4xl font-black mb-1 text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm md:text-lg mb-4">{subtitle}</p>}
            
            {!hideActions && <StepIndicator step={step} />}

            <div className="w-full flex flex-col items-center">
                {children}

                {!hideActions && (
                    <>
                        {/* REDUCED SPACING IN THE COLUMN */}
                        <div className="w-full max-w-sm flex flex-col gap-2 mt-6">
                            <button 
                                onClick={onNext}
                                className="w-full bg-gradient-to-r from-[#00FFB0] to-[#00A7F8] text-black font-black py-4 rounded-2xl text-lg shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                            >
                                <span>{step === 4 ? 'ابدأ المشاهدة' : 'متابعة'}</span>
                                {step < 4 && <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>}
                            </button>

                            {/* FIXED: RIGHT ARROW FOR PREVIOUS IN RTL */}
                            {!isFirstStep && (
                                <button 
                                    onClick={onPrev}
                                    className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-1 group"
                                >
                                    <span className="text-[#00FFB0] text-xl transition-transform group-hover:translate-x-1">→</span>
                                    <span className="text-xs font-bold">الخطوة السابقة</span>
                                </button>
                            )}
                        </div>

                        <button 
                            onClick={onSkip} 
                            className="text-[#00FFB0]/70 font-bold text-xs hover:text-[#00FFB0] hover:underline mt-4 transition-colors"
                        >
                            تخطي وابدأ المشاهدة
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
);

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onFinish, onSetView, activeProfile, allContent }) => {
  const [step, setStep] = useState(1);
  const [profileName, setProfileName] = useState(activeProfile?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(activeProfile?.avatar || '');
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [demographics, setDemographics] = useState({
    gender: '',
    ageGroup: '',
    hasKids: ''
  });

  const availableCategories = [
    { name: 'مسلسلات تركية', image: 'https://shahid.mbc.net/mediaObject/982a0f09-8e13-4334-b2c7-10c470667964?height=120&width=120&version=1&type=avif&q=80' },
    { name: 'مسلسلات مصرية', image: 'https://shahid.mbc.net/mediaObject/7e4265bf-dc72-4d5c-a68c-368bafc388a7?height=120&width=120&version=1&type=avif&q=80' },
    { name: 'مسلسلات اجنبية', image: 'https://shahid.mbc.net/mediaObject/5c412598-1555-4dec-ab9a-aa6737d3c575?height=120&width=120&version=1&type=avif&q=80' },
    { name: 'مسلسلات خليجية', image: 'https://shahid.mbc.net/mediaObject/d37f35d3-ac91-473e-a621-55f8ff8b6b67?height=120&width=120&version=1&type=avif&q=80' },
    { name: 'افلام عربية', image: 'https://shahid.mbc.net/mediaObject/1b602d47-8d03-4891-903d-af20aa5c0fc0?height=120&width=120&version=1&type=avif&q=80' },
    { name: 'افلام اجنبية', image: 'https://shahid.mbc.net/mediaObject/07058ba8-5a90-4421-9cca-181ba9a83edf?height=120&width=120&version=1&type=avif&q=80' },
  ];

  const topContent = useMemo(() => {
    const unique = Array.from(new Map<string, Content>(allContent.map(item => [item.id, item])).values());
    return unique.sort((a, b) => b.rating - a.rating).slice(0, 12);
  }, [allContent]);

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else onFinish({ name: profileName, avatar: profileAvatar }, demographics);
  };

  const prevStep = () => {
      if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => {
      onFinish({ name: profileName || 'مستخدم جديد', avatar: profileAvatar }, demographics);
      onSetView('home');
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : (prev.length < 5 ? [...prev, cat] : prev)
    );
  };

  const toggleContent = (id: string) => {
    setSelectedContent(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : (prev.length < 5 ? [...prev, id] : prev)
    );
  };

  const handleSelectAvatar = (url: string) => {
      setProfileAvatar(url);
      setIsSelectingAvatar(false);
  };

  // --- Avatar Selection Sub-View ---
  if (isSelectingAvatar) {
      return (
          <OnboardingLayout 
            title="اختر صورتك الرمزية" 
            subtitle="اختر الصورة التي تعبر عنك" 
            hideActions={true}
          >
              <div className="bg-[#1a2230]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] w-full max-w-3xl shadow-2xl animate-fade-in-up">
                  <div className="space-y-8">
                      <div>
                          <h3 className="text-[#00FFB0] font-bold text-sm mb-4 text-right pr-4">ذكور</h3>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                              {maleAvatars.map((url, idx) => (
                                  <button 
                                    key={`male-${idx}`} 
                                    onClick={() => handleSelectAvatar(url)}
                                    className={`relative rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${profileAvatar === url ? 'border-[#00FFB0] ring-4 ring-[#00FFB0]/20 shadow-lg shadow-[#00FFB0]/10' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                  >
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <h3 className="text-[#00FFB0] font-bold text-sm mb-4 text-right pr-4">إناث</h3>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                              {femaleAvatars.map((url, idx) => (
                                  <button 
                                    key={`female-${idx}`} 
                                    onClick={() => handleSelectAvatar(url)}
                                    className={`relative rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${profileAvatar === url ? 'border-[#00FFB0] ring-4 ring-[#00FFB0]/20 shadow-lg shadow-[#00FFB0]/10' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                  >
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsSelectingAvatar(false)}
                    className="mt-10 bg-gray-800 text-white font-bold py-3 px-10 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                      رجوع
                  </button>
              </div>
          </OnboardingLayout>
      );
  }

  // --- Step 1: Profile ---
  if (step === 1) return (
    <OnboardingLayout 
        title="أنشئ ملف شخصي" 
        step={step} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={handleSkip}
        isFirstStep={true}
    >
        <div className="bg-[#1a2230]/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl flex flex-col items-center">
            <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-[#00FFB0] to-[#00A7F8] shadow-lg mb-4">
                    <img src={profileAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-[#131a26]" />
                </div>
                <button 
                    type="button"
                    onClick={() => setIsSelectingAvatar(true)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#00FFB0] font-bold text-xs transition-all flex items-center gap-2 border border-[#00FFB0]/20 shadow-sm"
                >
                    <span className="translate-x-0.5">تغيير صورة الملف الشخصي</span>
                    <span className="text-sm">✎</span>
                </button>
            </div>
            <input 
                value={profileName} 
                onChange={e => setProfileName(e.target.value)} 
                className="w-full bg-white border-none rounded-xl px-4 py-4 text-black text-center font-bold outline-none text-lg shadow-inner mb-2"
                placeholder="اسم الملف الشخصي"
                autoFocus
            />
        </div>
    </OnboardingLayout>
  );

  // --- Step 2: Categories ---
  if (step === 2) return (
    <OnboardingLayout 
        title="إختر الفئة المفضلة لديك" 
        subtitle="فقط 5 الحد الأقصى" 
        step={step} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={handleSkip}
    >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6 w-full max-w-3xl px-4">
            {availableCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat.name);
                return (
                    <div key={cat.name} onClick={() => toggleCategory(cat.name)} className="flex flex-col items-center gap-3 cursor-pointer group">
                        <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden transition-all duration-300 border-2 ${isSelected ? 'border-[#00FFB0] scale-105 shadow-[0_0_20px_rgba(0,255,176,0.3)]' : 'border-white/10 group-hover:border-white/30'}`}>
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover brightness-100" />
                            {isSelected && (
                                <div className="absolute inset-0 bg-[#00FFB0]/20 flex items-center justify-center">
                                    <div className="bg-[#00FFB0] rounded-full p-1.5 shadow-lg">
                                        <StarIcon className="w-5 h-5 text-black" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className={`text-xs md:text-sm font-black transition-colors ${isSelected ? 'text-[#00FFB0]' : 'text-gray-400'}`}>{cat.name}</span>
                    </div>
                )
            })}
        </div>
    </OnboardingLayout>
  );

  // --- Step 3: Content ---
  if (step === 3) return (
    <OnboardingLayout 
        title="إختر البرامج والأفلام المفضلة لديك" 
        subtitle="فقط 5 الحد الأقصى" 
        step={step} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={handleSkip}
    >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 w-full max-w-5xl px-4">
            {topContent.map(content => {
                const isSelected = selectedContent.includes(content.id);
                return (
                    <div key={content.id} onClick={() => toggleContent(content.id)} className={`relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${isSelected ? 'border-[#00FFB0] scale-[0.97] shadow-xl' : 'border-white/5 hover:scale-[1.02]'}`}>
                        <img src={content.poster} alt="" className="w-full h-full object-cover opacity-100" />
                        {isSelected && (
                            <div className="absolute inset-0 bg-[#00FFB0]/10 flex items-center justify-center">
                                <div className="bg-[#00FFB0] rounded-full p-2.5 shadow-2xl">
                                    <StarIcon className="w-6 h-6 text-black" />
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    </OnboardingLayout>
  );

  // --- Step 4: Demographics ---
  if (step === 4) return (
    <OnboardingLayout 
        title="متحمسون للتعرف عليك أكثر" 
        subtitle="شاركنا بعض التفاصيل حتى نتمكن من تقديم خدمة مصممة خصيصاً لك" 
        step={step} 
        onNext={nextStep} 
        onPrev={prevStep} 
        onSkip={handleSkip}
    >
        <div className="bg-[#1a2230]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl text-right">
            <div className="space-y-6">
                {/* Gender */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-500 mr-2 uppercase tracking-widest">الجنس</label>
                    <div className="flex flex-wrap gap-2">
                        {['ذكر', 'أنثى', 'أفضل عدم القول'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => setDemographics({...demographics, gender: opt})}
                                className={`px-6 py-2 rounded-xl text-sm font-black transition-all border ${demographics.gender === opt ? 'bg-white text-black border-white shadow-lg' : 'bg-gray-800/40 text-gray-500 border-white/5 hover:border-white/20'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Age */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-500 mr-2 uppercase tracking-widest">الفئة العمرية</label>
                    <div className="flex flex-wrap gap-2">
                        {['23 وأصغر', '24-34', '35-44', '45-55', '55 وأكبر'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => setDemographics({...demographics, ageGroup: opt})}
                                className={`px-5 py-2 rounded-xl text-sm font-black transition-all border ${demographics.ageGroup === opt ? 'bg-white text-black border-white shadow-lg' : 'bg-gray-800/40 text-gray-500 border-white/5 hover:border-white/20'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kids */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-500 mr-2 uppercase tracking-widest">هل لديك أطفال دون سن الـ 13؟</label>
                    <div className="flex gap-2">
                        {['نعم', 'لا'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => setDemographics({...demographics, hasKids: opt})}
                                className={`px-10 py-2 rounded-xl text-sm font-black transition-all border ${demographics.hasKids === opt ? 'bg-white text-black border-white shadow-lg' : 'bg-gray-800/40 text-gray-500 border-white/5 hover:border-white/20'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </OnboardingLayout>
  );

  return null;
};

export default OnboardingPage;