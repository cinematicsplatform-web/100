import React, { useEffect, useState } from 'react';
import type { View } from '@/types';

// Simple Home Icon
const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.632 8.632a.75.75 0 01-1.06 1.06l-.352-.352V19.5a3 3 0 01-3 3H7.25a3 3 0 01-3-3V13.18l-.352.352a.75.75 0 01-1.06-1.06L11.47 3.84z" />
  </svg>
);

interface NotFoundPageProps {
    onSetView: (view: View) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onSetView }) => {
  const [countdown, setCountdown] = useState(3);

  // Countdown and Auto-Redirect Logic
  useEffect(() => {
    if (countdown === 0) {
      onSetView('home');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onSetView]);

  return (
    <div className="relative min-h-screen w-full bg-[#141414] text-white flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Ghostly 404 Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[20rem] md:text-[30rem] font-black text-white/5 opacity-5 blur-sm translate-y-10">
          404
        </h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
          الصفحة غير موجودة
        </h2>
        
        <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg mx-auto leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          <br />
          <span className="text-gray-500 text-sm mt-2 block">
            سيتم توجيهك للصفحة الرئيسية خلال <span className="text-[#00A7F8] font-bold">{countdown}</span> ثواني...
          </span>
        </p>

        {/* Back to Home Button */}
        <button
          onClick={() => onSetView('home')}
          className="group relative inline-flex items-center gap-3 px-8 py-3 bg-[#00A7F8] hover:bg-[#008ecf] text-white rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,167,248,0.4)] hover:shadow-[0_0_30px_rgba(0,167,248,0.6)]"
        >
          <span>الصفحة الرئيسية</span>
          <HomeIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>

      {/* Subtle Background Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#141414]/50 to-[#141414] pointer-events-none"></div>
    </div>
  );
};

export default NotFoundPage;
