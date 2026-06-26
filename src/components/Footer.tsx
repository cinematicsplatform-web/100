
import React from 'react';
import { FacebookIcon } from './FacebookIcon';
import { InstagramIcon } from './InstagramIcon';
import { TwitterIcon } from './TwitterIcon';
import { GroupIcon } from './GroupIcon';
import type { SocialLinks, View } from '@/types';

interface FooterProps {
  socialLinks: SocialLinks;
  onSetView: (view: View) => void;
  isRamadanFooter?: boolean;
  className?: string; 
}

const Footer: React.FC<FooterProps> = ({ socialLinks, onSetView, isRamadanFooter, className = '' }) => {
  const footerLinks: {name: string, action: () => void}[] = [
      { name: 'حولنا', action: () => onSetView('about') },
      { name: 'اتصل بنا', action: () => { window.location.href = socialLinks.contactUs } },
      { name: 'سياسة الخصوصية', action: () => onSetView('privacy') },
      { name: 'حقوق الملكية', action: () => onSetView('copyright') },
      { name: 'تطبيق الموبايل', action: () => onSetView('appDownload') },
      { name: 'طلبات المحتوى', action: () => onSetView('contentRequest') },
  ];
  
  const baseClasses = isRamadanFooter
    ? "relative w-full bg-[var(--bg-body)] shadow-[0_0_25px_rgba(0,0,0,0.8)] z-[100] pt-10 pb-10 border-t border-white/10" 
    : "bg-[var(--bg-body)] py-12 border-t border-white/10"; 
  
  const footerClasses = `${baseClasses} ${className}`;

  const textClasses = "text-white"; 

  return (
    <footer className={`${footerClasses} px-4 md:px-8 w-full transition-all duration-500`}>
      <div className="w-full">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${textClasses}`}>
          <div>
            <h1 className="text-3xl font-extrabold mb-4 cursor-pointer" onClick={() => onSetView('home')}>
              <span className="text-white">سينما</span><span className="gradient-text font-['Lalezar'] tracking-wide">تيكس</span>
            </h1>
            <p className="text-sm max-w-sm opacity-90">منصتكم الأولى للترفيه العربي والتركي والأجنبي. شاهدوا أحدث الأفلام والمسلسلات بجودة عالية في أي وقت ومن أي مكان.</p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.name}><button onClick={(e) => {e.preventDefault(); link.action()}} className="hover-text-accent transition-colors text-left">{link.name}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">تابعنا</h3>
            <div className="flex items-center gap-4">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover-text-accent transition-colors">
                <FacebookIcon className="w-6 h-6" />
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover-text-accent transition-colors">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover-text-accent transition-colors">
                <TwitterIcon className="w-6 h-6" />
              </a>
              <a href={socialLinks.facebookGroup} target="_blank" rel="noopener noreferrer" className="text-white hover-text-accent transition-colors">
                <GroupIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className={`border-t border-white/10 mt-8 pt-6 text-center text-sm ${textClasses} opacity-70`}>
          <p>&copy; {new Date().getFullYear()} سينماتيكس. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
