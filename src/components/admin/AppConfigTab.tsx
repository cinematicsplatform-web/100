import React, { useState } from 'react';
import { SiteSettings, AppConfig, AppReview } from '../../types';
import { CloseIcon } from '../icons/CloseIcon';

interface AppConfigTabProps {
  settings: SiteSettings;
  onUpdate: (newSettings: SiteSettings) => void;
}

const initialAppConfig: AppConfig = {
  apkUrl: '',
  appSize: '35 MB',
  version: '1.0.0',
  heroImage: '',
  screenshots: [],
  reviews: []
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 0-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const AppConfigTab: React.FC<AppConfigTabProps> = ({ settings, onUpdate }) => {
  const [config, setConfig] = useState<AppConfig>(settings.appConfig || initialAppConfig);
  const [newScreenshot, setNewScreenshot] = useState('');
  const [newReview, setNewReview] = useState<Partial<AppReview>>({ user: '', rating: 5, text: '' });

  const handleChange = (field: keyof AppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAddScreenshot = () => {
    if (!newScreenshot) return;
    setConfig(prev => ({ ...prev, screenshots: [...prev.screenshots, newScreenshot] }));
    setNewScreenshot('');
  };

  const handleRemoveScreenshot = (index: number) => {
    setConfig(prev => ({ ...prev, screenshots: prev.screenshots.filter((_, i) => i !== index) }));
  };

  const handleAddReview = () => {
    if (!newReview.user || !newReview.text) return;
    const review: AppReview = {
        id: Date.now().toString(),
        user: newReview.user!,
        date: new Date().toLocaleDateString('ar-EG'),
        rating: newReview.rating || 5,
        text: newReview.text!
    };
    setConfig(prev => ({ ...prev, reviews: [review, ...prev.reviews] }));
    setNewReview({ user: '', rating: 5, text: '' });
  };

  const handleRemoveReview = (id: string) => {
    setConfig(prev => ({ ...prev, reviews: prev.reviews.filter(r => r.id !== id) }));
  };

  const handleSave = () => {
    onUpdate({ ...settings, appConfig: config });
  };

  const inputClass = "w-full bg-[#0f1014] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00A7F8] transition-all";

  return (
    <div className="space-y-8 animate-fade-in text-right max-w-5xl mx-auto" dir="rtl">
       <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="text-xl font-bold text-[#00A7F8] mb-6 flex items-center gap-2">
            <span>📦</span> إعدادات تطبيق الأندرويد
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">رابط الـ APK</label>
                <input value={config.apkUrl} onChange={e => handleChange('apkUrl', e.target.value)} className={inputClass} placeholder="https://.../app.apk" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">حجم التطبيق</label>
                    <input value={config.appSize} onChange={e => handleChange('appSize', e.target.value)} className={inputClass} placeholder="12 MB" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">الإصدار (Version)</label>
                    <input value={config.version} onChange={e => handleChange('version', e.target.value)} className={inputClass} placeholder="1.2.5" />
                </div>
            </div>
          </div>
       </div>

       <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="text-lg font-bold text-[#00A7F8] mb-4">📸 لقطات الشاشة (Screenshots)</h3>
          <div className="flex gap-2 mb-6">
            <input value={newScreenshot} onChange={e => setNewScreenshot(e.target.value)} className={inputClass} placeholder="رابط صورة لقطة الشاشة..." />
            <button onClick={handleAddScreenshot} className="bg-[#00A7F8] text-white px-6 rounded-xl font-bold hover:bg-blue-600 transition-colors">إضافة</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {config.screenshots.map((s, idx) => (
                <div key={idx} className="relative group aspect-[9/16] rounded-xl overflow-hidden border border-gray-700 bg-black">
                    <img src={s} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => handleRemoveScreenshot(idx)} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><CloseIcon className="w-4 h-4" /></button>
                </div>
            ))}
          </div>
       </div>

       <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="text-lg font-bold text-[#00A7F8] mb-4">⭐ مراجعات المستخدمين</h3>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={newReview.user} onChange={e => setNewReview({...newReview, user: e.target.value})} className={inputClass} placeholder="اسم المستخدم" />
                <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className={inputClass}>
                    {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} نجوم</option>)}
                </select>
            </div>
            <textarea value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} className={inputClass} placeholder="نص المراجعة..." rows={2} />
            <button onClick={handleAddReview} className="w-full bg-[#00FFB0] text-black font-bold py-3 rounded-xl hover:brightness-110 transition-all">نشر المراجعة</button>
          </div>

          <div className="space-y-4">
            {config.reviews.map(r => (
                <div key={r.id} className="flex justify-between items-start p-4 bg-[#0f1014] rounded-xl border border-gray-700">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{r.user}</span>
                            <span className="text-xs text-gray-500">{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 text-yellow-500 mb-2">
                            {Array.from({length: 5}).map((_, i) => <span key={i}>{i < r.rating ? '★' : '☆'}</span>)}
                        </div>
                        <p className="text-sm text-gray-400">{r.text}</p>
                    </div>
                    <button onClick={() => handleRemoveReview(r.id)} className="text-red-500 hover:text-red-400 p-2"><TrashIcon /></button>
                </div>
            ))}
          </div>
       </div>

       <div className="sticky bottom-4 z-50 flex justify-end">
        <button onClick={handleSave} className="bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-black px-10 py-4 rounded-full shadow-[0_0_30px_rgba(0,167,248,0.5)] transform hover:scale-105 active:scale-95 transition-all">حفظ التغييرات</button>
       </div>
    </div>
  );
};
export default AppConfigTab;