import React, { useState, useEffect } from 'react';
import type { View, LoginError } from '@/types';
import { CheckIcon } from './CheckIcon';
import { ChevronRightIcon } from './icons/ChevronRight';
import SEO from './SeoMeta';
import { BouncingDotsLoader } from './BouncingDotsLoader';

interface LoginModalProps {
  onSetView: (view: View, category?: string, params?: any) => void;
  onLogin: (email: string, password: string) => Promise<LoginError>;
  onGoogleLogin: () => Promise<void>;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
  isShahidTheme?: boolean;
  authReturnView?: View;
  initialEmail?: string;
}

const SpinnerIcon = () => (
  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const LoginModal: React.FC<LoginModalProps> = ({ 
  onSetView, onLogin, onGoogleLogin, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme, isShahidTheme, authReturnView, initialEmail 
}) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<LoginError>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('none');
    if(email && password) {
      setIsLoading(true);
      try {
        const loginResult = await onLogin(email, password);
        if (loginResult === 'none') {
          setIsSuccess(true);
          setTimeout(() => { onSetView('profileSelector'); }, 800);
        } else {
          setError(loginResult);
          setIsLoading(false);
        }
      } catch (err) {
        setError('userNotFound');
        setIsLoading(false);
      }
    }
  };

  const accentColor = isShahidTheme ? '#1994e5' : isRamadanTheme ? '#f59e0b' : isEidTheme ? '#a855f7' : isCosmicTealTheme ? '#35F18B' : isNetflixRedTheme ? '#E50914' : '#00A7F8';
  const accentBg = isShahidTheme ? 'bg-white hover:bg-neutral-100 text-black font-extrabold shadow-[0_4px_25px_rgba(255,255,255,0.15)] border-none' : isRamadanTheme ? 'bg-amber-500 text-white' : isEidTheme ? 'bg-purple-500 text-white' : isCosmicTealTheme ? 'bg-[#35F18B] text-black' : isNetflixRedTheme ? 'bg-[#E50914] text-white' : 'bg-[#00A7F8] text-white';

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white font-['Cairo'] overflow-hidden flex flex-col md:flex-row">
      <SEO title="تسجيل الدخول - سينماتيكس" noIndex={true} />
      
      {/* الجانب الأيسر: واجهة تسجيل الدخول */}
      <div className="w-full md:w-[45%] min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 z-10 bg-[#050505] border-r border-white/5 relative">
        
        {/* زر العودة */}
        <button 
          onClick={() => onSetView(authReturnView || 'home')}
          className="absolute top-8 left-8 md:left-16 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 group shadow-lg"
        >
          <ChevronRightIcon className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="max-w-md w-full mx-auto md:mx-0 flex flex-col items-end">
          <div className="mb-12 text-right w-full">
            <div className="inline-block px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
              مرحباً بك مجدداً
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight">
              تسجيل <span style={{ color: accentColor }}>الدخول</span>
            </h1>
            <p className="text-gray-500 text-base font-bold">يرجى إدخال بياناتك للوصول إلى حسابك</p>
          </div>

          {error !== 'none' && (
            <div className="w-full bg-red-500/10 border-r-4 border-red-500 text-red-500 p-4 rounded-xl mb-8 animate-shake font-bold text-xs flex items-center gap-3 justify-start dir-rtl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>البريد الإلكتروني أو كلمة المرور غير صحيحة.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 w-full">
            {/* حقل البريد الإلكتروني - محاذاة يمين */}
            <div className="relative group text-right">
              <input 
                type="email" 
                value={email}
                dir="rtl"
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-white transition-all text-xl text-right placeholder-transparent"
                placeholder="Email"
                id="login_email"
                required
              />
              <label 
                htmlFor="login_email"
                className="absolute right-0 top-4 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
              >
                البريد الإلكتروني
              </label>
            </div>

            {/* حقل كلمة المرور - محاذاة يمين */}
            <div className="relative group text-right">
              <input 
                type="password" 
                value={password}
                dir="rtl"
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-white transition-all text-xl text-right placeholder-transparent"
                placeholder="Password"
                id="login_pass"
                required
              />
              <label 
                htmlFor="login_pass"
                className="absolute right-0 top-4 text-gray-500 transition-all pointer-events-none peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-400 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs"
              >
                كلمة المرور
              </label>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              <button 
                type="submit" 
                disabled={isLoading || isSuccess}
                className={`w-full ${isSuccess ? 'bg-green-600 text-white' : accentBg} font-black py-5 rounded-2xl text-xl shadow-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50`}
              >
                {isLoading ? <BouncingDotsLoader size="md" colorClass="bg-black" delayMs={0} /> : isSuccess ? <CheckIcon className="w-7 h-7" /> : 'دخول'}
              </button>
              
              <div className="text-center w-full">
                <p className="text-gray-500 text-sm font-bold">
                  ليس لديك حساب؟ {' '}
                  <button type="button" onClick={() => onSetView('register')} className="text-white hover:underline transition-all">إنشاء حساب</button>
                </p>
              </div>
            </div>
          </form>

          {/* الاجتماعي */}
          <div className="mt-16 w-full">
            <div className="flex items-center gap-4 text-gray-800 mb-8">
               <div className="h-[1px] flex-1 bg-white/5"></div>
               <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">أو سجل عبر</span>
               <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>
            <div className="flex justify-center gap-6">
               <div 
                onClick={onGoogleLogin}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all active:scale-90"
               >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
               </div>
               <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all active:scale-90 grayscale opacity-30">
                  <img src="https://www.svgrepo.com/show/303108/apple-black-logo.svg" className="w-5 h-5 invert" alt="apple" />
               </div>
            </div>
          </div>
        </div>

        {/* تذييل الصفحة */}
        <div className="mt-auto pt-10 flex flex-wrap gap-x-8 gap-y-4 text-[10px] text-gray-700 font-black uppercase tracking-tighter dir-rtl">
           <span className="text-gray-800 ml-auto uppercase">CINEMATIX PREMIUM &copy; 2026</span>
           <button onClick={() => onSetView('about')} className="hover:text-white transition-colors">من نحن</button>
           <button onClick={() => onSetView('copyright')} className="hover:text-white transition-colors">القواعد</button>
           <button onClick={() => onSetView('privacy')} className="hover:text-white transition-colors">الخصوصية</button>
        </div>
      </div>

      {/* الجانب الأيمن: العرض السينمائي */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden">
        <img 
          src="https://shahid.mbc.net/mediaObject/436ea116-cdae-4007-ace6-3c755df16856?width=1920&type=avif&q=80" 
          className="w-full h-full object-cover object-center opacity-50 scale-105 hover:scale-110 transition-transform duration-[20s] ease-linear" 
          alt="Cinematic Background" 
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

export default LoginModal;