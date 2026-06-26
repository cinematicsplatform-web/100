import React, { useState } from 'react';
import type { User, View } from '@/types';
import { ChevronRightIcon } from './icons/ChevronRight';
import SEO from './SeoMeta';

interface CreateAccountPageProps {
  onSetView: (view: View, category?: string, params?: any) => void;
  onRegister: (newUser: Omit<User, 'id' | 'role' | 'profiles'> & { gender: 'male' | 'female' }) => Promise<string | null>;
  onGoogleLogin: () => Promise<void>;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isShahidTheme?: boolean;
  authReturnView?: View;
}

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ 
  onSetView, onRegister, onGoogleLogin, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme, isShahidTheme, authReturnView 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim()) { setError('يرجى إدخال الاسم الأول.'); return; }
    if (password !== confirmPassword) { setError('كلمتا المرور غير متطابقتين.'); return; }

    setIsLoading(true);
    const errCode = await onRegister({ email, password, firstName, lastName, gender });
    setIsLoading(false);

    if (errCode) {
      setError(errCode === 'auth/email-already-in-use' ? 'البريد مسجل بالفعل.' : 'حدث خطأ في التسجيل.');
    }
  };

  const accentColor = isShahidTheme ? '#1994e5' : isRamadanTheme ? '#f59e0b' : isEidTheme ? '#a855f7' : isCosmicTealTheme ? '#35F18B' : isNetflixRedTheme ? '#E50914' : '#00A7F8';
  const accentBg = isShahidTheme ? 'bg-white hover:bg-neutral-100 text-black font-extrabold shadow-[0_4px_25px_rgba(255,255,255,0.15)] border-none' : isRamadanTheme ? 'bg-amber-500 text-white' : isEidTheme ? 'bg-purple-500 text-white' : isCosmicTealTheme ? 'bg-[#35F18B] text-black' : isNetflixRedTheme ? 'bg-[#E50914] text-white' : 'bg-[#00A7F8] text-white';

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white font-['Cairo'] overflow-hidden flex flex-col md:flex-row">
      <SEO title="إنشاء حساب - سينماتيكس" noIndex={true} />
      
      {/* الجانب الأيسر: واجهة إدخال البيانات (تظهر في الشمال في اللابتوب) */}
      <div className="w-full md:w-[45%] min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 z-10 bg-[#050505] border-r border-white/5 relative overflow-y-auto">
        
        {/* زر العودة */}
        <button 
          onClick={() => onSetView(authReturnView || 'home')}
          className="absolute top-8 left-8 md:left-16 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 group shadow-lg"
        >
          <ChevronRightIcon className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="max-w-md w-full mx-auto md:mx-0 text-right mt-10 md:mt-0">
          <div className="mb-10">
            <div className="inline-block px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
              Join Cinematix
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight">إنشاء <span style={{ color: accentColor }}>حساب جديد</span></h1>
            <p className="text-gray-500 text-base font-bold">ابدأ رحلتك الآن في عالم الترفيه</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border-r-4 border-red-500 text-red-500 p-4 rounded-xl mb-8 animate-shake font-bold text-xs flex items-center gap-3 justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* الاسم الأول */}
              <div className="relative group">
                <input 
                  type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="peer w-full bg-transparent border-b-2 border-white/10 py-3 outline-none focus:border-white transition-all text-lg placeholder-transparent text-right"
                  placeholder="First Name" id="reg_fname" required
                />
                <label htmlFor="reg_fname" className="absolute right-0 top-3 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">الاسم الأول</label>
              </div>

               {/* الاسم الأخير */}
              <div className="relative group">
                <input 
                  type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  className="peer w-full bg-transparent border-b-2 border-white/10 py-3 outline-none focus:border-white transition-all text-lg placeholder-transparent text-right"
                  placeholder="Last Name" id="reg_lname"
                />
                <label htmlFor="reg_lname" className="absolute right-0 top-3 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">الاسم الأخير</label>
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div className="relative group">
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="peer w-full bg-transparent border-b-2 border-white/10 py-3 outline-none focus:border-white transition-all text-lg dir-ltr text-right placeholder-transparent"
                placeholder="Email" id="reg_email" required
              />
              <label htmlFor="reg_email" className="absolute right-0 top-3 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">البريد الإلكتروني</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* كلمة المرور */}
              <div className="relative group">
                <input 
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="peer w-full bg-transparent border-b-2 border-white/10 py-3 outline-none focus:border-white transition-all text-lg placeholder-transparent text-right"
                  placeholder="Pass" id="reg_pass" required
                />
                <label htmlFor="reg_pass" className="absolute right-0 top-3 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">كلمة المرور</label>
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="relative group">
                <input 
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="peer w-full bg-transparent border-b-2 border-white/10 py-3 outline-none focus:border-white transition-all text-lg placeholder-transparent text-right"
                  placeholder="Confirm" id="reg_confirm" required
                />
                <label htmlFor="reg_confirm" className="absolute right-0 top-3 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">تأكيد كلمة المرور</label>
              </div>
            </div>

            {/* اختيار الجنس */}
            <div className="pt-4 text-right">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">الجنس</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl font-black transition-all border-2 ${gender === 'male' ? 'border-white bg-white text-black' : 'border-white/5 bg-white/5 text-gray-500'}`}>ذكر</button>
                <button type="button" onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl font-black transition-all border-2 ${gender === 'female' ? 'border-white bg-white text-black' : 'border-white/5 bg-white/5 text-gray-500'}`}>أنثى</button>
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-6">
              <button 
                type="submit" disabled={isLoading}
                className={`w-full ${accentBg} font-black py-5 rounded-2xl text-xl shadow-2xl transition-all transform active:scale-[0.98] disabled:opacity-50`}
              >
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب الآن'}
              </button>
              
              <p className="text-center text-gray-500 font-bold mt-4">
                لديك حساب بالفعل؟ {' '}
                <button type="button" onClick={() => onSetView('login')} className="text-white underline underline-offset-4 hover:text-gray-300 transition-colors">سجل دخولك</button>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-auto pt-10 flex flex-wrap gap-x-8 gap-y-4 text-[10px] text-gray-700 font-black uppercase tracking-tighter">
           <button onClick={() => onSetView('privacy')} className="hover:text-white transition-colors">الخصوصية</button>
           <button onClick={() => onSetView('copyright')} className="hover:text-white transition-colors">القواعد</button>
           <button onClick={() => onSetView('about')} className="hover:text-white transition-colors">من نحن</button>
           <span className="text-gray-800 mr-auto uppercase">CINEMATIX PREMIUM &copy; 2026</span>
        </div>
      </div>

      {/* الجانب الأيمن: العرض السينمائي */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden">
        <img 
          src="https://shahid.mbc.net/mediaObject/436ea116-cdae-4007-ace6-3c755df16856?width=1920&type=avif&q=80" 
          className="w-full h-full object-cover object-center opacity-50 scale-105" 
          alt="background" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/60"></div>
        
        <div className="absolute bottom-20 right-16 max-w-md text-right">
           <h2 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tighter">
             محتوى <br/> <span style={{ color: accentColor }}>حصري</span> ينتظرك
           </h2>
           <p className="text-lg text-gray-400 font-bold leading-relaxed">
             انضم الآن واحصل على وصول غير محدود لأحدث الأعمال العربية والعالمية في مكان واحد.
           </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;