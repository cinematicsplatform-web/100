import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StartupAd, Content } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface StartupAdModalProps {
    adConfig: StartupAd;
    allContent: Content[];
    onClose: () => void;
    onSelectContent: (content: Content) => void;
}

const StartupAdModal: React.FC<StartupAdModalProps> = ({ adConfig, allContent, onClose, onSelectContent }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow animation to finish
    };

    const handleClick = () => {
        if (adConfig.linkType === 'content' && adConfig.targetContentId) {
            const content = allContent.find(c => c.id === adConfig.targetContentId);
            if (content) {
                onSelectContent(content);
            }
        } else if (adConfig.linkType === 'external' && adConfig.externalUrl) {
            window.open(adConfig.externalUrl, '_blank');
        }
        handleClose();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border border-white/10 group cursor-pointer"
                        onClick={handleClick}
                    >
                        {/* Close button - absolute positioned above everything else */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-md transition-colors"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="relative aspect-video sm:aspect-[4/3] md:aspect-video w-full bg-zinc-900">
                            <picture className="w-full h-full block">
                                {adConfig.imageUrlPc && (
                                    <source media="(min-width: 640px)" srcSet={adConfig.imageUrlPc} />
                                )}
                                {adConfig.imageUrlMobile && (
                                    <source media="(max-width: 639px)" srcSet={adConfig.imageUrlMobile} />
                                )}
                                <img
                                    src={adConfig.imageUrlMobile || adConfig.imageUrlPc}
                                    alt="إعلان"
                                    className="w-full h-full object-cover"
                                />
                            </picture>
                            
                            {/* Overlay gradient for text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            
                            {/* CTA button inside if it has a link */}
                            {(adConfig.linkType === 'content' || adConfig.linkType === 'external') && (
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                                    <div className="bg-[var(--color-accent)] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[var(--color-accent)]/30 group-hover:scale-105 transition-transform">
                                        شاهد الآن
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StartupAdModal;
