import React from 'react';
import type { ThemeType } from '../../types';

interface ThemesTabProps {
  siteSettings: {
    activeTheme: ThemeType;
    [key: string]: any;
  };
  onSetSiteSettings: (settings: any) => void;
}

const ThemesTab: React.FC<ThemesTabProps> = ({ siteSettings, onSetSiteSettings }) => {
  const changeTheme = (theme: ThemeType) => {
    onSetSiteSettings({ ...siteSettings, activeTheme: theme });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-700/50 space-y-8 shadow-xl">
        <h3 className="text-xl font-bold text-[#00A7F8] mb-4 border-b border-gray-700 pb-4">إعدادات المظهر (Themes)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Shahid Theme */}
          <div 
            onClick={() => changeTheme('shahid')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'shahid' ? 'border-[#1994e5] bg-[#1994e5]/5 shadow-[0_0_20px_rgba(25,148,229,0.15)]' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-gradient-to-br from-[#1994e5] to-[#00ffaa] rounded-xl mb-4 shadow-lg flex items-center justify-center text-3xl relative overflow-hidden">
              <span className="text-white font-black tracking-tight drop-shadow-md">shahid</span>
            </div>
            <h4 className="font-bold text-white text-lg">شاهد (Shahid MBC)</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">ثيم منصة شاهد وMBC بالأزرار الدائرية والهيدر المدمج الأنيق.</p>
            {siteSettings.activeTheme === 'shahid' && (
              <div className="mt-3 text-[#1994e5] text-xs font-bold bg-[#1994e5]/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('default')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'default' ? 'border-[#00A7F8] bg-[#00A7F8]/5 shadow-[0_0_20px_rgba(0,167,248,0.1)]' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] rounded-xl mb-4 shadow-lg"></div>
            <h4 className="font-bold text-white text-lg">الافتراضي (السايبر)</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">الثيم الأساسي باللون الأزرق والأخضر.</p>
            {siteSettings.activeTheme === 'default' && (
              <div className="mt-3 text-[#00A7F8] text-xs font-bold bg-[#00A7F8]/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('netflix-red')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'netflix-red' ? 'border-[#E50914] bg-[#E50914]/5 shadow-[0_0_20px_rgba(229,9,20,0.1)]' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-[#141414] rounded-xl mb-4 shadow-lg flex items-center justify-center border-b-4 border-[#E50914]">
              <span className="text-[#E50914] text-3xl font-black tracking-tighter">N</span>
            </div>
            <h4 className="font-bold text-white text-lg">الأحمر الداكن (Netflix)</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">تصميم سينمائي باللون الأسود والأحمر.</p>
            {siteSettings.activeTheme === 'netflix-red' && (
              <div className="mt-3 text-[#E50914] text-xs font-bold bg-[#E50914]/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('cosmic-teal')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'cosmic-teal' ? 'border-[#35F18B] bg-[#35F18B]/5 shadow-[0_0_20px_rgba(53,241,139,0.1)]' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-gradient-to-br from-[#35F18B] to-[#2596be] rounded-xl mb-4 shadow-lg flex items-center justify-center text-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95ab3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80')] opacity-50 bg-cover"></div>
              <span className="relative z-10">✨</span>
            </div>
            <h4 className="font-bold text-white text-lg">الكوني (Cosmic Teal)</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">تصميم عصري بألوان الأخضر الزاهي.</p>
            {siteSettings.activeTheme === 'cosmic-teal' && (
              <div className="mt-3 text-[#35F18B] text-xs font-bold bg-[#35F18B]/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('ramadan')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'ramadan' ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-gradient-to-br from-[#D4AF37] to-[#F59E0B] rounded-xl mb-4 shadow-lg flex items-center justify-center text-3xl">🌙</div>
            <h4 className="font-bold text-white text-lg">رمضان الذهبي</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">ألوان ذهبية دافئة للأجواء الرمضانية.</p>
            {siteSettings.activeTheme === 'ramadan' && (
              <div className="mt-3 text-amber-500 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('eid')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'eid' ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-gradient-to-br from-[#6A0DAD] to-[#C0C0C0] rounded-xl mb-4 shadow-lg flex items-center justify-center text-3xl">🎉</div>
            <h4 className="font-bold text-white text-lg">العيد (بنفسجي)</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">ألوان احتفالية مبهجة للمناسبات.</p>
            {siteSettings.activeTheme === 'eid' && (
              <div className="mt-3 text-purple-500 text-xs font-bold bg-purple-500/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('ios')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'ios' ? 'border-[#00C6FF] bg-[#00C6FF]/5 shadow-[0_0_20px_rgba(0,198,255,0.1)]' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] rounded-xl mb-4 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
            </div>
            <h4 className="font-bold text-white text-lg">iOS Glass</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">تصميم زجاجي عصري مع تدرجات سماوية.</p>
            {siteSettings.activeTheme === 'ios' && (
              <div className="mt-3 text-[#00C6FF] text-xs font-bold bg-[#00C6FF]/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('night-city')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'night-city' ? 'border-[#FF00FF] bg-[#FF00FF]/5 shadow-[0_0_20px_rgba(255,0,255,0.1)]' : 'border-gray-800 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-black rounded-xl mb-4 shadow-[0_0_15px_#FF00FF] relative border border-[#00FFFF]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/30 to-[#00FFFF]/30"></div>
            </div>
            <h4 className="font-bold text-white text-lg">Night City</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">ألوان نيون حيوية ومظهر مستقبلي.</p>
            {siteSettings.activeTheme === 'night-city' && (
              <div className="mt-3 text-[#FF00FF] text-xs font-bold bg-[#FF00FF]/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>

          <div 
            onClick={() => changeTheme('nature')} 
            className={`p-5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${siteSettings.activeTheme === 'nature' ? 'border-[#8FBC8F] bg-[#8FBC8F]/5 shadow-[0_0_20px_rgba(143,188,143,0.1)]' : 'border-gray-800 bg-gray-800 hover:border-gray-500'}`}
          >
            <div className="h-24 bg-gradient-to-br from-[#2F4F4F] to-[#8FBC8F] rounded-xl mb-4 shadow-lg"></div>
            <h4 className="font-bold text-white text-lg">Nature</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">ألوان طبيعية هادئة مستوحاة من الغابات.</p>
            {siteSettings.activeTheme === 'nature' && (
              <div className="mt-3 text-[#8FBC8F] text-xs font-bold bg-[#8FBC8F]/10 px-2 py-1 rounded w-fit">✓ مفعل</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemesTab;
