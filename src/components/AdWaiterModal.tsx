
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Ad } from '@/types';
import { CloseIcon } from '@/components/icons/CloseIcon';
import AdDisplay from './AdDisplay';
import { BouncingDotsLoader } from './BouncingDotsLoader';

interface AdWaiterModalProps {
    isOpen: boolean;
    ad: Ad;
    onComplete: () => void;
    onClose: () => void;
}

const AdWaiterModal: React.FC<AdWaiterModalProps> = ({ isOpen, ad, onComplete, onClose }) => {
    const [timeLeft, setTimeLeft] = useState<number>(ad.timerDuration || 0);
    const [canSkip, setCanSkip] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            const duration = ad.timerDuration && ad.timerDuration > 0 ? ad.timerDuration : 0;
            setTimeLeft(duration);
            setCanSkip(duration === 0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, ad]);

    useEffect(() => {
        if (!isOpen || timeLeft <= 0) {
            if (isOpen && timeLeft === 0) setCanSkip(true);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanSkip(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, timeLeft]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-hidden">
            <div className="relative w-full max-w-4xl flex flex-col items-center justify-center h-full max-h-[90vh] animate-fade-in-up">
                
                {/* Header / Skip Area */}
                <div className="absolute top-0 right-0 left-0 z-50 flex justify-between items-center p-2">
                     <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <CloseIcon className="w-5 h-5 text-white" />
                     </button>

                     <div className="flex items-center gap-3">
                        {!canSkip ? (
                            <div className="bg-black/60 border border-white/20 rounded-full px-5 py-2 flex items-center gap-3 backdrop-blur-md">
                                <BouncingDotsLoader size="sm" colorClass="bg-white" delayMs={0} />
                                <span className="text-white font-bold text-xs">انتظر {timeLeft} ثانية</span>
                            </div>
                        ) : (
                            <button 
                                onClick={onComplete}
                                className="bg-green-600 hover:bg-green-500 text-white border border-green-400 rounded-full px-6 py-2.5 flex items-center gap-2 font-bold shadow-xl transition-all"
                            >
                                <span>تخطي</span>
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        )}
                     </div>
                </div>

                {/* AD CONTENT AREA */}
                <div className="w-full flex-1 flex items-center justify-center p-2 md:p-6 overflow-hidden">
                    <div className="relative max-w-full max-h-full flex items-center justify-center w-full h-full">
                        {ad.type === 'banner' && ad.imageUrl ? (
                            <a href={ad.destinationUrl || '#'} target="_blank" rel="noopener noreferrer" className="block relative">
                                <img 
                                    src={ad.imageUrl} 
                                    alt={ad.title} 
                                    className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
                                />
                            </a>
                        ) : (
                            <AdDisplay 
                                adCode={ad.code || ad.scriptCode || ''} 
                                className="w-full h-full rounded-2xl bg-gray-900"
                                style={{ minHeight: '300px', minWidth: '300px' }}
                            />
                        )}
                    </div>
                </div>

                <div className="py-4 text-gray-500 text-[10px] font-bold tracking-widest uppercase opacity-60">
                    Advertisement • {ad.title}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AdWaiterModal;
