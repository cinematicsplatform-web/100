
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { CloseIcon } from './icons/CloseIcon';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if user is on Mobile
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent);
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    setIsIOS(isIosDevice);

    // 2. Handle 'beforeinstallprompt' (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Only show if it's a mobile device and not already in standalone mode
      if (isMobile) {
          setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Check if already installed (Standalone Mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    if (isStandalone) {
        setIsVisible(false);
    }

    // 4. Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Log result for analytics (optional), using console.debug to reduce noise
    if (outcome === 'accepted') {
      // console.debug('User accepted the install prompt');
    } else {
      // console.debug('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
      setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-[9999] animate-fade-in-up">
      <div className="bg-[#141b29]/95 backdrop-blur-md border border-[#00A7F8]/30 rounded-2xl shadow-[0_0_25px_rgba(0,167,248,0.3)] p-4 flex items-center gap-4 relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#00A7F8]/20 rounded-full blur-[50px] pointer-events-none"></div>
        
        {/* Icon */}
        <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-[#00A7F8] to-[#00FFB0] p-0.5">
            <div className="w-full h-full bg-[#141b29] rounded-[10px] flex items-center justify-center">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00A7F8] to-[#00FFB0]">C</span>
            </div>
        </div>

        {/* Text */}
        <div className="flex-1">
            <h3 className="text-white font-bold text-sm">تطبيق سينماتيكس</h3>
            <p className="text-gray-400 text-xs mt-0.5">ثبت التطبيق لتجربة مشاهدة أفضل وأسرع بدون إنترنت.</p>
        </div>

        {/* Action */}
        {isIOS ? (
            // iOS Instruction (Static, as iOS doesn't support programmatic trigger yet)
            <div className="text-xs text-[#00A7F8] font-bold px-2 text-center">
                اضغط "مشاركة" <br/> ثم "إضافة للشاشة الرئيسية"
            </div>
        ) : (
            // Android/Chrome Button
            <button 
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-bold text-xs px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-1"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>تثبيت</span>
            </button>
        )}

        {/* Close */}
        <button 
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
        >
            <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
