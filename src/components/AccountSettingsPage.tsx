
import React, { useState } from 'react';
import type { User, Profile, View } from '@/types';
import ProfileEditModal from './ProfileEditDialog';
import { ChevronRightIcon } from './icons/ChevronRight';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface AccountSettingsPageProps {
  user: User;
  onUpdateProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: number) => void;
  onUpdatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  onDeleteAccount: () => void;
  onSetView: (view: View) => void;
  isRamadanTheme?: boolean;
  isEidTheme?: boolean;
  isCosmicTealTheme?: boolean;
  isNetflixRedTheme?: boolean;
}

const PasswordChangeModal: React.FC<{
    onClose: () => void;
    onSave: (oldPassword: string, newPassword: string) => Promise<boolean>;
    isNetflixRed?: boolean;
}> = ({ onClose, onSave, isNetflixRed }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const focusRing = isNetflixRed ? 'focus:ring-[#E50914]' : 'focus:ring-[#00FFB0]';
    const btnBg = isNetflixRed ? 'bg-[#E50914] text-white' : 'bg-[#00FFB0] text-black';

    const handleSave = async () => {
        if(newPassword.length < 6) {
            alert("يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("كلمتا المرور الجديدة غير متطابقة.");
            return;
        }
        const success = await onSave(oldPassword, newPassword);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md text-white animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">تغيير كلمة المرور</h2>
                    <div className="space-y-4">
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="كلمة المرور الحالية" className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${focusRing}`}/>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة" className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${focusRing}`}/>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور الجديدة" className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${focusRing}`}/>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-4 rounded-lg">إلغاء</button>
                        <button onClick={handleSave} className={`${btnBg} font-bold py-2 px-6 rounded-lg`}>حفظ</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ user, onUpdateProfile, onDeleteProfile, onUpdatePassword, onDeleteAccount, onSetView, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | 'new' | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  const isNetflixRed = isNetflixRedTheme || document.body.classList.contains('theme-netflix-red');
  const accentText = isNetflixRed ? 'text-[#E50914]' : 'text-[#00FFB0]';
  const focusRing = isNetflixRed ? 'focus:ring-[#E50914]' : 'focus:ring-[#00FFB0]';
  const primaryBtn = isNetflixRed 
    ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' 
    : 'bg-[#00FFB0] text-black shadow-[0_0_15px_rgba(0,255,176,0.3)]';
  const ringHover = isNetflixRed ? 'group-hover:ring-[#E50914]' : 'group-hover:ring-[#00FFB0]';
  const textHover = isNetflixRed ? 'hover:text-[#E50914]' : 'hover:text-[#00FFB0]';

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };
  
  const handleNewProfile = () => {
    setEditingProfile('new');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProfile(null);
    setIsModalOpen(false);
  }

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-body)] text-white p-4 sm:p-6 lg:p-8 pt-8 pb-24 animate-fade-in-up">
        
        {/* Navigation Header */}
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
             <h1 className="text-3xl md:text-4xl font-bold">إعدادات الحساب</h1>
             
             <button 
                onClick={() => onSetView('profileHub')}
                className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 transition-colors group border border-white/10"
                aria-label="Back"
             >
                <ChevronRightIcon className="w-6 h-6 text-white transform rotate-180 group-hover:-translate-x-1 transition-transform" />
             </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Account Details Section */}
          <div className="bg-gray-800 p-5 md:p-6 rounded-xl mb-6 md:mb-8 shadow-lg border border-gray-700/50">
            <h2 className={`text-xl font-bold mb-4 ${accentText}`}>تفاصيل الحساب</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">البريد الإلكتروني</label>
                  <input type="email" defaultValue={user.email} className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${focusRing} text-gray-200 cursor-not-allowed`} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">كلمة المرور</label>
                  <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="w-full text-right bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 hover:bg-gray-600 hover:border-gray-500 transition-all flex justify-between items-center">
                      <span>********</span>
                      <span className={`text-xs ${accentText}`}>تغيير</span>
                  </button>
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" onClick={(e) => {e.preventDefault(); alert('تم حفظ التغييرات (محاكاة).')}} className={`w-full md:w-auto font-bold py-3 px-8 rounded-lg hover:bg-white transition-colors ${primaryBtn}`}>
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>

          {/* Profiles Section */}
          <div className="bg-gray-800 p-5 md:p-6 rounded-xl mb-6 md:mb-8 shadow-lg border border-gray-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className={`text-xl font-bold ${accentText} self-start sm:self-center`}>الملفات الشخصية</h2>
              <button onClick={handleNewProfile} className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 border border-gray-600 font-bold py-2 px-4 rounded-lg text-sm transition-all">
                  + إضافة ملف شخصي
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {user.profiles.map(profile => (
                <div key={profile.id} className="text-center group bg-gray-700/30 p-3 rounded-xl border border-transparent hover:border-gray-600 transition-all">
                  <div onClick={() => handleEditProfile(profile)} className={`w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto overflow-hidden ring-2 ring-transparent ${ringHover} transition-all cursor-pointer shadow-md`}>
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-3 text-sm md:text-base font-bold text-gray-300 group-hover:text-white truncate">{profile.name}</p>
                   <button onClick={() => handleEditProfile(profile)} className={`mt-2 text-xs text-gray-500 ${textHover} transition-colors flex items-center justify-center w-full py-1`}>
                       <span>تعديل</span>
                   </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Delete Account Section */}
          <div className="bg-red-900/10 border border-red-500/20 p-5 md:p-6 rounded-xl">
              <h2 className="text-xl font-bold text-red-400 mb-2">منطقة الخطر</h2>
              <p className="text-red-300/70 text-sm mb-6 leading-relaxed">حذف حسابك هو إجراء دائم ولا يمكن التراجع عنه. ستفقد كل سجل المشاهدة وقوائم المفضلة والملفات الشخصية المرتبطة بهذا الحساب.</p>
              <button onClick={() => setIsDeleteAccountModalOpen(true)} className="w-full md:w-auto bg-red-600/90 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                  حذف الحساب نهائياً
              </button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ProfileEditModal
          profile={editingProfile === 'new' ? null : editingProfile}
          onClose={handleCloseModal}
          onSave={onUpdateProfile}
          onDelete={onDeleteProfile}
        />
      )}
      {isPasswordModalOpen && (
        <PasswordChangeModal 
            onClose={() => setIsPasswordModalOpen(false)}
            onSave={onUpdatePassword}
            isNetflixRed={isNetflixRed}
        />
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={() => {
            onDeleteAccount();
            setIsDeleteAccountModalOpen(false);
        }}
        title="حذف الحساب"
        message="هل أنت متأكد من حذف حسابك نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم فقدان جميع البيانات."
      />
    </>
  );
};

export default AccountSettingsPage;
