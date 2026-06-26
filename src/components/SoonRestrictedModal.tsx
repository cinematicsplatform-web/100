
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons/CloseIcon'; 
import type { Content } from '../types';

interface SoonRestrictedModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: Content;
}

const SoonRestrictedModal: React.FC<SoonRestrictedModalProps> = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    // Use createPortal to render the modal at the document body.
    return createPortal(
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            {/* 2. نافذة المحتوى - تصميم عصري ومميز باللون الأخضر */}
            <div 
                className="bg-gray-900 border border-[#00A7F8]/50 rounded-2xl shadow-[0_0_30px_rgba(0,167,248,0.3)] w-full max-w-md text-white relative overflow-hidden animate-fade-in-up" 
                onClick={e => e.stopPropagation()}
            >
                {/* زخرفة خلفية خفيفة */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00A7F8] via-[#00FFB0] to-[#00A7F8]"></div>

                {/* 3. زر الإغلاق */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-[#00A7F8] transition-colors p-2 rounded-full hover:bg-gray-800 z-10"
                    aria-label="إغلاق"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-10 text-center">
                    <div className="flex justify-center mb-6 relative">
                        {/* هالة خضراء خلف البوستر */}
                        <div className="absolute inset-0 bg-[#00A7F8]/20 blur-xl rounded-full"></div>
                        <img src={content.poster} alt={content.title} className="relative w-24 h-auto rounded-lg shadow-lg border-2 border-[#00A7F8]/50" />
                    </div>
                    
                    {/* عنوان مضيء */}
                    <h2 className="text-3xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#00A7F8] to-[#00FFB0]">قريباً</h2>
                    
                    <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                        العمل **{content.title}** سيتم إصداره قريباً على المنصة.
                    </p>
                    <p className="text-gray-400 text-sm">
                        لا يمكن تشغيل المحتوى أو فتح صفحة التفاصيل حتى يحين موعد العرض الرسمي.
                    </p>
                    
                    {/* زر أخضر متدرج */}
                    <button 
                        onClick={onClose} 
                        className="mt-8 w-full bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                        حسنًا، فهمت
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SoonRestrictedModal;
