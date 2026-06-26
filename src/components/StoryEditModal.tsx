import React, { useState, useEffect } from 'react';
import type { Story, StoryMediaItem } from '@/types';
import { CloseIcon } from './icons/CloseIcon';
import ToggleSwitch from './ToggleSwitch';

interface StoryEditModalProps {
    story: Story | null;
    onClose: () => void;
    onSave: (story: Story) => void;
}

const StoryEditModal: React.FC<StoryEditModalProps> = ({ story, onClose, onSave }) => {
    const isNew = story === null;

    // Use internal state that maps to the Story interface
    // FIX: Moved ctaText and targetUrl into mediaItems[0] to match Story interface
    const [formData, setFormData] = useState<Story>(story || {
        id: '',
        title: '',
        mediaItems: [{ url: '', mediaType: 'image', ctaText: 'شاهد الآن', targetUrl: '' }], // Story interface uses array of mediaItems
        thumbnailUrl: '',
        isActive: true,
        createdAt: new Date().toISOString()
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Custom handling for mapping single media inputs to the first item in mediaItems array
        if (name === 'mediaUrl') {
            setFormData(prev => ({
                ...prev,
                mediaItems: [{ ...prev.mediaItems[0], url: value }]
            }));
        } else if (name === 'mediaType') {
            setFormData(prev => ({
                ...prev,
                mediaItems: [{ ...prev.mediaItems[0], mediaType: value as 'image' | 'video' }]
            }));
        // FIX: Added handlers for ctaText and targetUrl within the mediaItems[0]
        } else if (name === 'ctaText') {
            setFormData(prev => ({
                ...prev,
                mediaItems: [{ ...prev.mediaItems[0], ctaText: value }]
            }));
        } else if (name === 'targetUrl') {
            setFormData(prev => ({
                ...prev,
                mediaItems: [{ ...prev.mediaItems[0], targetUrl: value }]
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value } as Story));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.mediaItems[0].url || !formData.thumbnailUrl) {
            alert('الرجاء تعبئة كافة الحقول المطلوبة.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-xl text-white animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                    <h3 className="text-xl font-bold">{isNew ? 'إضافة ستوري جديد' : 'تعديل الستوري'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">عنوان الستوري</label>
                            <input 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="مثال: إعلان فيلم جديد"
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00A7F8]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">نوع الوسائط</label>
                            <select 
                                name="mediaType"
                                value={formData.mediaItems[0].mediaType}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00A7F8]"
                            >
                                <option value="image">صورة (Image)</option>
                                <option value="video">فيديو (Video)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">رابط الوسائط (Media URL)</label>
                            <input 
                                name="mediaUrl"
                                value={formData.mediaItems[0].url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-sm dir-ltr focus:outline-none focus:border-[#00A7F8]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">رابط الصورة المصغرة (Thumbnail URL)</label>
                            <input 
                                name="thumbnailUrl"
                                value={formData.thumbnailUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-sm dir-ltr focus:outline-none focus:border-[#00A7F8]"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">نص زر الحركة (CTA Text)</label>
                            <input 
                                name="ctaText"
                                // FIX: Corrected access to ctaText from the first media item
                                value={formData.mediaItems[0].ctaText || ''}
                                onChange={handleChange}
                                placeholder="مثال: اطلب الآن"
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00A7F8]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">رابط التوجيه (Target URL)</label>
                            <input 
                                name="targetUrl"
                                // FIX: Corrected access to targetUrl from the first media item
                                value={formData.mediaItems[0].targetUrl || ''}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-sm dir-ltr focus:outline-none focus:border-[#00A7F8]"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
                        <ToggleSwitch 
                            checked={formData.isActive} 
                            onChange={(val) => setFormData(prev => ({...prev, isActive: val}))} 
                            label={formData.isActive ? 'ظاهر للعامة' : 'مخفي مؤقتاً'}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                        {isNew ? 'إضافة الستوري' : 'حفظ التغييرات'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StoryEditModal;