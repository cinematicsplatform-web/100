import React from 'react';
import { BellIcon } from '../icons/BellIcon';

interface RadarAlert {
    id: string;
    message: string;
}

const TimerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);

const AlertsTab: React.FC<{alerts: RadarAlert[], onGoToRadar: () => void, onDismiss: (id: string) => void, onClearAll: () => void}> = ({alerts, onGoToRadar, onDismiss, onClearAll}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-[#1f2937] rounded-3xl border border-gray-700/50 overflow-hidden shadow-xl">
                <div className="px-8 py-6 border-b border-gray-700/50 flex justify-between items-center bg-black/10">
                    <div className="flex items-center gap-3">
                        <BellIcon className="w-6 h-6 text-[#00A7F8]" />
                        <h3 className="font-bold text-xl text-white">تنبيهات النشر (التلقائية)</h3>
                    </div>
                    <div className="flex gap-4 items-center">
                        {alerts.length > 0 && (
                            <button onClick={onClearAll} className="text-xs font-black text-red-400 hover:underline">إخفاء الكل</button>
                        )}
                        <button onClick={onGoToRadar} className="text-xs font-bold text-[#00A7F8] hover:underline">إدارة رادار البحث</button>
                    </div>
                </div>
                <div className="p-8">
                    {alerts.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center opacity-30">
                                <BellIcon className="w-10 h-10" />
                            </div>
                            <p className="text-lg font-bold">لا توجد تنبيهات جديدة</p>
                            <p className="text-sm">سيتم إخطارك هنا عند حلول مواعد نشر حلقات المسلسلات المجدولة.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert, i) => (
                                <div key={alert.id} className="flex items-center gap-4 p-5 bg-[#161b22] border border-gray-700 rounded-2xl hover:border-[#00A7F8]/50 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                        <TimerIcon />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-base md:text-lg leading-relaxed">{alert.message}</p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-widest">موعد النشر: الآن</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={onGoToRadar} className="px-5 py-2.5 bg-gray-800 hover:bg-[#00A7F8] hover:text-black rounded-xl text-xs font-black transition-all shadow-md">نشر الآن</button>
                                        <button onClick={() => onDismiss(alert.id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-xl transition-all" title="إخفاء">✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertsTab;
