import React, { useState, useEffect, useMemo } from 'react';
import { getServers, addServer, updateServer, deleteServer, db } from '../../firebase';
import type { GlobalServer, Content } from '../../types';
import { 
    Server, Globe, Database, Pencil, Trash2, RefreshCw, Layers, 
    CheckCircle2, AlertTriangle, Play, Search, WifiOff, Activity, 
    Settings, Info, FileText, Unlink
} from 'lucide-react';

interface ServersManagementTabProps {
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    onServersChanged?: () => void;
}

const ServersManagementTab: React.FC<ServersManagementTabProps> = ({ addToast, onServersChanged }) => {
    const [servers, setServers] = useState<GlobalServer[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [name, setName] = useState('');
    const [baseDomain, setBaseDomain] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [domainSuggestion, setDomainSuggestion] = useState<string | null>(null);

    // Live Health Checks state
    const [healthStatus, setHealthStatus] = useState<Record<string, 'checking' | 'online' | 'blocked_cors' | 'offline'>>({});
    const [checkingAll, setCheckingAll] = useState(false);

    // Migration state
    const [migrationServerId, setMigrationServerId] = useState('');
    const [migrating, setMigrating] = useState(false);
    const [showMigrationUI, setShowMigrationUI] = useState(false);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [currentSeriesName, setCurrentSeriesName] = useState('');
    const [totalToProcess, setTotalToProcess] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    const [migrationSuccessCount, setMigrationSuccessCount] = useState(0);
    const [migrationSkippedCount, setMigrationSkippedCount] = useState(0);
    const [migrationFailedCount, setMigrationFailedCount] = useState(0);
    
    const [logFilter, setLogFilter] = useState<'all' | 'success' | 'skipped' | 'failed'>('all');
    const [migrationLogs, setMigrationLogs] = useState<{
        id: string; title: string; status: 'success' | 'skipped' | 'failed'; message: string; timestamp: string;
    }[]>([]);

    // Linked Series per Server state
    const [expandedServerId, setExpandedServerId] = useState<string | null>(null);
    const [linkedContent, setLinkedContent] = useState<Record<string, any[]>>({});
    const [loadingLinked, setLoadingLinked] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchServers();
    }, []);

    // Smart Domain Cleanser
    useEffect(() => {
        if (!baseDomain) {
            setDomainSuggestion(null);
            return;
        }
        try {
            if (baseDomain.includes('.mp4') || baseDomain.includes('.m3u8') || baseDomain.includes('?') || (baseDomain.match(/\//g) || []).length > 3) {
                const urlObj = new URL(baseDomain.startsWith('http') ? baseDomain : 'https://' + baseDomain);
                const suggestedPath = `${urlObj.protocol}//${urlObj.host}/`;
                setDomainSuggestion(suggestedPath !== baseDomain ? suggestedPath : null);
            } else {
                setDomainSuggestion(null);
            }
        } catch (e) {
            setDomainSuggestion(null);
        }
    }, [baseDomain]);

    const fetchServers = async () => {
        setLoading(true);
        try {
            const data = await getServers();
            setServers(data);
            triggerHealthChecks(data);
        } catch (e) {
            addToast("فشل جلب سيرفرات البث.", "error");
        }
        setLoading(false);
    };

    const triggerHealthChecks = async (serversList: GlobalServer[]) => {
        if (serversList.length === 0) return;
        setCheckingAll(true);
        
        const initialStatus: Record<string, any> = {};
        serversList.forEach(s => initialStatus[s.id] = 'checking');
        setHealthStatus(initialStatus);

        await Promise.all(serversList.map(async (server) => {
            try {
                let targetUrl = server.baseDomain.startsWith('http') ? server.baseDomain : 'https://' + server.baseDomain;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);

                await fetch(targetUrl, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
                clearTimeout(timeoutId);
                setHealthStatus(prev => ({ ...prev, [server.id]: 'online' }));
            } catch (err: any) {
                setHealthStatus(prev => ({ ...prev, [server.id]: err.name === 'AbortError' ? 'blocked_cors' : 'offline' }));
            }
        }));
        setCheckingAll(false);
    };

    const toggleExpandServer = async (serverId: string) => {
        if (expandedServerId === serverId) {
            setExpandedServerId(null);
            return;
        }
        setExpandedServerId(serverId);
        if (!linkedContent[serverId]) {
            setLoadingLinked(prev => ({ ...prev, [serverId]: true }));
            try {
                const snap = await db.collection('content').where('autoLinkConfig.serverId', '==', serverId).get();
                const list = snap.docs.map(doc => {
                    const data = doc.data() as Content;
                    let epCount = 0;
                    let ssCount = data.seasons?.length || 0;
                    data.seasons?.forEach(s => epCount += s.episodes?.length || 0);
                    return {
                        id: doc.id,
                        title: data.title || 'محتوى بدون عنوان',
                        type: data.type || 'series',
                        seasonsCount: ssCount,
                        episodesCount: epCount,
                        slug: data.autoLinkConfig?.seriesSlug || ''
                    };
                });
                setLinkedContent(prev => ({ ...prev, [serverId]: list }));
            } catch (err) {
                addToast("حدث خطأ أثناء تحميل السلاسل المرتبطة.", "error");
            } finally {
                setLoadingLinked(prev => ({ ...prev, [serverId]: false }));
            }
        }
    };

    // ميزة جديدة: فك الارتباط المباشر لعمل محدد
    const handleUnlinkContent = async (contentId: string, serverId: string) => {
        if (!confirm("هل أنت متأكد من فك ارتباط هذا العمل عن السيرفر؟")) return;
        try {
            await db.collection('content').doc(contentId).update({
                'autoLinkConfig.serverId': ''
            });
            addToast("تم فك الارتباط بنجاح", "success");
            setLinkedContent(prev => ({
                ...prev,
                [serverId]: prev[serverId].filter(item => item.id !== contentId)
            }));
        } catch (err) {
            addToast("حدث خطأ أثناء فك الارتباط", "error");
        }
    };

    const handleRunMigration = async () => {
        if (!migrationServerId) return addToast("يرجى اختيار السيرفر المستهدف أولاً.", "error");
        const matchedServer = servers.find(s => s.id === migrationServerId);
        if (!matchedServer) return;
        
        if (!confirm(`تحذير: سيتم توحيد الروابط لتعمل على السيرفر "${matchedServer.name}". هل تود المتابعة؟`)) return;

        setMigrating(true);
        setShowMigrationUI(true);
        setMigrationLogs([]);
        setProgressPercentage(0);
        setCurrentSeriesName('جاري التهيئة...');
        setProcessedCount(0); setMigrationSuccessCount(0); setMigrationSkippedCount(0); setMigrationFailedCount(0);

        try {
            const snapshot = await db.collection('content').get();
            const docs = snapshot.docs;
            setTotalToProcess(docs.length);

            if (docs.length === 0) {
                setCurrentSeriesName('قاعدة البيانات فارغة.');
                setMigrating(false);
                return;
            }

            let currentSuccess = 0, currentSkipped = 0, currentFailed = 0;
            const targetBaseDomain = matchedServer.baseDomain;

            for (let i = 0; i < docs.length; i++) {
                const doc = docs[i];
                const data = doc.data() as Content;
                const docTitle = data.title || 'محتوى بدون عنوان';
                setCurrentSeriesName(docTitle);
                await new Promise(resolve => setTimeout(resolve, 30)); // UI Rhythm

                try {
                    let needsUpdate = false;
                    const replaceUrl = (url: string) => {
                        if (!url || !url.startsWith('http')) return url;
                        try {
                            const urlObj = new URL(url);
                            const external = ['youtube.com', 'youtu.be', 'dailymotion.com', 'ok.ru', 'vk.com', 'uqload', 'vimeo.com'];
                            if (external.some(domain => urlObj.hostname.includes(domain))) return url;
                            const cleanBase = targetBaseDomain.endsWith('/') ? targetBaseDomain.slice(0, -1) : targetBaseDomain;
                            const cleanPath = urlObj.pathname.startsWith('/') ? urlObj.pathname : '/' + urlObj.pathname;
                            return cleanBase + cleanPath + urlObj.search;
                        } catch { return url; }
                    };

                    const processServersArray = (serversArr: any[]) => serversArr?.map(srv => {
                        const newUrl = replaceUrl(srv.url);
                        const newDl = srv.downloadUrl ? replaceUrl(srv.downloadUrl) : newUrl;
                        if (newUrl !== srv.url || newDl !== srv.downloadUrl) needsUpdate = true;
                        return { ...srv, url: newUrl, downloadUrl: newDl };
                    }) || [];

                    let updatedRootServers = processServersArray(data.servers || []);
                    let updatedSeasons = (data.seasons || []).map(season => ({
                        ...season,
                        episodes: (season.episodes || []).map(ep => ({ ...ep, servers: processServersArray(ep.servers || []) }))
                    }));

                    let updatedAutoLink = data.autoLinkConfig;
                    if (data.autoLinkConfig && data.autoLinkConfig.serverId !== migrationServerId) {
                        updatedAutoLink = { ...data.autoLinkConfig, serverId: migrationServerId };
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        await db.collection('content').doc(doc.id).update({
                            ...(data.servers && { servers: updatedRootServers }),
                            ...(data.seasons && { seasons: updatedSeasons }),
                            ...(updatedAutoLink && { autoLinkConfig: updatedAutoLink })
                        });
                        currentSuccess++;
                        setMigrationSuccessCount(currentSuccess);
                        logAction(doc.id, docTitle, 'success', `تم تحويل الروابط وربطها بنجاح`);
                    } else {
                        currentSkipped++;
                        setMigrationSkippedCount(currentSkipped);
                        logAction(doc.id, docTitle, 'skipped', `لا توجد تعديلات مطلوبة`);
                    }
                } catch (err: any) {
                    currentFailed++;
                    setMigrationFailedCount(currentFailed);
                    logAction(doc.id, docTitle, 'failed', `فشل التحديث: ${err.message}`);
                }

                setProcessedCount(i + 1);
                setProgressPercentage(Math.round(((i + 1) / docs.length) * 100));
            }
            setCurrentSeriesName('اكتملت العملية بنجاح! 🎉');
            addToast("تم التطبيع بنجاح!", "success");
        } catch (err) {
            addToast("فشلت عملية الترحيل.", "error");
        } finally {
            setMigrating(false);
            if (onServersChanged) onServersChanged();
        }
    };

    const logAction = (id: string, title: string, status: any, msg: string) => {
        setMigrationLogs(prev => [{
            id: `${id}-${Date.now()}`, title, status, message: `[${title}]: ${msg}`, timestamp: new Date().toLocaleTimeString('ar-EG', { hour12: false })
        }, ...prev]);
    };

    const handleEditStart = (server: GlobalServer) => {
        setEditingId(server.id);
        setName(server.name);
        setBaseDomain(server.baseDomain);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !baseDomain.trim()) return addToast("يرجى إكمال البيانات الأساسية.", "error");
        
        let formattedDomain = baseDomain.trim();
        if (!formattedDomain.startsWith('http')) formattedDomain = 'https://' + formattedDomain;
        if (!formattedDomain.endsWith('/')) formattedDomain += '/';

        // Check for duplicates
        const normalizedName = name.trim().toLowerCase();
        const checkClean = formattedDomain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();

        const duplicateMatched = servers.find(gs => {
            if (editingId && gs.id === editingId) return false;
            const isNameMatch = gs.name.trim().toLowerCase() === normalizedName;
            const gsClean = gs.baseDomain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
            const isDomainMatch = gsClean === checkClean;
            return isNameMatch || isDomainMatch;
        });

        if (duplicateMatched) {
            addToast(`عذراً، هذا السيرفر أو النطاق مضاف بالفعل مسبقاً باسم: "${duplicateMatched.name}" وبنطاق "${duplicateMatched.baseDomain}"`, "error");
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await updateServer(editingId, { name: name.trim(), baseDomain: formattedDomain });
                addToast("تم تحديث السيرفر.", "success");
            } else {
                await addServer({ name: name.trim(), baseDomain: formattedDomain });
                addToast("تم إضافة السيرفر بنجاح.", "success");
            }
            setEditingId(null); setName(''); setBaseDomain(''); setDomainSuggestion(null);
            await fetchServers();
        } catch (err) {
            addToast("حدث خطأ أثناء الحفظ.", "error");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string, serverName: string) => {
        if (confirm(`هل أنت متأكد من حذف السيرفر "${serverName}"؟`)) {
            try {
                await deleteServer(id);
                addToast("تم حذف السيرفر.", "success");
                fetchServers();
            } catch (err) { addToast("فشل الحذف.", "error"); }
        }
    };

    const filteredServers = useMemo(() => servers.filter(srv => 
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        srv.baseDomain.toLowerCase().includes(searchQuery.toLowerCase())
    ), [servers, searchQuery]);

    const filteredLogs = useMemo(() => logFilter === 'all' ? migrationLogs : migrationLogs.filter(log => log.status === logFilter), [migrationLogs, logFilter]);

    return (
        <div className="space-y-8 font-['Cairo'] text-right" dir="rtl">
            
            {/* Minimal Bento Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: 'الكل', count: servers.length, icon: Server, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { title: 'متصل', count: Object.values(healthStatus).filter(s => s === 'online' || s === 'blocked_cors').length, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { title: 'مقطوع', count: Object.values(healthStatus).filter(s => s === 'offline').length, icon: WifiOff, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { title: 'الربط التلقائي', count: 'مُفعل', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-400/10', isText: true }
                ].map((stat, i) => (
                    <div key={i} className="bg-black/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                        <div>
                            <p className="text-gray-400 text-xs font-bold">{stat.title}</p>
                            <h4 className={`text-2xl font-black mt-2 font-mono ${stat.color}`}>{stat.count}</h4>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Card */}
                <div className="lg:col-span-4 bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
                            <Settings className="text-blue-400 w-5 h-5" />
                            <h3 className="text-sm font-bold text-white">{editingId ? "تعديل السيرفر" : "إضافة سيرفر جديد"}</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-xs text-gray-400">اسم السيرفر</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: خادم المشغل الأول" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-xs text-gray-400">الدومين الأساسي (Base Domain)</label>
                                <input type="text" value={baseDomain} onChange={(e) => setBaseDomain(e.target.value)} placeholder="https://domain.com/" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm ltr font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-left" />
                                
                                {domainSuggestion && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs mt-2 flex flex-col gap-2">
                                        <div className="flex items-start gap-1.5">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            <span>تم اكتشاف رابط مباشر. هل تريد استخلاص الدومين الأساسي فقط؟</span>
                                        </div>
                                        <button type="button" onClick={() => { setBaseDomain(domainSuggestion); setDomainSuggestion(null); }} className="self-end px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold rounded-lg transition-all">
                                            نعم، استخلص الدومين
                                        </button>
                                    </div>
                                )}

                                {/* Live duplicate detector block */}
                                {(() => {
                                    if (!name.trim() && !baseDomain.trim()) return null;
                                    const normalizedName = name.trim().toLowerCase();
                                    let domainToCheck = baseDomain.trim();
                                    if (domainToCheck) {
                                        if (!domainToCheck.startsWith('http')) domainToCheck = 'https://' + domainToCheck;
                                        if (!domainToCheck.endsWith('/')) domainToCheck += '/';
                                    }
                                    const matched = servers.find(gs => {
                                        if (editingId && gs.id === editingId) return false;
                                        const isNameMatch = normalizedName ? gs.name.trim().toLowerCase() === normalizedName : false;
                                        const gsClean = gs.baseDomain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
                                        const checkClean = domainToCheck ? domainToCheck.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase() : '';
                                        const isDomainMatch = domainToCheck && domainToCheck !== 'https://' ? gsClean === checkClean : false;
                                        return isNameMatch || isDomainMatch;
                                    });

                                    if (!matched) return null;
                                    return (
                                        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-xs flex flex-col gap-2 font-bold animate-pulse mt-3 col-span-2">
                                            <span className="flex items-center gap-1.5">
                                                <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                                                <span>تنبيه: هذا السيرفر مضاف بالفعل بالأسفل!</span>
                                            </span>
                                            <p className="text-[11px] text-gray-300">
                                                موجود مسبقاً باسم: <span className="text-white font-black">"{matched.name}"</span> وبدومين أساسي: <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-mono">{matched.baseDomain}</code>
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={submitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2">
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : (editingId ? "حفظ التعديلات" : "إضافة السيرفر")}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={() => {setEditingId(null); setName(''); setBaseDomain('');}} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all">إلغاء</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Servers List */}
                <div className="lg:col-span-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/[0.02]">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                            القائمة الفعالة <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{filteredServers.length}</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث..." className="w-48 pr-9 pl-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500" />
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <button onClick={() => triggerHealthChecks(servers)} disabled={checkingAll} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-xs text-gray-300 rounded-lg border border-white/10 flex items-center gap-1.5 transition-all">
                                <RefreshCw className={`w-3.5 h-3.5 ${checkingAll ? 'animate-spin text-emerald-400' : ''}`} />
                                فحص
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-gray-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right text-gray-300">
                                <thead className="bg-white/[0.02] text-xs text-gray-500 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 font-normal">الاسم</th>
                                        <th className="px-6 py-4 font-normal">النطاق</th>
                                        <th className="px-6 py-4 font-normal text-center">الحالة</th>
                                        <th className="px-6 py-4 font-normal text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredServers.map(server => (
                                        <React.Fragment key={server.id}>
                                            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-bold text-white text-xs">{server.name}</td>
                                                <td className="px-6 py-4 ltr"><code className="text-xs text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded">{server.baseDomain}</code></td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${healthStatus[server.id] === 'online' || healthStatus[server.id] === 'blocked_cors' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : healthStatus[server.id] === 'offline' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                                        {healthStatus[server.id] === 'online' || healthStatus[server.id] === 'blocked_cors' ? 'متصل' : healthStatus[server.id] === 'offline' ? 'مقطوع' : 'جاري الفحص'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex justify-center gap-2">
                                                    <button onClick={() => toggleExpandServer(server.id)} className={`p-2 rounded-lg transition-all ${expandedServerId === server.id ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}><Database className="w-4 h-4" /></button>
                                                    <button onClick={() => handleEditStart(server)} className="p-2 bg-white/5 text-gray-400 hover:text-blue-400 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(server.id, server.name)} className="p-2 bg-white/5 text-gray-400 hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                            {/* Expanded Content Area */}
                                            {expandedServerId === server.id && (
                                                <tr className="bg-black/20">
                                                    <td colSpan={4} className="p-6 border-b border-white/5">
                                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                                                <h4 className="text-xs font-bold text-white">الأعمال المرتبطة بهذا السيرفر</h4>
                                                            </div>
                                                            {loadingLinked[server.id] ? <div className="text-center text-xs text-gray-400 py-4">جاري التحميل...</div> : !linkedContent[server.id]?.length ? <div className="text-center text-xs text-gray-500 py-4">لا توجد أعمال مرتبطة حالياً.</div> : (
                                                                <table className="w-full text-xs text-right text-gray-400">
                                                                    <thead className="bg-white/5 text-gray-500">
                                                                        <tr>
                                                                            <th className="px-4 py-2 font-normal">العمل</th>
                                                                            <th className="px-4 py-2 font-normal text-center">النوع</th>
                                                                            <th className="px-4 py-2 font-normal">Slug</th>
                                                                            <th className="px-4 py-2 font-normal text-center">إدارة</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {linkedContent[server.id].map(item => (
                                                                            <tr key={item.id} className="border-b border-white/5">
                                                                                <td className="px-4 py-3 font-bold text-white">{item.title}</td>
                                                                                <td className="px-4 py-3 text-center">{item.type === 'movie' ? 'فيلم' : 'مسلسل'}</td>
                                                                                <td className="px-4 py-3 ltr font-mono text-blue-400">{item.slug}</td>
                                                                                <td className="px-4 py-3 text-center">
                                                                                    <button onClick={() => handleUnlinkContent(item.id, server.id)} title="فك الارتباط" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-all">
                                                                                        <Unlink className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Migration Engine */}
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h4 className="font-bold text-white text-sm">محرك دمج وتوحيد الروابط (Smart Normalization Engine)</h4>
                        <p className="text-xs text-gray-500 mt-1">قم بنقل كافة الروابط الثابتة القديمة لتعمل ديناميكياً مع النطاق الجديد.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <select value={migrationServerId} onChange={(e) => setMigrationServerId(e.target.value)} disabled={migrating} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                        <option value="">-- حدد السيرفر المستهدف لتوحيد الروابط --</option>
                        {servers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.baseDomain})</option>)}
                    </select>
                    <button onClick={handleRunMigration} disabled={migrating} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                        {migrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {migrating ? "جاري المعالجة..." : "بدء التوحيد"}
                    </button>
                </div>

                {showMigrationUI && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between text-xs text-gray-400 font-mono">
                            <span>{currentSeriesName}</span>
                            <span className="text-emerald-400">{progressPercentage}% ({processedCount}/{totalToProcess})</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        
                        {/* Terminal Logs */}
                        <div className="h-48 bg-black/60 border border-white/5 rounded-lg p-3 overflow-y-auto font-mono text-[10px] space-y-1.5 ltr text-left">
                            {migrationLogs.map(log => (
                                <div key={log.id} className={`p-1.5 rounded flex justify-between ${log.status === 'success' ? 'text-emerald-400' : log.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                                    <span>{log.message}</span>
                                    <span className="opacity-50">{log.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServersManagementTab;