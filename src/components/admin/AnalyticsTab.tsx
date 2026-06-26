import React, { useMemo } from 'react';

const AnalyticsTab: React.FC<any> = ({ allContent, allUsers }) => {
    const totalMovies = allContent.filter((c: any) => c.type === 'movie').length;
    const totalSeries = allContent.filter((c: any) => c.type === 'series').length;
    const totalUsersCount = allUsers.length;
    const genreStats = useMemo(() => {
        const stats: Record<string, number> = {};
        allContent.forEach((c: any) => { if (c.genres) c.genres.forEach((g: string) => { stats[g] = (stats[g] || 0) + 1; }); });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]);
    }, [allContent]);
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-700/50 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-[#00FFB0]">توزيع المحتوى حسب النوع</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><span className="text-gray-400">أفلام</span><div className="flex-1 mx-4 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${(totalMovies / (totalMovies + totalSeries || 1)) * 100}%` }}></div></div><span className="font-bold">{totalMovies}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-400">مسلسلات</span><div className="flex-1 mx-4 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="bg-purple-500 h-full" style={{ width: `${(totalSeries / (totalMovies + totalSeries || 1)) * 100}%` }}></div></div><span className="font-bold">{totalSeries}</span></div>
                    </div>
                </div>
                <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-700/50 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-[#00A7F8]">أكثر التصنيفات انتشاراً</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {genreStats.slice(0, 10).map(([genre, count]) => (<div key={genre} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl border border-gray-700"><span className="text-gray-300 font-bold">{genre}</span><span className="bg-gray-700 px-3 py-1 rounded-lg text-xs font-mono">{count}</span></div>))}
                    </div>
                </div>
            </div>
            <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-700/50 shadow-xl">
                <h3 className="text-xl font-bold mb-6 text-white">إجمالي المستخدمين المسجلين</h3>
                <div className="flex items-center gap-6"><div className="text-5xl font-black text-[#00FFB0]">{totalUsersCount}</div><div className="text-gray-400">مستخدم مسجل في القاعدة</div></div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
