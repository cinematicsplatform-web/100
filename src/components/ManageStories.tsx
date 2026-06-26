import React, { useState, useEffect, useRef } from 'react';
import { db, saveStory, deleteStory, getStories } from '../firebase';
import type { Story, StoryMediaItem } from '../types';
import ToggleSwitch from './ToggleSwitch';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PlayIcon } from './icons/PlayIcon';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.414 6.811 7.272 4.125 12 4.125s8.586 2.686 9.964 7.553a1.012 1.012 0 010 .644C20.586 17.189 16.728 19.875 12 19.875s-8.586-2.686-9.964-7.553Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
    </svg>
);

interface ManageStoriesProps {
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const ManageStories: React.FC<ManageStoriesProps> = ({ addToast }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
    
    // UI Local State
    const [formData, setFormData] = useState({ title: '', thumbnailUrl: '' });
    const [mediaItems, setMediaItems] = useState<StoryMediaItem[]>([
        { url: '', mediaType: 'image', ctaText: 'شاهد الآن', targetUrl: '' }
    ]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; story: Story | null }>({ isOpen: false, story: null });

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        setIsLoading(true);
        try {
            const data = await getStories(false);
            setStories(data);
        } catch (e) { addToast('فشل تحميل الستوريات', 'error'); } finally { setIsLoading(false); }
    };

