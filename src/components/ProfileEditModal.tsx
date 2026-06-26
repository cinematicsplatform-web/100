
import React, { useState } from 'react';
import type { Profile } from '@/types';
import { maleAvatars, femaleAvatars, defaultAvatar } from '@/data';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ProfileEditModalProps {
    profile: Profile | null;
    onClose: () => void;
    onSave: (profile: Profile) => void;
    onDelete: (profileId: number) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ profile, onClose, onSave, onDelete }) => {
    const isNew = profile === null;
    const [name, setName] = useState(profile?.name || '');
    const [isKid, setIsKid] = useState(profile?.isKid || false);
    const [avatar, setAvatar] = useState(profile?.avatar || defaultAvatar);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleSave = () => {
        if (!name.trim()) {
            alert("الرجاء إدخال اسم للملف الشخصي.");
            return;
        }
        const profileToSave: Profile = {
            id: profile?.id || Date.now(),
            name,
            avatar,
            isKid,
            watchHistory: profile?.watchHistory || [],
            myList: profile?.myList || [],
        };
        onSave(profileToSave);
        onClose();
    };
    
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (profile) {
            onDelete(profile.id);
            onClose();
        }
        setIsDeleteModalOpen(false);
    };

    const AvatarRow = ({ title, avatars }: { title: string, avatars: string[] }) => (
        <div className="mb-4">
            <h4 className="text-xs text-gray-400 mb-2 font-bold">{title}</h4>
            <div className="flex gap-4 overflow-x-auto rtl-scroll pb-2">
                {avatars.map(av => (
                    <div 
                        key={av} 
                        onClick={() => setAvatar(av)} 
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden cursor-pointer transition-all duration-200 border-2 ${avatar === av ? 'border-[var(--color-accent)] scale-110 shadow-[0_0_10px_var(--shadow-color)]' : 'border-transparent hover:border-gray-500'}`}
                    >
                        <img src={av} alt="avatar" className="w-full h-full object-cover bg-gray-700" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl text-white animate-fade-in-up border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-bold mb-6 text-center">{isNew ? 'إضافة ملف شخصي جديد' : 'تعديل الملف الشخصي'}</h2>
                    
                    {/* Top Section: Current Selected & Inputs */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-gray-700/30 p-4 rounded-xl border border-gray-700">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-[var(--color-accent)] flex-shrink-0 shadow-lg">
                            <img src={avatar} alt="Selected Avatar" className="w-full h-full object-cover bg-gray-900" />
                        </div>
                        <div className="w-full">
                            <label htmlFor="profileName" className="block text-sm font-medium text-gray-400 mb-2">اسم الملف الشخصي</label>
                            <input 
                                type="text"
                                id="profileName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-white placeholder-gray-500"
                                placeholder="مثال: أحمد"
                            />
                            <div className="mt-4">
                                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-700/50 rounded-lg transition-colors w-fit">
                                    <input 
                                        type="checkbox" 
                                        checked={isKid} 
                                        onChange={e => setIsKid(e.target.checked)}
                                        className="w-5 h-5 rounded accent-[var(--color-accent)] bg-gray-600 border-gray-500 focus:ring-2 focus:ring-offset-0 focus:ring-offset-gray-800 focus:ring-[var(--color-accent)]"
                                    />
                                    <span className="text-gray-300 text-sm select-none">هل هذا الملف خاص بطفل؟</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Avatar Selection Rows */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[var(--color-primary-to)] mb-4">اختر صورة رمزية</h3>
                        <AvatarRow title="ذكور" avatars={maleAvatars} />
                        <AvatarRow title="إناث" avatars={femaleAvatars} />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                        <div>
                            {!isNew && (
                                <button onClick={handleDeleteClick} className="text-red-400 hover:text-red-300 font-bold px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm">
                                    حذف الملف
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm">
                                إلغاء
                            </button>
                            <button onClick={handleSave} className="bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-black font-bold py-2 px-8 rounded-lg hover:bg-white transition-colors shadow-lg text-sm transform hover:scale-105">
                                حفظ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="حذف الملف الشخصي"
                message={`هل أنت متأكد من حذف ملف "${profile?.name}" الشخصي؟`}
            />
        </div>
    );
};

export default ProfileEditModal;
