import React, { useState, useEffect } from 'react';
import type { Content } from '../../types';
import ToggleSwitch from '../ToggleSwitch';
import { RefreshIcon } from './AdminIcons';
import { BouncingDotsLoader } from '../BouncingDotsLoader';

interface TmdbResult {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    release_date?: string;
    first_air_date?: string;
    media_type: 'movie' | 'tv';
    original_language?: string;
    origin_country?: string[];
    popularity?: number;
}

const RadarIconFixed = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 18c-5.965 0-10.8-4.03-10.8-9S6.035 3 12 3" />
    </svg>
);

const DashboardTab: React.FC<{stats: {totalMovies: number, totalSeries: number, totalUsers: number}, allContent: Content[]}> = ({stats, allContent}) => {
    const TMDB_API_KEY = 'b8d66e320b334f4d56728d98a7e39697';
    const [tmdbRadarItems, setTmdbRadarItems] = useState<TmdbResult[]>([]);
    const [isRadarLoading, setIsRadarLoading] = useState(false);
    const [radarType, setRadarType] = useState<string>('all');
    const [radarMode, setRadarMode] = useState<'discover' | 'now_playing'>('discover');
    const [strict24h, setStrict24h] = useState(true);

    const getOriginLabel = (item: TmdbResult) => {
        const lang = item.original_language;
        const countries = item.origin_country || [];
        const country = countries[0];

        if (lang === 'ar') {
            if (country === 'EG') return 'مصري 🇪🇬';
            if (country === 'MA') return 'مغربي 🇲🇦';
            return 'عربي 🇸🇦';
        }
        if (lang === 'tr') return 'تركي 🇹🇷';
        if (lang === 'hi') return 'هندي 🇮🇳';
        if (lang === 'ru') return 'روسي 🇷🇺';
        if (lang === 'es') return 'إسباني 🇪🇸';
        if (lang === 'en') {
            if (country === 'US') return 'أمريكي 🇺🇸';
            return 'أجنبي 🌐';
        }
        
        return 'أجنبي 🌐';
    };

    const fetchTmdbRadar = async (category: string = radarType, mode: 'discover' | 'now_playing' = radarMode, isStrict: boolean = strict24h) => {
        setIsRadarLoading(true);
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const last45Days = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const dateFilter = isStrict ? yesterday : (mode === 'now_playing' ? last45Days : lastWeek);
        
        let moviesUrl = '';
        let tvUrl = '';

        moviesUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&primary_release_date.gte=${dateFilter}&sort_by=popularity.desc&language=ar-SA&include_adult=false`;
        tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&first_air_date.gte=${dateFilter}&sort_by=popularity.desc&language=ar-SA&include_adult=false`;

        if (category === 'arabic_movies') moviesUrl += '&with_original_language=ar';
        if (category === 'arabic_series') tvUrl += '&with_original_language=ar';
        if (category === 'turkish_movies') moviesUrl += '&with_original_language=tr';
        if (category === 'turkish_series') tvUrl += '&with_original_language=tr';
        if (category === 'foreign_movies') moviesUrl += '&with_original_language=en';
        if (category === 'foreign_series') tvUrl += '&with_original_language=en';
        if (category === 'animation') {
            moviesUrl += '&with_genres=16';
            tvUrl += '&with_genres=16';
        }

        try {
            const [moviesRes, tvRes] = await Promise.all([
                fetch(moviesUrl).then(r => r.json()),
                fetch(tvUrl).then(r => r.json())
            ]);

            let movies = (moviesRes.results || []).map((i: any) => ({ ...i, media_type: 'movie' }));
            let tv = (tvRes.results || []).map((i: any) => ({ ...i, media_type: 'tv' }));
            
            if (isStrict) {
                movies = movies.filter((m: any) => m.release_date >= yesterday);
                tv = tv.filter((t: any) => t.first_air_date >= yesterday);
            }

            let combined = [...movies, ...tv];
            
            if (category.includes('movies')) combined = movies;
            if (category.includes('series')) combined = tv;

            setTmdbRadarItems(combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 24));
        } catch (e) {
            console.error("Radar Fetch Error", e);
        } finally {
            setIsRadarLoading(false);
        }
    };

    useEffect(() => {
        fetchTmdbRadar(radarType, radarMode, strict24h);
    }, [radarType, radarMode, strict24h]);

    const categoryButtons = [
        { id: 'all', label: 'الكل', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
        { id: 'arabic_movies', label: 'أفلام عربي', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
        { id: 'arabic_series', label: 'مسلسلات عربي', color: 'bg-purple-500/10 text-purple-400 border-green-500/30' },
        { id: 'turkish_movies', label: 'أفلام تركي', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
        { id: 'turkish_series', label: 'مسلسلات تركي', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
        { id: 'foreign_movies', label: 'أفلام أجنبي', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
        { id: 'foreign_series', label: 'مسلسلات أجنبي', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
        { id: 'animation', label: 'أفلام أنيميشن', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    ];

    const currentCategoryLabel = categoryButtons.find(b => b.id === radarType)?.label || 'الكل';

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10"><h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">إجمالي الأفلام</h3><span className="text-2xl bg-blue-500/20 p-2 rounded-lg">🎬</span></div>
                    <p className="text-5xl font-black mt-4 text-white relative z-10">{stats.totalMovies}</p>
                    <p className="text-xs text-blue-400 mt-2 font-bold relative z-10">فيلم متاح</p>
                </div>
                <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10"><h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">إجمالي المسلسلات</h3><span className="text-2xl bg-purple-500/20 p-2 rounded-lg">📺</span></div>
                    <p className="text-5xl font-black mt-4 text-white relative z-10">{stats.totalSeries}</p>
                    <p className="text-xs text-purple-400 mt-2 font-bold relative z-10">مسلسل متاح</p>
                </div>
                <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10"><h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">المستخدمين</h3><span className="text-2xl bg-green-500/20 p-2 rounded-lg">👥</span></div>
                    <p className="text-5xl font-black mt-4 text-white relative z-10">{stats.totalUsers}</p>
                    <p className="text-xs text-green-400 mt-2 font-bold relative z-10">حساب نشط</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#00A7F8] rounded-full"></div>
                        <h4 className="text-xl font-black text-white">تحكم في رصد المحتوى</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-[#1f2937] p-2 rounded-2xl border border-gray-700/50 shadow-inner">
                        <div className="flex bg-[#0f1014] p-1 rounded-xl border border-gray-700">
                            <button 
                                onClick={() => setRadarMode('discover')} 
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${radarMode === 'discover' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                إضافات جديدة
                            </button>
                            <button 
                                onClick={() => setRadarMode('now_playing')} 
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${radarMode === 'now_playing' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                يعرض الآن
                            </button>
                        </div>

                        <div className="h-6 w-px bg-gray-700 hidden md:block"></div>

                        <label className="flex items-center gap-3 cursor-pointer group px-2">
                             <ToggleSwitch checked={strict24h} onChange={setStrict24h} className="scale-75" />
                             <span className={`text-xs font-black uppercase tracking-widest ${strict24h ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-400'}`}>رصد اليوم فقط</span>
                        </label>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {categoryButtons.map(btn => (
                        <button 
                            key={btn.id}
                            onClick={() => setRadarType(btn.id)}
                            className={`p-3 rounded-xl border transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center flex flex-col items-center justify-center gap-1 ${radarType === btn.id ? 'border-[#00A7F8] bg-[#00A7F8]/10 ring-2 ring-[#00A7F8]/20' : `${btn.color} hover:border-white/20 shadow-md`}`}
                        >
                            <span className="text-xs font-black leading-tight whitespace-nowrap">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700/50 overflow-hidden shadow-2xl relative">
                <div className="px-8 py-7 border-b border-gray-700/50 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-red-600/20 text-red-500 rounded-2xl animate-pulse shadow-inner">
                            <RadarIconFixed className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white">رصد TMDB الذكي: <span className="text-red-500">{currentCategoryLabel}</span></h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {radarMode === 'discover' ? 'رصد أحدث الإصدارات الأسبوعية' : 'رصد الأعمال التي تُعرض حالياً في السينما والمنصات'}
                                {strict24h ? ' • مصفى بآخر 24 ساعة' : ''}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => fetchTmdbRadar()}
                        className="p-3 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 shadow-lg border border-gray-700"
                        title="تحديث البيانات"
                    >
                        <RefreshIcon className={`w-5 h-5 ${isRadarLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="p-8">
                    {isRadarLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-6 opacity-60">
                            <BouncingDotsLoader size="lg" delayMs={300} colorClass="bg-red-500" />
                            <span className="text-sm font-black animate-pulse tracking-widest uppercase">جاري مسح الرادار العالمي...</span>
                        </div>
                    ) : tmdbRadarItems.length === 0 ? (
                        <div className="py-24 text-center text-gray-500 flex flex-col items-center gap-6 animate-fade-in">
                            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shadow-inner">
                                <span className="text-5xl opacity-40">📡</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-white/80">لم يتم رصد نتائج</p>
                                <p className="max-w-xs font-bold text-sm mx-auto leading-relaxed">لم نجد نتائج مطابقة لفلتر <span className="text-red-500">"{currentCategoryLabel}"</span> حالياً.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-fade-in">
                            {tmdbRadarItems.map(item => (
                                <div key={item.id} className="group relative bg-[#0f1014] rounded-2xl border border-gray-800 overflow-hidden transition-all duration-500 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1">
                                    <div className="aspect-[2/3] relative overflow-hidden">
                                        <img src={item.poster_path ? `https://image.tmdb.org/t/p/w400${item.poster_path}` : 'https://placehold.co/400x600/101010/white?text=No+Poster'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                        
                                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white border border-white/10 shadow-xl z-20 flex items-center gap-1.5 ring-1 ring-white/5">
                                            {getOriginLabel(item)}
                                        </div>

                                        <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white shadow-lg">
                                            ID: {item.id}
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-start gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.media_type === 'movie' ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.4)]'}`}>
                                                {item.media_type === 'movie' ? 'فيلم' : 'مسلسل'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <h4 className="text-xs font-black text-white truncate leading-tight group-hover:text-red-500 transition-colors">{item.title || item.name}</h4>
                                        <div className="flex items-center justify-between border-t border-gray-800 pt-2">
                                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">التاريخ</span>
                                            <span className="text-[10px] text-green-500 font-mono font-black">{item.release_date || item.first_air_date || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardTab;