    const handleEditStory = (story: Story) => {
        setEditingStoryId(story.id);
        setFormData({ title: story.title, thumbnailUrl: story.thumbnailUrl });
        setMediaItems(story.mediaItems?.length ? story.mediaItems : [{ url: '', mediaType: 'image', ctaText: 'شاهد الآن', targetUrl: '' }]);
        setActiveSlideIndex(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingStoryId(null);
        setFormData({ title: '', thumbnailUrl: '' });
        setMediaItems([{ url: '', mediaType: 'image', ctaText: 'شاهد الآن', targetUrl: '' }]);
        setActiveSlideIndex(0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validMedia = mediaItems.filter(m => m.url.trim() !== '');
        if (!formData.title.trim() || !formData.thumbnailUrl.trim() || validMedia.length === 0) {
            addToast('الرجاء تعبئة كافة الحقول الأساسية ورابط ميديا واحد على الأقل', 'info');
            return;
        }

        setIsSaving(true);
        try {
            const storyData: any = { ...formData, mediaItems: validMedia, isActive: true };
            if (editingStoryId) storyData.id = editingStoryId;
            await saveStory(storyData);
            addToast(editingStoryId ? 'تم التحديث!' : 'تم النشر بنجاح!', 'success');
            resetForm();
            fetchStories();
        } catch (error) { addToast('حدث خطأ أثناء الحفظ', 'error'); } finally { setIsSaving(false); }
    };

    const executeDelete = async () => {
        if (!deleteModal.story) return;
        try {
            await deleteStory(deleteModal.story.id);
            setStories(prev => prev.filter(s => s.id !== deleteModal.story?.id));
            if (editingStoryId === deleteModal.story.id) resetForm();
            addToast('تم الحذف بنجاح', 'success');
        } catch (e) { addToast('فشل الحذف', 'error'); } finally { setDeleteModal({ isOpen: false, story: null }); }
    };

    const inputClass = "w-full bg-[#0f1014] border border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-[#00A7F8] outline-none transition-all text-sm shadow-inner";
    const labelClass = "block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 pr-1";

    return (
        <div className="space-y-12 animate-fade-in-up pb-12" dir="rtl">
            
            {/* Editor & Preview Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-[#1a2230] p-10 rounded-[3rem] border border-gray-700/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white flex items-center gap-4">
                        <span className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">🎬</span>
                        {editingStoryId ? 'تعديل الستوري المختار' : 'إنشاء ستوري تفاعلي جديد'}
                    </h3>
                    <p className="text-gray-500 font-bold mt-2 mr-16">قم بإضافة صور أو فيديوهات قصيرة لعرضها في شريط القصص بالرئيسية.</p>
                </div>
                <div className="flex gap-4 relative z-10 w-full lg:w-auto">
                    <button onClick={resetForm} className="flex-1 lg:flex-none px-10 py-4 bg-gray-800 text-gray-400 font-black rounded-2xl border border-gray-700 transition-all hover:bg-gray-700 hover:text-white">إلغاء</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSaving}
                        className="flex-1 lg:flex-none bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-black px-14 py-4 rounded-2xl shadow-2xl transform active:scale-95 transition-all hover:shadow-[0_0_40px_rgba(0,167,248,0.4)] disabled:opacity-50"
                    >
                        {isSaving ? 'جاري النشر...' : 'نشر الستوري الآن'}
                    </button>
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Pane (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-[#1a2230] p-10 rounded-[3rem] border border-gray-700/50 shadow-2xl space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>عنوان الستوري (العام)</label>
                                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} placeholder="مثال: تريند الأسبوع"/>
                            </div>
                            <div>
                                <label className={labelClass}>رابط الصورة الدائرية (Thumbnail)</label>
                                <input value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} className={inputClass + " font-mono text-[10px] text-blue-400"} placeholder="https://..."/>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                                <h4 className="text-xl font-black text-white">الشرائح ({mediaItems.length})</h4>
                                <button type="button" onClick={() => setMediaItems([...mediaItems, { url:'', mediaType:'image', ctaText:'شاهد الآن', targetUrl:'' }])} className="text-xs font-black text-[#00A7F8] hover:underline flex items-center gap-1.5">+ إضافة شريحة</button>
                            </div>

                            <div className="space-y-4">
                                {mediaItems.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setActiveSlideIndex(idx)}
                                        className={`bg-[#0f1014] p-6 rounded-3xl border transition-all group relative ${activeSlideIndex === idx ? 'border-[#00A7F8] ring-2 ring-[#00A7F8]/10' : 'border-gray-800 hover:border-gray-700'}`}
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase tracking-widest">الشريحة #{idx + 1}</span>
                                            {mediaItems.length > 1 && (
                                                <button onClick={(e) => { e.stopPropagation(); setMediaItems(mediaItems.filter((_,i)=>i!==idx)); if(activeSlideIndex >= idx) setActiveSlideIndex(0); }} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">✕</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className={labelClass}>رابط ميديا الشريحة (صورة/فيديو)</label>
                                                <input value={item.url} onChange={e => { const m=[...mediaItems]; m[idx].url=e.target.value; setMediaItems(m); }} className={inputClass} placeholder="رابط مباشر للميديا"/>
                                            </div>
                                            <div>
                                                <label className={labelClass}>النوع</label>
                                                <select value={item.mediaType} onChange={e => { const m=[...mediaItems]; m[idx].mediaType=e.target.value as any; setMediaItems(m); }} className={inputClass}>
                                                    <option value="image">صورة (Image)</option>
                                                    <option value="video">فيديو (Video)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>نص الزر (CTA)</label>
                                                <input value={item.ctaText} onChange={e => { const m=[...mediaItems]; m[idx].ctaText=e.target.value; setMediaItems(m); }} className={inputClass} placeholder="شاهد الآن"/>
                                            </div>
                                            <div className="col-span-2">
                                                <label className={labelClass}>رابط التوجيه عند الضغط</label>
                                                <input value={item.targetUrl} onChange={e => { const m=[...mediaItems]; m[idx].targetUrl=e.target.value; setMediaItems(m); }} className={inputClass} placeholder="Target URL"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview Pane (4 cols) */}
                <div className="lg:col-span-4 sticky top-24">
                    <div className="flex flex-col items-center gap-6">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Live Simulator View</label>
                        
                        {/* High Fidelity Phone Simulator */}
                        <div className="relative w-[300px] h-[620px] bg-black border-[10px] border-[#1f2127] rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1f2127] rounded-b-2xl z-50"></div>
                            
                            {/* Simulator Screen */}
                            <div className="h-full w-full bg-[#0a0a0a] relative flex flex-col">
                                {/* Story Progress Bars */}
                                <div className="absolute top-10 inset-x-4 flex gap-1 z-40">
                                    {mediaItems.map((_, i) => (
                                        <div key={i} className={`h-0.5 flex-1 rounded-full ${i === activeSlideIndex ? 'bg-white' : i < activeSlideIndex ? 'bg-white' : 'bg-white/20'}`}></div>
                                    ))}
                                </div>

                                {/* Story Header */}
                                <div className="absolute top-14 inset-x-4 flex items-center justify-between z-40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#00A7F8] to-[#00FFB0]">
                                            <img src={formData.thumbnailUrl || 'https://placehold.co/100x100/222/555?text=...'} className="w-full h-full rounded-full object-cover border-2 border-black" alt=""/>
                                        </div>
                                        <span className="text-white font-bold text-xs shadow-md">{formData.title || 'اسم الستوري'}</span>
                                    </div>
                                    <div className="text-white/70">✕</div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                                    {mediaItems[activeSlideIndex]?.url ? (
                                        mediaItems[activeSlideIndex].mediaType === 'video' ? (
                                            <video src={mediaItems[activeSlideIndex].url} autoPlay muted loop className="w-full h-full object-cover"/>
                                        ) : (
                                            <img src={mediaItems[activeSlideIndex].url} className="w-full h-full object-cover animate-zoom-in" alt=""/>
                                        )
                                    ) : (
                                        <div className="text-center p-10 opacity-20 flex flex-col items-center gap-4">
                                            <PlayIcon className="w-12 h-12" />
                                            <span className="text-[10px] font-black uppercase">أدخل رابط الميديا للمعاينة</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                                </div>

                                {/* CTA Button Mock */}
                                <div className="absolute bottom-10 inset-x-6 z-40">
                                     <div className="bg-white text-black py-3.5 rounded-2xl text-center font-black text-xs shadow-xl flex items-center justify-center gap-2">
                                        {mediaItems[activeSlideIndex]?.ctaText || 'شاهد الآن'} <span>←</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Slide Selector Controls */}
                        <div className="flex gap-2">
                            {mediaItems.map((_, i) => (
                                <button key={i} onClick={() => setActiveSlideIndex(i)} className={`w-8 h-8 rounded-xl font-black text-[10px] transition-all border ${activeSlideIndex === i ? 'bg-[#00A7F8] text-black border-transparent shadow-lg' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>{i+1}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section: Circle Grid View */}
            <div className="bg-[#1f2937] p-10 rounded-[3rem] border border-gray-700/50 shadow-2xl space-y-10">
                <div className="flex justify-between items-center border-b border-gray-800 pb-6">
                    <h4 className="text-2xl font-black text-white">الستوريات المنشورة ({stories.length})</h4>
                    <button onClick={fetchStories} className="text-xs font-black text-[#00A7F8] hover:underline uppercase tracking-widest">تحديث القائمة</button>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center animate-pulse text-gray-500 font-black tracking-widest">SCANNING LIVE FEED...</div>
                ) : stories.length === 0 ? (
                    <div className="py-20 text-center text-gray-600 font-bold">لا يوجد ستوريات منشورة حالياً.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {stories.map(s => (
                            <div key={s.id} className="group flex flex-col items-center gap-4 text-center">
                                <div className="relative">
                                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full p-1 transition-all duration-500 ${s.isActive ? 'bg-gradient-to-tr from-[#00A7F8] to-[#00FFB0] group-hover:shadow-[0_0_30px_rgba(0,167,248,0.4)]' : 'bg-gray-800'}`}>
                                        <div className="w-full h-full rounded-full border-4 border-[#1f2937] overflow-hidden bg-[#0f1014] relative">
                                            <img src={s.thumbnailUrl} className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${s.isActive ? '' : 'grayscale opacity-50'}`} alt=""/>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => handleEditStory(s)} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg" title="تعديل">✎</button>
                                                <button onClick={() => setDeleteModal({isOpen:true, story:s})} className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg" title="حذف">✕</button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Slide Count Badge */}
                                    <div className="absolute -top-1 -right-1 bg-white text-black font-black text-[10px] w-7 h-7 flex items-center justify-center rounded-full border-2 border-[#1f2937] shadow-lg">
                                        {s.mediaItems?.length || 1}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h5 className="font-black text-white group-hover:text-[#00A7F8] transition-colors">{s.title}</h5>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                        {s.isActive ? <span className="text-green-500">نشط (Live)</span> : <span className="text-red-500">مخفي</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, story: null })} onConfirm={executeDelete} title="حذف الستوري" message={`هل أنت متأكد من حذف "${deleteModal.story?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`} />
        </div>
    );
};

export default ManageStories;