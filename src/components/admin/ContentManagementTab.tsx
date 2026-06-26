
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { db, generateSlug } from '../../firebase';
import type { Content, Season, Episode, Server } from '../../types';
import { ContentType } from '../../types';
import { SearchIcon, TableCellsIcon, ArrowUpTrayIcon, ExcelIcon, RefreshIcon, TrashIcon } from './AdminIcons';
import { normalizeText } from '../../utils/textUtils';
import { BouncingDotsLoader } from '../BouncingDotsLoader';
import { 
    Filter, 
    Calendar, 
    Film, 
    Tv, 
    Play, 
    Moon, 
    Link, 
    Download, 
    SlidersHorizontal, 
    AlertCircle, 
    Info, 
    ChevronDown,
    XCircle,
    RotateCcw
} from 'lucide-react';

const API_KEY = 'b8d66e320b334f4d56728d98a7e39697';
const LANG = 'ar-SA';

const getTypeMeta = (type: string) => {
    switch (type) {
        case ContentType.Movie: return { label: 'فيلم', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
        case ContentType.Series: return { label: 'مسلسل', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
        case ContentType.Program: return { label: 'برنامج', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
        case ContentType.Concert: return { label: 'حفلة', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
        case ContentType.Play: return { label: 'مسرحية', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' };
        default: return { label: type, color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
    }
};

interface ContentManagementTabProps {
    onEdit: (content: Content) => void;
    onNew: () => void;
    onRequestDelete: (id: string, title: string) => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    onBulkSuccess: () => void;
    refreshKey: number;
}

const ContentManagementTab: React.FC<ContentManagementTabProps> = ({ 
    onEdit, 
    onNew, 
    onRequestDelete, 
    addToast, 
    onBulkSuccess,
    refreshKey
}) => { 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [allContent, setAllContent] = useState<Content[] | null>(null);
    const [isInternalLoading, setIsInternalLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [localRefreshKey, setLocalRefreshKey] = useState(0);

    // Filter states
    const [activeFilter, setActiveFilter] = useState<'all' | 'arabic-movies' | 'arabic-series' | 'ramadan' | 'no-watch-links' | 'no-download-links'>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recently-updated' | 'newest' | 'oldest' | 'rating' | 'alphabetical'>('recently-updated');

    const itemsPerPage = 20;
    const pagesPerGroup = 10;
    const excelInputRef = useRef<HTMLInputElement>(null); 
    const [processingExcel, setProcessingExcel] = useState(false); 
    const [progress, setProgress] = useState(''); 

    // Helper to evaluate watch/download linkspresence
    const hasWatchLinks = (c: Content) => {
        const isEpisodic = c.type === 'series' || c.type === 'program';
        if (!isEpisodic) {
            return !!(c.servers && c.servers.some(s => s.url && s.url.trim() !== ''));
        } else {
            return !!(c.seasons && c.seasons.some(s => s.episodes && s.episodes.some(ep => ep.servers && ep.servers.some(srv => srv.url && srv.url.trim() !== ''))));
        }
    };

    const hasDownloadLinks = (c: Content) => {
        const isEpisodic = c.type === 'series' || c.type === 'program';
        if (!isEpisodic) {
            return !!(c.servers && c.servers.some(s => s.downloadUrl && s.downloadUrl.trim() !== ''));
        } else {
            return !!(c.seasons && c.seasons.some(s => s.episodes && s.episodes.some(ep => ep.servers && ep.servers.some(srv => srv.downloadUrl && srv.downloadUrl.trim() !== ''))));
        }
    };

    // Load entire database once on mount/refresh to build smart localized indexing/filters
    useEffect(() => {
        const loadAll = async () => {
            setIsInternalLoading(true);
            try {
                const snap = await db.collection("content").get();
                const docs = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Content[];
                setAllContent(docs);
            } catch (e) {
                console.error("Error fetching content:", e);
                addToast("خطأ في جلب البيانات من السيرفر", "error");
            }
            setIsInternalLoading(false);
        };
        loadAll();
    }, [refreshKey, localRefreshKey, addToast]);

    const uniqueYears = React.useMemo(() => {
        if (!allContent) return [];
        const yearsSet = new Set<number>();
        allContent.forEach(c => {
            if (c.releaseYear) {
                yearsSet.add(c.releaseYear);
            }
        });
        return Array.from(yearsSet).sort((a, b) => b - a).map(String);
    }, [allContent]);

    const filterCounts = React.useMemo(() => {
        const counts = {
            all: 0,
            'arabic-movies': 0,
            'arabic-series': 0,
            ramadan: 0,
            'no-watch-links': 0,
            'no-download-links': 0,
        };
        if (!allContent) return counts;

        counts.all = allContent.length;
        allContent.forEach(c => {
            if (c.type === 'movie' && c.categories && c.categories.includes('افلام عربية')) {
                counts['arabic-movies']++;
            }
            if (c.type === 'series' && c.categories && c.categories.includes('مسلسلات عربية')) {
                counts['arabic-series']++;
            }
            if (c.categories && (
                c.categories.includes('رمضان') || 
                c.categories.includes('حصرياً لرمضان') || 
                c.categories.includes('برامج رمضان') || 
                c.categories.includes('مسلسلات رمضان')
            )) {
                counts.ramadan++;
            }
            if (!hasWatchLinks(c)) {
                counts['no-watch-links']++;
            }
            if (!hasDownloadLinks(c)) {
                counts['no-download-links']++;
            }
        });
        return counts;
    }, [allContent]);

    const processedFilteredContent = React.useMemo(() => {
        if (!allContent) return [];

        let result = [...allContent];

        // 1. Title Search Indexing
        if (searchTerm.trim() !== '') {
            const normalizedQuery = normalizeText(searchTerm);
            result = result.filter(c => normalizeText(c.title).includes(normalizedQuery));
        }

        // 2. Tab Filter Presets
        if (activeFilter === 'arabic-movies') {
            result = result.filter(c => c.type === 'movie' && c.categories && c.categories.includes('افلام عربية'));
        } else if (activeFilter === 'arabic-series') {
            result = result.filter(c => c.type === 'series' && c.categories && c.categories.includes('مسلسلات عربية'));
        } else if (activeFilter === 'ramadan') {
            result = result.filter(c => c.categories && (
                c.categories.includes('رمضان') || 
                c.categories.includes('حصرياً لرمضان') || 
                c.categories.includes('برامج رمضان') || 
                c.categories.includes('مسلسلات رمضان')
            ));
        } else if (activeFilter === 'no-watch-links') {
            result = result.filter(c => !hasWatchLinks(c));
        } else if (activeFilter === 'no-download-links') {
            result = result.filter(c => !hasDownloadLinks(c));
        }

        // 3. Year Filter
        if (selectedYear !== 'all') {
            const yr = parseInt(selectedYear);
            result = result.filter(c => c.releaseYear === yr);
        }

        // 4. Content Type Filter
        if (selectedType !== 'all') {
            result = result.filter(c => c.type === selectedType);
        }

        // 5. Intelligent Multi-Criteria Sort sorting
        result.sort((a, b) => {
            if (sortBy === 'recently-updated') {
                const timeA = new Date(a.updatedAt || a.createdAt).getTime();
                const timeB = new Date(b.updatedAt || b.createdAt).getTime();
                return timeB - timeA;
            } else if (sortBy === 'newest') {
                return (b.releaseYear || 0) - (a.releaseYear || 0);
            } else if (sortBy === 'oldest') {
                return (a.releaseYear || 0) - (b.releaseYear || 0);
            } else if (sortBy === 'rating') {
                return (b.rating || 0) - (a.rating || 0);
            } else if (sortBy === 'alphabetical') {
                return a.title.localeCompare(b.title, 'ar');
            }
            return 0;
        });

        return result;
    }, [allContent, searchTerm, activeFilter, selectedYear, selectedType, sortBy]);

    const totalItems = processedFilteredContent.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Self-correcting Page Limits
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pagedItems = React.useMemo(() => {
        return processedFilteredContent.slice(startIndex, startIndex + itemsPerPage);
    }, [processedFilteredContent, startIndex, itemsPerPage]);

    const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);

    const generateExcelTemplate = () => { const moviesHeader = ["TMDB_ID", "Title", "Description", "Year", "Rating", "Genres", "Poster_URL", "Backdrop_URL", "Logo_URL", "Watch_Server_1", "Watch_Server_2", "Watch_Server_3", "Watch_Server_4", "Download_Link"]; const episodesHeader = ["Series_TMDB_ID", "Series_Name", "Season_Number", "Episode_Number", "Episode_Title", "Watch_Server_1", "Watch_Server_2", "Download_Link"]; const wb = XLSX.utils.book_new(); const wsMovies = XLSX.utils.aoa_to_sheet([moviesHeader]); const wsEpisodes = XLSX.utils.aoa_to_sheet([episodesHeader]); XLSX.utils.book_append_sheet(wb, wsMovies, "Movies"); XLSX.utils.book_append_sheet(wb, wsEpisodes, "Episodes"); XLSX.writeFile(wb, "cinematix_import_template.xlsx"); }; 
    const fetchTMDBData = async (id: string, type: 'movie' | 'tv') => { if (!id) return null; try { const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=${LANG}&append_to_response=images,credits`); if (!res.ok) return null; return await res.json(); } catch (e) { console.error("TMDB Fetch Error:", e); return null; } }; 
    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { 
        const file = e.target.files?.[0]; 
        if (!file) return; 
        setProcessingExcel(true); 
        setProgress('جاري قراءة الملف...'); 
        const reader = new FileReader(); 
        reader.onload = async (evt) => { 
            try { 
                const data = new Uint8Array(evt.target?.result as ArrayBuffer); 
                const workbook = XLSX.read(data, { type: 'array' }); 
                if (workbook.Sheets['Movies']) { 
                    const movies = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Movies']); 
                    let count = 0; 
                    const batch = db.batch(); 
                    let batchCount = 0; 
                    for (const row of movies) { 
                        count++; 
                        setProgress(`معالجة الفيلم ${count} من ${movies.length}...`); 
                        let movieData: any = {}; 
                        if (row.TMDB_ID) { 
                            const tmdb = await fetchTMDBData(String(row.TMDB_ID), 'movie'); 
                            if (tmdb) { 
                                movieData = { 
                                    title: tmdb.title, 
                                    description: tmdb.overview, 
                                    poster: tmdb.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : '', 
                                    backdrop: tmdb.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}` : '', 
                                    rating: tmdb.vote_average ? Number((tmdb.vote_average / 2).toFixed(1)) : 0, 
                                    releaseYear: tmdb.release_date ? new Date(tmdb.release_date).getFullYear() : new Date().getFullYear(), 
                                    genres: tmdb.genres?.map((g: any) => g.name) || [], 
                                    cast: tmdb.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [] 
                                }; 
                            } 
                        } 
                        if (row.Title) movieData.title = row.Title; 
                        if (row.Description) movieData.description = row.Description; 
                        if (row.Year) movieData.releaseYear = parseInt(String(row.Year)); 
                        if (row.Rating) movieData.rating = parseFloat(String(row.Rating)); 
                        if (row.Poster_URL) movieData.poster = row.Poster_URL; 
                        if (row.Backdrop_URL) movieData.backdrop = row.Backdrop_URL; 
                        if (row.Logo_URL) { movieData.logoUrl = row.Logo_URL; movieData.isLogoEnabled = true; } 
                        if (row.Genres) movieData.genres = row.Genres.split(',').map((g: string) => g.trim()); 
                        const servers: Server[] = []; 
                        if (row.Watch_Server_1) servers.push({ id: 1, name: "سيرفر 1", url: row.Watch_Server_1, downloadUrl: "", isActive: true }); 
                        if (row.Watch_Server_2) servers.push({ id: 2, name: "سيرفر 2", url: row.Watch_Server_2, downloadUrl: "", isActive: true }); 
                        if (row.Watch_Server_3) servers.push({ id: 3, name: "سيرفر 3", url: row.Watch_Server_3, downloadUrl: "", isActive: true }); 
                        if (row.Watch_Server_4) servers.push({ id: 4, name: "سيرفر 4", url: row.Watch_Server_4, downloadUrl: "", isActive: true }); 
                        if (row.Download_Link) servers.forEach(s => s.downloadUrl = row.Download_Link); 
                        const finalMovie: Content = { 
                            id: row.TMDB_ID ? String(row.TMDB_ID) : String(Date.now() + Math.random()), 
                            type: ContentType.Movie, 
                            title: movieData.title || 'New Movie', 
                            description: movieData.description || '', 
                            poster: movieData.poster || '', 
                            backdrop: movieData.backdrop || '', 
                            rating: movieData.rating || 0, 
                            releaseYear: movieData.releaseYear || new Date().getFullYear(), 
                            genres: movieData.genres || [], 
                            categories: ['افلام اجنبية'], 
                            cast: movieData.cast || [], 
                            visibility: 'general', 
                            ageRating: '', 
                            servers: servers, 
                            seasons: [], 
                            createdAt: new Date().toISOString(), 
                            updatedAt: new Date().toISOString(), 
                            slug: generateSlug(movieData.title || ''), 
                            logoUrl: movieData.logoUrl, 
                            isLogoEnabled: movieData.isLogoEnabled 
                        }; 
                        const ref = db.collection("content").doc(finalMovie.id); 
                        batch.set(ref, finalMovie, { merge: true }); 
                        batchCount++; 
                        if (batchCount >= 400) { await batch.commit(); batchCount = 0; } 
                    } 
                    if (batchCount > 0) await batch.commit(); 
                } 
                if (workbook.Sheets['Episodes']) { 
                    const episodes = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Episodes']); 
                    const seriesGroups: Record<string, any[]> = {}; 
                    episodes.forEach(ep => { 
                        const key = ep.Series_TMDB_ID || ep.Series_Name || 'Unknown'; 
                        if (!seriesGroups[key]) seriesGroups[key] = []; 
                        seriesGroups[key].push(ep); 
                    }); 
                    const epBatch = db.batch(); 
                    let epBatchCount = 0; 
                    let seriesCount = 0; 
                    for (const [seriesKey, epRows] of Object.entries(seriesGroups)) { 
                        seriesCount++; 
                        setProgress(`معالجة المسلسل ${seriesCount} من ${Object.keys(seriesGroups).length}...`); 
                        let seriesDoc: any = null; 
                        let seriesId = String(seriesKey); 
                        const existingSnap = await db.collection("content").doc(seriesId).get(); 
                        if (existingSnap.exists) { 
                            seriesDoc = { ...existingSnap.data(), id: existingSnap.id }; 
                        } else { 
                            let tmdbSeries: any = null; 
                            if (!isNaN(Number(seriesKey))) { 
                                tmdbSeries = await fetchTMDBData(String(seriesKey), 'tv'); 
                            } 
                            seriesDoc = { 
                                id: seriesId, 
                                type: ContentType.Series, 
                                title: tmdbSeries?.name || epRows[0].Series_Name || 'New Series', 
                                description: tmdbSeries?.overview || '', 
                                poster: tmdbSeries?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}` : '', 
                                backdrop: tmdbSeries?.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbSeries.backdrop_path}` : '', 
                                rating: tmdbSeries?.vote_average ? Number((tmdbSeries.vote_average / 2).toFixed(1)) : 0, 
                                releaseYear: tmdbSeries?.first_air_date ? new Date(tmdbSeries.first_air_date).getFullYear() : new Date().getFullYear(), 
                                genres: tmdbSeries?.genres?.map((g: any) => g.name) || [], 
                                categories: ['مسلسلات اجنبية'], 
                                seasons: [], 
                                visibility: 'general', 
                                createdAt: new Date().toISOString(), 
                                updatedAt: new Date().toISOString(), 
                                slug: generateSlug(tmdbSeries?.name || epRows[0].Series_Name || '') 
                            }; 
                        } 
                        if (!seriesDoc.seasons) seriesDoc.seasons = []; 
                        for (const ep of epRows) { 
                            const sNum = parseInt(String(ep.Season_Number)) || 1; 
                            const eNum = parseInt(String(ep.Episode_Number)) || 1; 
                            let season = seriesDoc.seasons.find((s: Season) => s.seasonNumber === sNum); 
                            if (!season) { 
                                season = { id: Date.now() + Math.random(), seasonNumber: sNum, title: `الموسم ${sNum}`, episodes: [] }; 
                                seriesDoc.seasons.push(season); 
                            } 
                            const episodeObj: Episode = { 
                                id: Date.now() + Math.random(), 
                                title: ep.Episode_Title || `الحلقة ${eNum}`, 
                                thumbnail: seriesDoc.backdrop || '', 
                                duration: "45:00", 
                                progress: 0, 
                                servers: [] 
                            }; 
                            if (ep.Watch_Server_1) episodeObj.servers.push({ id: 1, name: "سيرفر 1", url: ep.Watch_Server_1, downloadUrl: ep.Download_Link || "", isActive: true }); 
                            if (ep.Watch_Server_2) episodeObj.servers.push({ id: 2, name: "سيرفر 2", url: ep.Watch_Server_2, downloadUrl: "", isActive: true }); 
                            const existingEpIndex = season.episodes.findIndex((e: Episode) => e.title?.includes(`${eNum}`) || e.title === ep.Episode_Title); 
                            if (existingEpIndex > -1) { 
                                season.episodes[existingEpIndex] = { ...season.episodes[existingEpIndex], ...episodeObj, servers: [...season.episodes[existingEpIndex].servers, ...episodeObj.servers] }; 
                            } else { 
                                season.episodes.push(episodeObj); 
                            } 
                        } 
                        seriesDoc.seasons.sort((a: Season, b: Season) => a.seasonNumber - b.seasonNumber); 
                        seriesDoc.seasons.forEach((s: Season) => { 
                            s.episodes.sort((a: Episode, b: Episode) => { 
                                const numA = parseInt(a.title?.replace(/\D/g, '') || '0'); 
                                const numB = parseInt(b.title?.replace(/\D/g, '') || '0'); 
                                return numA - numB; 
                            }); 
                        }); 
                        const ref = db.collection("content").doc(seriesDoc.id); 
                        epBatch.set(ref, seriesDoc, { merge: true }); 
                        epBatchCount++; 
                        if (epBatchCount >= 300) { await epBatch.commit(); epBatchCount = 0; } 
                    } 
                    if (epBatchCount > 0) await epBatch.commit(); 
                } 
                addToast('تم استيراد البيانات من Excel بنجاح!', 'success'); 
                onBulkSuccess(); 
                setLocalRefreshKey(prev => prev + 1);
                setCurrentPage(1);
            } catch (err) { 
                console.error("Excel Import Error:", err); 
                addToast('حدث خطأ أثناء معالجة ملف Excel.', 'error'); 
            } finally { 
                setProcessingExcel(false); 
                setProgress(''); 
                if (excelInputRef.current) excelInputRef.current.value = ''; 
            } 
        }; 
        reader.readAsArrayBuffer(file); 
    }; 
    
    const pageNumbersInGroup = Array.from(
        { length: Math.min(pagesPerGroup, totalPages - currentGroup * pagesPerGroup) },
        (_, i) => currentGroup * pagesPerGroup + i + 1
    );

    const hasNextGroup = (currentGroup + 1) * pagesPerGroup < totalPages;
    const hasPrevGroup = currentGroup > 0;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1f2937] p-6 rounded-2xl mb-8 border border-gray-700/50 shadow-lg">
                <div className="relative w-full md:w-auto md:min-w-[350px]">
                    <input 
                        type="text" 
                        placeholder="ابحث بالاسم في كامل قاعدة البيانات..." 
                        value={searchTerm} 
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }} 
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#00A7F8] text-white placeholder-gray-600 shadow-inner"
                    />
                    <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
                <div className="flex gap-3 w-full md:w-auto flex-wrap">
                    <button onClick={generateExcelTemplate} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-5 rounded-xl transition-colors text-sm border border-gray-600"><TableCellsIcon /><span className="hidden sm:inline">تحميل نموذج Excel</span></button>
                    <input type="file" accept=".xlsx, .xls" ref={excelInputRef} onChange={handleExcelUpload} className="hidden" />
                    <button onClick={() => excelInputRef.current?.click()} disabled={processingExcel} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-5 rounded-xl transition-colors text-sm disabled:opacity-50 border border-gray-600"><ArrowUpTrayIcon /><span className="hidden sm:inline">{processingExcel ? 'جاري المعالجة...' : 'استيراد من Excel'}</span></button>
                    <button onClick={onNew} className="flex-1 md:flex-none bg-gradient-to-r from-[#00A7F8] to-[#00FFB0] text-black font-extrabold py-3 px-8 rounded-xl hover:shadow-[0_0_20px_rgba(0,167,248,0.4)] transition-all transform hover:scale-105 whitespace-nowrap">+ إضافة محتوى</button>
                </div>
            </div>

            {/* لوحة الفلاتر الذكية والشاملة */}
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A7F8]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FFB0]/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-800/85 pb-4">
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-[#00A7F8]" />
                            <h2 className="text-white font-bold text-base md:text-lg">الفلترة الذكية والتصنيف</h2>
                        </div>
                        <span className="text-xs bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full font-bold border border-gray-700/55 self-start sm:self-center">
                            إجمالي عناصر النظام: {allContent?.length || 0}
                        </span>
                    </div>

                    {/* أولاً: التبويبات السريعة للفلترة والأعداد */}
                    <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap md:flex-wrap items-center">
                        <button
                            type="button"
                            onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                activeFilter === 'all'
                                    ? 'bg-gradient-to-r from-[#00A7F8] to-[#00A7F8]/80 text-white border-transparent shadow-lg shadow-[#00A7F8]/20'
                                    : 'bg-[#1f2937]/50 text-gray-400 border-gray-800 hover:text-white hover:bg-[#1f2937]'
                            }`}
                        >
                            <span>الكل</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                {filterCounts.all}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveFilter('arabic-movies'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                activeFilter === 'arabic-movies'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20'
                                    : 'bg-[#1f2937]/50 text-blue-400 border-gray-800 hover:text-blue-300 hover:bg-[#1f2937]'
                            }`}
                        >
                            <Film className="w-4 h-4" />
                            <span>أفلام عربية</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeFilter === 'arabic-movies' ? 'bg-white/20 text-white' : 'bg-gray-800 text-blue-400'}`}>
                                {filterCounts['arabic-movies']}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveFilter('arabic-series'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                activeFilter === 'arabic-series'
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-transparent shadow-lg shadow-purple-500/20'
                                    : 'bg-[#1f2937]/50 text-purple-400 border-gray-800 hover:text-purple-300 hover:bg-[#1f2937]'
                            }`}
                        >
                            <Tv className="w-4 h-4" />
                            <span>مسلسلات عربية</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeFilter === 'arabic-series' ? 'bg-white/20 text-white' : 'bg-gray-800 text-purple-400'}`}>
                                {filterCounts['arabic-series']}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveFilter('ramadan'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                activeFilter === 'ramadan'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent shadow-lg shadow-amber-500/20'
                                    : 'bg-[#1f2937]/50 text-amber-500 border-gray-800 hover:text-amber-400 hover:bg-[#1f2937]'
                            }`}
                        >
                            <Moon className="w-4 h-4" />
                            <span>محتوى رمضان</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeFilter === 'ramadan' ? 'bg-white/20 text-white' : 'bg-gray-800 text-amber-400'}`}>
                                {filterCounts.ramadan}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveFilter('no-watch-links'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                activeFilter === 'no-watch-links'
                                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-transparent shadow-lg shadow-rose-500/20'
                                    : 'bg-[#1f2937]/50 text-rose-400 border-gray-800 hover:text-rose-300 hover:bg-[#1f2937]'
                            }`}
                        >
                            <Play className="w-4 h-4 rotate-180" />
                            <span>أعمال بدون روابط مشاهدة</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeFilter === 'no-watch-links' ? 'bg-white/20 text-white' : 'bg-gray-800 text-rose-400'}`}>
                                {filterCounts['no-watch-links']}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveFilter('no-download-links'); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                activeFilter === 'no-download-links'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-transparent shadow-lg shadow-red-600/20'
                                    : 'bg-[#1f2937]/50 text-red-500 border-gray-800 hover:text-red-300 hover:bg-[#1f2937]'
                            }`}
                        >
                            <Download className="w-4 h-4" />
                            <span>أعمال بدون روابط تحميل</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeFilter === 'no-download-links' ? 'bg-white/20 text-white' : 'bg-gray-800 text-red-400'}`}>
                                {filterCounts['no-download-links']}
                            </span>
                        </button>
                    </div>

                    {/* ثانياً: الفلترة الدقيقة (النوع، السنة، والترتيب الذكي) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800/50">
                        {/* فلتر نوع المحتوى */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00A7F8]" />
                                نوع العمل
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedType}
                                    onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-2.5 pl-10 text-xs md:text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A7F8] appearance-none cursor-pointer"
                                >
                                    <option value="all">كل الأنواع والأشكال</option>
                                    <option value="movie">أفلام</option>
                                    <option value="series">مسلسلات</option>
                                    <option value="program">برامج تلفزيونية</option>
                                    <option value="play">مسرحيات</option>
                                    <option value="concert">حفلات</option>
                                </select>
                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* فلتر السنة */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#00A7F8]" />
                                سنة الإنتاج والصدور
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-2.5 pl-10 text-xs md:text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A7F8] appearance-none cursor-pointer"
                                >
                                    <option value="all">كل السنين والأعوام</option>
                                    {uniqueYears.map((yr) => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* الترتيب الذكي والشامل */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                                <RotateCcw className="rotate-180 w-3.5 h-3.5 text-[#00A7F8]" />
                                ترتيب وعرض حسب
                            </label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
                                    className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-2.5 pl-10 text-xs md:text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00A7F8] appearance-none cursor-pointer"
                                >
                                    <option value="recently-updated">الأحدث تحديثاً وتعديلاً</option>
                                    <option value="newest">الأحدث إنتاجاً (سنة تنازلية)</option>
                                    <option value="oldest">الأقدم إنتاجاً (سنة تصاعدية)</option>
                                    <option value="rating">الأعلى تقييماً وتصنيفاً</option>
                                    <option value="alphabetical">الترتيب الأبجدي (أ - ي)</option>
                                </select>
                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* زر إعادة ضبط كل الفلاتر */}
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveFilter('all');
                                    setSelectedYear('all');
                                    setSelectedType('all');
                                    setSortBy('recently-updated');
                                    setSearchTerm('');
                                    setCurrentPage(1);
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-[#1f2937]/85 hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold border border-gray-800 transition-colors cursor-pointer"
                            >
                                <XCircle className="w-4 h-4 text-gray-400" />
                                <span>إعادة ضبط الفلاتر</span>
                            </button>
                        </div>
                    </div>

                    {/* ملخص الفلاتر النشطة الحالية */}
                    {(activeFilter !== 'all' || selectedYear !== 'all' || selectedType !== 'all' || searchTerm.trim() !== '') && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 bg-gray-900/40 p-3 rounded-xl border border-gray-800/40">
                            <span className="text-xs text-gray-400">الفلاتر النشطة:</span>
                            {activeFilter !== 'all' && (
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md font-bold">
                                    التصفية: {activeFilter === 'arabic-movies' ? 'أفلام عربية' : activeFilter === 'arabic-series' ? 'مسلسلات عربية' : activeFilter === 'ramadan' ? 'رمضان' : activeFilter === 'no-watch-links' ? 'بدون روابط مشاهدة' : 'بدون روابط تحميل'}
                                </span>
                            )}
                            {selectedType !== 'all' && (
                                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md font-bold">
                                    النوع: {selectedType === 'movie' ? 'أفلام' : selectedType === 'series' ? 'مسلسلات' : selectedType === 'program' ? 'برامج' : selectedType === 'play' ? 'مسرحيات' : 'حفلات'}
                                </span>
                            )}
                            {selectedYear !== 'all' && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md font-bold">
                                    العام: {selectedYear}
                                </span>
                            )}
                            {searchTerm.trim() !== '' && (
                                <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-md font-bold">
                                    البحث: "{searchTerm}"
                                </span>
                            )}
                            <span className="mr-auto text-[11px] text-[#00A7F8] font-bold">
                                وجدنا {totalItems} عنصر مطابق
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {processingExcel && (<div className="mb-6 bg-[#1f2937] p-6 rounded-2xl border border-gray-700/50 animate-pulse shadow-lg"><div className="flex justify-between mb-3 text-sm text-[#00A7F8] font-bold"><span>جاري الاستيراد...</span><span>{progress}</span></div><div className="w-full bg-gray-800 rounded-full h-3"><div className="bg-[#00A7F8] h-3 rounded-full w-2/3 transition-all duration-500 shadow-[0_0_10px_#00A7F8]"></div></div><p className="text-xs text-gray-500 mt-3 text-center">الرجاء عدم إغلاق الصفحة حتى تكتمل العملية.</p></div>)}
            
            {isInternalLoading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-6">
                    <BouncingDotsLoader size="lg" delayMs={300} />
                    <span className="text-gray-500 font-black tracking-widest uppercase text-xs">جاري سحب المحتوى والفلترة الذكية...</span>
                </div> 
            ) : (
                <>
                    {totalItems === 0 && (
                        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-3xl mb-8 flex flex-col items-center justify-center bg-gray-900/10">
                            <span className="text-4xl mb-4 opacity-50">📂</span>
                            لا يوجد محتوى مطابق لبحثك أو الفلاتر المحددة.
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 mb-10">
                        {pagedItems.map((c:any) => {
                            const meta = getTypeMeta(c.type);
                            return (
                                <div key={c.id} className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer bg-gray-800 border border-gray-700/50 shadow-lg hover:shadow-[0_0_25px_rgba(0,167,248,0.2)] transition-all duration-300 hover:scale-[1.02]">
                                    <img src={c.poster} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-md border ${meta.color}`}>
                                            {meta.label}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute bottom-0 left-0 w-full p-4 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 mb-1 drop-shadow-md text-right" dir="rtl">{c.title}</h3>
                                        <div className="flex items-center justify-between text-xs text-gray-300 mb-3 flex-row-reverse">
                                            <span className="font-mono">{c.releaseYear}</span>
                                            <span className={`font-bold ${c.visibility === 'general' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {c.visibility === 'general' ? 'عام' : 'مقيد'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                            <button onClick={(e) => { e.stopPropagation(); onEdit(c); }} className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-2 rounded-lg text-xs font-bold border border-white/10 transition-colors">تعديل</button>
                                            <button onClick={(e) => { e.stopPropagation(); onRequestDelete(c.id, c.title); }} className="flex-1 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md text-red-300 py-2 rounded-lg text-xs font-bold border border-red-500/20 transition-colors">حذف</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-6 bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-xl mb-12">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                {hasPrevGroup && (
                                    <button 
                                        onClick={() => setCurrentPage(currentGroup * pagesPerGroup)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 font-black rounded-xl hover:bg-gray-700 transition-all border border-gray-700 cursor-pointer"
                                    >
                                        <span className="text-sm rotate-180">«</span>
                                        <span className="text-xs">المجموعة السابقة</span>
                                    </button>
                                )}

                                {pageNumbersInGroup.map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`w-12 h-12 rounded-xl font-black text-sm transition-all border cursor-pointer ${currentPage === num ? 'bg-[var(--color-accent)] text-black border-transparent shadow-[0_0_20px_var(--shadow-color)]' : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-white hover:border-gray-500'}`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                {hasNextGroup && (
                                    <button 
                                        onClick={() => setCurrentPage((currentGroup + 1) * pagesPerGroup + 1)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 font-black rounded-xl hover:bg-gray-700 transition-all border border-gray-700 cursor-pointer"
                                    >
                                        <span className="text-xs">المجموعة التالية</span>
                                        <span className="text-sm">»</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 flex-row-reverse" dir="rtl">
                                <span>الصفحة {currentPage} من {totalPages}</span>
                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                <span>المطابقة: {totalItems} عنصر</span>
                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                <span>الإجمالي الكلي: {allContent?.length || 0}</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    ); 
};

export default ContentManagementTab;
