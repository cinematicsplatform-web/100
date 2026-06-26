import React, { useState, useEffect, useRef } from 'react';
// التعديل هنا: استيراد الواجهة الأصلية لتوسيعها محلياً
import type { PromotionalBanner as OriginalPromotionalBanner, PromotionalBannerItem, Content, Episode } from '../../types';
import { db } from '../../firebase';
import { PlusIcon } from '../icons/PlusIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { FilmIcon } from '../icons/FilmIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import ToggleSwitch from '../ToggleSwitch';

// إضافة المتغيرات الجديدة محلياً لتخطي خطأ Vercel
export interface PromotionalBanner extends OriginalPromotionalBanner {
    bannerType?: string;
    logoUrl?: string;
}

interface PromoBannersTabProps {
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    allContent?: Content[];
    onContentChanged?: () => void;
}

const PromoBannersTab: React.FC<PromoBannersTabProps> = ({ addToast, allContent = [], onContentChanged }) => {
    const [banners, setBanners] = useState<PromotionalBanner[]>([]);
    const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isItemsExpanded, setIsItemsExpanded] = useState(false);
    const [activeItemDropdown, setActiveItemDropdown] = useState<number | null>(null);
    const [itemSearchText, setItemSearchText] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    
    // ... later in render
    const filteredContent = allContent.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 50);
    const filteredItemContent = allContent.filter(c => c.title.toLowerCase().includes(itemSearchText.toLowerCase())).slice(0, 50);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const querySnapshot = await db.collection('promotionalBanners').get();
                const list: PromotionalBanner[] = [];
                querySnapshot.forEach((doc: any) => {
                    list.push({ id: doc.id, ...doc.data() } as PromotionalBanner);
                });
                setBanners(list);
            } catch (e) {
                console.error('Error fetching banners:', e);
            }
        };
        fetchBanners();
    }, []);

    const handleSaveBanner = async () => {
        if (!editingBanner) return;
        try {
            if (editingBanner.id) {
                // Update
                await db.collection('promotionalBanners').doc(editingBanner.id).update({ ...editingBanner });
                setBanners(banners.map(b => b.id === editingBanner.id ? editingBanner : b));
                addToast('تم تحديث البانر بنجاح', 'success');
            } else {
                // Add
                const newDocRef = await db.collection('promotionalBanners').add({ ...editingBanner, id: '' });
                const finalBanner = { ...editingBanner, id: newDocRef.id };
                await newDocRef.update({ id: newDocRef.id });
                setBanners([...banners, finalBanner]);
                addToast('تم إضافة البانر بنجاح', 'success');
            }
            setEditingBanner(null);
            if (onContentChanged) onContentChanged();
        } catch (e: any) {
            addToast('حدث خطأ أثناء الحفظ', 'error');
            console.error(e);
        }
    };

    const handleDeleteBanner = async (id: string) => {
        try {
            await db.collection('promotionalBanners').doc(id).delete();
            setBanners(banners.filter(b => b.id !== id));
            addToast('تم الحذف بنجاح', 'success');
            if (onContentChanged) onContentChanged();
        } catch (e) {
            addToast('حدث خطأ أثناء الحذف', 'error');
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await db.collection('promotionalBanners').doc(id).update({ isActive: !currentStatus });
            setBanners(banners.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
            if (onContentChanged) onContentChanged();
        } catch (e) {
            addToast('حدث خطأ أثناء التحديث', 'error');
        }
    };

    const handleAddItem = () => {
        if (!editingBanner) return;
        const newItem: PromotionalBannerItem = { title: '', thumbnail: '', duration: '', videoUrl: '' };
        setEditingBanner({ ...editingBanner, items: [...(editingBanner.items || []), newItem] });
    };

    const handleItemChange = (index: number, field: keyof PromotionalBannerItem, value: string) => {
        if (!editingBanner) return;
        const newItems = [...editingBanner.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditingBanner({ ...editingBanner, items: newItems });
    };

    const handleRemoveItem = (index: number) => {
        if (!editingBanner) return;
        const newItems = editingBanner.items.filter((_, i) => i !== index);
        setEditingBanner({ ...editingBanner, items: newItems });
    };

    const handleContentSelect = (contentId: string) => {
        if (!editingBanner) return;
        setEditingBanner({
            ...editingBanner,
            contentId
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <FilmIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">إدارة الحاويات الترويجية (Inline Banners)</h3>
                        <p className="text-xs text-gray-400 mt-1">تظهر هذه الحاويات بين الصفوف في الصفحات المحددة (لشاشات الكمبيوتر فقط).</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingBanner({ id: '', targetPage: 'home', positionIndex: 1, title: '', subtitle: '', backgroundImage: '', items: [], isActive: true });
                        setIsItemsExpanded(true);
                        setTimeout(() => {
                            editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    }}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    إضافة حاوية
                </button>
            </div>

            {editingBanner && (
                <div ref={editorRef} className="bg-[#1f2937] p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative mb-8 scroll-mt-24">
                    <button onClick={() => setEditingBanner(null)} className="absolute top-4 left-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                        <CloseIcon className="w-4 h-4 text-gray-400" />
                    </button>
                    <h3 className="text-lg font-bold text-white mb-6">
                        {editingBanner.id ? 'تعديل الحاوية الترويجية' : 'إضافة حاوية جديدة'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-300 mb-2">نوع الحاوية</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                                    <input 
                                        type="radio" 
                                        name="bannerType" 
                                        value="auto" 
                                        checked={editingBanner.bannerType !== 'custom'} 
                                        onChange={() => setEditingBanner({...editingBanner, bannerType: 'auto'})}
                                        className="form-radio text-indigo-500 bg-gray-800 border-gray-700" 
                                    />
                                    <span>مسلسل (ارتباط تلقائي بالحلقات)</span>
                                </label>
                                <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                                    <input 
                                        type="radio" 
                                        name="bannerType" 
                                        value="custom" 
                                        checked={editingBanner.bannerType === 'custom'} 
                                        onChange={() => setEditingBanner({...editingBanner, bannerType: 'custom'})}
                                        className="form-radio text-indigo-500 bg-gray-800 border-gray-700" 
                                    />
                                    <span>فيلم / مخصص (إضافة كروت يدوياً)</span>
                                </label>
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-300 mb-2">ربط بعمل (ابحث عن الاسم)</label>
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                placeholder={editingBanner.contentId ? allContent.find(c => c.id === editingBanner.contentId)?.title || 'اختر عملاً...' : 'اكتب اسم المسلسل للبحث...'}
                            />
                            {showDropdown && (
                                <ul className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                     <li 
                                         className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                                         onMouseDown={() => {
                                             setSearchQuery('');
                                             setShowDropdown(false);
                                             handleContentSelect('');
                                         }}
                                     >
                                         -- بدون ربط --
                                     </li>
                                     {filteredContent.map(c => (
                                         <li 
                                             key={c.id} 
                                             className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-t border-gray-700/50"
                                             onMouseDown={() => {
                                                 setSearchQuery(c.title);
                                                 setShowDropdown(false);
                                                 handleContentSelect(c.id);
                                             }}
                                         >
                                             {c.title}
                                         </li>
                                     ))}
                                </ul>
                            )}
                            <p className="text-xs text-gray-400 mt-1">عند اختيار عمل، سيتم جلب الحلقات وتعيين صورة الخلفية تلقائياً.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">العنوان الرئيسي</label>
                            <input 
                                type="text"
                                value={editingBanner.title}
                                onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                                placeholder="مثال: صراعات خلف العشوائيات"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">الوصف الفرعي</label>
                            <input 
                                type="text"
                                value={editingBanner.subtitle}
                                onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                                placeholder="مثال: عالم من الجريمة خلف أبواب موصدة"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                            />
                        </div>
                        {(!editingBanner.contentId || editingBanner.bannerType === 'custom') && (
                        <>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">رابط صورة الخلفية {editingBanner.contentId ? '(تجاوز)' : ''}</label>
                            <input 
                                type="text"
                                value={editingBanner.backgroundImage || ''}
                                onChange={(e) => setEditingBanner({...editingBanner, backgroundImage: e.target.value})}
                                placeholder="https://example.com/banner-bg.jpg"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">رابط اللوجو الشفاف {editingBanner.contentId ? '(تجاوز)' : ''}</label>
                            <input 
                                type="text"
                                value={editingBanner.logoUrl || ''}
                                onChange={(e) => setEditingBanner({...editingBanner, logoUrl: e.target.value})}
                                placeholder="https://example.com/logo.png"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                            />
                        </div>
                        </>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">الصفحة المستهدفة</label>
                                <select 
                                    value={editingBanner.targetPage}
                                    onChange={(e) => setEditingBanner({...editingBanner, targetPage: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                >
                                    <option value="home">الرئيسية</option>
                                    <option value="series">المسلسلات</option>
                                    <option value="movies">الأفلام</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">الترتيب (بعد أي قسم؟)</label>
                                <select 
                                    value={editingBanner.targetCarousel || ''}
                                    onChange={(e) => setEditingBanner({...editingBanner, targetCarousel: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 mb-2"
                                >
                                    <option value="">-- الترتيب بالرقم (اختياري) --</option>
                                    <option value="أحدث الإضافات">أحدث الإضافات</option>
                                    <option value="مسلسلات عربية">مسلسلات عربية</option>
                                    <option value="مسلسلات تركية">مسلسلات تركية</option>
                                    <option value="مسلسلات أجنبية">مسلسلات أجنبية</option>
                                    <option value="أفلام عربية">أفلام عربية</option>
                                    <option value="أفلام أجنبية">أفلام أجنبية</option>
                                </select>
                                {!editingBanner.targetCarousel && (
                                    <input 
                                        type="number"
                                        min="1"
                                        placeholder="رقم الصف البديل"
                                        value={editingBanner.positionIndex}
                                        onChange={(e) => setEditingBanner({...editingBanner, positionIndex: parseInt(e.target.value) || 1})}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {(!editingBanner.contentId || editingBanner.bannerType === 'custom') ? (
                    <div className="border-t border-gray-700 pt-6 mb-6">
                        <div 
                            className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-800/50 p-2 -mx-2 rounded-lg transition-colors"
                            onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <h4 className="text-md font-bold text-white">الحلقات / الكروت السفلية ({editingBanner.items?.length || 0})</h4>
                                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isItemsExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddItem();
                                    setIsItemsExpanded(true);
                                }} 
                                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-1 focus:outline-none"
                            >
                                <PlusIcon className="w-4 h-4" /> إضافة كرت
                            </button>
                        </div>
                        
                        {isItemsExpanded && (
                            <div className="space-y-4">
                                {editingBanner.items?.map((item, index) => (
                                    <div key={index} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 relative">
                                        <button onClick={() => handleRemoveItem(index)} className="absolute top-2 left-2 text-red-500 hover:text-red-400">
                                            <CloseIcon className="w-5 h-5" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-4 relative">
                                                <label className="block text-xs text-indigo-400 mb-1">تعبئة ذكية (ابحث عن فيلم/عمل)</label>
                                                <input 
                                                    type="text" 
                                                    value={activeItemDropdown === index ? itemSearchText : ''}
                                                    onChange={(e) => setItemSearchText(e.target.value)}
                                                    onFocus={() => {
                                                        setActiveItemDropdown(index);
                                                        setItemSearchText('');
                                                    }}
                                                    onBlur={() => setTimeout(() => setActiveItemDropdown(null), 200)}
                                                    className="w-full bg-indigo-900/30 border border-indigo-500/30 rounded px-3 py-2 text-sm text-white focus:border-indigo-500" 
                                                    placeholder="اكتب اسم العمل لجلب بياناته تلقائياً..." 
                                                />
                                                {activeItemDropdown === index && (
                                                    <ul className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                         {filteredItemContent.map(c => (
                                                             <li 
                                                                 key={c.id} 
                                                                 className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-t border-gray-700/50 text-sm"
                                                                 onMouseDown={() => {
                                                                     // Auto fill item
                                                                     const newItems = [...editingBanner.items];
                                                                     newItems[index] = {
                                                                         ...newItems[index],
                                                                         title: c.title,
                                                                         thumbnail: c.backdrop || c.poster || '',
                                                                         duration: c.duration || '',
                                                                         videoUrl: `/watch/${c.slug}`
                                                                     };
                                                                     setEditingBanner({ ...editingBanner, items: newItems });
                                                                     setActiveItemDropdown(null);
                                                                 }}
                                                             >
                                                                 {c.title}
                                                             </li>
                                                         ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">عنوان الكرت</label>
                                                <input type="text" value={item.title} onChange={(e) => handleItemChange(index, 'title', e.target.value)} className="w-full bg-gray-800 rounded px-3 py-2 text-sm text-white" placeholder="الموسم 1, الحلقة 1" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">صورة الكرت</label>
                                                <input type="text" value={item.thumbnail} onChange={(e) => handleItemChange(index, 'thumbnail', e.target.value)} className="w-full bg-gray-800 rounded px-3 py-2 text-sm text-white" placeholder="رابط الصورة" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">المدة</label>
                                                <input type="text" value={item.duration} onChange={(e) => handleItemChange(index, 'duration', e.target.value)} className="w-full bg-gray-800 rounded px-3 py-2 text-sm text-white" placeholder="42:50" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">رابط الفيديو</label>
                                                <input type="text" value={item.videoUrl} onChange={(e) => handleItemChange(index, 'videoUrl', e.target.value)} className="w-full bg-gray-800 rounded px-3 py-2 text-sm text-white" placeholder="/watch/slug" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!editingBanner.items || editingBanner.items.length === 0) && (
                                    <p className="text-gray-500 text-sm text-center py-4">لم يتم إضافة كروت بعد.</p>
                                )}
                            </div>
                        )}
                    </div>
                    ) : (
                    <div className="border-t border-gray-700 pt-6 mb-6">
                        <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl flex items-start gap-4">
                            <FilmIcon className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-indigo-300 font-bold mb-1">ارتباط تلقائي نشط</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    يتم جلب صورة الخلفية وكروت الحلقات تلقائياً من المسلسل المرتبط. أي تحديثات تحدث للمسلسل (مثل إضافة حلقة جديدة أو تغيير صورة الخلفية) ستظهر هنا مباشرة ولن تحتاج لتحديثها يدوياً.
                                </p>
                            </div>
                        </div>
                    </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                        <button onClick={() => setEditingBanner(null)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold">
                            إلغاء
                        </button>
                        <button onClick={handleSaveBanner} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold">
                            حفظ الحاوية
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {banners.map(banner => {
                    let displayBg = banner.backgroundImage;
                    let displayCount = banner.items?.length || 0;
                    if (banner.contentId && allContent) {
                        const c = allContent.find(x => x.id === banner.contentId);
                        if (c) {
                            displayBg = displayBg || c.backdrop || c.poster || '';
                            if (banner.bannerType !== 'custom') {
                                if (c.type === 'series' && c.seasons && c.seasons.length > 0) {
                                    const seq = c.seasons.slice().sort((a,b) => b.seasonNumber - a.seasonNumber);
                                    if (seq[0].backdrop && !banner.backgroundImage) displayBg = seq[0].backdrop;
                                    displayCount = seq[0].episodes?.length || 0;
                                } else if (c.type === 'movie' || c.type === 'program') {
                                    displayCount = 1;
                                }
                            }
                        }
                    }

                    return (
                    <div key={banner.id} className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-64 h-36 flex-shrink-0 rounded-xl overflow-hidden relative">
                            <img src={displayBg} className="w-full h-full object-cover" alt={banner.title} />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="bg-black/80 text-white text-xs px-2 py-1 rounded font-bold">صفحة: {banner.targetPage} - بعد صف: {banner.positionIndex}</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-white">{banner.title}</h4>
                                    <p className="text-sm text-gray-400">{banner.subtitle}</p>
                                </div>
                                <ToggleSwitch checked={banner.isActive} onChange={() => handleToggleActive(banner.id, banner.isActive)} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>عدد الكروت: {displayCount} {banner.contentId && banner.bannerType !== 'custom' ? '(ارتباط تلقائي)' : ''}</span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        setEditingBanner(banner);
                                        setIsItemsExpanded(false);
                                        setTimeout(() => {
                                            editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 100);
                                    }} 
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors cursor-pointer"
                                    type="button"
                                >
                                    تعديل
                                </button>
                                <button onClick={() => handleDeleteBanner(banner.id)} className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm transition-colors cursor-pointer" type="button">
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                )})}
                {banners.length === 0 && (
                    <div className="text-center p-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                        <p className="text-gray-400">لا توجد حاويات إعلانية بعد. اضغط على المفتاح بالأعلى لإضافة حاوية جديدة.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoBannersTab;