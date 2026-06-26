
import React, { useState, useEffect } from 'react';
import type { View, User, ContentRequest } from '@/types';
import { ChevronRightIcon } from '../components/icons/ChevronRight';
import SEO from '../components/SeoMeta';
import { addContentRequest, getContentRequests } from '../firebase';
import { BouncingDotsLoader } from '../components/BouncingDotsLoader';

interface ContentRequestPageProps {
  onSetView: (view: View) => void;
  onGoBack: (fallbackView: View) => void;
  currentUser: User | null;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  returnView?: View;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const ContentRequestPage: React.FC<ContentRequestPageProps> = ({ 
    onSetView, 
    onGoBack,
    currentUser, 
    addToast, 
    returnView,
    isRamadanTheme,
    isEidTheme,
    isCosmicTealTheme,
    isNetflixRedTheme
}) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'movie' | 'series'>('movie');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Logic preserved but UI removed as per request
    const [recentRequests, setRecentRequests] = useState<ContentRequest[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);

    const accentColor = isRamadanTheme ? 'text-amber-500' : isEidTheme ? 'text-purple-500' : isCosmicTealTheme ? 'text-[#35F18B]' : isNetflixRedTheme ? 'text-[#E50914]' : 'text-[#00A7F8]';
    const bgAccent = isRamadanTheme ? 'bg-amber-500' : isEidTheme ? 'bg-purple-500' : isCosmicTealTheme ? 'bg-[#35F18B]' : isNetflixRedTheme ? 'bg-[#E50914]' : 'bg-[#00A7F8]';
    const borderAccent = isRamadanTheme ? 'border-amber-500/30' : isEidTheme ? 'border-purple-500/30' : isCosmicTealTheme ? 'border-[#35F18B]/30' : isNetflixRedTheme ? 'border-[#E50914]/30' : 'border-[#00A7F8]/30';

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await getContentRequests();
            setRecentRequests(data.slice(0, 10));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // فحص السبام: هل الزائر ده بعت طلب قريب؟
        const lastRequestTime = localStorage.getItem('lastRequestTime');
        const cooldownTime = 1000 * 60 * 60; // ساعة واحدة (60 دقيقة)

        if (lastRequestTime && Date.now() - parseInt(lastRequestTime) < cooldownTime) {
            addToast("⏳ مهلاً! يمكنك إرسال طلب واحد كل ساعة لتجنب الازدحام.", "info");
            return; // وقف الدالة هنا
        }

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
                userId: currentUser?.id || null,
            });
            
            // بعد نجاح الإرسال، سجل الوقت في التخزين المحلي
            localStorage.setItem('lastRequestTime', Date.now().toString());

            addToast('تم إرسال طلبك بنجاح! سنعمل على توفيره قريباً.', 'success');
            setTitle('');
            setNotes('');
            setType('movie');
            fetchRequests();
        } catch (error) {
            console.error(error);
            addToast('حدث خطأ أثناء إرسال الطلب.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[var(--bg-body)] text-white animate-fade-in relative overflow-hidden flex flex-col">
            <SEO title="طلب محتوى - سينماتيكس" description="هل تبحث عن فيلم أو مسلسل ولم تجده؟ اطلب إضافته الآن وسنقوم بتوفيره لك بأسرع وقت." />
            
            {/* Background Container - Full Visibility */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <img 
                    src="https://shahid.mbc.net/mediaObject/436ea116-cdae-4007-ace6-3c755df16856?width=1920&type=avif&q=80" 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-100"
                />
                {/* Single subtle gradient at bottom for UI depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-body)] via-transparent to-transparent opacity-80 z-10"></div>
            </div>

            {/* Content Wrapper */}
            <div className="relative z-20 flex flex-col h-full w-full">
                
                {/* Navigation - Top Bar */}
                <div className="w-full px-4 md:px-12 py-6 flex items-center justify-between">
                    <button 
                        onClick={() => onGoBack(returnView || 'home')} 
                        className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all border border-white/10 shadow-lg group"
                    >
                        <ChevronRightIcon className="w-6 h-6 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <h1 className="text-2xl md:text-4xl font-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">طلبات المحتوى</h1>
                    <div className="w-12"></div>
                </div>

                {/* Centered Form Area */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl animate-fade-in-up">
                        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
                            <div className="mb-10 text-center">
                                <h2 className="text-2xl md:text-4xl font-black mb-4">لم تجد ما تبحث عنه؟</h2>
                                <p className="text-gray-200 font-bold leading-relaxed max-w-md mx-auto opacity-90">
                                    املأ النموذج أدناه وسيقوم فريق العمل بمراجعة طلبك وإضافة العمل المطلوب في أقرب وقت.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-3 pr-2 uppercase tracking-widest text-right">اسم العمل (فيلم أو مسلسل)</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="اسم العمل المطلوب..."
                                        className="w-full bg-black/50 border border-gray-600 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all shadow-inner text-lg"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setType('movie')}
                                        className={`py-5 rounded-2xl border-2 font-black transition-all transform active:scale-95 text-lg ${type === 'movie' ? `${borderAccent} ${bgAccent} text-black shadow-lg` : 'bg-white/5 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                    >
                                        فيلم
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setType('series')}
                                        className={`py-5 rounded-2xl border-2 font-black transition-all transform active:scale-95 text-lg ${type === 'series' ? `${borderAccent} ${bgAccent} text-black shadow-lg` : 'bg-white/5 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                    >
                                        مسلسل
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-3 pr-2 uppercase tracking-widest text-right">ملاحظات إضافية (اختياري)</label>
                                    <textarea 
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="مثال: الموسم الثالث، نسخة مترجمة..."
                                        rows={3}
                                        className="w-full bg-black/50 border border-gray-600 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all resize-none shadow-inner text-base"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`w-full py-6 rounded-2xl font-black text-2xl transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 ${bgAccent} text-black`}
                                >
                                    {isSubmitting ? (
                                        <BouncingDotsLoader size="sm" colorClass="bg-black" delayMs={0} />
                                    ) : (
                                        <>
                                            <span>إرسال الطلب</span>
                                            <ChevronRightIcon className="w-6 h-6 transform rotate-180" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentRequestPage;
