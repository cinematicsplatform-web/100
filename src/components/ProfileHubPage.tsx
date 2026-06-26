import React from 'react';
import type { User, Profile, View } from '@/types';
import { UserRole } from '@/types';
import { UserIcon } from './icons/UserIcon';
import { CheckIcon } from './CheckIcon';
import { HomeIcon } from './icons/HomeIcon';
import { BellIcon } from './icons/BellIcon';

// -- Simple Local Icons to reduce file dependencies for this specific view --

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const SwapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
);

// -------------------------------------------------------------------------

interface ProfileHubPageProps {
    user: User;
    activeProfile: Profile;
    onSetView: (view: View) => void;
    onLogout: () => void;
    isRamadanTheme?: boolean;
    isEidTheme?: boolean;
    isCosmicTealTheme?: boolean;
    isNetflixRedTheme?: boolean;
}

const ProfileHubPage: React.FC<ProfileHubPageProps> = ({ user, activeProfile, onSetView, onLogout, isRamadanTheme, isEidTheme, isCosmicTealTheme, isNetflixRedTheme }) => {
    
    // Fallback if not passed (though App.tsx should pass them now)
    const isNetflixRed = isNetflixRedTheme || document.body.classList.contains('theme-netflix-red');
    const isCosmicTeal = isCosmicTealTheme || document.body.classList.contains('theme-cosmic-teal');

    const menuItems = [
        {
            id: 'notifications',
            label: 'الإشعارات',
            icon: BellIcon,
            action: () => onSetView('notifications'),
            color: isNetflixRed ? 'text-[#E50914]' : isCosmicTeal ? 'text-[#35F18B]' : 'text-[#00A7F8]'
        },
        {
            id: 'mylist',
            label: 'قائمتي',
            icon: CheckIcon,
            action: () => onSetView('myList'),
            color: isNetflixRed ? 'text-[#E50914]' : isCosmicTeal ? 'text-[#35F18B]' : 'text-[#00FFB0]'
        },
        {
            id: 'settings',
            label: 'إدارة الحساب',
            icon: SettingsIcon,
            action: () => onSetView('accountSettings'),
            color: isNetflixRed ? 'text-white' : isCosmicTeal ? 'text-[#2596be]' : 'text-[#00A7F8]'
        },
        {
            id: 'profiles',
            label: 'تبديل الملف الشخصي',
            icon: SwapIcon,
            action: () => onSetView('profileSelector'),
            color: 'text-white'
        },
        // Admin Only Item
        ...(user.role === UserRole.Admin ? [{
            id: 'admin',
            label: 'لوحة التحكم',
            icon: HomeIcon,
            action: () => onSetView('admin'),
            color: 'text-yellow-400'
        }] : []),
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-body)] text-white animate-fade-in-up pb-20">
            
            {/* Custom Header */}
            <div className="flex items-center justify-between p-6 pt-8 flex-row-reverse">
                <div className="text-lg font-bold opacity-0">Profile</div>
                <button 
                    onClick={() => onSetView('home')} 
                    className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 transition-colors group"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-white transform rotate-180 group-hover:scale-110 transition-transform" /> 
                </button>
            </div>

            <div className="px-6 flex flex-col items-center -mt-4">
                {/* Avatar Section */}
                <div className="relative mb-4 group">
                    <div className={`w-28 h-28 rounded-full p-1 ${isNetflixRed ? 'bg-[#E50914]' : isCosmicTeal ? 'bg-gradient-to-tr from-[#35F18B] to-[#2596be]' : 'bg-gradient-to-tr from-[#00A7F8] to-[#00FFB0]'}`}>
                        <img 
                            src={activeProfile.avatar} 
                            alt={activeProfile.name} 
                            className="w-full h-full rounded-full object-cover border-4 border-[#141b29]"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#141b29] rounded-full flex items-center justify-center">
                         <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-[#141b29]"></div>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-1">{activeProfile.name}</h2>
                <p className="text-sm text-gray-400 font-mono mb-8">{user.email}</p>

                {/* Menu List */}
                <div className="w-full max-w-md space-y-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={item.action}
                                className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-white/5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                            >
                                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${item.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="flex-1 text-right font-bold text-base text-gray-200">
                                    {item.label}
                                </span>
                                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                            </button>
                        )
                    })}

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 p-4 mt-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <LogoutIcon className="w-6 h-6" />
                        </div>
                        <span className="flex-1 text-right font-bold text-base text-red-400">
                            تسجيل الخروج
                        </span>
                    </button>
                </div>
                
                {/* App Version / Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-xs text-gray-600">Cinematix v1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileHubPage;