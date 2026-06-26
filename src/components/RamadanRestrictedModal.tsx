
import React from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons/CloseIcon'; 
import type { Content } from '../types';

interface RamadanRestrictedModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: Content;
}

const RamadanRestrictedModal: React.FC<RamadanRestrictedModalProps> = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    // Use createPortal to render the modal at the document body.
    // This ensures position: fixed works relative to the viewport, centered correctly on mobile and desktop.
    return createPortal(
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            {/* 2. نافذة المحتوى - تصميم رمضاني (إطار ذهبي) */}
            <div 
                className="bg-gray-900 border border-amber-500/50 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] w-full max-w-md text-white relative overflow-hidden animate-fade-in-up" 
                onClick={e => e.stopPropagation()}
            >
                {/* زخرفة خلفية خفيفة */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700"></div>

                {/* 3. زر الإغلاق */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-gray-800 z-10"
                    aria-label="إغلاق"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-10 text-center">
                    <div className="flex justify-center mb-6 relative">
                        {/* هالة ذهبية خلف البوستر */}
                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                        <img src={content.poster} alt={content.title} className="relative w-24 h-auto rounded-lg shadow-lg border-2 border-amber-500/50" />
                    </div>
                    
                    {/* عنوان ذهبي */}
                    <h2 className="text-3xl font-extrabold mb-3 text-amber-400">قريباً في رمضان</h2>
                    
                    <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                        العمل **{content.title}** سيبدأ عرضه عند انتهاء العد التنازلي.
                    </p>
                    <p className="text-gray-400 text-sm">
                        لا يمكن تشغيل المحتوى أو فتح صفحة التفاصيل حتى يحين موعد العرض.
                    </p>
                    
                    {/* زر ذهبي */}
                    <button 
                        onClick={onClose} 
                        className="mt-8 w-full bg-gradient-to-r from-amber-600 to-amber-400 text-black font-bold py-3 rounded-lg hover:from-amber-500 hover:to-amber-300 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                        حسنًا، فهمت
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RamadanRestrictedModal;
