import React, { useState, useEffect } from 'react';
import { getContentRequests, deleteContentRequest, getUserProfile, db } from '../../firebase';
import type { ContentRequest } from '../../types';
import { InboxIcon, TrashIcon } from './AdminIcons';

const RequestsTab: React.FC<any> = ({ addToast, onRequestDelete }) => { 
    const [requests, setRequests] = useState<ContentRequest[]>([]); 
    const [loading, setLoading] = useState(true); 
    
    useEffect(() => { fetchRequests(); }, []); 
    
    const fetchRequests = async () => { 
        setLoading(true); 
        const data = await getContentRequests(); 
        setRequests(data); 
        setLoading(false); 
    }; 
    
    const handleFulfillRequest = async (req: ContentRequest) => { 
        if (confirm(`هل أنت متأكد من تحديد طلب "${req.title}" كمكتمل؟ سيتم إرسال إشعار للمستخدم وحذف الطلب.`)) { 
            try { 
                let notificationSent = false; 
                if (req.userId) { 
                    try { 
                        const userProfile = await getUserProfile(req.userId); 
                        const tokens = userProfile?.fcmTokens || []; 
                        if (tokens.length > 0) { 
                            const title = 'تم تلبية طلبك! 🎉';
                            const body = `تمت إضافة "${req.title}" إلى الموقع. مشاهدة ممتعة!`;
                            
                            // Send to each token
                            await Promise.all(tokens.map(async (token: string) => { 
                                await fetch('/api/send-notification', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        title,
                                        body,
                                        image: 'https://cinematix.watch/android-chrome-192x192.png',
                                        targetUrl: '/',
                                        type: 'new_content',
                                        targetToken: token
                                    })
                                });
                            })); 
                            notificationSent = true; 
                        } 
                    } catch (notifyErr) { 
                        console.error("Failed to send notification:", notifyErr); 
                        addToast('فشل إرسال الإشعار، لكن سيتم إكمال الطلب.', 'error'); 
                    } 
                } 
                await deleteContentRequest(req.id); 
                setRequests(prev => prev.filter(r => r.id !== req.id)); 
                addToast(notificationSent ? 'تمت تلبية الطلب وإشعار المستخدم بنجاح.' : 'تمت تلبية الطلب.', 'success'); 
            } catch (error) { 
                console.error(error); 
                addToast('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.', 'error'); 
            } 
        } 
    }; 
    
    return (
        <div className="space-y-6">
            <div className="bg-[#1f2937] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
                <div className="px-8 py-6 border-b border-gray-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2"><InboxIcon />طلبات المحتوى ({requests.length})</h3>
                    <button onClick={fetchRequests} className="text-sm text-[#00A7F8] hover:text-[#00FFB0] font-bold transition-colors">تحديث القائمة</button>
                </div>
                {loading ? (
                    <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                        <span className="text-4xl opacity-50">📭</span>لا يوجد طلبات جديدة حالياً.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-300 whitespace-nowrap">
                            <thead className="bg-gray-800/50 text-xs uppercase font-bold text-gray-400">
                                <tr>
                                    <th className="px-8 py-4">العنوان</th>
                                    <th className="px-8 py-4">النوع</th>
                                    <th className="px-8 py-4">ملاحظات</th>
                                    <th className="px-8 py-4">التاريخ</th>
                                    <th className="px-8 py-4">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                        <td className="px-8 py-4 font-bold text-white">{req.title}</td>
                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.type === 'movie' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{req.type === 'movie' ? 'فيلم' : 'مسلسل'}</span>
                                        </td>
                                        <td className="px-8 py-4 max-w-xs truncate text-gray-400" title={req.notes}>{req.notes || '-'}</td>
                                        <td className="px-8 py-4 dir-ltr text-right text-xs font-mono">{new Date(req.createdAt).toLocaleDateString('en-GB')}</td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleFulfillRequest(req)} className="bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold py-2 px-4 rounded-lg text-xs transition-colors border border-green-500/20">✓ تمت الإضافة</button>
                                                <button onClick={() => onRequestDelete(req.id, req.title)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20" title="حذف الطلب">
                                                    <TrashIcon />
                                                </button>
                                            </div>
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

export default RequestsTab;
