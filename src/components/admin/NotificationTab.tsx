
import React, { useState, useEffect } from 'react';
import { db, getBroadcastHistory } from '../../firebase';
import type { Notification, BroadcastNotification } from '../../types';
import { PaperAirplaneIcon, PlayIcon, BellIcon, TrashIcon } from './AdminIcons';
import { BouncingDotsLoader } from '../BouncingDotsLoader';

const NotificationTab: React.FC<any> = ({ addToast, allUsers, onRequestDelete }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [image, setImage] = useState('');
    const [url, setUrl] = useState('/');
    const [type, setType] = useState<'info' | 'play' | 'alert' | 'new_content'>('new_content');
    const [topic, setTopic] = useState('all_users');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<BroadcastNotification[]>([]);
    const [customContentId, setCustomContentId] = useState('');
    const [dataOnly, setDataOnly] = useState(false);

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        const data = await getBroadcastHistory();
        setHistory(data);
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !body.trim()) {
            addToast('الرجاء تعبئة العنوان ونص الرسالة.', 'info');
            return;
        }

        setSending(true);
        try {
            const broadcastId = String(Date.now());
            
            // 1. Send push notification directly via our backend API
            const response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    body,
                    image,
                    targetUrl: url,
                    type,
                    topic,
                    contentId: customContentId || undefined,
                    dataOnly: dataOnly,
                }),
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to send notification via API');
            }

            // 2. Save internal notifications in Firestore for registered users
            if (topic === 'all_users') {
                const batch = db.batch();
                allUsers.forEach((user: any) => {
                    const notifRef = db.collection('notifications').doc();
                    const newNotif: Omit<Notification, 'id'> = {
                        userId: user.id,
                        title,
                        body,
                        type,
                        isRead: false,
                        createdAt: new Date().toISOString(),
                        targetUrl: url || undefined,
                        imageUrl: image || undefined,
                        broadcastId: broadcastId
                    };
                    batch.set(notifRef, newNotif);
                });

                // 3. Save to broadcast history
                const historyRef = db.collection('broadcast_history').doc(broadcastId);
                batch.set(historyRef, {
                    title, body, type, imageUrl: image || null, targetUrl: url || null,
                    createdAt: new Date().toISOString(),
                    recipientCount: allUsers.length
                });

                await batch.commit();
            }

            addToast(`تم إرسال الإشعار بنجاح لجميع الأجهزة المشتركة! 🎉`, 'success');
            setTitle(''); setBody(''); setImage(''); setUrl('/'); setType('new_content'); setCustomContentId(''); setDataOnly(false);
            fetchHistory();
        } catch (error: any) { 
            console.error("[Cinematix] Global Notification Error:", error);
            addToast('فشل إرسال الإشعارات: ' + error.message, 'error'); 
        } finally { 
            setSending(false); 
        }
    };

    const getIcon = (t: string) => {
        switch(t) {
            case 'new_content': return <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><PlayIcon className="w-5 h-5"/></div>;
            case 'alert': return <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">⚠️</div>;
            default: return <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">ℹ️</div>;
        }
    };

    const getAccentPreview = (t: string) => {
        switch(t) {
            case 'new_content': return 'bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
            case 'alert': return 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
            default: return 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            
            <div className="bg-gradient-to-l from-blue-900/40 to-[#1f2937] border border-blue-500/30 p-6 rounded-3xl text-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <div>
                        <h2 className="font-extrabold text-xl mb-1 text-white text-shadow-sm">نظام البث السحابي الذكي (FCM Backend)</h2>
                        <p className="text-sm text-blue-200/80 leading-relaxed max-w-2xl">
                            الإشعارات الآن يتم معالجتها وإرسالها عبر <span className="font-bold text-blue-400">سيرفرات المنصة (Backend API)</span> بشكل آمن جداً.
                            تأكد من إضافة بيانات Service Account في صفحة الإعدادات الأمنية (ملف <code>.env</code>) الخاص باستضافتك لضمان تشفير المفاتيح وعدم كشفها للمستخدمين.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 bg-[#1f2937] px-6 py-8 md:p-10 rounded-[2.5rem] border border-gray-700/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/5 via-transparent to-transparent rounded-full mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                    
                    <div className="flex justify-between items-center mb-10 relative z-10 border-b border-gray-700/50 pb-6">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3"><PaperAirplaneIcon className="text-blue-500 w-8 h-8 drop-shadow-md" /> إعداد الرسالة الجديدة</h3>
                            <p className="text-sm text-gray-400 font-medium mt-2">تحكم كامل بكل عناصر الإشعار وتوجيه المستخدمين.</p>
                        </div>
                        <button type="button" onClick={() => {setTitle(''); setBody(''); setImage(''); setUrl('/');}} className="text-sm font-bold text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-all">مسح الحقول 🧹</button>
                    </div>
                    
                    <form onSubmit={handleSendNotification} className="space-y-8 relative z-10">
                        
                        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-6">
                            <h4 className="text-md font-bold text-white mb-2 flex items-center gap-2"><span className="w-1.5 h-5 bg-blue-500 rounded-full"></span> الإعدادات الأساسية</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-3">قناة البث (الجمهور المستهدف)</label>
                                    <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-2xl px-5 py-4 text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                        <option value="all_users">🌍 الجميع (all_users)</option>
                                        <option value="android_users">📱 أندرويد فقط</option>
                                        <option value="ios_users">🍎 iOS فقط</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-3">نوع الإشعار (للتصنيف)</label>
                                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-black/50 border border-gray-700 rounded-2xl px-5 py-4 text-white font-medium focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                        <option value="new_content">🟢 محتوى ترفيهي جديد</option>
                                        <option value="alert">🟡 تنبيه إداري هام</option>
                                        <option value="info">🔵 رسالة إخبارية عامة</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-6">
                            <h4 className="text-md font-bold text-white mb-2 flex items-center gap-2"><span className="w-1.5 h-5 bg-green-500 rounded-full"></span> محتوى الإشعار</h4>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-3">عنوان الجذب (Title)</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-2xl px-5 py-4 text-white font-bold text-lg focus:border-green-500 outline-none transition-all" required placeholder="مثال: حصرياً! فيلم المرتزقة متاح الآن 🔥"/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-3">نص الرسالة التفصيلي (Body)</label>
                                <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-2xl px-5 py-4 text-white min-h-[120px] outline-none focus:border-green-500 transition-all leading-relaxed" required placeholder="اسرد التفاصيل لجذب انتباه المستخدم ليقوم بفتح التطبيق..."/>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-6">
                            <h4 className="text-md font-bold text-white mb-2 flex items-center gap-2"><span className="w-1.5 h-5 bg-purple-500 rounded-full"></span> الوسائط الإضافة والتوجيه والمفاتيح (اختياري)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-3">رابط الصورة الكبيرة (Rich Notification)</label>
                                    <input value={image} onChange={e => setImage(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-2xl px-5 py-4 text-white dir-ltr font-mono text-xs focus:border-purple-500 outline-none transition-all" placeholder="https://domain.com/poster.jpg"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-3">توجيه عند النقر (Deep Link / URL)</label>
                                    <input value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-2xl px-5 py-4 text-white dir-ltr font-mono text-xs focus:border-purple-500 outline-none transition-all" placeholder="/watch/movie/123"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-800/60">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-3">معرّف المحتوى المباشر (contentId)</label>
                                    <input value={customContentId} onChange={e => setCustomContentId(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-2xl px-5 py-4 text-white dir-ltr font-mono text-xs focus:border-purple-500 outline-none transition-all" placeholder="مثال: m5 أو id_of_movie"/>
                                    <span className="text-xs text-gray-500 mt-2 block">إذا تركته فارغاً، فسيستخرجه السيرفر تلقائياً من رابط التوجيه.</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-300 select-none bg-black/30 p-4 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all">
                                        <input type="checkbox" checked={dataOnly} onChange={e => setDataOnly(e.target.checked)} className="w-5 h-5 accent-purple-500 rounded border-gray-700 bg-black/50 cursor-pointer" />
                                        <span className="leading-relaxed">إرسال كـ "Data Payload" فقط (لتسهيل المعالجة الخلفية وعرض الصور في أندرويد) ⚙️</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={sending || !title} className="w-full bg-gradient-to-r from-blue-600 to-teal-400 text-white font-black text-xl py-5 rounded-[2rem] shadow-[0_15px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3">
                                {sending ? (
                                    <><BouncingDotsLoader size="sm" colorClass="bg-white" className="ml-2" /> جاري معالجة وإرسال البث...</>
                                ) : (
                                    <><span className="text-2xl">📡</span> بث الإشعار الآن</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="xl:col-span-4">
                    <div className="sticky top-28 bg-[#1f2937] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-purple-500"></div>
                        <h3 className="font-extrabold text-xl text-white mb-6 text-center tracking-wide font-['Lalezar']">دقة المعاينة المباشرة</h3>
                        <p className="text-xs text-gray-400 text-center mb-8 bg-black/30 p-3 rounded-2xl">هكذا سيظهر الإشعار تقريباً على هواتف المستخدمين عند استلامه وهم خارج التطبيق.</p>
                        
                        <div className="relative mx-auto w-[280px] h-[580px] bg-[#0c0c0c] border-[10px] border-black rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-gray-800">
                            {/* Mobile Top Bar */}
                            <div className="absolute top-0 w-full h-6 bg-black flex justify-center items-end pb-1.5 z-50">
                                <div className="w-20 h-4 bg-[#1a1a1a] rounded-full border border-gray-800/50"></div>
                            </div>
                            
                            {/* iPhone Wallpaper Simulation */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/40 to-[#4c1d95]/40 opacity-50 pointer-events-none"></div>
                            
                            <div className="relative z-10 p-4 pt-12 h-full flex flex-col">
                                {/* Clock */}
                                <div className="text-center text-white mb-8">
                                    <h1 className="text-5xl font-light tracking-tighter">09:41</h1>
                                    <p className="text-sm font-medium opacity-80 mt-1">الخميس، 15 رمضان</p>
                                </div>
                                
                                <div className={`border rounded-[1.5rem] shadow-xl animate-fade-in-up overflow-hidden backdrop-blur-2xl transition-all duration-300 ${getAccentPreview(type)}`}>
                                    <div className="flex flex-col bg-[#1c1c1e]/90">
                                        <div className="p-3 flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-black overflow-hidden border border-gray-700/50">
                                                <img src="/android-chrome-192x192.png" className="w-full h-full object-cover p-1" alt="App Icon" onError={(e) => { e.currentTarget.src = 'https://cinematix.watch/android-chrome-192x192.png'; }} />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="text-[11px] font-bold text-gray-200">سينماتيكس</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">الآن</span>
                                                </div>
                                                <h4 className="text-[13px] font-bold text-white truncate leading-tight tracking-wide">{title || 'عنوان الإشعار يظهر هنا'}</h4>
                                                <p className="text-[12px] text-gray-400 line-clamp-2 mt-1 leading-snug">{body || 'نص الرسالة التفصيلي سيظهر في هذا المكان ليوضح للمستخدم المحتوى...'}</p>
                                            </div>
                                        </div>
                                        
                                        {image && (
                                            <div className="w-full h-32 bg-black border-t border-gray-800">
                                                <img src={image} className="w-full h-full object-cover opacity-90" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Bottom Bar */}
                                <div className="mt-auto pb-4 flex justify-center">
                                    <div className="w-1/3 h-1 bg-white/20 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1f2937] rounded-[2.5rem] border border-gray-700/50 shadow-2xl overflow-hidden mt-8">
                <div className="px-8 py-8 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between items-center bg-gray-900/30 gap-4">
                    <h3 className="font-black text-2xl text-white flex items-center gap-3">
                        <span className="bg-gray-800 p-2 rounded-xl border border-gray-700">📜</span> سجل الأرشيف العضوي
                    </h3>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold tracking-wider">آخر عمليات الإرسال</span>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-sm text-right text-gray-300 border-separate border-spacing-y-2">
                        <thead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr><th className="px-6 py-3 font-medium">النوع</th><th className="px-6 py-3 font-medium">منطوق الإشعار</th><th className="px-6 py-3 font-medium text-center">المستلمون</th><th className="px-6 py-3 font-medium">وقت الاستلام</th><th className="px-6 py-3 font-medium text-center">إجراء</th></tr>
                        </thead>
                        <tbody>
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500 text-lg font-medium">لا توجد إشعارات مسجلة.</td>
                                </tr>
                            )}
                            {history.map(item => (
                                <tr key={item.id} className="bg-gray-800/40 hover:bg-gray-700/60 transition-all rounded-2xl group border border-transparent hover:border-gray-600/50">
                                    <td className="px-6 py-4 rounded-r-2xl"><div className="flex items-center gap-2">{getIcon(item.type)}</div></td>
                                    <td className="px-6 py-4">
                                        <p className="font-extrabold text-white text-base mb-1">{item.title}</p>
                                        <p className="text-xs text-gray-400 line-clamp-1 max-w-md">{item.body}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 bg-blue-900/30 border border-blue-800/50 text-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span> {item.recipientCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-400">
                                        <div className="flex flex-col">
                                            <span className="text-white">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px]">{new Date(item.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 rounded-l-2xl text-center">
                                        <button onClick={() => onRequestDelete(item.id, item.title)} className="p-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20" title="حذف من السجل">
                                            <TrashIcon/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NotificationTab;
