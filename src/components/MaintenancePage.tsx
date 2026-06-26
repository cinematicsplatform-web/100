
import React from 'react';
import type { SocialLinks, View } from '@/types';
import { FacebookIcon } from './FacebookIcon';
import { InstagramIcon } from './InstagramIcon';
import { TwitterIcon } from './TwitterIcon';
import { GroupIcon } from './GroupIcon';

// Use a simple lock icon for admin access
const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

interface MaintenancePageProps {
    socialLinks: SocialLinks;
    onSetView: (view: View) => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ socialLinks, onSetView }) => {
    // Use type assertion to bypass TypeScript's IntrinsicElements check for the custom element
    const DotLottie = 'dotlottie-wc' as unknown as React.ElementType;

    return (
        <div className="min-h-screen w-full bg-[var(--bg-body)] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-10 left-10 w-64 h-64 bg-[#00A7F8] rounded-full blur-[120px]"></div>
                 <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#00FFB0] rounded-full blur-[120px]"></div>
            </div>

            <div className="z-10 max-w-4xl w-full flex flex-col items-center gap-6 animate-fade-in-up">
                
                {/* Lottie Animation - Resized Larger as requested */}
                <div className="w-full flex justify-center mb-4">
                    <DotLottie 
                        src="https://lottie.host/bd6cf564-4798-4ced-bda8-2db3af17fa72/n2bS4Fanvz.lottie" 
                        style={{ width: '100%', height: 'auto', margin: '0 auto' }}
                        className="w-full md:w-[650px]"
                        autoplay 
                        loop
                    ></DotLottie>
                </div>

                {/* Text Content */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            نقوم الآن بعمل بعض التحديثات!
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-300 opacity-80 leading-relaxed max-w-xl mx-auto">
                            المنصة حالياً في وضع الصيانة، وهنرجع خلال وقت قصير بتجربة أفضل وأسرع. شكراً لتفهمكم.
                        </p>
                    </div>

                    <div className="w-full h-px bg-white/10 max-w-xs mx-auto"></div>

                    <div className="space-y-2" dir="ltr">
                        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                            We’re doing some upgrades!
                        </h2>
                        <p className="text-base md:text-xl text-gray-300 opacity-80 leading-relaxed max-w-xl mx-auto">
                            Our platform is currently under maintenance. We’ll be back shortly with a smoother and faster experience. Thank you for your patience.
                        </p>
                    </div>
                </div>

                {/* Social Links */}
                <div className="mt-12">
                     <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider font-semibold">تابعنا على</h3>
                     <div className="flex items-center justify-center gap-6">
                         <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00A7F8] transition-all transform hover:scale-110">
                             <FacebookIcon className="w-8 h-8" />
                         </a>
                         <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-all transform hover:scale-110">
                             <InstagramIcon className="w-8 h-8" />
                         </a>
                         <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-all transform hover:scale-110">
                             <TwitterIcon className="w-8 h-8" />
                         </a>
                         <a href={socialLinks.facebookGroup} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-all transform hover:scale-110">
                             <GroupIcon className="w-8 h-8" />
                         </a>
                     </div>
                </div>
            </div>

            {/* Admin Access Trigger */}
            <button 
                onClick={() => onSetView('login')}
                className="absolute bottom-6 right-6 text-gray-600 hover:text-white transition-colors opacity-30 hover:opacity-100 p-3 bg-black/20 rounded-full"
                title="Admin Access"
            >
                <LockIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default MaintenancePage;
