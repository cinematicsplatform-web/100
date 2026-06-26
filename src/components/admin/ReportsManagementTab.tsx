import React, { useState, useEffect } from 'react';
import { getReports, deleteReport } from '../../firebase';
import { TrashIcon } from './AdminIcons';

const ReportsManagementTab: React.FC<any> = ({ addToast, onRequestDelete }) => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        setLoading(true);
        const data = await getReports();
        setReports(data);
        setLoading(false);
    };

    const getReasonLabel = (reason: string) => {
        switch(reason) {
            case 'not_working': return 'الفيديو لا يعمل';
            case 'wrong_episode': return 'حلقة خاطئة';
            case 'sound_issue': return 'مشكلة في الصوت/الترجمة';
            case 'other': return 'أخرى';
            default: return reason;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#1f2937] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
                <div className="px-8 py-6 border-b border-gray-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">⚠️ بلاغات الأعطال ({reports.length})</h3>
                    <button onClick={fetchReports} className="text-sm text-[#00A7F8] hover:text-[#00FFB0] font-bold transition-colors">تحديث</button>
                </div>
                {loading ? (
                    <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                        <span className="text-4xl opacity-50">✅</span>
                        لا توجد بلاغات أعطال حالياً.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-300">
                            <thead className="bg-gray-800/50 text-xs uppercase font-bold text-gray-400">
                                <tr>
                                    <th className="px-8 py-4">المحتوى</th>
                                    <th className="px-8 py-4">المشكلة</th>
                                    <th className="px-8 py-4">التفاصيل</th>
                                    <th className="px-8 py-4">التاريخ</th>
                                    <th className="px-8 py-4">إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                        <td className="px-8 py-4 font-bold text-white">
                                            {report.contentTitle} 
                                            {report.episode && <span className="block text-[10px] text-[#00A7F8] mt-1">{report.episode}</span>}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold">{getReasonLabel(report.reason)}</span>
                                        </td>
                                        <td className="px-8 py-4 text-xs text-gray-400 max-w-xs truncate" title={report.description}>{report.description || '-'}</td>
                                        <td className="px-8 py-4 dir-ltr text-right text-xs font-mono">{new Date(report.createdAt).toLocaleDateString('en-GB')}</td>
                                        <td className="px-8 py-4">
                                            <button onClick={() => onRequestDelete(report.id, `بلاغ: ${report.contentTitle}`)} className="text-red-400 hover:text-red-300 p-2"><TrashIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsManagementTab;
