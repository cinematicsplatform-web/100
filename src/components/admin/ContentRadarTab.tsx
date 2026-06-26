import React, { useState, useEffect, useMemo } from 'react';
import { getReleaseSchedules, saveReleaseSchedule, deleteReleaseSchedule, markScheduleAsAdded, db } from '../../firebase';
import type { ReleaseSchedule, ReleaseSource, Content, ReleasePriority, ReleaseStatus } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { SearchIcon } from '../icons/SearchIcon';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import ToggleSwitch from '../ToggleSwitch';
import { normalizeText } from '../../utils/textUtils';

// --- PREMIUM ICONS ---
const RadarIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className || "w-10 h-10"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
);

const TimerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

// --- COMPONENT HELPERS ---
const PriorityBadge = ({ priority }: { priority: ReleasePriority }) => {
    switch (priority) {
        case 'hot': return <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse">HOT 🔥</span>;
        case 'high': return <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(249,115,22,0.3)]">TRENDING 📈</span>;
        case 'medium': return <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded">NEW</span>;
        default: return <span className="bg-gray-700 text-gray-300 text-[9px] font-black px-2 py-0.5 rounded">REGULAR</span>;
    }
};

const StatusLabel = ({ status }: { status: ReleaseStatus }) => {
    switch (status) {
        case 'ongoing': return <span className="text-green-400 font-bold">مستمر</span>;
        case 'hiatus': return <span className="text-yellow-500 font-bold">متوقف مؤقتاً</span>;
        case 'finished': return <span className="text-gray-500 font-bold">منتهي</span>;
        case 'upcoming': return <span className="text-blue-400 font-bold">قريباً</span>;
        default: return null;
    }
};

interface ContentRadarTabProps {
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    onRequestDelete: (id: string, title: string) => void;
    onEditContent: (content: Content) => void;
    allPublishedContent: Content[];
}

