
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { addReport } from '@/firebase';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    contentId: string;
    contentTitle: string;
    episode?: string;
    isCosmicTealTheme?: boolean;
    isNetflixRedTheme?: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, contentId, contentTitle, episode, isCosmicTealTheme, isNetflixRedTheme }) => {
    const [reason, setReason] = useState('not_working');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const accentColor = isNetflixRedTheme ? 'text-[#E50914]' : isCosmicTealTheme ? 'text-[#35F18B]' : 'text-[#00A7F8]';
    const btnBg = isNetflixRedTheme ? 'bg-[#E50914] hover:bg-[#b20710]' : isCosmicTealTheme ? 'bg-[#35F18B] hover:bg-[#2596be]' : 'bg-[#00A7F8] hover:bg-[#008ac5]';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addReport({
                contentId,
                contentTitle,
                episode,
                reason,
                description
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setDescription('');
                setReason('not_working');
            }, 2000);
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء الإرسال');
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className={accentColor}>⚠️</span> الإبلاغ عن مشكلة
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
                            <h4 className="text-xl font-bold text-white mb-2">تم الإرسال</h4>
                            <p className="text-gray-400 text-sm">شكراً لك، سنقوم بمراجعة المشكلة قريباً.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-sm text-gray-300">
                                أنت تبلغ عن: <span className="font-bold text-white">{contentTitle}</span> {episode && <span className="text-[var(--color-accent)]">({episode})</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 mb-1">ما هي المشكلة؟</label>
                                {[
                                    { id: 'not_working', label: 'الفيديو لا يعمل' },
                                    { id: 'wrong_episode', label: 'حلقة خاطئة' },
                                    { id: 'sound_issue', label: 'مشكلة في الصوت/الترجمة' },
                                    { id: 'other', label: 'أخرى' }
                                ].map(opt => (
                                    <label key={opt.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-700 bg-gray-800/30 cursor-pointer hover:bg-gray-700 transition-colors">
                                        <input type="radio" name="reason" value={opt.id} checked={reason === opt.id} onChange={(e) => setReason(e.target.value)} className="w-4 h-4 accent-[var(--color-accent)]" />
                                        <span className="text-sm text-white">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                            <button type="submit" disabled={isSubmitting} className={`w-full ${btnBg} text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 mt-2`}>
                                {isSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReportModal;
