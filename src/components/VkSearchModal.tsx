import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { BouncingDotsLoader } from './BouncingDotsLoader';

// VK Official Logo Icon
const VkIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M13.162 18.994c-6.098 0-9.57-4.172-9.714-11.104h3.008c.11 5.093 2.355 7.25 4.136 7.693V7.89h2.83v4.394c1.73-.183 3.547-2.195 4.158-4.394h2.83c-.446 2.693-2.43 4.706-3.855 5.537 1.425.666 3.734 2.408 4.606 5.577h-3.11c-.682-2.128-2.378-3.77-4.158-3.947V18.994z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

interface VkVideo {
    id: number;
    owner_id: number;
    title: string;
    image: { url: string }[];
    player: string;
    duration: number;
    files?: Record<string, string>; // ضروري عشان نوصل لروابط الجودة
}

interface VkResult {
    title: string;
    embedUrl: string;
    downloadUrl: string;
}

interface VkSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (result: VkResult) => void;
}

const VkSearchModal: React.FC<VkSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<VkVideo[]>([]);
    const [error, setError] = useState('');

    // المفتاح الجديد الخاص بالمستخدم
    const ACCESS_TOKEN = 'vk1.a.jj5yKnnWwDgvsqG_1AToUF_i62f0Ura3qBwWxbXHf0kB3Lb91OISdT6-i3IToUAtuk2JbEumqEeh0IQ4qX7dOjM51C73pAOwAv1Oltux8Qw97AgfYs3y6Ig7_BuuCkMjD9ddq_e92rTEm2c6PhKF4oBa_GhtuPVJl7mWYpcdAWmqOuFQjto1C1N9HdMy3sL3XMbSzhLmObYkGgjbjCh-VA';
    const VK_API_VERSION = '5.131';

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
    };

    // دالة تجيب رابط التحميل المباشر فقط (480 أو 720)
    const getDownloadLink = (video: VkVideo): string => {
        if (!video.files) return ''; 
        if (video.files.mp4_480) return video.files.mp4_480;
        if (video.files.mp4_720) return video.files.mp4_720;
        if (video.files.mp4_360) return video.files.mp4_360;
        return ''; 
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        const apiUrl = `https://api.vk.com/method/video.search?q=${encodeURIComponent(query)}&count=20&extended=1&sort=2&access_token=${ACCESS_TOKEN}&v=${VK_API_VERSION}`;
        
        // نظام وكلاء (Proxies) متعدد لضمان النجاح وتخطي حظر الـ CORS
        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`
        ];

        let data = null;
        let success = false;

        for (const proxy of proxies) {
            if (success) break;
            try {
                const res = await fetch(proxy);
                if (!res.ok) continue;

                if (proxy.includes('allorigins')) {
                    const wrapper = await res.json();
                    if (wrapper.contents) {
                        data = JSON.parse(wrapper.contents);
                    }
                } else if (proxy.includes('codetabs')) {
                    const text = await res.text();
                    data = JSON.parse(text);
                } else {
                    data = await res.json();
                }
                
                if (data && (data.response || data.error)) {
                    success = true;
                }
            } catch (err) {
                console.warn(`Proxy failed: ${proxy}`, err);
                // ننتقل للوكيل التالي
            }
        }

        if (!success || !data) {
            setError('حدث خطأ في الاتصال بالخادم. يرجى التأكد من اتصال الإنترنت أو المحاولة لاحقاً.');
            setLoading(false);
            return;
        }

        if (data.error) {
            console.error('VK API Error:', data.error);
            setError(data.error.error_msg || 'حدث خطأ في بحث VK');
        } else {
            const items = data.response.items || [];
            setResults(items);
            if (items.length === 0) {
                setError('لم يتم العثور على فيديوهات بهذا الاسم.');
            }
        }
        setLoading(false);
    };

    const handleSelect = (video: VkVideo) => {
        let embedUrl = video.player;
        if (!embedUrl) {
             embedUrl = `https://vk.com/video_ext.php?oid=${video.owner_id}&id=${video.id}&hash=&hd=2`;
        }
        const directDownloadUrl = getDownloadLink(video);

        onSelect({
            title: video.title,
            embedUrl: embedUrl,
            downloadUrl: directDownloadUrl 
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[600] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#0b1116] border border-gray-800 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,1)] w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#070b0e]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#0077FF] text-white rounded-2xl shadow-lg shadow-blue-900/20">
                            <VkIcon />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white">VK Video Search</h3>
                            <p className="text-xs text-gray-500 font-bold mt-0.5">البحث في السيرفرات الروسية</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 bg-[#0b1116]">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ابحث عن اسم الفيلم أو المسلسل..."
                                className="w-full bg-[#161b22] border border-gray-700 rounded-2xl px-6 py-4 pr-14 text-white font-bold focus:outline-none focus:border-[#0077FF] focus:ring-1 focus:ring-[#0077FF]/50 transition-all text-lg placeholder-gray-600"
                                autoFocus
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">
                                <SearchIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-[#0077FF] hover:bg-[#0066DD] text-white font-black py-4 px-10 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-blue-900/20"
                        >
                            {loading ? 'جاري البحث...' : 'بحث'}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#050505]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-6">
                            <BouncingDotsLoader size="lg" delayMs={300} colorClass="bg-[#0077FF]" />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-16 bg-red-500/5 border border-red-500/10 rounded-3xl p-8 max-w-xl mx-auto">
                            <p className="text-lg font-bold text-red-400">{error}</p>
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="text-center py-24 text-gray-800 flex flex-col items-center gap-6">
                            <VkIcon />
                            <p className="text-gray-600 font-bold">جاهز للبحث...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                        {results.map((video) => (
                            <div 
                                key={video.id} 
                                onClick={() => handleSelect(video)}
                                className="group bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#0077FF]/50 transition-all flex flex-col shadow-2xl cursor-pointer"
                            >
                                <div className="aspect-video w-full relative overflow-hidden bg-black">
                                    <img 
                                        src={video.image && video.image.length > 0 ? video.image[video.image.length - 1].url : ''} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                                        alt="" 
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white flex items-center gap-1">
                                        <ClockIcon />
                                        {formatDuration(video.duration)}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-[#0077FF] text-white font-bold px-4 py-2 rounded-xl shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                            إضافة السيرفر
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="text-sm font-bold text-gray-200 line-clamp-2 mb-2 group-hover:text-[#0077FF] transition-colors dir-auto" title={video.title}>{video.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VkSearchModal;