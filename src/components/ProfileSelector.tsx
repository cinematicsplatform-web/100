
import React from 'react';
import type { User, Profile, View } from '@/types';

interface ProfileSelectorProps {
  user: User;
  onSelectProfile: (profile: Profile) => void;
  onSetView: (view: View) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ user, onSelectProfile, onSetView }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center p-4 pt-24 animate-fade-in-up">
      <div className="text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">من يشاهد الآن؟</h1>
        <p className="text-gray-400 text-lg mb-12">اختر ملفك الشخصي لبدء المشاهدة.</p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {user.profiles.map(profile => (
            <div 
              key={profile.id} 
              onClick={() => onSelectProfile(profile)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden transition-all duration-300 transform group-hover:scale-110 group-hover:ring-4 group-hover:ring-[var(--color-accent)]">
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              <p className="mt-4 text-xl font-semibold text-gray-300 group-hover:text-white transition-colors">{profile.name}</p>
            </div>
          ))}
        </div>
        <button 
          onClick={() => onSetView('accountSettings')}
          className="mt-16 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 font-bold py-2 px-8 rounded-lg transition-colors">
            إدارة الملفات الشخصية
        </button>
      </div>
    </div>
  );
};

export default ProfileSelector;