const ContentRadarTab: React.FC<ContentRadarTabProps> = ({ addToast, onRequestDelete, onEditContent, allPublishedContent }) => {
    const [schedules, setSchedules] = useState<ReleaseSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
    const [editingSchedule, setEditingSchedule] = useState<ReleaseSchedule | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const today = new Date().getDay();

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const data = await getReleaseSchedules();
            setSchedules(data);
        } catch (e) {
            addToast('فشل تحميل رادار المحتوى', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEdit = (schedule: ReleaseSchedule | null) => {
        setEditingSchedule(schedule);
        setViewMode('editor');
    };

    const handleMarkAsDone = async (id: string) => {
        try {
            await markScheduleAsAdded(id);
            setSchedules(prev => prev.map(s => s.id === id ? { ...s, lastAddedAt: new Date().toISOString() } : s));
            addToast('تم تحديث حالة النشر بنجاح!', 'success');
        } catch (e) {
            addToast('حدث خطأ أثناء التحديث', 'error');
        }
    };

    const handleJumpToContent = (seriesName: string) => {
        const found = allPublishedContent.find(c => c.title.toLowerCase().includes(seriesName.toLowerCase()));
        if (found) onEditContent(found);
        else addToast('لم يتم العثور على المسلسل في المكتبة المنشورة بعد.', 'info');
    };

    const filteredSchedules = useMemo(() => {
        return schedules.filter(s => {
            const matchesSearch = s.seriesName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' ? true : (filterStatus === 'active' ? s.isActive : !s.isActive);
            return matchesSearch && matchesStatus;
        }).sort((a, b) => {
            const pMap = { hot: 0, high: 1, medium: 2, low: 3 };
            if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];
            return a.seriesName.localeCompare(b.seriesName);
        });
    }, [schedules, searchTerm, filterStatus]);

    const airingToday = useMemo(() => filteredSchedules.filter(s => s.daysOfWeek.includes(today) && s.isActive), [filteredSchedules, today]);
    const others = useMemo(() => filteredSchedules.filter(s => !s.daysOfWeek.includes(today) || !s.isActive), [filteredSchedules, today]);

    if (viewMode === 'editor') {
        return (
            <ScheduleEditorView 
                schedule={editingSchedule} 
                onClose={() => setViewMode('list')} 
                onSave={async (s) => {
                    await saveReleaseSchedule(s);
                    addToast('تم حفظ بيانات الرادار!', 'success');
                    setViewMode('list');
                    fetchSchedules();
                }} 
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up" dir="rtl">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
                <div className="flex flex-col md:flex-row gap-6 items-center w-full">
                    <div className="relative w-full md:w-96 flex items-center">
                        <input 
                            type="text" 
                            placeholder="ابحث في رادار البث..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0f1014] border border-gray-700 rounded-2xl px-12 py-4 focus:border-[#00A7F8] focus:ring-1 focus:ring-[#00A7F8] outline-none text-white transition-all text-sm shadow-inner"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 opacity-50 flex items-center justify-center">
                            <SearchIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex bg-[#0f1014] p-1 rounded-xl border border-gray-700 w-full md:w-auto">
                        <button onClick={() => setFilterStatus('all')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black transition-all ${filterStatus === 'all' ? 'bg-gray-800 text-white shadow' : 'text-gray-500'}`}>الكل</button>
                        <button onClick={() => setFilterStatus('active')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black transition-all ${filterStatus === 'active' ? 'bg-green-600 text-white shadow' : 'text-gray-500'}`}>النشط</button>
                        <button onClick={() => setFilterStatus('inactive')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black transition-all ${filterStatus === 'inactive' ? 'bg-red-600 text-white shadow' : 'text-gray-500'}`}>المتوقف</button>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenEdit(null)}
                    className="w-full lg:w-auto bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-black px-12 py-4 rounded-[1.5rem] hover:shadow-[0_0_40px_rgba(0,167,248,0.4)] transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-xl"
                >
                    + إضافة للمجدولة
                </button>
            </div>

            {/* Layout: Main List + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main List (8 cols) */}
                <div className="lg:col-span-8 space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                            <h4 className="text-2xl font-black text-white">إصدارات اليوم ({airingToday.length})</h4>
                        </div>
                        {airingToday.length === 0 ? (
                            <div className="bg-[#1f2937]/30 p-16 rounded-[3rem] border border-dashed border-gray-800 text-center opacity-40">
                                <p className="text-lg font-bold">لا توجد إصدارات منشطة اليوم</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {airingToday.map(item => (
                                    <RadarCard 
                                        key={item.id} 
                                        item={item} 
                                        dayLabels={item.daysOfWeek.map(d => dayNames[d])} 
                                        onMarkDone={() => handleMarkAsDone(item.id)}
                                        onEdit={() => handleOpenEdit(item)}
                                        onDelete={() => onRequestDelete(item.id, item.seriesName)}
                                        onJump={() => handleJumpToContent(item.seriesName)}
                                        isToday={true}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(0,167,248,0.5)]"></div>
                            <h4 className="text-2xl font-black text-white">بقية أيام الأسبوع</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {others.map(item => (
                                <RadarCard 
                                    key={item.id} 
                                    item={item} 
                                    dayLabels={item.daysOfWeek.map(d => dayNames[d])} 
                                    onMarkDone={() => handleMarkAsDone(item.id)}
                                    onEdit={() => handleOpenEdit(item)}
                                    onDelete={() => onRequestDelete(item.id, item.seriesName)}
                                    onJump={() => handleJumpToContent(item.seriesName)}
                                    isToday={false}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Library Sidebar (4 cols) */}
                <div className="lg:col-span-4 sticky top-24 space-y-6">
                    <div className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-2xl h-fit">
                        <h3 className="font-black text-white mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-black shadow-inner">📡</span>
                            المكتبة السريعة
                        </h3>
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed">ابحث عن المسلسلات المنشورة حالياً في مكتبتك لفتح صفحة تعديل الحلقات مباشرة.</p>
                        <div className="relative mb-6 flex items-center">
                            <input 
                                type="text" 
                                placeholder="ابحث في المنشور..." 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-[1.25rem] px-12 py-4 text-white text-sm focus:outline-none focus:border-[#00A7F8] placeholder-gray-700 transition-all shadow-inner"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 flex items-center justify-center">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                            {allPublishedContent.filter(c => c.type === 'series').slice(0, 10).map((c:any) => (
                                <div key={c.id} onClick={() => onEditContent(c)} className="flex items-center gap-4 p-3.5 bg-[#0f1014] hover:bg-[#161b22] rounded-2xl border border-transparent hover:border-[#00A7F8]/30 cursor-pointer group transition-all duration-300">
                                    <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-lg relative">
                                        <img src={c.poster} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate text-white group-hover:text-[#00A7F8] transition-colors">{c.title}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-black text-gray-600 font-mono">{c.releaseYear}</span>
                                            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TV SERIES</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RadarCard: React.FC<{
    item: ReleaseSchedule; 
    dayLabels: string[]; 
    onMarkDone: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onJump: () => void;
    isToday: boolean;
}> = ({ item, dayLabels, onMarkDone, onEdit, onDelete, onJump, isToday }) => {
    
    const lastAddedDate = item.lastAddedAt ? new Date(item.lastAddedAt) : null;
    const isPublishedToday = lastAddedDate && lastAddedDate.toDateString() === new Date().toDateString();

    const borderGlow = item.priority === 'hot' ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : isToday ? 'border-green-600/30 shadow-lg' : 'border-gray-800';

    return (
        <div className={`group relative bg-[#1a2230] border rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col ${borderGlow}`}>
            <div className="aspect-[16/10] relative overflow-hidden bg-black">
                <img src={item.poster} className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2230] via-[#1a2230]/40 to-transparent"></div>
                
                <div className="absolute top-4 inset-x-4 flex justify-between items-start z-20">
                    <div className="flex flex-col gap-2">
                         <PriorityBadge priority={item.priority} />
                         <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-[8px] font-black text-white border border-white/10">
                            <StatusLabel status={item.status} />
                         </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onEdit} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-[#00A7F8] hover:text-black transition-all shadow-lg">✎</button>
                        <button onClick={onDelete} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-red-600 transition-all shadow-lg">✕</button>
                    </div>
                </div>

                <div className="absolute bottom-4 right-6 left-6 text-right">
                    <h5 className="text-2xl font-black text-white drop-shadow-lg leading-tight mb-2 truncate">{item.seriesName}</h5>
                    <div className="flex items-center gap-3">
                         <span className="bg-[#00A7F8] text-black text-xs px-4 py-1.5 rounded-xl font-black shadow-lg" dir="rtl">{item.time}</span>
                         <div className="flex flex-wrap gap-1">
                            {dayLabels.map((day, idx) => (
                                <span key={idx} className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${isToday ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}>{day}</span>
                            ))}
                         </div>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-2">
                    {item.sources.slice(0, 2).map((src, i) => (
                        <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#0f1014] rounded-2xl text-[10px] font-black text-gray-400 hover:bg-[#161b22] border border-gray-800 transition-all group/link hover:border-[#00A7F8]/30">
                            <span className="truncate max-w-[80px]">{src.name}</span>
                            <ExternalLinkIcon />
                        </a>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-800/50 flex items-center justify-between">
                    <button onClick={onJump} className="text-xs font-black text-[#00A7F8] hover:text-[#00FFB0] transition-colors flex items-center gap-1.5 group/jump">
                        <span>إدارة الحلقات</span>
                        <span className="transition-transform group-hover/jump:-translate-x-1">🔗</span>
                    </button>

                    <button 
                        onClick={onMarkDone}
                        disabled={isPublishedToday}
                        className={`px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-xl flex items-center gap-2 active:scale-95 ${isPublishedToday ? 'bg-green-600/10 text-green-400 border border-green-500/20 cursor-default shadow-none' : 'bg-white text-black hover:bg-[#00FFB0]'}`}
                    >
                        {isPublishedToday ? '✓ تم النشر اليوم' : 'تحديد كمكتمل'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ScheduleEditorView: React.FC<{ 
    schedule: ReleaseSchedule | null; 
    onClose: () => void; 
    onSave: (s: ReleaseSchedule) => void 
}> = ({ schedule, onClose, onSave }) => {
    const isNew = !schedule;
    const [allContent, setAllContent] = useState<Content[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState<ReleaseSchedule>(schedule || {
        id: '', seriesName: '', poster: '', daysOfWeek: [1], time: '21:00', isActive: true,
        lastAddedAt: null, sources: [{ name: 'EGYBEST', url: '' }, { name: 'WE CIMA', url: '' }],
        priority: 'medium', status: 'ongoing', nextEpisodeNumber: 1, internalNotes: ''
    });

    useEffect(() => {
        const fetchAll = async () => {
            const snap = await db.collection('content').get();
            setAllContent(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content)));
        };
        fetchAll();
    }, []);

    const filteredSuggestions = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const normalizedQuery = normalizeText(searchQuery);
        return allContent.filter(c => normalizeText(c.title).includes(normalizedQuery)).slice(0, 5);
    }, [allContent, searchQuery]);

    const handleSelectContent = (content: Content) => {
        setFormData({ ...formData, seriesId: content.id, seriesName: content.title, poster: content.poster });
        setSearchQuery('');
        setIsSearching(false);
    };

    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const toggleDay = (dayIndex: number) => {
        setFormData(prev => {
            const currentDays = prev.daysOfWeek || [];
            const newDays = currentDays.includes(dayIndex) ? currentDays.filter(d => d !== dayIndex) : [...currentDays, dayIndex];
            return { ...prev, daysOfWeek: newDays.sort((a,b) => a - b) };
        });
    };

    const handleSourceChange = (idx: number, field: keyof ReleaseSource, val: string) => {
        const updated = [...formData.sources];
        updated[idx] = { ...updated[idx], [field]: val };
        setFormData({ ...formData, sources: updated });
    };

    const inputClass = "w-full bg-[#0f1014] border border-gray-700 rounded-2xl px-4 py-3 text-white focus:border-[#00A7F8] outline-none transition-all text-sm shadow-inner";
    const labelClass = "block text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 pr-1";

    return (
        <div className="space-y-10 animate-fade-in" dir="rtl">
            <div className="flex justify-between items-center bg-[#1a2230] p-8 rounded-[2.5rem] border border-gray-800 shadow-xl">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-4 bg-gray-800 text-gray-400 hover:text-white rounded-[1.25rem] transition-all border border-gray-700 shadow-lg group"><BackIcon /></button>
                    <div>
                        <h3 className="text-3xl font-black text-white">{isNew ? 'إضافة رادار جديد' : 'تحديث بيانات الرادار'}</h3>
                        <p className="text-xs text-gray-500 font-bold mt-1">قم بتخصيص مواعيد النشر والمصادر بدقة.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-10 py-3.5 bg-gray-800 text-gray-300 font-black rounded-2xl hover:bg-gray-700 transition-all border border-gray-700 shadow-lg">إلغاء</button>
                    <button 
                        onClick={() => onSave(formData)} 
                        className="bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-black px-14 py-3.5 rounded-2xl shadow-2xl transform active:scale-95 transition-all disabled:opacity-50"
                        disabled={!formData.seriesName || formData.daysOfWeek.length === 0}
                    >
                        حفظ الرادار
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4">
                     <div className="bg-[#1a2230] p-8 rounded-[3rem] border border-gray-700/50 shadow-2xl sticky top-24">
                         <div className="aspect-[2/3] rounded-[2rem] overflow-hidden bg-[#0a0a0a] border-2 border-dashed border-gray-700 relative group mb-8 shadow-inner">
                            {formData.poster ? (
                                <img src={formData.poster} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt=""/>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-xs text-gray-600 text-center px-8 gap-6 opacity-20"><RadarIcon className="w-16 h-16" /><span>معاينة البوستر</span></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                         </div>
                         <div className="space-y-4">
                            <label className={labelClass}>رابط البوستر المباشر</label>
                            <input value={formData.poster} onChange={e => setFormData({...formData, poster: e.target.value})} className={inputClass + " font-mono text-[10px] text-blue-400"} placeholder="https://..."/>
                         </div>
                     </div>
                </div>

                <div className="lg:col-span-8 space-y-8 pb-20">
                    <div className="bg-[#1a2230] p-10 rounded-[3rem] border border-gray-700/50 shadow-2xl space-y-10">
                        <div className="relative flex flex-col">
                            <label className={labelClass}>البحث السريع في المكتبة</label>
                            <div className="relative flex items-center">
                                <input 
                                    type="text" value={searchQuery} 
                                    onChange={e => { setSearchQuery(e.target.value); setIsSearching(true); }} 
                                    className={inputClass + " border-blue-500/20 focus:border-[#00A7F8] bg-[#0f1014] text-lg px-12"} 
                                    placeholder="اكتب اسم المسلسل للربط التلقائي..."
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A7F8] opacity-60 flex items-center justify-center">
                                    <SearchIcon className="w-6 h-6" />
                                </div>
                            </div>
                            {isSearching && filteredSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-3 bg-[#1f2937] border border-gray-700 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
                                    {filteredSuggestions.map(content => (
                                        <button key={content.id} type="button" onClick={() => handleSelectContent(content)} className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-all border-b border-gray-800 last:border-0">
                                            <img src={content.poster} className="w-10 h-14 object-cover rounded-lg shadow-lg" alt="" />
                                            <div className="flex flex-col text-right"><span className="font-black text-white">{content.title}</span><span className="text-[10px] text-gray-500 font-mono uppercase">ID: {content.id}</span></div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div><label className={labelClass}>اسم المسلسل (للتنبيهات)</label><input value={formData.seriesName} onChange={e => setFormData({...formData, seriesName: e.target.value})} className={inputClass} placeholder="اسم العمل الظاهر"/></div>
                            <div><label className={labelClass}>رقم الحلقة التالية</label><input type="number" value={formData.nextEpisodeNumber || ''} onChange={e => setFormData({...formData, nextEpisodeNumber: parseInt(e.target.value)})} className={inputClass} placeholder="مثال: 12"/></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div><label className={labelClass}>وقت البث المجدول</label><input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className={inputClass + " text-lg font-black text-[#00A7F8]"}/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>الأولوية</label><select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className={inputClass}><option value="low">عادي</option><option value="medium">متوسط</option><option value="high">مرتفع</option><option value="hot">تريند 🔥</option></select></div>
                                <div><label className={labelClass}>الحالة</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className={inputClass}><option value="ongoing">مستمر</option><option value="hiatus">متوقف</option><option value="finished">منتهي</option><option value="upcoming">قريباً</option></select></div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>أيام الصدور الأسبوعية</label>
                            <div className="flex flex-wrap gap-2">
                                {dayNames.map((name, idx) => (
                                    <button key={idx} type="button" onClick={() => toggleDay(idx)} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border ${formData.daysOfWeek.includes(idx) ? 'bg-[#00A7F8] text-black border-transparent shadow-[0_0_20px_rgba(0,167,248,0.4)]' : 'bg-[#0f1014] text-gray-500 border-gray-800 hover:border-gray-600'}`}>{name}</button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-800 space-y-6">
                            <h4 className="text-sm font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">🔗 مصادر المراقبة (Sources)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.sources.map((src, i) => (
                                    <div key={i} className="bg-[#0f1014] p-5 rounded-3xl border border-gray-800 space-y-3 group/src relative shadow-inner">
                                        <button type="button" onClick={() => setFormData({...formData, sources: formData.sources.filter((_,si)=>si!==i)})} className="absolute -top-2 -left-2 w-7 h-7 bg-red-600 rounded-xl flex items-center justify-center opacity-0 group-hover/src:opacity-100 transition-all shadow-lg">✕</button>
                                        <div>
                                            <label className={labelClass}>اسم المصدر</label>
                                            <input value={src.name} onChange={e => handleSourceChange(i, 'name', e.target.value)} className={inputClass} placeholder="مثال: EGYBEST"/>
                                        </div>
                                        <div>
                                            <label className={labelClass}>رابط المراقبة</label>
                                            <input value={src.url} onChange={e => handleSourceChange(i, 'url', e.target.value)} className={inputClass + " font-mono text-[10px] text-blue-400"} placeholder="https://..."/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => setFormData({...formData, sources: [...formData.sources, { name: '', url: '' }]})} className="w-full py-4 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500 font-bold hover:border-[#00A7F8] hover:text-[#00A7F8] transition-all">+ إضافة مصدر مراقبة</button>
                        </div>

                        <div className="pt-8 border-t border-gray-800">
                            <label className={labelClass}>ملاحظات داخلية (خاصة بك)</label>
                            <textarea value={formData.internalNotes} onChange={e => setFormData({...formData, internalNotes: e.target.value})} className={inputClass + " h-24 resize-none"} placeholder="اكتب أي ملاحظات هنا..."/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentRadarTab;
