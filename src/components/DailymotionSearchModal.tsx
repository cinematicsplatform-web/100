import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { BouncingDotsLoader } from './BouncingDotsLoader';

// Dailymotion specific icon (simplified 'd')
const DailymotionIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v10h-2V7z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

interface DailymotionVideo {
    id: string;
    title: string;
    thumbnail_240_url: string;
    embed_url: string;
    duration: number;
    owner_screenname: string;
}

interface DailymotionResult {
    embedUrl: string;
    title: string;
}

interface DailymotionSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (result: DailymotionResult) => void;
}

const DailymotionSearchModal: React.FC<DailymotionSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<DailymotionVideo[]>([]);
    const [error, setError] = useState('');

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const url = `https://api.dailymotion.com/videos?search=${encodeURIComponent(query)}&fields=id,title,thumbnail_240_url,embed_url,duration,owner_screenname&limit=12&flags=no_live`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('فشل الاتصال بـ Dailymotion');
            const data = await res.json();
            setResults(data.list || []);
            if (data.list?.length === 0) setError('لم يتم العثور على نتائج.');
        } catch (err) {
            setError('حدث خطأ أثناء البحث. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (video: DailymotionVideo) => {
        // Force HTTPS
        const secureEmbed = video.embed_url.replace('http://', 'https://');
        onSelect({
            title: video.title,
            embedUrl: secureEmbed
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[250] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#151922] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a2230]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                            <DailymotionIcon />
                        </div>
                        <h3 className="text-xl font-bold text-white">البحث في Dailymotion</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 bg-[#0f1014]">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ابحث عن فيديو (اسم المسلسل، رقم الحلقة...)"
                                className="w-full bg-[#161b22] border border-gray-700 rounded-2xl px-5 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                                autoFocus
                            />
                            <div className="absolute right-4 top-3 text-gray-500">
                                <SearchIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 whitespace-nowrap"
                        >
                            {loading ? 'جاري البحث...' : 'بحث'}
                        </button>
                    </form>
                </div>

                {/* Results Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0a0a0a]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <BouncingDotsLoader size="lg" delayMs={300} colorClass="bg-blue-500" />
                            <span className="text-gray-500 text-sm font-bold">جاري جلب النتائج من Dailymotion...</span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                <SearchIcon className="w-8 h-8 opacity-20" />
                            </div>
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                <DailymotionIcon />
                            </div>
                            <span className="max-w-xs font-bold">ابحث عن الفيديوهات المرفوعة على Dailymotion للإضافة السريعة.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {results.map((video) => (
                            <div 
                                key={video.id} 
                                className="group bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all flex flex-col shadow-lg"
                            >
                                <div className="aspect-video w-full relative overflow-hidden bg-black">
                                    <img src={video.thumbnail_240_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white flex items-center gap-1">
                                        <ClockIcon />
                                        {formatDuration(video.duration)}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => handleSelect(video)}
                                            className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xl transform scale-90 group-hover:scale-100 transition-all"
                                        >
                                            اختيار الفيديو
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 leading-relaxed" title={video.title}>{video.title}</h4>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-bold truncate max-w-[120px]">@{video.owner_screenname}</span>
                                        <span className="text-[9px] text-blue-500/60 font-mono uppercase tracking-widest">Dailymotion</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailymotionSearchModal;