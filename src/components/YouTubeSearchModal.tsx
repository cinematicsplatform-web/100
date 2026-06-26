
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { BouncingDotsLoader } from './BouncingDotsLoader';

// Using the API Key provided by the user
const YOUTUBE_API_KEY = 'AIzaSyDKU89B22xeUd_R3mmVV_2G5L_r3Uh8gq4';

interface YouTubeVideo {
    id: { videoId: string };
    snippet: {
        title: string;
        thumbnails: { high: { url: string } };
        channelTitle: string;
        publishedAt: string;
    };
}

interface YouTubeSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    initialQuery?: string;
}

const YouTubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const YouTubeSearchModal: React.FC<YouTubeSearchModalProps> = ({ isOpen, onClose, onSelect, initialQuery = '' }) => {
    const [query, setQuery] = useState(initialQuery);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<YouTubeVideo[]>([]);
    const [error, setError] = useState('');

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            // Searching for "Official Trailer" to get better cinematic results
            const searchQuery = query.toLowerCase().includes('trailer') ? query : `${query} official trailer`;
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(searchQuery)}&relevanceLanguage=ar&key=${YOUTUBE_API_KEY}`;
            
            const res = await fetch(url);
            
            if (!res.ok) {
                const errData = await res.json();
                if (errData.error?.message?.includes('key')) {
                    throw new Error('مفتاح الـ API غير صالح أو انتهت صلاحيته.');
                }
                throw new Error(errData.error?.message || 'فشل الاتصال بـ YouTube');
            }
            
            const data = await res.json();
            setResults(data.items || []);
            
            if (data.items?.length === 0) setError('لم يتم العثور على نتائج. جرب كلمات بحث مختلفة.');
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء البحث. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVideo = (videoId: string) => {
        onSelect(`https://www.youtube.com/watch?v=${videoId}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[500] flex items-center justify-center p-2 md:p-4" onClick={onClose}>
            <div className="bg-[#0b1116] border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-5 md:p-7 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 text-white rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                            <YouTubeIcon />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white">YouTube Trailer Search</h3>
                            <p className="text-xs text-gray-400 font-bold mt-0.5">ابحث عن الإعلانات الرسمية وأضفها بضغطة زر</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-5 md:p-8 bg-[#0b1116]">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1 group">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="اسم الفيلم، المسلسل، أو رابط يوتيوب..."
                                className="w-full bg-[#161b22] border border-gray-700 rounded-2xl px-6 py-4 pr-14 text-white font-bold focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all text-lg shadow-inner"
                                autoFocus
                            />
                            <div className="absolute right-5 top-4.5 text-gray-500 group-focus-within:text-red-500 transition-colors">
                                <SearchIcon className="w-6 h-6 mt-1" />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(220,38,38,0.2)] whitespace-nowrap text-lg active:scale-95"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <BouncingDotsLoader size="sm" colorClass="bg-white" delayMs={0} />
                                    <span>جاري البحث</span>
                                </div>
                            ) : 'بحث'}
                        </button>
                    </form>
                </div>

                {/* Results Grid */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar bg-[#050505]">
                    {loading && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-50">
                            <BouncingDotsLoader size="lg" delayMs={300} colorClass="bg-red-500" />
                            <span className="text-gray-400 text-lg font-black animate-pulse">جاري جلب الفيديوهات...</span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-20 bg-red-500/5 rounded-3xl border border-red-500/10 max-w-xl mx-auto p-10 shadow-inner">
                            <div className="text-red-500 mb-4 text-5xl">⚠️</div>
                            <p className="text-xl font-black text-red-400 mb-2">{error}</p>
                            <p className="text-sm text-gray-500 font-bold">تأكد من كتابة اسم العمل بشكل صحيح أو حاول مرة أخرى لاحقاً.</p>
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="text-center py-20 text-gray-600 flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                                <YouTubeIcon />
                            </div>
                            <p className="max-w-md text-lg font-black opacity-40">أدخل اسم العمل في الأعلى للبحث عن الإعلانات المتوفرة على منصة يوتيوب.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
                        {results.map((video) => (
                            <div 
                                key={video.id.videoId} 
                                onClick={() => handleSelectVideo(video.id.videoId)}
                                className="group bg-[#161b22] border border-gray-800 rounded-3xl overflow-hidden hover:border-red-500/40 transition-all flex flex-col shadow-2xl hover:shadow-red-900/10 cursor-pointer transform active:scale-[0.98]"
                            >
                                <div className="aspect-video w-full relative overflow-hidden bg-black">
                                    <img 
                                        src={video.snippet.thumbnails.high.url} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={video.snippet.title} 
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="bg-red-600 text-white font-black px-6 py-3 rounded-2xl shadow-2xl transform scale-90 group-hover:scale-100 transition-all">
                                            اختيار التريلر
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-red-600 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-tighter shadow-lg">HD</div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h4 className="text-base font-bold text-white line-clamp-2 mb-3 leading-relaxed group-hover:text-red-400 transition-colors" title={video.snippet.title}>
                                        {video.snippet.title}
                                    </h4>
                                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-black truncate max-w-[150px] uppercase tracking-wide">{video.snippet.channelTitle}</span>
                                            <span className="text-[9px] text-gray-600 font-bold">{new Date(video.snippet.publishedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-red-600/10 px-2 py-1 rounded-lg">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">YouTube</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-[#0b1116] border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">YouTube Data API v3 Integrated System</p>
                </div>
            </div>
        </div>
    );
};

export default YouTubeSearchModal;
