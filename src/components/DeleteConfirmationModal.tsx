import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons/CloseIcon';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "تأكيد الحذف", 
    message = "هل أنت متأكد من حذف المحتوى؟" 
}) => {
    // Lock body scroll when open to prevent background movement
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Rendering via Portal to document.body ensures 'fixed' is relative to the screen (viewport)
    // and not reset by any parent 'transform' or 'z-index' properties.
    return createPortal(
        <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 overflow-hidden outline-none">
            {/* Overlay / Backdrop */}
            <div 
                className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            ></div>

            {/* Modal Card - Centered vertically and horizontally */}
            <div 
                className="relative bg-[#1f2937] border border-gray-700 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-[340px] md:max-w-md transform transition-all animate-fade-in-up overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Header Style Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600/50"></div>

                <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
                    {/* Warning Icon Container */}
                    <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                        {title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex flex-col gap-2.5 w-full">
                        <button
                            onClick={onConfirm}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg active:scale-[0.98]"
                        >
                            نعم، حذف نهائي
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-800/80 text-gray-300 hover:text-white font-bold py-3 rounded-2xl transition-all active:scale-[0.98]"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteConfirmationModal;