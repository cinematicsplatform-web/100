import React, { useState } from 'react';
import type { SiteSettings, Content, StartupAd } from '../../types';
import ToggleSwitch from '../ToggleSwitch';
import { MegaphoneIcon } from './AdminIcons';
import { PlusIcon } from '../icons/PlusIcon';
import { CloseIcon } from '../icons/CloseIcon';

interface StartupAdTabProps {
    siteSettings: SiteSettings;
    onSetSiteSettings: (s: SiteSettings) => void;
    allContent: Content[];
}

const StartupAdTab: React.FC<StartupAdTabProps> = ({ siteSettings, onSetSiteSettings, allContent }) => {
    const startupAds = siteSettings.startupAds || [];
    const [editingAdIndex, setEditingAdIndex] = useState<number | null>(null);

    const handleAddAd = () => {
        const newAd: StartupAd = {
            id: Date.now().toString(),
            name: `إعلان جديد ${startupAds.length + 1}`,
            imageUrlPc: '',
            imageUrlMobile: '',
            linkType: 'none',
            isActive: false,
            updatedAt: new Date().toISOString()
        };
        const updatedAds = [...startupAds, newAd];
        onSetSiteSettings({ ...siteSettings, startupAds: updatedAds });
        setEditingAdIndex(updatedAds.length - 1);
    };

    const handleUpdateAd = (index: number, updatedAd: StartupAd) => {
        const updatedAds = [...startupAds];
        updatedAds[index] = { ...updatedAd, updatedAt: new Date().toISOString() };
        onSetSiteSettings({ ...siteSettings, startupAds: updatedAds });
    };

    const handleDeleteAd = (index: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        const updatedAds = startupAds.filter((_, i) => i !== index);
        onSetSiteSettings({ ...siteSettings, startupAds: updatedAds });
        if (editingAdIndex === index) {
            setEditingAdIndex(null);
        } else if (editingAdIndex !== null && editingAdIndex > index) {
            setEditingAdIndex(editingAdIndex - 1);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <MegaphoneIcon className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">إعلانات الانطلاق (Startup Ads)</h3>
                        <p className="text-xs text-gray-400 mt-1">تظهر هذه الإعلانات في الصفحة الرئيسية فقط (كل إعلان يظهر مرة واحدة للمستخدم).</p>
                    </div>
                </div>
                <button
                    onClick={handleAddAd}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    اضافة إعلان
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {startupAds.map((ad, index) => (
                    <div key={ad.id} className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                            <div className="flex items-center gap-4">
                                <span className={ad.isActive ? "text-green-500 font-bold" : "text-gray-500"}>
                                    {ad.isActive ? "نشط" : "غير نشط"}
                                </span>
                                <h4 className="text-lg font-bold text-white">{ad.name || `إعلان ${ad.id}`}</h4>
                            </div>
                            <div className="flex items-center gap-4">
                                <ToggleSwitch 
                                    checked={ad.isActive} 
                                    onChange={(c) => handleUpdateAd(index, { ...ad, isActive: c })} 
                                />
                                <button
                                    onClick={() => setEditingAdIndex(editingAdIndex === index ? null : index)}
                                    className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md text-white transition-colors"
                                >
                                    {editingAdIndex === index ? 'إخفاء التعديل' : 'تعديل'}
                                </button>
                                <button
                                    onClick={() => handleDeleteAd(index)}
                                    className="text-sm bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded-md transition-colors"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>

                        {editingAdIndex === index && (
                            <div className="space-y-6 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">اسم الإعلان (للتنظيم الداخلي)</label>
                                        <input 
                                            type="text"
                                            value={ad.name}
                                            onChange={(e) => handleUpdateAd(index, { ...ad, name: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">رقم المسلسل (ID الداخلي - لا يمكن تغييره)</label>
                                        <input 
                                            type="text"
                                            value={ad.id}
                                            disabled
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 opacity-70 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">رابط صورة الإعلان (شاشة الكمبيوتر PC)</label>
                                        <input 
                                            type="text"
                                            value={ad.imageUrlPc}
                                            onChange={(e) => handleUpdateAd(index, { ...ad, imageUrlPc: e.target.value })}
                                            placeholder="https://example.com/image-pc.jpg"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                        {ad.imageUrlPc && (
                                            <div className="mt-4 relative aspect-video w-full rounded-xl overflow-hidden border border-gray-700">
                                                <img src={ad.imageUrlPc} alt="PC معاينة" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">رابط صورة الإعلان (شاشة الموبايل Mobile)</label>
                                        <input 
                                            type="text"
                                            value={ad.imageUrlMobile}
                                            onChange={(e) => handleUpdateAd(index, { ...ad, imageUrlMobile: e.target.value })}
                                            placeholder="https://example.com/image-mobile.jpg"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        />
                                        {ad.imageUrlMobile && (
                                            <div className="mt-4 relative aspect-[4/5] w-full max-w-[250px] mx-auto rounded-xl overflow-hidden border border-gray-700">
                                                <img src={ad.imageUrlMobile} alt="Mobile معاينة" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                                    <div className="col-span-full md:col-span-1">
                                        <label className="block text-sm font-bold text-gray-300 mb-2">نوع الحدث عند النقر</label>
                                        <select
                                            value={ad.linkType || 'none'}
                                            onChange={(e) => handleUpdateAd(index, { ...ad, linkType: e.target.value as any })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        >
                                            <option value="none">بدون تفاعل (صورة فقط)</option>
                                            <option value="content">فتح محتوى (مسلسل/فيلم)</option>
                                            <option value="external">فتح رابط خارجي</option>
                                        </select>
                                    </div>
                                    
                                    {ad.linkType === 'content' && (
                                        <div className="col-span-full md:col-span-1">
                                            <label className="block text-sm font-bold text-gray-300 mb-2">اختر المحتوى</label>
                                            <select
                                                value={ad.targetContentId || ''}
                                                onChange={(e) => handleUpdateAd(index, { ...ad, targetContentId: e.target.value })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                            >
                                                <option value="">اختر محتوى للتوجه إليه...</option>
                                                {allContent.map(content => (
                                                    <option key={content.id} value={content.id}>{content.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {ad.linkType === 'external' && (
                                        <div className="col-span-full md:col-span-1">
                                            <label className="block text-sm font-bold text-gray-300 mb-2">الرابط الخارجي</label>
                                            <input
                                                type="text"
                                                value={ad.externalUrl || ''}
                                                onChange={(e) => handleUpdateAd(index, { ...ad, externalUrl: e.target.value })}
                                                placeholder="https://google.com"
                                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {startupAds.length === 0 && (
                    <div className="text-center p-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                        <p className="text-gray-400">لا توجد إعلانات انطلاق حالياً. اضغط على أضف إعلان للبدء.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StartupAdTab;

