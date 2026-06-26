
import React, { useState, useMemo, useEffect } from 'react';
import type { Content, PinnedItem, PageKey } from '../../types';
import { ContentType } from '../../types';
import { TrophyIcon, SearchIcon, TrashIcon } from './AdminIcons';

const Top10ManagerTab: React.FC<any> = ({ allContent, pinnedState, setPinnedItems }) => { 
  const [selectedPage, setSelectedPage] = useState<PageKey>('home'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [localPinnedItems, setLocalPinnedItems] = useState<PinnedItem[]>([]); 
  const [draggedItem, setDraggedItem] = useState<PinnedItem | null>(null); 
  const [dragOverItem, setDraggedOverItem] = useState<PinnedItem | null>(null); 

  useEffect(() => { 
    setLocalPinnedItems(pinnedState[selectedPage] || []); 
  }, [pinnedState, selectedPage]); 

  const isDirty = JSON.stringify(localPinnedItems) !== JSON.stringify(pinnedState[selectedPage] || []); 
  
  const pinnedContentDetails = useMemo(() => localPinnedItems.map(pin => { 
    const content = allContent.find((c:any) => c.id === pin.contentId); 
    return content ? { ...pin, contentDetails: content } : null; 
  }).filter((item): item is { contentDetails: Content } & PinnedItem => item !== null), [localPinnedItems, allContent]); 

  const availableContent = useMemo(() => { 
    const pinnedIds = new Set(localPinnedItems.map(p => p.contentId)); 
    let filtered = allContent.filter((c:any) => !pinnedIds.has(c.id)); 
    if (selectedPage === 'movies') filtered = filtered.filter((c:any) => c.type === ContentType.Movie); 
    else if (selectedPage === 'series') filtered = filtered.filter((c:any) => c.type === ContentType.Series); 
    else if (selectedPage === 'kids') filtered = filtered.filter((c:any) => c.categories.includes('أفلام أنيميشن') || c.categories.includes('مسلسلات أنيميشن') || c.categories.includes('افلام أنميشن') || c.visibility === 'kids' || c.genres.includes('أطفال')); 
    else if (selectedPage === 'ramadan') filtered = filtered.filter((c:any) => c.categories.includes('رمضان')); 
    else if (selectedPage === 'soon') filtered = filtered.filter((c:any) => c.categories.includes('قريباً')); 
    return filtered.filter((c:any) => (c.title || '').toLowerCase().includes(searchTerm.toLowerCase())); 
  }, [allContent, localPinnedItems, searchTerm, selectedPage]); 

  const handlePin = (contentId: string) => { 
    if (pinnedContentDetails.length >= 10) { alert('يمكنك إضافة 10 عناصر كحد أقصى للتوب 10.'); return; } 
    setLocalPinnedItems([...localPinnedItems, { contentId, bannerNote: '' }]); 
  }; 

  const handleUnpin = (contentId: string) => { setLocalPinnedItems(localPinnedItems.filter(p => p.contentId !== contentId)); }; 
  
  const onDragStart = (e: React.DragEvent<HTMLLIElement>, item: PinnedItem) => { setDraggedItem(item); e.dataTransfer.effectAllowed = 'move'; }; 
  const onDragOver = (e: React.DragEvent<HTMLLIElement>, item: PinnedItem) => { e.preventDefault(); if (draggedItem?.contentId !== item.contentId) { setDraggedOverItem(item); } }; 
  const onDrop = () => { if (!draggedItem || !dragOverItem) return; const currentItems = [...localPinnedItems]; const fromIndex = currentItems.findIndex(p => p.contentId === draggedItem.contentId); const toIndex = currentItems.findIndex(p => p.contentId === dragOverItem.contentId); if (fromIndex === -1 || toIndex === -1) return; const updatedItems = [...currentItems]; const [movedItem] = updatedItems.splice(fromIndex, 1); updatedItems.splice(toIndex, 0, movedItem); setLocalPinnedItems(updatedItems); setDraggedItem(null); setDraggedOverItem(null); }; 
  const onDragEnd = () => { setDraggedItem(null); setDraggedOverItem(null); }; 
  
  const pageLabels: Record<string, string> = { home: 'الرئيسية', movies: 'الأفلام', series: 'المسلسلات', ramadan: 'رمضان', soon: 'قريباً', kids: 'الأطفال' }; 
  
  return ( 
    <div className="animate-fade-in-up space-y-6"> 
        <div className="bg-[#1f2937] p-6 rounded-3xl border border-gray-700/50 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD700]/5 rounded-bl-full pointer-events-none"></div>
            <h3 className="text-gray-400 mb-6 text-xs font-black uppercase tracking-widest flex items-center gap-2 relative z-10">
                <span className="w-1.5 h-4 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]"></span>
                تعديل قائمة التوب 10: {pageLabels[selectedPage]}
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-3 relative z-10">
                {(Object.keys(pageLabels) as PageKey[]).map(key => (
                    <button 
                        key={key} 
                        onClick={() => setSelectedPage(key)} 
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all border ${selectedPage === key ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.15)] scale-105' : 'bg-[#0f1014] border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'}`}
                    >
                        {pageLabels[key]}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8"> 
            <div className="lg:col-span-8 bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <span className="text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><TrophyIcon className="w-8 h-8" /></span>
                            ترتيب الأفضل 10
                        </h3>
                        <p className="text-xs text-gray-500 font-bold mt-1">اسحب العنصر من علامة الترتيب لتغيير موضعه</p>
                    </div>
                    <button 
                        onClick={() => setPinnedItems(selectedPage, localPinnedItems)} 
                        disabled={!isDirty} 
                        className="bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black py-3 px-10 rounded-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale disabled:transform-none shadow-xl"
                    >
                        حفظ القائمة
                    </button>
                </div>

                {pinnedContentDetails.length > 0 ? (
                    <ul onDrop={onDrop} onDragLeave={() => setDraggedOverItem(null)} className="space-y-4">
                        {pinnedContentDetails.map((item, index) => (
                            <li 
                                key={item.contentId} 
                                draggable 
                                onDragStart={(e) => onDragStart(e, item)} 
                                onDragOver={(e) => onDragOver(e, item)} 
                                onDragEnd={onDragEnd} 
                                className={`flex items-center gap-6 p-4 rounded-2xl transition-all duration-500 border cursor-grab active:cursor-grabbing group ${draggedItem?.contentId === item.contentId ? 'opacity-20 scale-95' : 'hover:border-[#FFD700]/30 shadow-lg'} ${dragOverItem?.contentId === item.contentId ? 'bg-gray-700 border-[#FFD700] translate-x-3' : 'bg-[#0f1014] border-gray-800'}`}
                            >
                                <div className="flex flex-col items-center justify-center w-14 shrink-0 bg-black/40 rounded-xl py-3 border border-white/5">
                                    <span className="rank-font font-black text-2xl text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">#{index + 1}</span>
                                </div>
                                <div className="w-16 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl relative">
                                    <img src={item.contentDetails.poster} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-white text-lg md:text-xl truncate group-hover:text-[#FFD700] transition-colors">{item.contentDetails.title}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.contentDetails.type}</span>
                                        <span className="text-[11px] font-black text-gray-500 font-mono">{item.contentDetails.releaseYear}</span>
                                        <span className="text-[11px] text-yellow-500 font-black">★ {(Number(item.contentDetails.rating) || 0).toFixed(1)}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleUnpin(item.contentId)} className="p-4 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90"><TrashIcon/></button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-32 text-gray-500 border-2 border-dashed border-gray-700 rounded-[3rem] flex flex-col items-center justify-center gap-4 bg-black/20 animate-pulse">
                        <span className="text-7xl opacity-10">🏆</span>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-gray-400">قائمة التوب 10 خالية</p>
                            <p className="text-sm opacity-60">اختر الأعمال من القائمة الجانبية لإضافتها هنا</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-2xl h-fit sticky top-24">
                    <h3 className="font-black text-white mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center text-xl font-black shadow-inner">+</span>
                        إضافة للقائمة
                    </h3>
                    <div className="relative mb-6">
                        <input 
                            type="text" 
                            placeholder="ابحث لإضافة عمل..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-[1.25rem] px-12 py-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] placeholder-gray-700 transition-all shadow-inner"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </span>
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                        {availableContent.length === 0 ? (
                            <div className="py-10 text-center opacity-30 text-xs font-bold">لا يوجد نتائج متاحة</div>
                        ) : (
                            availableContent.slice(0, 20).map((c:any) => (
                                <div key={c.id} className="flex items-center gap-4 p-3.5 bg-[#0f1014] hover:bg-[#161b22] rounded-2xl border border-transparent hover:border-[#FFD700]/30 cursor-pointer group transition-all duration-300">
                                    <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-lg relative">
                                        <img src={c.poster} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate text-white group-hover:text-[#FFD700] transition-colors">{c.title}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{c.type === 'movie' ? 'FILM' : 'TV'}</span>
                                            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
                                            <span className="text-[10px] font-black text-gray-600 font-mono">{c.releaseYear}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handlePin(c.id)} 
                                        className="bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700] hover:text-black font-black text-xl w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm border border-[#FFD700]/10"
                                    >
                                        +
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div> 
    </div>
  ); 
};

export default Top10ManagerTab;
