
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons/CloseIcon';
import { addContentRequest } from '../firebase';
import type { User } from '../types';

interface RequestContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const RequestContentModal: React.FC<RequestContentModalProps> = ({ isOpen, onClose, currentUser, addToast }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'movie' | 'series'>('movie');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            addToast('الرجاء كتابة اسم العمل', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await addContentRequest({
                title: title.trim(),
                type: type,
                notes: notes.trim(),
                userId: currentUser?.id || null, // Ensure string or null
            });
            addToast('تم إرسال طلبك بنجاح! سنعمل على توفيره قريباً.', 'success');
            onClose();
            // Reset form
            setTitle('');
            setNotes('');
            setType('movie');
        } catch (error) {
            console.error(error);
            addToast('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg text-white relative animate-fade-in-up overflow-hidden">
                
                <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-800/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-[var(--color-accent)]">📢</span>
                        طلب محتوى
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-sm text-gray-400">
                        هل تبحث عن فيلم أو مسلسل ولم تجده؟ املأ النموذج أدناه وسنقوم بإضافته لك بأسرع وقت.
                    </p>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">اسم العمل</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: Inception, المؤسس عثمان..."
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">النوع</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${type === 'movie' ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)]' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}>
                                <input type="radio" name="type" className="hidden" checked={type === 'movie'} onChange={() => setType('movie')} />
                                <span className="font-bold">فيلم</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${type === 'series' ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)]' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}>
                                <input type="radio" name="type" className="hidden" checked={type === 'series'} onChange={() => setType('series')} />
                                <span className="font-bold">مسلسل</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">ملاحظات (اختياري)</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="مثال: الموسم الأول فقط، نسخة 4K..."
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default RequestContentModal;
