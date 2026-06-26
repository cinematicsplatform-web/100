import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Content, Server, Season, Episode, Category, Genre, GlobalServer, AutoLinkConfig } from '@/types';
import { ContentType, genres } from '@/types';
import { db, generateSlug, getPeople, savePerson, getServers, getAllContent, addServer } from '@/firebase';  
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ToggleSwitch from './ToggleSwitch';
import * as XLSX from 'xlsx';
import UqloadSearchModal from './UqloadSearchModal';
import DailymotionSearchModal from './DailymotionSearchModal';
import YouTubeSearchModal from './YouTubeSearchModal';
import VkSearchModal from './VkSearchModal';
import { normalizeText } from '@/utils/textUtils';
import ActionButtons from './ActionButtons';
import { StarIcon } from './icons/StarIcon';
import { ClockIcon } from './icons/ClockIcon';
import VideoPlayer from './VideoPlayer';
import { BouncingDotsLoader } from './BouncingDotsLoader';

// --- PREMIUM ICONS ---
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const LayersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);
const ServerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.072 0 2.065.49 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>
);
const ExitIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.414 6.811 7.272 4.125 12 4.125s8.586 2.686 9.964 7.553a1.012 1.012 0 0 1 0 .644C20.586 17.189 16.728 19.875 12 19.875s-8.586-2.686-9.964-7.553Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
const FamilyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11.35l-1.45-1.32C8.4 8 7 9.5 7 11.5c0 1.1.9 2 2 2 .35 0 .69-.07 1-.18.31.11.65.18 1 .18 1.1 0 2-.9 2-2 0-2-1.4-3.5-3.55-5.18L12 11.35z" fill="currentColor" stroke="none"/> 
    </svg>
);
const AdultIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);
const CheckSmallIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" {...props}>
        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
    </svg>
);
const CloudArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3.01 3.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);
const ExcelIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653z" />
    </svg>
);
const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 0-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const LanguageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
    </svg>
);
const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);

const StackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

// --- New Icon for Notifications ---
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

// --- New Icon for Auto Links ---
const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);

// --- REFINED STYLES ---
const INPUT_BG = "bg-[#161b22]"; 
const BORDER_COLOR = "border-gray-700/50";
const FOCUS_RING = "focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]";

const inputClass = `w-full ${INPUT_BG} border ${BORDER_COLOR} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none ${FOCUS_RING} transition-all duration-300 text-sm shadow-sm`;
const labelClass = "block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide";
const sectionBoxClass = "bg-[#0f1014] p-4 md:p-8 rounded-2xl border border-gray-800 shadow-xl";

// --- HELPERS ---
const getRowValue = (row: any, ...candidates: string[]) => {
    const rowKeys = Object.keys(row);
    for (const candidate of candidates) {
        if (row[candidate] !== undefined && row[row[candidate]] !== null) return row[candidate];
        const foundKey = rowKeys.find(k => k.trim().toLowerCase() === candidate.trim().toLowerCase());
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) return row[foundKey];
    }
    return null;
};

const SEARCH_CATEGORIES = [
    'مصري', 'عربي', 'تركي', 'أجنبي', 'برامج',
    'رومانسي', 'عائلي', 'كوميديا', 'دراما', 'أكشن',
    'جريمة', 'خيال علمي', 'رعب', 'تركي مدبلج', 'مسرح', 'قريباً'
];

interface MobileSimulatorProps {
    imageUrl: string;
    posX: number;
    posY: number;
    onUpdateX: (val: number) => void;
    onUpdateY: (val: number) => void;
    contentData: Content; 
    children?: React.ReactNode;
}

const MobileSimulator: React.FC<MobileSimulatorProps> = ({ imageUrl, posX, posY, onUpdateX, onUpdateY, contentData, children }) => {
    const cropClass = contentData.enableMobileCrop ? 'mobile-custom-crop' : '';
    const imgStyle: React.CSSProperties = { 
        '--mob-x': `${posX}%`, 
        '--mob-y': `${posY}%`,
        objectPosition: `${posX}% ${posY}%`
    } as React.CSSProperties;
    
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startPercentageRef = useRef({ x: posX, y: posY });

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsPanning(true);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        startPercentageRef.current = { x: posX, y: posY };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPanning || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = e.clientX - startPosRef.current.x;
        const deltaY = e.clientY - startPosRef.current.y;

        const sensitivity = 0.5;
        let newX = startPercentageRef.current.x - (deltaX / rect.width) * 100 * sensitivity;
        let newY = startPercentageRef.current.y - (deltaY / rect.height) * 100 * sensitivity;

        newX = Math.max(0, Math.min(100, Math.round(newX)));
        newY = Math.max(0, Math.min(100, Math.round(newY)));

        onUpdateX(newX);
        onUpdateY(newY);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsPanning(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
        <div className="mt-6 flex flex-col items-center gap-12 rounded-3xl border border-gray-800 bg-[#080a0f] p-4 md:p-8 md:flex-row md:items-start shadow-2xl">
            <div className="relative mx-auto flex-shrink-0 md:mx-0">
                <div 
                    ref={containerRef}
                    className="relative overflow-hidden rounded-[3rem] border-[10px] border-[#1f2127] bg-black shadow-2xl ring-1 ring-white/10 select-none touch-none scale-90 md:scale-100 origin-top"
                    style={{ width: '300px', height: '620px', cursor: isPanning ? 'grabbing' : 'grab' }} 
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    {children ? children : (
                        <div className="h-full bg-[#141b29] overflow-y-auto no-scrollbar scroll-smooth flex flex-col pointer-events-none">
                            <div className="relative h-[440px] w-full flex-shrink-0">
                                <img 
                                    src={imageUrl || 'https://placehold.co/1080x1920/101010/101010/png'} 
                                    className={`absolute inset-0 h-full w-full object-cover ${cropClass} object-top transition-none`}
                                    style={imgStyle}
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#141b29] via-[#141b29]/40 via-30% to-transparent z-10"></div>
                                
                                <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 pb-8 text-white text-center pointer-events-none">
                                    {contentData.bannerNote && (
                                        <div className="mb-2 mx-auto text-[10px] font-bold bg-[#6366f1]/80 text-white border border-[#6366f1]/30 px-2 py-0.5 rounded backdrop-blur-md w-fit">
                                            {contentData.bannerNote}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        {contentData.isLogoEnabled && contentData.logoUrl ? (
                                            <img src={contentData.logoUrl} className="max-w-[160px] max-h-[100px] object-contain drop-shadow-2xl mx-auto" alt="" />
                                        ) : (
                                            <h1 className="text-2xl font-black drop-shadow-lg leading-tight">{contentData.title || 'العنوان'}</h1>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-200 mb-4 font-bold">
                                        <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                                            <StarIcon className="w-2.5 h-2.5" />
                                            <span>{contentData.rating.toFixed(1)}</span>
                                        </div>
                                        <span>•</span>
                                        <span>{contentData.releaseYear}</span>
                                        <span>•</span>
                                        <span className="px-1 border border-gray-500 rounded text-[8px]">{contentData.ageRating || 'G'}</span>
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <div className="flex-1 bg-[var(--color-accent)] text-black h-10 rounded-full flex items-center justify-center font-black text-xs gap-2">
                                            <PlayIcon className="w-3 h-3 fill-black" />
                                            شاهد الآن
                                        </div>
                                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center font-bold text-lg">+</div>
                                    </div>
                                </div>
                                <div 
                                    className="absolute z-50 w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                                    style={{ left: `${posX}%`, top: `${posY}%` }}
                                >
                                    <div className="w-full h-full relative">
                                        <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                                        <div className="absolute left-1/2 top-0 w-px h-full bg-white"></div>
                                        <div className="absolute inset-0 border-2 border-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="sticky top-0 z-30 bg-[#141b29]/95 backdrop-blur-md border-b border-white/5 flex gap-4 px-4 h-12 items-center flex-shrink-0">
                                <div className="text-[10px] font-black border-b-2 border-[var(--color-accent)] py-3 text-white">الحلقات</div>
                                <div className="text-[10px] font-black text-gray-500 py-3">التفاصيل</div>
                                <div className="text-[10px] font-black text-gray-500 py-3">أعمال مشابهة</div>
                            </div>
                            <div className="p-4 space-y-4 flex-1">
                                <p className="text-[11px] text-gray-400 leading-relaxed text-justify line-clamp-4">
                                    {contentData.description || 'قصة العمل تظهر هنا...'}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-right">
                                        <span className="block text-[8px] text-gray-500 font-bold uppercase mb-1">المخرج</span>
                                        <span className="text-[10px] font-bold text-gray-300 truncate block">{contentData.director || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-right">
                                        <span className="block text-[8px] text-gray-500 font-bold uppercase mb-1">التقييم</span>
                                        <span className="text-[10px] font-bold text-yellow-400">★ {contentData.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-0 left-1/2 z-30 h-7 w-36 -translate-x-1/2 rounded-b-2xl bg-[#1f2127] pointer-events-none"></div>
                    <div className="absolute top-3 right-6 z-30 h-3 w-3 rounded-full bg-gray-600/30 pointer-events-none"></div>
                    <div className="absolute bottom-2 left-1/2 z-30 h-1 w-32 -translate-x-1/2 rounded-full bg-white/20 pointer-events-none"></div>
                </div>
                <div className="mt-6 text-center font-mono text-xs text-gray-500 uppercase tracking-[0.2em]">Mobile Preview</div>
            </div>

            <div className="flex w-full flex-1 flex-col gap-8 pt-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">تخصيص العرض للجوال</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            تحكم دقيق في نقطة تركيز الصورة (Focal Point) لتظهر بشكل مثالي على صفحة العرض الرسمية في الجوال. 
                            المعاينة أمامك هي نسخة طبق الأصل لما سيراه المستخدم النهائي. يمكنك السحب مباشرة على صورة الجوال للتحريك.
                        </p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => { onUpdateX(50); onUpdateY(50); }}
                        className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-bold rounded-lg border border-gray-700 hover:bg-gray-700 transition-all shadow-sm"
                    >
                        إعادة ضبط
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-800 bg-[#161b22] p-6 shadow-lg transition-all hover:border-gray-700">
                        <label className="mb-4 flex justify-between text-sm font-bold text-gray-300">
                            <span className="flex items-center gap-2">↔️ الإزاحة الأفقية (X-Axis)</span>
                            <span className="font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 rounded-md">{posX}%</span>
                        </label>
                        <div className="relative h-6 flex items-center">
                            <input 
                                type="range" min="0" max="100" step="1"
                                value={posX}
                                onChange={(e) => onUpdateX(Number(e.target.value))}
                                className="absolute w-full h-2 rounded-lg bg-gray-700 accent-[var(--color-accent)] hover:accent-blue-400 cursor-grab active:cursor-grabbing appearance-none z-10"
                            />
                        </div>
                        <div className="mt-3 flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                            <span>Left</span>
                            <span>Right</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-[#161b22] p-6 shadow-lg transition-all hover:border-gray-700">
                        <label className="mb-4 flex justify-between text-sm font-bold text-gray-300">
                            <span className="flex items-center gap-2">↕️ الإزاحة العمودية (Y-Axis)</span>
                            <span className="font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 rounded-md">{posY}%</span>
                        </label>
                        <div className="relative h-6 flex items-center">
                            <input 
                                type="range" min="0" max="100" step="1"
                                value={posY}
                                onChange={(e) => onUpdateY(Number(e.target.value))}
                                className="absolute w-full h-2 rounded-lg bg-gray-700 accent-[var(--color-accent)] hover:accent-blue-400 cursor-grab active:cursor-grabbing appearance-none z-10"
                            />
                        </div>
                         <div className="mt-3 flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                            <span>Top</span>
                            <span>Bottom</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    tmdbId: string;
    type: ContentType; 
    targetField: 'poster' | 'backdrop' | 'logo';
    onSelect: (url: string) => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ isOpen, onClose, tmdbId, type, targetField, onSelect }) => {
    const [images, setImages] = useState<{ posters: any[], backdrops: any[], logos: any[] }>({ posters: [], backdrops: [], logos: [] });
    const [loading, setLoading] = useState(false);
    const [filterLang, setFilterLang] = useState<string>('all'); 

    const activeTab = useMemo(() => {
        if (targetField === 'poster') return 'posters';
        if (targetField === 'logo') return 'logos';
        return 'backdrops';
    }, [targetField]);

    const API_KEY = 'b8d66e320b334f4d56728d98a7e39697';

    useEffect(() => {
        if (isOpen && tmdbId) {
            fetchImages();
        }
    }, [isOpen, tmdbId]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const endpointType = (type === ContentType.Movie || type === ContentType.Play || type === ContentType.Concert) ? 'movie' : 'tv';
            const res = await fetch(`https://api.themoviedb.org/3/${endpointType}/${tmdbId}/images?api_key=${API_KEY}&include_image_language=ar,en,null`);
            const data = await res.json();
            setImages({
                posters: data.posters || [],
                backdrops: data.backdrops || [],
                logos: data.logos || []
            });
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    const displayedImages = useMemo(() => {
        const list = images[activeTab] || [];
        if (filterLang === 'all') return list;
        if (filterLang === 'null') return list.filter((img: any) => img.iso_639_1 === null);
        return list.filter((img: any) => img.iso_639_1 === filterLang);
    }, [images, activeTab, filterLang]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-[#0f1014] shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-800 bg-[#161b22] px-4 md:px-6 py-4">
                    <h3 className="flex items-center gap-3 text-lg md:text-xl font-bold text-white">
                        <PhotoIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-accent)]"/>
                        معرض الصور 
                        <span className="hidden sm:inline rounded bg-[var(--color-accent)]/10 px-2 py-0.5 text-xs text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                            {activeTab === 'posters' ? 'بوسترات' : activeTab === 'logos' ? 'شعارات' : 'خلفيات'}
                        </span>
                    </h3>
                    <div className="flex items-center gap-2 md:gap-3">
                        <select 
                            value={filterLang} 
                            onChange={(e) => setFilterLang(e.target.value)}
                            className="rounded-lg border border-gray-700 bg-black px-3 py-2 text-xs text-white focus:border-[var(--color-accent)] focus:outline-none"
                        >
                            <option value="all">كل اللغات</option>
                            <option value="ar">العربية (AR)</option>
                            <option value="en">الإنجليزية (EN)</option>
                            <option value="null">بدون نص (Clean)</option>
                        </select>
                        <button onClick={onClose} className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-red-500 hover:text-white">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto bg-[#0a0a0a] p-4 md:p-6">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-gray-500">جاري تحميل الصور...</div>
                    ) : displayedImages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-gray-500">لا توجد صور مطابقة للفلتر المحدد.</div>
                    ) : (
                        <div className={`grid gap-4 md:gap-6 ${activeTab === 'posters' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3'}`}>
                            {displayedImages.map((img: any, idx: number) => (
                                <div key={idx} onClick={() => { onSelect(`https://image.tmdb.org/t/p/original${img.file_path}`); onClose(); }} className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10">
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
                                        loading="lazy" 
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        alt=""
                                    />
                                    <div className="absolute top-2 right-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md border border-white/10">
                                        {img.iso_639_1?.toUpperCase() || 'NO-TEXT'}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                                        <span className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black shadow-lg">اختيار</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end border-t border-gray-800 bg-[#161b22] p-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-2 text-sm font-bold text-red-400 transition-all hover:bg-red-500 hover:text-white"
                    >
                        <CloseIcon className="h-4 w-4" />
                        إغلاق المعرض
                    </button>
                </div>
            </div>
        </div>
    );
};

interface TitleGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    tmdbId: string;
    type: ContentType;
    onSelect: (title: string) => void;
}

const TitleGalleryModal: React.FC<TitleGalleryModalProps> = ({ isOpen, onClose, tmdbId, type, onSelect }) => {
    const [titles, setTitles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const API_KEY = 'b8d66e320b334f4d56728d98a7e39697';

    useEffect(() => {
        if (isOpen && tmdbId) {
            fetchTitles();
        }
    }, [isOpen, tmdbId]);

    const fetchTitles = async () => {
        setLoading(true);
        try {
            const endpointType = (type === ContentType.Movie || type === ContentType.Play || type === ContentType.Concert) ? 'movie' : 'tv';
            
            const infoRes = await fetch(`https://api.themoviedb.org/3/${endpointType}/${tmdbId}?api_key=${API_KEY}&language=ar-SA`);
            const info = await infoRes.json();
            
            const results: any[] = [];
            
            if (info.title) results.push({ title: info.title, iso_3166_1: 'Primary (AR)', type: 'Main' });
            if (info.name) results.push({ title: info.name, iso_3166_1: 'Primary (AR)', type: 'Main' });
            if (info.original_title && info.original_title !== info.title) results.push({ title: info.original_title, iso_3166_1: info.original_language?.toUpperCase() || 'Original', type: 'Original' });
            if (info.original_name && info.original_name !== info.name) results.push({ title: info.original_name, iso_3166_1: info.original_language?.toUpperCase() || 'Original', type: 'Original' });

            const altRes = await fetch(`https://api.themoviedb.org/3/${endpointType}/${tmdbId}/alternative_titles?api_key=${API_KEY}`);
            const altData = await altRes.json();
            
            if (altData.titles || altData.results) {
                const altList = altData.titles || altData.results;
                altList.forEach((item: any) => {
                    if (!results.some(r => r.title === (item.title || item.name))) {
                        results.push({
                            title: item.title || item.name,
                            iso_3166_1: item.iso_3166_1 || 'Alt',
                            type: 'Alternative'
                        });
                    }
                });
            }

            setTitles(results);
        } catch (error) {
            console.error("Error fetching titles:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-[#0f1014] shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-800 bg-[#161b22] px-6 py-4">
                    <h3 className="flex items-center gap-3 text-xl font-bold text-white">
                        <LanguageIcon className="w-6 h-6 text-[var(--color-accent)]"/>
                        عناوين بديلة
                    </h3>
                    <button onClick={onClose} className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-red-500 hover:text-white">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto bg-[#0a0a0a] p-6 space-y-3">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-gray-500">جاري تحميل العناوين...</div>
                    ) : titles.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-gray-500">لا توجد عناوين بديلة متاحة.</div>
                    ) : (
                        titles.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => { onSelect(item.title); onClose(); }} 
                                className="group flex items-center justify-between p-4 bg-[#161b22] hover:bg-[#1f2937] border border-gray-800 hover:border-[var(--color-accent)] rounded-xl cursor-pointer transition-all shadow-md"
                            >
                                <div className="flex flex-col text-right">
                                    <span className="text-white font-bold text-lg group-hover:text-[var(--color-accent)] transition-colors">{item.title}</span>
                                    <span className="text-xs text-gray-500 font-mono mt-1">{item.type} • {item.iso_3166_1}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlusIcon className="w-5 h-5 text-[var(--color-accent)]" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end border-t border-gray-800 bg-[#161b22] p-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-gray-700"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ServerManagementModalProps {
    episode: Episode;
    onClose: () => void;
    onSave: (servers: Server[]) => void;
    globalServers: GlobalServer[];
    onRefreshGlobalServers: () => Promise<void>;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const ServerManagementModal: React.FC<ServerManagementModalProps> = ({ 
    episode, 
    onClose, 
    onSave,
    globalServers,
    onRefreshGlobalServers,
    addToast
}) => {
    const isMovieMode = episode.title === 'الفيلم';
    const [servers, setServers] = useState<Server[]>(() => {
        const existing = [...(episode.servers || [])];
        if (existing.length === 0) {
            existing.push({ id: Date.now(), name: 'سيرفر 1', url: '', downloadUrl: '', isActive: true });
        }
        return existing;
    });

    const [isUqloadModalOpen, setIsUqloadModalOpen] = useState(false);
    const [isDailymotionModalOpen, setIsDailymotionModalOpen] = useState(false);
    const [isVkModalOpen, setIsVkModalOpen] = useState(false);

    // إضافة خادم جديد يدوياً
    const [isNewServerFormOpen, setIsNewServerFormOpen] = useState(false);
    const [newServerName, setNewServerName] = useState('');
    const [newServerDomain, setNewServerDomain] = useState('');
    const [isSavingNewServer, setIsSavingNewServer] = useState(false);

    const handleServerChange = (index: number, field: keyof Server, value: string | boolean) => {
        const updatedServers = [...servers];
        updatedServers[index] = { ...updatedServers[index], [field]: value };
        setServers(updatedServers);
    };

    const handleAddServer = () => {
        setServers([...servers, { 
            id: Date.now() + servers.length, 
            name: `سيرفر ${servers.length + 1}`, 
            url: '', 
            downloadUrl: '', 
            isActive: true 
        }]);
    };

    const handleRemoveServer = (index: number) => {
        if (servers.length <= 1) {
            handleServerChange(0, 'url', '');
            handleServerChange(0, 'downloadUrl', '');
            return;
        }
        setServers(servers.filter((_, i) => i !== index));
    };

    const handleSaveServers = () => {
        const serversToSave = servers.filter(s => (s.url && s.url.trim() !== '') || (s.downloadUrl && s.downloadUrl.trim() !== ''));
        onSave(serversToSave);
        onClose();
    };

    const handleAddGlobalServerDirectly = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newServerName.trim()) {
            addToast("يرجى إدخال اسم خادم البث.", "error");
            return;
        }

        let domain = newServerDomain.trim();
        if (!domain) {
            domain = "https://";
        } else {
            if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
                domain = 'https://' + domain;
            }
            if (!domain.endsWith('/')) {
                domain += '/';
            }
        }

        // Check for duplicates in globalServers
        const normalizedName = newServerName.trim().toLowerCase();
        const checkClean = domain && domain !== 'https://' 
            ? domain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase() 
            : '';

        const duplicateMatched = globalServers.find(gs => {
            const isNameMatch = gs.name.trim().toLowerCase() === normalizedName;
            const gsClean = gs.baseDomain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
            const isDomainMatch = checkClean ? gsClean === checkClean : false;
            return isNameMatch || isDomainMatch;
        });

        if (duplicateMatched) {
            addToast(`هذا السيرفر مضاف بالفعل باسم: "${duplicateMatched.name}". تم اختياره واعتماده تلقائياً!`, "info");
            
            // Auto-select / auto-fill this server into the active row
            const updatedServers = [...servers];
            const emptyIndex = updatedServers.findIndex(s => !s.url && !s.downloadUrl);
            if (emptyIndex !== -1) {
                updatedServers[emptyIndex] = { ...updatedServers[emptyIndex], name: duplicateMatched.name };
            } else {
                updatedServers.push({
                    id: Date.now() + updatedServers.length,
                    name: duplicateMatched.name,
                    url: '',
                    downloadUrl: '',
                    isActive: true
                });
            }
            setServers(updatedServers);
            setNewServerName('');
            setNewServerDomain('');
            setIsNewServerFormOpen(false);
            return;
        }

        setIsSavingNewServer(true);
        try {
            await addServer({
                name: newServerName.trim(),
                baseDomain: domain
            });
            await onRefreshGlobalServers();
            addToast(`تم إضافة السيرفر "${newServerName}" بنجاح كخادم رسمي باللوحة 🚀`, "success");
            setNewServerName('');
            setNewServerDomain('');
            setIsNewServerFormOpen(false);
        } catch (error) {
            console.error(error);
            addToast("حدث خطأ أثناء إضافة السيرفر الجديد.", "error");
        } finally {
            setIsSavingNewServer(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[220] bg-[#07080b]/98 backdrop-blur-md overflow-y-auto font-['Cairo'] text-right flex flex-col p-4 md:p-8" dir="rtl" onClick={onClose}>
            <div className="w-full max-w-4xl mx-auto flex-1 bg-[#10121a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-2 md:my-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                
                {/* Header Section */}
                <div className="flex flex-row items-center justify-between border-b border-gray-800 bg-[#131622] px-6 py-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#121c2c] rounded-lg text-sky-400">
                            <ServerIcon className="w-5 h-5"/>
                        </div>
                        <h3 className="text-sm md:text-base font-black text-white">
                            <span>إدارة السيرفرات: </span>
                            <span className="text-[#00e5c9]">{episode.title}</span>
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* VK and Dailymotion and Uqload buttons inside header */}
                        <button 
                            type="button" 
                            onClick={() => setIsUqloadModalOpen(true)} 
                            className="flex items-center gap-1.5 rounded-lg bg-[#121c2c] border border-blue-500/20 px-2.5 py-1 text-[10px] font-bold text-blue-400 transition-all hover:bg-[#18263a] cursor-pointer"
                        >
                            <span>Uqload</span>
                            <SearchIcon className="w-3 h-3"/>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsDailymotionModalOpen(true)} 
                            className="flex items-center gap-1.5 rounded-lg bg-[#19152b] border border-purple-500/20 px-2.5 py-1 text-[10px] font-bold text-purple-400 transition-all hover:bg-[#251f3d] cursor-pointer"
                        >
                            <span className="font-sans">Daily</span>
                            <span>📺</span>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsVkModalOpen(true)} 
                            className="flex items-center gap-1.5 rounded-lg bg-[#111c33] border border-blue-500/20 px-2.5 py-1 text-[10px] font-sans font-black text-blue-400 transition-all hover:bg-[#162747] cursor-pointer"
                        >
                            <span>VK</span>
                        </button>

                        <div className="h-4 w-px bg-gray-800 mx-1"></div>

                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-white bg-[#1b1e2a] hover:bg-[#25293a] p-1.5 rounded-lg transition-all cursor-pointer"
                        >
                            <CloseIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>

                {/* Main Content List / Canvas */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 bg-[#07080c]">
                    {servers.map((server, index) => {
                        return (
                            <div key={index} className="relative rounded-2xl border border-[#1f2538] bg-[#11131c] p-5 space-y-4 transition-colors shadow-lg animate-fade-in-up">
                                {/* Delete Row Button */}
                                {servers.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveServer(index)}
                                        className="absolute top-4 left-4 text-gray-500 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-800"
                                        title="حذف السيرفر"
                                    >
                                        <CloseIcon className="h-4 w-4" />
                                    </button>
                                )}

                                {/* Name and State Selection */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded bg-[#07090e] border border-gray-800 font-mono text-[10px] font-bold text-gray-400">
                                            {index + 1}
                                        </span>
                                        
                                        <input 
                                            type="text"
                                            value={server.name} 
                                            onChange={(e) => handleServerChange(index, 'name', e.target.value)} 
                                            placeholder="اسم السيرفر" 
                                            className="rounded-lg border border-gray-850 bg-[#07090e] px-4 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold w-44 text-center"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={server.isActive} 
                                                onChange={(e) => handleServerChange(index, 'isActive', e.target.checked)} 
                                                className="h-4 w-4 accent-[#00e5c9] rounded bg-[#07090e] border-gray-800 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-[#2196f3] select-none">نشط</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Links Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">رابط المشاهدة (WATCH)</label>
                                        <input 
                                            type="text"
                                            value={server.url} 
                                            onChange={(e) => handleServerChange(index, 'url', e.target.value)} 
                                            placeholder="رابط كامل للمشاهدة أو امتداد البث..." 
                                            className="w-full rounded-xl border border-gray-800 bg-[#07090e] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono text-center placeholder:text-center"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">رابط التحميل (DOWNLOAD)</label>
                                        <input 
                                            type="text"
                                            value={server.downloadUrl} 
                                            onChange={(e) => handleServerChange(index, 'downloadUrl', e.target.value)} 
                                            placeholder="رابط التحميل المباشر للزوار..." 
                                            className="w-full rounded-xl border border-gray-800 bg-[#07090e] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono text-center placeholder:text-center"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                {/* Smart domain extraction support for quick save */}
                                {(() => {
                                    const isFullUrl = server.url && (server.url.includes('.mp4') || server.url.includes('.m3u8') || server.url.includes('?') || (server.url.match(/\//g) || []).length > 3);
                                    if (!isFullUrl) return null;
                                    try {
                                        const urlObj = new URL(server.url.startsWith('http') ? server.url : 'https://' + server.url);
                                        const host = urlObj.hostname.replace('www.', '');
                                        const domainOnly = `${urlObj.protocol}//${urlObj.host}/`;
                                        const rawName = host.split('.')[0];
                                        const serverNameDefault = rawName.charAt(0).toUpperCase() + rawName.slice(1);
                                        
                                        const isAlreadyRegistered = globalServers.some(gs => gs.baseDomain.includes(host) || gs.name.toLowerCase() === serverNameDefault.toLowerCase());
                                        
                                        return (
                                            <div className="bg-[#121c2a] border border-blue-500/20 text-blue-300 p-3 rounded-lg text-[10px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1 font-bold animate-pulse">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1 px-2 rounded bg-blue-500/10 text-blue-400 text-[8px] font-mono">ذكاء المحرك ⚡</span>
                                                    <span>مستضيف مكشوف: <b className="font-mono text-emerald-400">{host}</b></span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            handleServerChange(index, 'name', serverNameDefault);
                                                            addToast(`تم اعتماد اسم السيرفر: "${serverNameDefault}"`, "info");
                                                        }} 
                                                        className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 rounded transition-colors text-[9px]"
                                                    >
                                                        اعتماد الاسم ({serverNameDefault})
                                                    </button>
                                                    {!isAlreadyRegistered && (
                                                        <button 
                                                            type="button" 
                                                            onClick={async () => {
                                                                try {
                                                                    await addServer({ name: serverNameDefault, baseDomain: domainOnly });
                                                                    await onRefreshGlobalServers();
                                                                    handleServerChange(index, 'name', serverNameDefault);
                                                                    addToast(`تم حفظ "${serverNameDefault}" كخادم رسمي دائم!`, "success");
                                                                } catch (e) {
                                                                    addToast("حدث خطأ في التسجيل.", "error");
                                                                }
                                                            }} 
                                                            className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-450 rounded transition-colors text-[9px] flex items-center gap-1"
                                                        >
                                                            💾 حفظ كخادم دائم
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    } catch {
                                        return null;
                                    }
                                })()}
                            </div>
                        );
                    })}

                    <button 
                        type="button"
                        onClick={handleAddServer}
                        className="flex w-full items-center justify-center gap-2 border border-dashed border-[#1f2538] bg-[#11131c]/50 hover:bg-[#11131c]/80 transition-all font-bold cursor-pointer rounded-xl py-3.5 text-xs text-gray-400 hover:border-green-500/50 hover:text-[#00e5c9]"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>إضافة سيرفر جديد</span>
                    </button>
                </div>

                {/* Footer Section */}
                <div className="flex justify-end gap-3 border-t border-gray-800 bg-[#0e1017] p-5">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="rounded-lg bg-[#242a3a] hover:bg-[#2e3549] px-6 py-2.5 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
                    >
                        إلغاء
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSaveServers} 
                        className="rounded-lg bg-[#00e5c9] hover:bg-[#00cba9] px-10 py-2.5 text-xs font-bold text-black transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                        حفظ التغييرات
                    </button>
                </div>
            </div>

            {isUqloadModalOpen && (
                <UqloadSearchModal 
                    isOpen={isUqloadModalOpen} 
                    onClose={() => setIsUqloadModalOpen(false)} 
                    onSelect={(res) => { 
                        const newServer: Server = { id: Date.now(), name: 'Uqload', url: res.embedUrl, downloadUrl: res.downloadUrl, isActive: true };
                        setServers(prev => [...prev, newServer]);
                    }} 
                />
            )}
            {isDailymotionModalOpen && (
                <DailymotionSearchModal 
                    isOpen={isDailymotionModalOpen} 
                    onClose={() => setIsDailymotionModalOpen(false)} 
                    onSelect={(res) => { 
                        const newServer: Server = { id: Date.now(), name: 'Dailymotion', url: res.embedUrl, downloadUrl: '', isActive: true };
                        setServers(prev => [...prev, newServer]);
                    }} 
                />
            )}
            {isVkModalOpen && (
                <VkSearchModal 
                    isOpen={isVkModalOpen}
                    onClose={() => setIsVkModalOpen(false)} 
                    onSelect={(res) => {
                        const newServer: Server = { id: Date.now(), name: 'VK Video', url: res.embedUrl, downloadUrl: res.downloadUrl, isActive: true };
                        setServers(prev => [...prev, newServer]);
                    }}
                />
            )}
        </div>
    );
};

const getCleanedSlug = (slug: string): string => {
    if (!slug) return '';
    if (slug.endsWith('/')) return slug;
    
    // Check if the slug ends with an episode prefix pattern or symbol
    const pattern = /[._\-\s/]([Ee]|[Ee][Pp]|[Hh])$/;
    const endsWithSeparator = /[._\-]$/;
    
    if (pattern.test(slug) || endsWithSeparator.test(slug)) {
        return slug;
    }
    return slug + '/';
};

interface ContentEditModalProps {
    content: Content | null;
    onClose: () => void; 
    onSave: (content: Content) => void;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ContentEditModal: React.FC<ContentEditModalProps> = ({ content, onClose, onSave, addToast }) => {
    const isNewContent = content === null;
    const [activeTab, setActiveTab] = useState('general');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Scheduling & Notification States ---
    const [showSchedulingUI, setShowSchedulingUI] = useState(false);
    const [episodeSchedulingState, setEpisodeSchedulingState] = useState<{
        isOpen: boolean;
        seasonId: number | null;
        episodeId: number | null;
        currentDate: string;
        notifyUsers: boolean;
        notifyAdmins: boolean;
    }>({ isOpen: false, seasonId: null, episodeId: null, currentDate: '', notifyUsers: true, notifyAdmins: true });

    // --- NEW: Auto-Link Generation State ---
    const [autoLinkState, setAutoLinkState] = useState<{
        isOpen: boolean;
        seasonId: number | null;
        serverId: string;
        seriesSlug: string;
        prefix: string;
        suffix: string;
        startNum: number | '';
        endNum: number | '';
        padZero: boolean;
        padTwoZeros: boolean;
    }>({ isOpen: false, seasonId: null, serverId: '', seriesSlug: '', prefix: '', suffix: '.mp4', startNum: '', endNum: '', padZero: true, padTwoZeros: false });

    // --- Auto-Link Modal: New Server Registration States ---
    const [autoLinkNewServerOpen, setAutoLinkNewServerOpen] = useState(false);
    const [autoLinkNewServerName, setAutoLinkNewServerName] = useState('');
    const [autoLinkNewServerDomain, setAutoLinkNewServerDomain] = useState('');
    const [autoLinkNewServerSaving, setAutoLinkNewServerSaving] = useState(false);

    const [globalServers, setGlobalServers] = useState<GlobalServer[]>([]);
    const [allContentList, setAllContentList] = useState<Content[]>([]);
    const [relatedSearchQuery, setRelatedSearchQuery] = useState('');

    useEffect(() => {
        getServers().then(setGlobalServers).catch(err => {
            console.error("Failed to load global servers in ContentEditModal:", err);
        });
        getAllContent(true).then(setAllContentList).catch(err => {
            console.error("Failed to load all content in ContentEditModal:", err);
        });
    }, []);

    // --- NEW: Video Preview State ---
    const [previewVideoState, setPreviewVideoState] = useState<{
        isOpen: boolean;
        url: string;
        title: string;
        poster: string;
    }>({ isOpen: false, url: '', title: '', poster: '' });

    const getDefaultFormData = (): Content => ({
        id: '', tmdbId: '', title: '', description: '', type: ContentType.Movie, poster: '', top10Poster: '', backdrop: '', horizontalPoster: '', mobileBackdropUrl: '',
        rating: 0, ageRating: '', categories: [], genres: [], releaseYear: new Date().getFullYear(), cast: [],
        visibility: 'general', seasons: [], servers: [], bannerNote: '', createdAt: '',
        logoUrl: '', isLogoEnabled: false, trailerUrl: '', duration: '', enableMobileCrop: false, 
        mobileCropPositionX: 50, mobileCropPositionY: 50, 
        slug: '',
        director: '', writer: '',
        isUpcoming: false,
        // Global Content Scheduling (Movies/Series level)
        isScheduled: false,
        scheduledAt: '',
        notifyOnPublish: true, // New: Notify when main content drops
        flipBackdrop: false,
        ...content,
    });

    const [formData, setFormData] = useState<Content>(getDefaultFormData());
    const [editingServersForEpisode, setEditingServersForEpisode] = useState<Episode | null>(null);
    const [isManagingMovieServers, setIsManagingMovieServers] = useState<boolean>(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!content?.slug);
    const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
    
    const [castQuery, setCastQuery] = useState('');
    const [castResults, setCastResults] = useState<any[]>([]);
    const [isSearchingCast, setIsSearchingCast] = useState(false);

    const [youTubeSearchState, setYouTubeSearchState] = useState<{ isOpen: boolean; targetId: 'main' | number | null }>({ isOpen: false, targetId: null });

    const [galleryState, setGalleryState] = useState<{
        isOpen: boolean;
        imageType: 'poster' | 'backdrop' | 'logo';
        onSelect: (url: string) => void;
    }>({ isOpen: false, imageType: 'poster', onSelect: () => {} });

    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);

    const globalFileInputRef = useRef<HTMLInputElement>(null);
    const movieExcelInputRef = useRef<HTMLInputElement>(null);
    
    // --- BULK ACTION STATES ---
    const [bulkActionState, setBulkActionState] = useState<{
        isOpen: boolean;
        type: 'add' | 'delete';
        seasonId: number | null;
        startFrom: number | '';
        endTo: number | '';
    }>({ isOpen: false, type: 'add', seasonId: null, startFrom: '', endTo: '' });

    const [deleteSeasonState, setDeleteSeasonState] = useState<{
        isOpen: boolean;
        seasonId: number | null;
        title: string;
    }>({ isOpen: false, seasonId: null, title: '' });

    const [deleteEpisodeState, setDeleteEpisodeState] = useState<{
        isOpen: boolean;
        seasonId: number | null;
        episodeId: number | null;
        title: string;
    }>({ isOpen: false, seasonId: null, episodeId: null, title: '' });

    const [clearSeasonServersState, setClearSeasonServersState] = useState<{
        isOpen: boolean;
        seasonId: number | null;
        title: string;
    }>({ isOpen: false, seasonId: null, title: '' });

    // --- BULK EPISODE IMAGE STATE ---
    const [bulkImageState, setBulkImageState] = useState<{
        isOpen: boolean;
        seasonId: number | null;
        imageUrl: string;
        applyRange: 'all' | 'range';
        fromEpisodes: number | '';
        toEpisodes: number | '';
    }>({
        isOpen: false,
        seasonId: null,
        imageUrl: '',
        applyRange: 'all',
        fromEpisodes: '',
        toEpisodes: ''
    });

    // --- BULK EPISODE SERVER NAMES STATE ---
    const [bulkServerNamesState, setBulkServerNamesState] = useState<{
        isOpen: boolean;
        seasonId: number | null;
        serverNames: string[];
        applyRange: 'all' | 'range';
        fromEpisodes: number | '';
        toEpisodes: number | '';
    }>({
        isOpen: false,
        seasonId: null,
        serverNames: ['', '', ''],
        applyRange: 'all',
        fromEpisodes: '',
        toEpisodes: ''
    });

    const [tmdbIdInput, setTmdbIdInput] = useState(content?.id && !isNaN(Number(content.id)) ? content.id : '');
    const [fetchLoading, setFetchLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false); 
    const [enableAutoLinks, setEnableAutoLinks] = useState(false);
    const API_KEY = 'b8d66e320b334f4d56728d98a7e39697';

    const [tmdbSearchMode, setTmdbSearchMode] = useState<'id' | 'name'>('name');
    const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
    const [tmdbSearchResults, setTmdbSearchResults] = useState<any[]>([]);
    const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);

    const isEpisodic = formData.type === ContentType.Series || formData.type === ContentType.Program;
    const isStandalone = !isEpisodic;

    // Helper to safely extract episode number from a title
    const extractEpisodeNumber = (title: string | undefined): number => {
        if (!title) return 0;
        const englishNumeralTitle = title.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
        const explicitMatch = englishNumeralTitle.match(/(?:الحلقة|حلقة|ep|episode|الـحـلـقـة|الفصل|فصل|الاخيرة|الأخيرة)\s*(\d+)/i);
        if (explicitMatch && explicitMatch[1]) return parseInt(explicitMatch[1], 10);
        const digits = englishNumeralTitle.match(/\d+/g);
        if (digits && digits.length > 0) return parseInt(digits[0], 10);
        return 0;
    };

    useEffect(() => {
        let initData = getDefaultFormData();
        if (initData.mobileCropPosition !== undefined && initData.mobileCropPositionX === undefined) {
            initData.mobileCropPositionX = initData.mobileCropPosition;
        }
        
        if (!initData.tmdbId && initData.id && !isNaN(Number(initData.id))) {
            initData.tmdbId = initData.id;
        }

        // --- FIX START: Check for expired schedules (Episode Level) ---
        if (initData.seasons && initData.seasons.length > 0) {
            const now = new Date();
            initData = {
                ...initData,
                seasons: initData.seasons.map(season => ({
                    ...season,
                    episodes: season.episodes.map(ep => {
                        if (ep.isScheduled && ep.scheduledAt) {
                            const scheduledTime = new Date(ep.scheduledAt).getTime();
                            if (scheduledTime < now.getTime()) {
                                return { 
                                    ...ep, 
                                    isScheduled: false, 
                                    scheduledAt: ''
                                };
                            }
                        }
                        return ep;
                    })
                }))
            };
        }
        // --- FIX END ---

        // --- FIX Check for expired schedules (Content Level) ---
        if (initData.isScheduled && initData.scheduledAt) {
            const now = new Date();
            const scheduledTime = new Date(initData.scheduledAt).getTime();
            if (scheduledTime < now.getTime()) {
                initData.isScheduled = false;
                initData.scheduledAt = '';
            }
        }

        setFormData(initData);
        setSlugManuallyEdited(!!content?.slug);
        setTmdbIdInput(content?.id && !isNaN(Number(content.id)) ? content.id : '');
        setShowSchedulingUI(initData.isScheduled || false);
    }, [content]);

    useEffect(() => {
        if (isEpisodic && formData.seasons?.length === 1) {
            setFormData(prev => {
                const season = prev.seasons![0];
                const updatedSeason = {
                    ...season,
                    poster: prev.poster,
                    backdrop: prev.backdrop,
                    horizontalPoster: prev.horizontalPoster,
                    logoUrl: prev.logoUrl,
                    mobileImageUrl: prev.mobileBackdropUrl,
                    enableMobileCrop: prev.enableMobileCrop,
                    mobileCropPositionX: prev.mobileCropPositionX,
                    mobileCropPositionY: prev.mobileCropPositionY,
                    trailerUrl: prev.trailerUrl,
                    description: prev.description,
                    releaseYear: prev.releaseYear,
                    isUpcoming: prev.isUpcoming,
                    flipBackdrop: prev.flipBackdrop
                };
                
                const isChanged = 
                    season.poster !== updatedSeason.poster ||
                    season.backdrop !== updatedSeason.backdrop ||
                    season.horizontalPoster !== updatedSeason.horizontalPoster ||
                    season.logoUrl !== updatedSeason.logoUrl ||
                    season.mobileImageUrl !== updatedSeason.mobileImageUrl ||
                    season.enableMobileCrop !== updatedSeason.enableMobileCrop ||
                    season.mobileCropPositionX !== updatedSeason.mobileCropPositionX ||
                    season.mobileCropPositionY !== updatedSeason.mobileCropPositionY || 
                    season.trailerUrl !== updatedSeason.trailerUrl ||
                    season.description !== updatedSeason.description ||
                    season.releaseYear !== updatedSeason.releaseYear ||
                    season.isUpcoming !== updatedSeason.isUpcoming ||
                    season.flipBackdrop !== updatedSeason.flipBackdrop;

                if (!isChanged) return prev;

                return {
                    ...prev,
                    seasons: [updatedSeason]
                };
            });
        }
    }, [
        isEpisodic,
        formData.seasons?.length,
        formData.poster,
        formData.backdrop,
        formData.horizontalPoster,
        formData.logoUrl,
        formData.mobileBackdropUrl,
        formData.enableMobileCrop,
        formData.mobileCropPositionX,
        formData.mobileCropPositionY,
        formData.trailerUrl,
        formData.description,
        formData.releaseYear,
        formData.isUpcoming,
        formData.flipBackdrop
    ]);

    const openGallery = (type: 'poster' | 'backdrop' | 'logo', callback: (url: string) => void) => {
        const idToUse = formData.tmdbId || formData.id;
        if (!idToUse) {
            addToast("يرجى جلب بيانات المحتوى أولاً (ID مطلوب) لفتح المعرض.", "info");
            return;
        }
        setGalleryState({ isOpen: true, imageType: type, onSelect: callback });
    };

    const openTitleGallery = () => {
        const idToUse = formData.tmdbId || formData.id;
        if (!idToUse) {
            addToast("يرجى جلب بيانات المحتوى أولاً (ID مطلوب) لفتح قائمة العناوين.", "info");
            return;
        }
        setIsTitleModalOpen(true);
    };

    const handleDeleteSection = (tabId: string) => {
        if (!confirm(`هل أنت متأكد من حذف (تصفير) بيانات قسم "${tabId}" بالكامل؟`)) return;
        
        setFormData(prev => {
            const updated = { ...prev };
            switch (tabId) {
                case 'general':
                    updated.title = '';
                    updated.description = '';
                    updated.releaseYear = new Date().getFullYear();
                    updated.rating = 0;
                    updated.director = '';
                    updated.writer = '';
                    updated.cast = [];
                    updated.bannerNote = '';
                    updated.isUpcoming = false;
                    break;
                case 'categories':
                    updated.categories = [];
                    updated.genres = [];
                    break;
                case 'media':
                    updated.poster = '';
                    updated.backdrop = '';
                    updated.logoUrl = '';
                    updated.isLogoEnabled = false;
                    updated.trailerUrl = '';
                    updated.mobileBackdropUrl = '';
                    updated.enableMobileCrop = false;
                    updated.flipBackdrop = false;
                    break;
                case 'seasons':
                    updated.seasons = [];
                    break;
                case 'servers':
                    updated.servers = [];
                    break;
            }
            return updated;
        });
        addToast(`تم تصفير بيانات قسم ${tabId} بنجاح.`, 'info');
    };

    const openBulkActionModal = (seasonId: number, type: 'add' | 'delete') => {
        setBulkActionState({
            isOpen: true,
            type,
            seasonId,
            startFrom: '',
            endTo: ''
        });
    };

    const executeBulkAction = () => {
        const { type, seasonId, startFrom, endTo } = bulkActionState;
        if (!seasonId) return;
        
        const sFrom = typeof startFrom === 'number' ? startFrom : 1;
        const eTo = typeof endTo === 'number' ? endTo : 1;

        if (eTo < sFrom) {
            addToast("رقم البداية يجب أن يكون أصغر من أو يساوي رقم النهاية.", "error");
            return;
        }

        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(season => {
                if (season.id !== seasonId) return season;

                let updatedEpisodes = [...(season.episodes || [])];

                if (type === 'add') {
                    const newEpisodes: Episode[] = [];
                    for (let i = sFrom; i <= eTo; i++) {
                        const exists = updatedEpisodes.some(ep => extractEpisodeNumber(ep.title) === i);
                        if (!exists) {
                            newEpisodes.push({
                                id: Date.now() + i + Math.random(),
                                title: `الحلقة ${i}`,
                                duration: '',
                                description: `شاهد أحداث الحلقة ${i} من الموسم ${season.seasonNumber}.`,
                                thumbnail: season.backdrop || prev.backdrop || '',
                                progress: 0,
                                servers: []
                            });
                        }
                    }
                    updatedEpisodes = [...updatedEpisodes, ...newEpisodes];
                } else {
                    updatedEpisodes = updatedEpisodes.filter(ep => {
                        const epNum = extractEpisodeNumber(ep.title);
                        return epNum < sFrom || epNum > eTo;
                    });
                }

                updatedEpisodes.sort((a, b) => {
                    const numA = extractEpisodeNumber(a.title);
                    const numB = extractEpisodeNumber(b.title);
                    return numA - numB;
                });

                return { ...season, episodes: updatedEpisodes };
            })
        }));

        addToast(type === 'add' ? `تم إضافة الحلقات من ${sFrom} إلى ${eTo} بنجاح.` : `تم حذف الحلقات من ${sFrom} إلى ${eTo} بنجاح.`, "success");
        setBulkActionState(prev => ({ ...prev, isOpen: false }));
    };

    // --- BULK EPISODE IMAGES FUNCTIONS ---
    const openBulkImageModal = (seasonId: number) => {
        const season = formData.seasons?.find(s => s.id === seasonId);
        const totalEps = season?.episodes?.length || 1;
        setBulkImageState({
            isOpen: true,
            seasonId,
            imageUrl: season?.backdrop || formData.backdrop || formData.poster || '',
            applyRange: 'all',
            fromEpisodes: 1,
            toEpisodes: totalEps
        });
    };

    const executeApplyBulkImage = () => {
        const { seasonId, imageUrl, applyRange, fromEpisodes, toEpisodes } = bulkImageState;
        if (!seasonId) return;

        if (!imageUrl.trim()) {
            addToast("يرجى إدخال رابط الصورة بشكل صحيح.", "error");
            return;
        }

        const sFrom = typeof fromEpisodes === 'number' ? fromEpisodes : 1;
        const eTo = typeof toEpisodes === 'number' ? toEpisodes : 1;

        if (applyRange === 'range' && eTo < sFrom) {
            addToast("رقم الحلقة النهائية يجب أن يكون أكبر من أو يساوي الحلقة الابتدائية.", "error");
            return;
        }

        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(season => {
                if (season.id !== seasonId) return season;

                const updatedEpisodes = (season.episodes || []).map((ep) => {
                    const epNum = extractEpisodeNumber(ep.title);
                    let shouldApply = false;
                    if (applyRange === 'all') {
                        shouldApply = true;
                    } else {
                        shouldApply = epNum >= sFrom && epNum <= eTo;
                    }

                    if (shouldApply) {
                        return { ...ep, thumbnail: imageUrl.trim() };
                    }
                    return ep;
                });

                return { ...season, episodes: updatedEpisodes };
            })
        }));

        addToast("تم تحديث صور الحلقات المحددة بنجاح!", "success");
        setBulkImageState(prev => ({ ...prev, isOpen: false }));
    };

    // --- BULK EPISODE SERVER NAMES FUNCTIONS ---
    const openBulkServerNamesModal = (seasonId: number) => {
        const season = formData.seasons?.find(s => s.id === seasonId);
        const totalEps = season?.episodes?.length || 1;
        
        // Try to pre-populate with existing server names from the first episode if available
        const firstEp = season?.episodes?.[0];
        const defaultNames: string[] = [];
        if (firstEp && firstEp.servers && firstEp.servers.length > 0) {
            firstEp.servers.forEach((srv) => {
                defaultNames.push(srv.name || '');
            });
        }
        
        while (defaultNames.length < 3) {
            defaultNames.push('');
        }

        setBulkServerNamesState({
            isOpen: true,
            seasonId,
            serverNames: defaultNames,
            applyRange: 'all',
            fromEpisodes: 1,
            toEpisodes: totalEps
        });
    };

    const handleAddServerNameField = () => {
        setBulkServerNamesState(prev => ({
            ...prev,
            serverNames: [...prev.serverNames, '']
        }));
    };

    const handleRemoveServerNameField = (index: number) => {
        setBulkServerNamesState(prev => {
            const updated = [...prev.serverNames];
            if (updated.length <= 1) return prev;
            updated.splice(index, 1);
            return { ...prev, serverNames: updated };
        });
    };

    const handleServerNameChange = (index: number, val: string) => {
        setBulkServerNamesState(prev => {
            const updated = [...prev.serverNames];
            updated[index] = val;
            return { ...prev, serverNames: updated };
        });
    };

    const executeApplyBulkServerNames = () => {
        const { seasonId, serverNames, applyRange, fromEpisodes, toEpisodes } = bulkServerNamesState;
        if (!seasonId) return;

        const hasName = serverNames.some(name => name && name.trim() !== '');
        if (!hasName) {
            addToast("يرجى إدخال اسم واحد على الأقل لتسمية السيرفرات.", "error");
            return;
        }

        const sFrom = typeof fromEpisodes === 'number' ? fromEpisodes : 1;
        const eTo = typeof toEpisodes === 'number' ? toEpisodes : 1;

        if (applyRange === 'range' && eTo < sFrom) {
            addToast("رقم الحلقة النهائية يجب أن يكون أكبر من أو يساوي الحلقة الابتدائية.", "error");
            return;
        }

        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(season => {
                if (season.id !== seasonId) return season;

                const updatedEpisodes = (season.episodes || []).map((ep) => {
                    const epNum = extractEpisodeNumber(ep.title);
                    let shouldApply = false;
                    if (applyRange === 'all') {
                        shouldApply = true;
                    } else {
                        shouldApply = epNum >= sFrom && epNum <= eTo;
                    }

                    if (shouldApply && ep.servers && ep.servers.length > 0) {
                        const updatedServers = ep.servers.map((srv, idx) => {
                            const newName = serverNames[idx];
                            if (newName && newName.trim() !== '') {
                                return { ...srv, name: newName.trim() };
                            }
                            return srv;
                        });
                        return { ...ep, servers: updatedServers };
                    }
                    return ep;
                });

                return { ...season, episodes: updatedEpisodes };
            })
        }));

        addToast("تم تحديث وتسمية سيرفرات الحلقات بنجاح!", "success");
        setBulkServerNamesState(prev => ({ ...prev, isOpen: false }));
    };

    // --- NEW: Auto-Link Generation Functions ---
    const openAutoLinkModal = (seasonId: number) => {
        const config = formData.autoLinkConfig; 
        setAutoLinkState({
            isOpen: true,
            seasonId,
            serverId: config?.serverId || '',
            seriesSlug: config?.seriesSlug || '',
            prefix: '',
            suffix: config?.suffix || '.mp4',
            startNum: '',
            endNum: '',
            padZero: config ? config.padZero : true,
            padTwoZeros: config ? config.padTwoZeros : false
        });
    };

    const executeAutoLinkGeneration = () => {
        const { seasonId, serverId, seriesSlug, suffix, startNum, endNum, padZero, padTwoZeros } = autoLinkState;
        if (!seasonId) return;

        const sNum = typeof startNum === 'number' ? startNum : 1;
        const eNum = typeof endNum === 'number' ? endNum : 1;

        if (eNum < sNum) {
            addToast("رقم البداية يجب أن يكون أصغر من أو يساوي رقم النهاية.", "error");
            return;
        }
        if (!serverId) {
            addToast("يرجى اختيار سيرفر البث.", "error");
            return;
        }
        if (!seriesSlug.trim()) {
            addToast("مسار / اسم السلسلة مطلوب.", "error");
            return;
        }

        const matchedServer = globalServers.find(s => s.id === serverId);
        if (!matchedServer) {
            addToast("السيرفر المحدد غير موجود.", "error");
            return;
        }

        const baseDomain = matchedServer.baseDomain || '';

        setFormData(prev => {
            const updatedSeasons = (prev.seasons || []).map(season => {
                if (season.id !== seasonId) return season;

                let updatedEpisodes = [...(season.episodes || [])];

                for (let i = sNum; i <= eNum; i++) {
                    let numStr = `${i}`;
                    if (padTwoZeros) {
                        numStr = i < 10 ? `00${i}` : (i < 100 ? `0${i}` : `${i}`);
                    } else if (padZero) {
                        numStr = i < 10 ? `0${i}` : `${i}`;
                    }

                    const cleanedSlug = getCleanedSlug(seriesSlug);
                    const cleanBaseDomain = baseDomain.endsWith('/') ? baseDomain.slice(0, -1) : baseDomain;
                    const generatedUrl = `${cleanBaseDomain}/${cleanedSlug}${numStr}${suffix}`;

                    const existingEpIndex = updatedEpisodes.findIndex(ep => extractEpisodeNumber(ep.title) === i);
                    
                    let nextServerNum = 1;
                    if (existingEpIndex !== -1) {
                        nextServerNum = (updatedEpisodes[existingEpIndex].servers?.length || 0) + 1;
                    }

                    const newServer: Server = {
                        id: Date.now() + i + Math.random(),
                        name: `سيرفر ${nextServerNum}`,
                        url: generatedUrl,
                        downloadUrl: generatedUrl,
                        isActive: true
                    };

                    if (existingEpIndex !== -1) {
                        updatedEpisodes[existingEpIndex] = {
                            ...updatedEpisodes[existingEpIndex],
                            servers: [...(updatedEpisodes[existingEpIndex].servers || []), newServer]
                        };
                    } else {
                        updatedEpisodes.push({
                            id: Date.now() + i + Math.random(),
                            title: `الحلقة ${i}`,
                            duration: '',
                            description: `شاهد أحداث الحلقة ${i} من الموسم ${season.seasonNumber}.`,
                            thumbnail: season.backdrop || prev.backdrop || '',
                            progress: 0,
                            servers: [newServer],
                            isScheduled: false,
                            scheduledAt: ''
                        });
                    }
                }

                updatedEpisodes.sort((a, b) => {
                    const numA = extractEpisodeNumber(a.title);
                    const numB = extractEpisodeNumber(b.title);
                    return numA - numB;
                });

                return { ...season, episodes: updatedEpisodes };
            });

            return {
                ...prev,
                seasons: updatedSeasons,
                autoLinkConfig: {
                    serverId,
                    seriesSlug,
                    suffix,
                    padZero,
                    padTwoZeros
                }
            };
        });

        addToast(`تم توليد روابط وإضافة/تحديث الحلقات من ${sNum} إلى ${eNum} بنجاح.`, "success");
        setAutoLinkState(prev => ({ ...prev, isOpen: false }));
    };
    // --- END NEW AUTO-LINK FUNCTIONS ---

    const renderImageInput = (
        label: string, 
        value: string | undefined, 
        onChange: (val: string) => void,
        galleryType: 'poster' | 'backdrop' | 'logo',
        placeholder: string = "https://...",
        previewClass: string = "w-12 h-16"
    ) => (
        <div>
            <label className={labelClass}>{label}</label>
            <div className="flex items-stretch gap-2">
                <input 
                    type="text" 
                    value={value || ''} 
                    onChange={(e) => onChange(e.target.value)} 
                    className={`${inputClass} flex-1 dir-ltr`} 
                    placeholder={placeholder} 
                />
                <button 
                    type="button" 
                    onClick={() => openGallery(galleryType, onChange)} 
                    className="flex items-center justify-center rounded-lg bg-gray-800 px-4 text-white shadow-md transition-all hover:bg-gray-700 hover:text-[var(--color-accent)] border border-gray-700" 
                    title="اختر من المعرض"
                >
                    <PhotoIcon className="w-5 h-5"/>
                </button>
                {value && (
                    <div className={`${previewClass} bg-black flex-shrink-0 overflow-hidden rounded-lg border border-gray-700 shadow-sm`}>
                        <img src={value} className="h-full w-full object-cover" alt="preview" />
                    </div>
                )}
            </div>
        </div>
    );

    const searchCast = async (query: string) => {
        setCastQuery(query);
        if (query.length < 2) {
            setCastResults([]);
            return;
        }
        setIsSearchingCast(true);
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ar-SA`);
            const data = await res.json();
            if (data.results) {
                setCastResults(data.results);
            }
        } catch (error) {
            console.error("Cast Search Error:", error);
        } finally {
            setIsSearchingCast(false);
        }
    };

    const addCastMember = (person: any) => {
        if (!formData.cast.includes(person.name)) {
            setFormData(prev => ({ ...prev, cast: [...prev.cast, person.name] }));
        }
        setCastQuery('');
        setCastResults([]);
    };

    const removeCastMember = (name: string) => {
        setFormData(prev => ({ ...prev, cast: prev.cast.filter(c => c !== name) }));
    };

    const generateEpisodeServers = (tmdbId: string, seasonNum: number, episodeNum: number): Server[] => {
         const epServers: Server[] = [];
         if (enableAutoLinks) {
             const vipUrl = `https://vidsrc.vip/embed/tv/${tmdbId}/${seasonNum}/${episodeNum}`;
             epServers.push({
                 id: 80000 + episodeNum,
                 name: 'سيرفر 1',
                 url: vipUrl,
                 downloadUrl: vipUrl,
                 isActive: true
             });
         }
         return epServers;
    };

    const generateMovieServers = (tmdbId: string): Server[] => {
        const movieServers: Server[] = [];
        if (enableAutoLinks) {
            const vipUrl = `https://vidsrc.vip/embed/movie/${tmdbId}`;
            movieServers.push({
                id: 99901,
                name: 'سيرفر 1',
                url: vipUrl,
                downloadUrl: vipUrl,
                isActive: true
            });
        }
        return movieServers;
    };
    const searchTMDB = async () => {
        if (!tmdbSearchQuery.trim()) return;
        setIsSearchingTMDB(true);
        setTmdbSearchResults([]);

        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(tmdbSearchQuery)}&language=ar-SA&page=1&include_adult=false`);
            const data = await res.json();
            
            if (data.results) {
                const filtered = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
                setTmdbSearchResults(filtered);
            }
        } catch (e) {
            console.error("TMDB Search Error:", e);
            addToast("حدث خطأ أثناء البحث في TMDB.", "error");
        } finally {
            setIsSearchingTMDB(false);
        }
    };

    const handleComprehensiveUpdate = async () => {
        const idToUse = formData.tmdbId || formData.id;

        if (!idToUse) {
            addToast('يجب أن يكون للمحتوى كود TMDB للتحقق من التحديثات.', "info");
            return;
        }
        setUpdateLoading(true);

        try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${idToUse}?api_key=${API_KEY}&language=ar-SA`);
            
            if(!res.ok) {
                if (res.status === 404) throw new Error("لم يتم العثور على المسلسل في TMDB. تأكد من صحة كود TMDB.");
                throw new Error("فشل الاتصال بـ TMDB");
            }
            
            const details = await res.json();

            let hasUpdates = false;
            let currentSeasons = [...(formData.seasons || [])];
            const backdrop = formData.backdrop || '';

            const validTmdbSeasons = details.seasons.filter((s:any) => s.season_number > 0);

            for (const tmdbSeason of validTmdbSeasons) {
                let existingSeasonIndex = currentSeasons.findIndex(s => s.seasonNumber === tmdbSeason.season_number);

                if (existingSeasonIndex === -1) {
                    const sRes = await fetch(`https://api.themoviedb.org/3/tv/${idToUse}/season/${tmdbSeason.season_number}?api_key=${API_KEY}&language=ar-SA`);
                    const sData = await sRes.json();
                    
                    const mappedEpisodes: Episode[] = sData.episodes?.map((ep: any) => {
                        let epDuration = '';
                        if (ep.runtime) {
                            if(ep.runtime > 60) epDuration = `${Math.floor(ep.runtime/60)}h ${ep.runtime%60}m`;
                            else epDuration = `${ep.runtime}:00`;
                        }
                        
                        const fixedTitle = `الحلقة ${ep.episode_number}`;
                        const isGenericTitle = !ep.name || ep.name.match(/^Episode \d+$/i) || ep.name.match(/^الحلقة \d+$/i);
                        let finalDescription = ep.overview || `شاهد أحداث الحلقة ${ep.episode_number} من الموسم ${sData.season_number}.`;
                        if (!isGenericTitle && ep.name) finalDescription = `${ep.name} : ${ep.overview || ''}`;

                        return {
                            id: Date.now() + ep.episode_number + Math.random(),
                            title: fixedTitle,
                            description: finalDescription,
                            thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : backdrop, 
                            duration: epDuration,
                            progress: 0,
                            servers: generateEpisodeServers(String(idToUse), sData.season_number, ep.episode_number)
                        };
                    }) || [];

                    currentSeasons.push({
                        id: Date.now() + Math.random(),
                        seasonNumber: tmdbSeason.season_number,
                        title: sData.name || `الموسم ${tmdbSeason.season_number}`,
                        releaseYear: sData.air_date ? new Date(sData.air_date).getFullYear() : new Date().getFullYear(),
                        description: sData.overview,
                        poster: sData.poster_path ? `https://image.tmdb.org/t/p/w500${sData.poster_path}` : formData.poster,
                        backdrop: backdrop,
                        mobileImageUrl: '', 
                        logoUrl: '',
                        isUpcoming: false,
                        flipBackdrop: false,
                        episodes: mappedEpisodes
                    });
                    hasUpdates = true;

                } else {
                    const existingSeason = currentSeasons[existingSeasonIndex];
                    
                    if (tmdbSeason.episode_count > (existingSeason.episodes?.length || 0)) {
                        const sRes = await fetch(`https://api.themoviedb.org/3/tv/${idToUse}/season/${tmdbSeason.season_number}?api_key=${API_KEY}&language=ar-SA`);
                        const sData = await sRes.json();
                        
                        const currentCount = existingSeason.episodes?.length || 0;
                        const newEpisodesData = sData.episodes.slice(currentCount);
                        
                        if (newEpisodesData.length > 0) {
                            const newMappedEpisodes: Episode[] = newEpisodesData.map((ep: any) => {
                                let epDuration = '';
                                if (ep.runtime) {
                                    if(ep.runtime > 60) epDuration = `${Math.floor(ep.runtime/60)}h ${ep.runtime%60}m`;
                                    else epDuration = `${ep.runtime}:00`;
                                }

                                const fixedTitle = `الحلقة ${ep.episode_number}`;
                                const isGenericTitle = !ep.name || ep.name.match(/^Episode \d+$/i) || ep.name.match(/^الحلقة \d+$/i);
                                let finalDescription = ep.overview || `شاهد أحداث الحلقة ${ep.episode_number} من الموسم ${tmdbSeason.season_number}.`;
                                if (!isGenericTitle && ep.name) finalDescription = `${ep.name} : ${ep.overview || ''}`;

                                return {
                                    id: Date.now() + ep.episode_number + Math.random(),
                                    title: fixedTitle,
                                    description: finalDescription,
                                    thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : (existingSeason.backdrop || backdrop), 
                                    duration: epDuration,
                                    progress: 0,
                                    servers: generateEpisodeServers(String(idToUse), tmdbSeason.season_number, ep.episode_number)
                                };
                            });
                            
                            currentSeasons[existingSeasonIndex] = {
                                ...existingSeason,
                                episodes: [...(existingSeason.episodes || []), ...newMappedEpisodes]
                            };
                            hasUpdates = true;
                        }
                    }
                }
            }

            if (hasUpdates) {
                currentSeasons.sort((a,b) => a.seasonNumber - b.seasonNumber);
                setFormData(prev => ({ ...prev, seasons: currentSeasons }));
                addToast("تم تحديث البيانات وإضافة الحلقات/المواسم الجديدة بنجاح!", "success");
            } else {
                addToast("لم يتم العثور على تحديثات جديدة (المحتوى مكتمل).", "info");
            }

        } catch (e: any) {
            console.error(e);
            addToast("حدث خطأ أثناء البحث عن تحديثات: " + e.message, "error");
        } finally {
            setDeleteSeasonState({ isOpen: false, seasonId: null, title: '' });
            setUpdateLoading(false);
        }
    };

    const handleUpdateSpecificSeasonFromTMDB = async (seasonId: number, seasonNumber: number) => {
        const idToUse = formData.tmdbId || formData.id;
        if (!idToUse) {
            addToast('يجب توفر كود TMDB للمحتوى.', "info");
            return;
        }
        
        try {
            const sRes = await fetch(`https://api.themoviedb.org/3/tv/${idToUse}/season/${seasonNumber}?api_key=${API_KEY}&language=ar-SA`);
            if (!sRes.ok) throw new Error("فشل جلب الموسم من TMDB.");
            const sData = await sRes.json();
            
            setFormData(prev => ({
                ...prev,
                seasons: (prev.seasons || []).map(s => {
                    if (s.id !== seasonId) return s;
                    
                    const existingEps = s.episodes || [];
                    const newEpsFromTmdb = sData.episodes.filter((ep: any) => 
                        !existingEps.some(eep => extractEpisodeNumber(eep.title) === ep.episode_number)
                    ).map((ep: any) => {
                        let epDuration = '';
                        if (ep.runtime) {
                            if(ep.runtime > 60) epDuration = `${Math.floor(ep.runtime/60)}h ${ep.runtime%60}m`;
                            else epDuration = `${ep.runtime}:00`;
                        }
                        return {
                            id: Date.now() + ep.episode_number + Math.random(),
                            title: `الحلقة ${ep.episode_number}`,
                            description: ep.overview || `شاهد أحداث الحلقة ${ep.episode_number} من الموسم ${seasonNumber}.`,
                            thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : (s.backdrop || formData.backdrop), 
                            duration: epDuration,
                            progress: 0,
                            servers: generateEpisodeServers(String(idToUse), seasonNumber, ep.episode_number)
                        };
                    });
                    
                    const merged = [...existingEps, ...newEpsFromTmdb].sort((a, b) => {
                        const numA = extractEpisodeNumber(a.title);
                        const numB = extractEpisodeNumber(b.title);
                        return numA - numB;
                    });
                    
                    return { ...s, episodes: merged };
                })
            }));
            addToast(`تم التحقق من الموسم ${seasonNumber} وإضافة الحلقات الجديدة.`, "success");
        } catch (e: any) {
            addToast(e.message, "error");
        }
    };

    const handleSelectSearchResult = (result: any) => {
        setTmdbIdInput(String(result.id));
        if (result.media_type === 'movie') {
            setFormData(prev => ({ ...prev, type: ContentType.Movie }));
        } else if (result.media_type === 'tv') {
            setFormData(prev => ({ ...prev, type: ContentType.Series }));
        }
        fetchFromTMDB(String(result.id), result.media_type === 'movie' ? ContentType.Movie : ContentType.Series);
        setTmdbSearchResults([]);
        setTmdbSearchQuery('');
    };

    const fetchSeasonDetails = async (tmdbId: string, seasonNumber: number) => {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=${API_KEY}&language=ar-SA`);
            if (res.ok) return await res.json();
            return null;
        } catch (e) {
            console.warn(`Failed to fetch season ${seasonNumber}`, e);
            return null;
        }
    };

    const fetchFromTMDB = async (overrideId?: string, overrideType?: ContentType, isUpdateMode: boolean = false) => {
        const targetId = overrideId || tmdbIdInput;
        if (!targetId) return;
        
        if (!isUpdateMode) setFetchLoading(true);
        let currentType = overrideType || formData.type;
        
        try {
            const getUrl = (type: ContentType, lang: string, path: string = '') => {
                const typePath = (type === ContentType.Movie || type === ContentType.Play || type === ContentType.Concert) ? 'movie' : 'tv';
                const append = (type === ContentType.Movie || type === ContentType.Play || type === ContentType.Concert)
                    ? 'credits,release_dates,videos,images' 
                    : 'content_ratings,credits,videos,images'; 
                return `https://api.themoviedb.org/3/${typePath}/${targetId}${path}?api_key=${API_KEY}&language=${lang}&append_to_response=${append}&include_image_language=${lang},en,null`;
            };

            let res = await fetch(getUrl(currentType, 'ar-SA'));
            if (!res.ok && res.status === 404 && !isUpdateMode) {
                const altType = isStandalone ? ContentType.Series : ContentType.Movie;
                const resAlt = await fetch(getUrl(altType, 'ar-SA'));
                if (resAlt.ok) {
                    res = resAlt;
                    currentType = altType; 
                }
            }

            if (!res.ok) throw new Error('لم يتم العثور على محتوى بهذا الـ ID. تأكد من صحة الرقم.');
            let details = await res.json();
            const originLang = details.original_language;
            
            let autoCategory: Category = 'افلام اجنبية'; 
            if (currentType === ContentType.Series || currentType === ContentType.Program) {
                if (originLang === 'tr') autoCategory = 'مسلسلات تركية';
                else if (originLang === 'ar') autoCategory = 'مسلسلات عربية';
                else autoCategory = 'مسلسلات اجنبية';
            } else {
                if (originLang === 'tr') autoCategory = 'افلام تركية';
                else if (originLang === 'ar') autoCategory = 'افلام عربية';
                else if (originLang === 'hi') autoCategory = 'افلام هندية';
                else autoCategory = 'افلام اجنبية';
            }

            if (originLang !== 'ar') {
                const resEn = await fetch(getUrl(currentType, 'en-US'));
                if (resEn.ok) {
                    const enDetails = await resEn.json();
                    if (!details.overview) details.overview = enDetails.overview;
                    if (enDetails.images) details.images = enDetails.images;
                    if (enDetails.videos) details.videos = enDetails.videos;
                }
            }

            const title = details.title || details.name || '';
            const description = details.overview || ''; 
            const poster = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '';
            const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : '';
            const rating = details.vote_average ? Number((details.vote_average / 2).toFixed(1)) : 0;
            const releaseDate = details.release_date || details.first_air_date || '';
            const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();
            
            let trailerUrl = '';
            if (details.videos && details.videos.results) {
                let trailer = details.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
                if (!trailer) trailer = details.videos.results.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube');
                if (trailer) trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            }

            let logoUrl = '';
            if (details.images && details.images.logos && details.images.logos.length > 0) {
                let logoNode = details.images.logos.find((img: any) => img.iso_639_1 === 'ar');
                if (!logoNode) logoNode = details.images.logos.find((img: any) => img.iso_639_1 === 'en');
                if (!logoNode) logoUrl = `https://image.tmdb.org/t/p/w500${details.images.logos[0].file_path}`;
                else logoUrl = `https://image.tmdb.org/t/p/w500${logoNode.file_path}`;
            }

            let duration = '';
            if (isStandalone && details.runtime) {
                const h = Math.floor(details.runtime / 60);
                const m = details.runtime % 60;
                duration = `${h}h ${m}m`;
            }

            let ageRating = '';
            if (isStandalone) {
                const usRelease = details.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
                if (usRelease) ageRating = usRelease.release_dates[0]?.certification || '';
            } else {
                const usRating = details.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
                if (usRating) ageRating = usRating.rating || '';
            }

            const mappedGenres: Genre[] = details.genres?.map((g: any) => {
                if(g.name === 'Action') return 'أكشن';
                if(g.name === 'Adventure') return 'مغامرة';
                if(g.name === 'Animation') return 'أطفال';
                if(g.name === 'Comedy') return 'كوميديا';
                if(g.name === 'Crime') return 'جريمة';
                if(g.name === 'Documentary') return 'وثائقي';
                if(g.name === 'Drama') return 'دراما';
                if(g.name === 'Family') return 'عائلي';
                if(g.name === 'Fantasy') return 'فانتازيا';
                if(g.name === 'History') return 'تاريخي';
                if(g.name === 'Horror') return 'رعب';
                if(g.name === 'Music') return 'موسيقي';
                if(g.name === 'Mystery') return 'غموض';
                if(g.name === 'Romance') return 'رومانسي';
                if(g.name === 'Science Fiction') return 'خيال علمي';
                if(g.name === 'TV Movie') return 'فيلم تلفزيوني';
                if(g.name === 'Thriller') return 'إثارة';
                if(g.name === 'War') return 'حربي';
                if(g.name === 'Western') return 'ويسترن';
                return g.name; 
            }) || [];

            if (mappedGenres.includes('أطفال') && !autoCategory.includes('أنيميشن')) {
                autoCategory = (currentType === ContentType.Series) ? 'مسلسلات أنيميشن' : 'أفلام أنيميشن';
            }

            const castNames: string[] = [];
            let directorName = '';
            let writerName = '';

            if (details.credits) {
                for (const p of (details.credits.cast || []).slice(0, 10)) {
                    castNames.push(p.name);
                }
                const director = (details.credits.crew || []).find((c: any) => c.job === 'Director');
                if (director) directorName = director.name;
                
                const writer = (details.credits.crew || []).find((c: any) => c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Story');
                if (writer) writerName = writer.name;
            }

            let newSeasons: Season[] = [];
            
            if ((currentType === ContentType.Series || currentType === ContentType.Program) && details.seasons) {
                const validSeasons = details.seasons.filter((s:any) => s.season_number > 0);
                const seasonPromises = validSeasons.map((s: any) => fetchSeasonDetails(String(targetId), s.season_number));
                const detailedSeasons = await Promise.all(seasonPromises);

                newSeasons = detailedSeasons.filter(ds => ds !== null).map((ds: any) => {
                    const mappedEpisodes: Episode[] = ds.episodes?.map((ep: any) => {
                        let epDuration = '';
                        if (ep.runtime) {
                            if(ep.runtime > 60) epDuration = `${Math.floor(ep.runtime/60)}h ${ep.runtime%60}m`;
                            else epDuration = `${ep.runtime}:00`;
                        }

                        const fixedTitle = `الحلقة ${ep.episode_number}`;
                        const isGenericTitle = !ep.name || ep.name.match(/^Episode \d+$/i) || ep.name.match(/^الحلقة \d+$/i);
                        let finalDescription = ep.overview || `شاهد أحداث الحلقة ${ep.episode_number} من الموسم ${ds.season_number}. استمتع بمشاهدة تطورات الأحداث في هذه الحلقة.`;
                        
                        if (!isGenericTitle && ep.name) {
                            finalDescription = `${ep.name} : ${ep.overview || ''}`;
                        }
                        
                        return {
                            id: Date.now() + ep.episode_number + Math.random(),
                            title: fixedTitle,
                            description: finalDescription,
                            thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : backdrop, 
                            duration: epDuration,
                            progress: 0,
                            servers: generateEpisodeServers(String(targetId), ds.season_number, ep.episode_number)
                        };
                    }) || [];

                    return {
                        id: Date.now() + ds.season_number + Math.random(),
                        seasonNumber: ds.season_number,
                        title: ds.name || `الموسم ${ds.season_number}`,
                        releaseYear: ds.air_date ? new Date(ds.air_date).getFullYear() : releaseYear,
                        description: ds.overview,
                        poster: ds.poster_path ? `https://image.tmdb.org/t/p/w500${ds.poster_path}` : poster,
                        backdrop: backdrop,
                        mobileImageUrl: '', 
                        logoUrl: ds.season_number === 1 ? logoUrl : '',
                        isUpcoming: false,
                        flipBackdrop: false,
                        episodes: mappedEpisodes
                    };
                });
            }

            setFormData(prev => ({
                ...prev,
                id: String(targetId),
                tmdbId: String(targetId), 
                title,
                description,
                poster,
                backdrop,
                mobileBackdropUrl: '', 
                logoUrl,
                isLogoEnabled: !!logoUrl,
                trailerUrl,
                rating,
                releaseYear,
                ageRating,
                type: currentType, 
                categories: [autoCategory],
                genres: [...new Set([...prev.genres, ...mappedGenres])],
                cast: castNames,
                director: directorName || prev.director,
                writer: writerName || prev.writer,
                duration: duration || prev.duration,
                isUpcoming: false,
                seasons: (currentType === ContentType.Series || currentType === ContentType.Program) ? newSeasons : prev.seasons,
                servers: isStandalone ? generateMovieServers(String(targetId)) : [],
                flipBackdrop: false
            }));

        } catch (e: any) {
            console.error(e);
            addToast(e.message || 'فشل جلب البيانات.', "error");
        } finally {
            setFetchLoading(false);
            setUpdateLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const inputElement = e.target as HTMLInputElement;
        if (inputElement.type === 'number') {
            const numericValue = value === '' ? 0 : parseFloat(value);
            setFormData(prev => ({ ...prev, [name]: isNaN(numericValue) ? 0 : numericValue }));
            return;
        }
        if (name === 'type') {
            const isTargetEpisodic = value === ContentType.Series || value === ContentType.Program;
            if (isTargetEpisodic && (!formData.seasons || formData.seasons.length === 0)) {
                setFormData(prev => ({
                    ...prev, 
                    type: value as ContentType, 
                    seasons: [{ id: Date.now(), seasonNumber: 1, title: 'الموسم 1', episodes: [], isUpcoming: false, flipBackdrop: false }]
                }));
                return;
            }
        }
        if (name === 'slug') setSlugManuallyEdited(true);
        setFormData(prev => ({ ...prev, [name]: value } as Content));
    };

    const filteredCategories = useMemo<Category[]>(() => {
        const commonCats: Category[] = ['قريباً'];
        if (formData.type === ContentType.Movie) {
            return ['افلام عربية', 'افلام تركية', 'افلام اجنبية', 'افلام هندية', 'أفلام أنيميشن', 'افلام العيد', ...commonCats];
        } else if (formData.type === ContentType.Series) {
            return ['مسلسلات عربية', 'مسلسلات تركية', 'مسلسلات اجنبية', 'مسلسلات أنيميشن', 'رمضان', 'حصرياً لرمضان', 'مسلسلات رمضان', ...commonCats];
        } else if (formData.type === ContentType.Program) {
            return ['برامج تلفزيونية', 'برامج رمضان', ...commonCats];
        } else if (formData.type === ContentType.Concert) {
            return ['حفلات', ...commonCats];
        } else if (formData.type === ContentType.Play) {
            return ['مسرحيات', ...commonCats];
        }
        return commonCats;
    }, [formData.type]);

    const handleCategoryChange = (category: Category) => {
        setFormData(prev => {
            const currentCats = prev.categories || [];
            const newCats = currentCats.includes(category)
                ? currentCats.filter(c => c !== category)
                : [...currentCats, category];
            return { ...prev, categories: newCats };
        });
    };
     
    const handleGenreChange = (genre: Genre) => {
        setFormData(prev => {
            const currentGenres = prev.genres || [];
            const newGenres = currentGenres.includes(genre)
                ? currentGenres.filter(g => g !== genre)
                : [...currentGenres, genre];
            return { ...prev, genres: newGenres };
        });
    };

    // --- SUBMIT HANDLER WITH SCHEDULING LOGIC ---
    const handleSubmit = async (e: React.FormEvent, isScheduled: boolean = false) => {
        e.preventDefault();
        if (isSubmitting) return; 

        if (!formData.title) { addToast('الرجاء كتابة اسم العمل.', "info"); return; }
        if (formData.categories.length === 0) { addToast('الرجاء اختيار تصنيف واحد على الأقل.', "info"); return; }
        
        // Validation for content-level scheduling
        if (isScheduled && !formData.scheduledAt) {
            addToast('الرجاء اختيار تاريخ ووقت الجدولة للمحتوى.', "info");
            return;
        }

        const backdrop = formData.backdrop;
        const mobileBackdrop = formData.mobileBackdropUrl || '';
        
        const seasons = formData.seasons?.map(s => ({
            ...s,
            mobileImageUrl: s.mobileImageUrl || '',
            episodes: s.episodes.map(ep => ({
                ...ep,
                // Ensure episode scheduling data is clean
                isScheduled: ep.isScheduled || false,
                scheduledAt: ep.isScheduled ? ep.scheduledAt : '',
                notifyOnPublish: ep.notifyOnPublish ?? true
            }))
        }));

        const finalSlug = formData.slug?.trim() || generateSlug(formData.title);
        const contentToSave: Content = { 
            ...formData, 
            mobileBackdropUrl: mobileBackdrop,
            seasons: seasons,
            slug: finalSlug,
            id: formData.id || String(Date.now()),
            tmdbId: formData.tmdbId || formData.id, 
            createdAt: formData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isScheduled: isScheduled,
            scheduledAt: isScheduled ? formData.scheduledAt : '',
            notifyOnPublish: formData.notifyOnPublish ?? true // Default to true
        };

        setIsSubmitting(true);
        try {
            await onSave(contentToSave);
            
            // Logic implies that if scheduled, the backend handles the trigger.
            // If published now (not scheduled), notifications might be handled by onSave implementation or backend triggers.
            let message = "تم النشر بنجاح!";
            if (isScheduled) message = "تم جدولة النشر بنجاح!";
            
            // Check if any separate episodes are scheduled
            const scheduledEpisodesCount = seasons?.reduce((acc, season) => acc + season.episodes.filter(e => e.isScheduled).length, 0) || 0;
            if (scheduledEpisodesCount > 0) {
                 message += ` (تم جدولة ${scheduledEpisodesCount} حلقة)`;
            }

            addToast(message, "success");
        } catch (err) {
            console.error("Submit failed:", err);
            setIsSubmitting(false);
        }
    };

    const toggleSeason = (id: number) => {
        setExpandedSeasons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleAddSeason = () => {
        const newSeasonNumber = (formData.seasons?.length || 0) + 1;
        setFormData(prev => ({
            ...prev,
            seasons: [...(prev.seasons || []), { id: Date.now(), seasonNumber: newSeasonNumber, title: `الموسم ${newSeasonNumber}`, episodes: [], isUpcoming: false, flipBackdrop: false }]
        }));
    };

    const handleUpdateSeason = (seasonId: number, field: keyof Season, value: any) => {
        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(s => s.id === seasonId ? { ...s, [field]: value } : s)
        }));
    };

    const requestDeleteSeason = (seasonId: number, seasonTitle: string) => { setDeleteSeasonState({ isOpen: true, seasonId, title: seasonTitle }); };
    const executeDeleteSeason = () => { if (deleteSeasonState.seasonId) setFormData(prev => ({ ...prev, seasons: (prev.seasons || []).filter(s => s.id !== deleteSeasonState.seasonId) })); setDeleteSeasonState(prev => ({ ...prev, isOpen: false })); };
    
    const requestClearSeasonServers = (seasonId: number, seasonTitle: string) => { setClearSeasonServersState({ isOpen: true, seasonId, title: seasonTitle }); };
    const executeClearSeasonServers = () => {
        if (clearSeasonServersState.seasonId) {
            setFormData(prev => ({
                ...prev,
                seasons: (prev.seasons || []).map(s => {
                    if (s.id !== clearSeasonServersState.seasonId) return s;
                    return {
                        ...s,
                        episodes: (s.episodes || []).map(ep => ({
                            ...ep,
                            servers: []
                        }))
                    };
                })
            }));
            addToast(`تم تفريغ كافة السيرفرات والروابط للموسم "${clearSeasonServersState.title}" بنجاح.`, "success");
        }
        setClearSeasonServersState({ isOpen: false, seasonId: null, title: '' });
    };
    
    const handleMovieExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json<any>(worksheet);

                if (rows.length === 0) {
                    addToast("لم يتم العثور على بيانات في الملف.", "info");
                    return;
                }

                const updatedServers: Server[] = [];
                const row = rows[0]; 

                if (enableAutoLinks) {
                    const idToUse = formData.tmdbId || formData.id;
                    const vipUrl = `https://vidsrc.vip/embed/movie/${idToUse}`;
                    updatedServers.push({ id: 99991, name: 'سيرفر 1', url: vipUrl, downloadUrl: vipUrl, isActive: true });
                }

                for (let i = 1; i <= 8; i++) {
                    const watchUrl = getRowValue(row, `سيرفر مشاهدة ${i}`, `Watch Server ${i}`, `سيرفر ${i}`);
                    const downloadUrl = getRowValue(row, `سيرفر تحميل ${i}`, `Download Server ${i}`, `تحميل ${i}`);

                    if ((watchUrl && String(watchUrl).trim() !== '') || (downloadUrl && String(downloadUrl).trim() !== '')) {
                        updatedServers.push({
                            id: Date.now() + i + Math.random(),
                            name: getRowValue(row, `اسم سيرفر ${i}`, `Server Name ${i}`) || `سيرفر ${(updatedServers.length + 1)}`,
                            url: String(watchUrl || '').trim(),
                            downloadUrl: String(downloadUrl || '').trim(),
                            isActive: true
                        });
                    }
                }

                if (updatedServers.length > 0) {
                    setFormData(prev => ({ ...prev, servers: updatedServers }));
                    addToast(`تم استيراد ${updatedServers.length} سيرفر للفيلم بنجاح!`, "success");
                } else {
                    addToast("لم يتم العثور على روابط سيرفرات في الصف الأول من الملف.", "info");
                }
            } catch (err) {
                console.error(err);
                addToast('حدث خطأ أثناء استيراد ملف الفيلم.', "error");
            }
            if (movieExcelInputRef.current) movieExcelInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };

    const handleSeasonExcelImport = async (e: React.ChangeEvent<HTMLInputElement>, seasonId: number, seasonNumber: number) => { 
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json<any>(worksheet);

                const relevantRows = rows.filter(r => {
                    const sNumRaw = getRowValue(r, 'الموسم', 'Season', 'Season_Number');
                    if (sNumRaw === null) return true; 
                    return parseInt(String(sNumRaw)) === seasonNumber;
                });

                if (relevantRows.length === 0) {
                    addToast(`لم يتم العثور على حلقات للموسم رقم ${seasonNumber} في الملف.`, "info");
                    return;
                }

                setFormData(prev => ({
                    ...prev,
                    seasons: (prev.seasons || []).map(s => {
                        if (s.id !== seasonId) return s;
                        const updatedEpisodes = [...(s.episodes || [])];

                        relevantRows.forEach((row, idx) => {
                            const eNumRaw = getRowValue(row, 'الحلقة', 'Episode', 'Episode_Number');
                            const eNum = parseInt(String(eNumRaw)) || (idx + 1);
                            
                            const epServers: Server[] = [];
                            
                            if (enableAutoLinks) {
                                const idToUse = formData.tmdbId || formData.id;
                                const vipUrl = `https://vidsrc.vip/embed/tv/${idToUse}/${seasonNumber}/${eNum}`;
                                epServers.push({ id: 99999 + Math.random(), name: 'سيرفر 1', url: vipUrl, downloadUrl: vipUrl, isActive: true });
                            }

                            for (let i = 1; i <= 8; i++) {
                                const watchUrl = getRowValue(row, `سيرفر مشاهدة ${i}`, `Watch Server ${i}`, `سيرفر ${i}`);
                                const downloadUrl = getRowValue(row, `سيرفر تحميل ${i}`, `Download Server ${i}`, `تحميل ${i}`);

                                if ((watchUrl && String(watchUrl).trim() !== '') || (downloadUrl && String(downloadUrl).trim() !== '')) {
                                    epServers.push({
                                        id: Date.now() + i + Math.random(),
                                        name: getRowValue(row, `اسم سيرفر ${i}`, `Server Name ${i}`) || `سيرفر ${(epServers.length + 1)}`,
                                        url: String(watchUrl || '').trim(),
                                        downloadUrl: String(downloadUrl || '').trim(),
                                        isActive: true
                                    });
                                }
                            }

                            const newEpisodeData: Episode = {
                                id: Date.now() + eNum + Math.random(), 
                                title: getRowValue(row, 'العنوان', 'Title') || `الحلقة ${eNum}`,
                                duration: getRowValue(row, 'المدة', 'Duration') || '45:00',
                                thumbnail: getRowValue(row, 'صورة', 'Thumbnail') || s.backdrop || formData.backdrop,
                                description: getRowValue(row, 'الوصف', 'Description') || `شاهد أحداث الحلقة ${eNum} من الموسم ${seasonNumber}.`,
                                progress: 0,
                                servers: epServers,
                                isScheduled: false,
                                scheduledAt: ''
                            };

                            const targetIdx = updatedEpisodes.findIndex(ep => {
                                const titleNum = extractEpisodeNumber(ep.title);
                                return titleNum === eNum;
                            });

                            if (targetIdx !== -1) {
                                updatedEpisodes[targetIdx] = {
                                    ...updatedEpisodes[targetIdx],
                                    servers: epServers.length > 0 ? epServers : updatedEpisodes[targetIdx].servers 
                                };
                            } else {
                                updatedEpisodes.push(newEpisodeData);
                            }
                        });

                        updatedEpisodes.sort((a, b) => {
                            const numA = extractEpisodeNumber(a.title);
                            const numB = extractEpisodeNumber(b.title);
                            return numA - numB;
                        });

                        return { ...s, episodes: updatedEpisodes };
                    })
                }));
                addToast(`تم تحديث روابط ${relevantRows.length} حلقة للموسم ${seasonNumber} بنجاح!`, "success");
            } catch (err) {
                console.error(err);
                addToast('حدث خطأ أثناء استيراد الملف.', "error");
            }
        };
        reader.readAsBinaryString(file);
    };
    
    const handleAddEpisode = (seasonId: number) => { 
        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(s => {
                if (s.id !== seasonId) return s;
                const newEpNum = (s.episodes?.length || 0) + 1;
                return {
                    ...s,
                    episodes: [...(s.episodes || []), { 
                        id: Date.now(), 
                        title: `الحلقة ${newEpNum}`, 
                        duration: '', 
                        progress: 0, 
                        servers: [],
                        isScheduled: false
                    }]
                };
            })
        }));
    };

    const handleSmartAddEpisode = (seasonId: number) => {
        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(s => {
                if (s.id !== seasonId) return s;
                
                const episodes = s.episodes || [];
                if (episodes.length === 0) return s;

                let lastEpNum = 0;
                let lastEpisode = episodes[0];
                
                episodes.forEach(ep => {
                    const num = extractEpisodeNumber(ep.title);
                    if (num >= lastEpNum) {
                        lastEpNum = num;
                        lastEpisode = ep;
                    }
                });

                const newEpNum = lastEpNum + 1;
                
                const newServers = (lastEpisode.servers || []).map(server => {
                    const incrementUrl = (url: string) => {
                        if (!url) return url;
                        const numStr = lastEpNum.toString();
                        const paddedNumStr = lastEpNum < 10 ? `0${lastEpNum}` : numStr;
                        const regex = new RegExp(`(?<!\\d)(${paddedNumStr}|${numStr})(?!\\d)`, 'g');
                        const matches = [...url.matchAll(regex)];
                        
                        if (matches.length > 0) {
                            const lastMatch = matches[matches.length - 1];
                            const matchStr = lastMatch[0];
                            const matchIndex = lastMatch.index!;
                            const replacement = (matchStr.startsWith('0') && matchStr.length > 1) 
                                ? (newEpNum < 10 ? `0${newEpNum}` : newEpNum.toString())
                                : newEpNum.toString();
                            return url.substring(0, matchIndex) + replacement + url.substring(matchIndex + matchStr.length);
                        }
                        return url;
                    };

                    return {
                        ...server,
                        id: Date.now() + Math.random(),
                        url: incrementUrl(server.url),
                        downloadUrl: incrementUrl(server.downloadUrl)
                    };
                });

                return {
                    ...s,
                    episodes: [...episodes, {
                        id: Date.now() + Math.random(),
                        title: `الحلقة ${newEpNum}`,
                        duration: '', 
                        thumbnail: s.backdrop || prev.backdrop || '', 
                        description: `شاهد أحداث الحلقة ${newEpNum} من الموسم ${s.seasonNumber}.`,
                        progress: 0,
                        servers: newServers,
                        isScheduled: false,
                        scheduledAt: ''
                    }]
                };
            })
        }));
        addToast("تم إضافة حلقة ذكية بنجاح!", "success");
    };
    
    const requestDeleteEpisode = (seasonId: number, episodeId: number, episodeTitle: string) => { 
        setDeleteEpisodeState({ isOpen: true, seasonId, episodeId, title: episodeTitle }); 
    };
    
    const executeDeleteEpisode = () => { 
        const { seasonId, episodeId } = deleteEpisodeState;
        if (seasonId && episodeId) {
            setFormData(prev => ({
                ...prev,
                seasons: (prev.seasons || []).map(s => {
                    if (s.id !== seasonId) return s;
                    return { ...s, episodes: s.episodes.filter(e => e.id !== episodeId) };
                })
            }));
        }
        setDeleteEpisodeState(prev => ({...prev, isOpen: false})); 
    };
    
    const handleUpdateEpisode = (seasonId: number, episodeId: number, field: keyof Episode | 'isScheduled' | 'scheduledAt' | 'notifyOnPublish', value: any) => { 
        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(s => {
                if (s.id !== seasonId) return s;
                return {
                    ...s,
                    episodes: s.episodes.map(e => e.id === episodeId ? { ...e, [field]: value } : e)
                };
            })
        }));
    };

    // --- Helper to open Scheduling Modal for an Episode ---
    const openEpisodeScheduling = (seasonId: number, episodeId: number, currentSchedule: string) => {
        setEpisodeSchedulingState({
            isOpen: true,
            seasonId,
            episodeId,
            currentDate: currentSchedule,
            notifyUsers: true,
            notifyAdmins: true
        });
    };

    // --- Confirm Episode Scheduling ---
    const confirmEpisodeSchedule = () => {
        const { seasonId, episodeId, currentDate, notifyUsers, notifyAdmins } = episodeSchedulingState;
        if (seasonId && episodeId) {
            setFormData(prev => ({
                ...prev,
                seasons: (prev.seasons || []).map(s => {
                    if (s.id !== seasonId) return s;
                    return {
                        ...s,
                        episodes: s.episodes.map(e => {
                            if (e.id === episodeId) {
                                return {
                                    ...e,
                                    isScheduled: !!currentDate,
                                    scheduledAt: currentDate,
                                    notifyOnPublish: notifyUsers // Storing this preference
                                };
                            }
                            return e;
                        })
                    };
                })
            }));
            addToast(currentDate ? "تم جدولة الحلقة بنجاح" : "تم إلغاء جدولة الحلقة", "success");
        }
        setEpisodeSchedulingState(prev => ({ ...prev, isOpen: false }));
    };
    
    const handleUpdateEpisodeServers = (newServers: Server[]) => { 
        if (!editingServersForEpisode) return;
        setFormData(prev => ({
            ...prev,
            seasons: (prev.seasons || []).map(s => ({
                ...s,
                episodes: s.episodes.map(e => e.id === editingServersForEpisode.id ? { ...e, servers: newServers } : e)
            }))
        }));
    };
    
    const handleUpdateMovieServers = (servers: Server[]) => { 
        setFormData(prev => ({ ...prev, servers })); 
    };

    const handleBulkSeriesImport = async (e: React.ChangeEvent<HTMLInputElement>) => { 
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json<any>(worksheet);

                const seasonsMap: Record<number, Episode[]> = {};
                rows.forEach((row, idx) => {
                    const sNumRaw = getRowValue(row, 'الموسم', 'Season', 'Season_Number');
                    const sNum = parseInt(String(sNumRaw)) || 1;
                    
                    const eNumRaw = getRowValue(row, 'الحلقة', 'Episode', 'Episode_Number');
                    const eNum = parseInt(String(eNumRaw)) || (idx + 1);
                    
                    if (!seasonsMap[sNum]) seasonsMap[sNum] = [];

                    const epServers: Server[] = [];
                    if (enableAutoLinks) {
                        const idToUse = formData.tmdbId || formData.id;
                        const vipUrl = `https://vidsrc.vip/embed/tv/${idToUse}/${sNum}/${eNum}`;
                        epServers.push({ id: 99999, name: 'سيرفر 1', url: vipUrl, downloadUrl: vipUrl, isActive: true });
                    }
                    
                    for (let i = 1; i <= 8; i++) {
                        const watchUrl = getRowValue(row, `سيرفر مشاهدة ${i}`, `Watch Server ${i}`, `سيرفر ${i}`);
                        const downloadUrl = getRowValue(row, `سيرفر تحميل ${i}`, `Download Server ${i}`, `تحميل ${i}`);

                        if ((watchUrl && String(watchUrl).trim() !== '') || (downloadUrl && String(downloadUrl).trim() !== '')) {
                            epServers.push({
                                id: Date.now() + i + Math.random(),
                                name: getRowValue(row, `اسم سيرفر ${i}`, `Server Name ${i}`) || `سيرفر ${(epServers.length + 1)}`,
                                url: String(watchUrl || '').trim(),
                                downloadUrl: String(downloadUrl || '').trim(),
                                isActive: true
                            });
                        }
                    }

                    seasonsMap[sNum].push({
                        id: Date.now() + Math.random(),
                        title: getRowValue(row, 'العنوان', 'Title') || `الحلقة ${eNum}`,
                        duration: getRowValue(row, 'المدة', 'Duration') || '45:00',
                        thumbnail: getRowValue(row, 'صورة', 'Thumbnail') || formData.backdrop,
                        description: getRowValue(row, 'الوصف', 'Description') || `حلقة من الموسم ${sNum}`,
                        progress: 0,
                        servers: epServers
                    });
                });

                const newSeasons: Season[] = Object.entries(seasonsMap).map(([sNum, eps]) => ({
                    id: Date.now() + Math.random(),
                    seasonNumber: parseInt(sNum),
                    title: `الموسم ${sNum}`,
                    episodes: eps,
                    backdrop: formData.backdrop,
                    poster: formData.poster,
                    isUpcoming: false,
                    flipBackdrop: false
                }));

                setFormData(prev => ({
                    ...prev,
                    seasons: newSeasons
                }));
                addToast('تم استيراد كافة المواسم بنجاح!', "success");
            } catch (err) {
                console.error(err);
                addToast('حدث خطأ أثناء الاستيراد الشامل.', "error");
            }
        };
        reader.readAsBinaryString(file);
    };

    const getSearchBadge = (mediaType: string) => {
        switch (mediaType) {
            case 'movie': return { label: 'فيلم', color: 'bg-blue-600/90' };
            case 'tv': return { label: 'مسلسل', color: 'bg-purple-600/90' };
            default: return { label: mediaType === 'person' ? 'فنان' : mediaType, color: 'bg-gray-600/90' };
        }
    };
    const renderLivePreview = () => {
        const posX = formData.mobileCropPositionX ?? 50;
        const posY = formData.mobileCropPositionY ?? 50;
        const imgStyle: React.CSSProperties = { 
            '--mob-x': `${posX}%`, 
            '--mob-y': `${posY}%`,
            objectPosition: `${posX}% ${posY}%`,
            transform: formData.flipBackdrop ? 'scaleX(-1)' : 'none'
        } as React.CSSProperties;
        const cropClass = formData.enableMobileCrop ? 'mobile-custom-crop' : '';

        return (
            <div className="space-y-12 animate-fade-in">
                <div className="flex flex-col items-center gap-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">📱</span>
                        معاينة الجوال (Mobile View)
                    </h3>
                    <div className="relative w-[300px] md:w-[320px] h-[600px] md:h-[650px] bg-black border-[8px] md:border-[10px] border-[#1f2127] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/10 scale-95 md:scale-100">
                        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-40 px-6 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-white/10"></div>
                        </div>
                        
                        <div className="h-full bg-[#141b29] overflow-y-auto no-scrollbar scroll-smooth flex flex-col">
                            <div className="relative h-[400px] md:h-[480px] w-full flex-shrink-0">
                                <img 
                                    src={formData.mobileBackdropUrl || formData.backdrop || 'https://placehold.co/1080x1920/101010/101010/png'} 
                                    className={`absolute inset-0 h-full w-full object-cover ${cropClass} object-top transition-none`} 
                                    style={imgStyle}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#141b29] via-[#141b29]/40 via-40% to-transparent z-10"></div>
                                
                                <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 pb-8 text-white text-center">
                                    {formData.bannerNote && (
                                        <div className="mb-2 mx-auto text-[10px] font-bold bg-[#6366f1]/80 text-white border border-[#6366f1]/30 px-2 py-0.5 rounded backdrop-blur-md w-fit">
                                            {formData.bannerNote}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        {formData.isLogoEnabled && formData.logoUrl ? (
                                            <img src={formData.logoUrl} className="max-w-[140px] md:max-w-[160px] max-h-[80px] md:max-h-[100px] object-contain drop-shadow-2xl mx-auto" alt="" />
                                        ) : (
                                            <h1 className="text-xl md:text-2xl font-black drop-shadow-lg leading-tight">{formData.title || 'العنوان'}</h1>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-200 mb-4 font-bold">
                                        <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                                            <StarIcon className="w-2.5 h-2.5" />
                                            <span>{formData.rating.toFixed(1)}</span>
                                        </div>
                                        <span>•</span>
                                        <span>{formData.releaseYear}</span>
                                        <span>•</span>
                                        <span className="px-1 border border-gray-500 rounded text-[8px]">{formData.ageRating || 'G'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-[#00A7F8] text-black h-10 rounded-full flex items-center justify-center font-black text-xs gap-2">
                                            <PlayIcon className="w-3 h-3 fill-black" />
                                            شاهد الآن
                                        </div>
                                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center font-bold text-lg">+</div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky top-0 z-30 bg-[#141b29]/95 backdrop-blur-md border-b border-white/5 flex gap-4 px-4 h-12 items-center flex-shrink-0">
                                <div className="text-[10px] font-black border-b-2 border-[#00A7F8] py-3 text-white">الحلقات</div>
                                <div className="text-[10px] font-black text-gray-500 py-3">التفاصيل</div>
                                <div className="text-[10px] font-black text-gray-500 py-3">أعمال مشابهة</div>
                            </div>

                            <div className="p-4 space-y-4 flex-1">
                                <p className="text-[11px] text-gray-400 leading-relaxed text-justify line-clamp-4">
                                    {formData.description || 'قصة العمل تظهر هنا...'}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-right">
                                        <span className="block text-[8px] text-gray-500 font-bold uppercase mb-1">المخرج</span>
                                        <span className="text-[10px] font-bold text-gray-300 truncate block">{formData.director || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-right">
                                        <span className="block text-[8px] text-gray-500 font-bold uppercase mb-1">التقييم</span>
                                        <span className="text-[10px] font-bold text-yellow-400">★ {formData.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1f2127] rounded-b-2xl z-50"></div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">💻</span>
                        معاينة المتصفح (Desktop View)
                    </h3>
                    <div className="w-full max-w-4xl aspect-video bg-[#141b29] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative group/desk">
                        <div className="h-8 bg-[#1f2127] border-b border-gray-800 flex items-center px-4 gap-1.5 z-50 relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                            <div className="flex-1 max-sm h-5 bg-black/40 rounded-md mx-auto flex items-center px-3"><span className="text-[8px] text-gray-600 font-mono">cinematix.watch/{formData.slug || 'slug'}</span></div>
                        </div>

                        <div className="relative h-full w-full">
                            <img 
                                src={formData.backdrop || 'https://placehold.co/1920x1080/101010/101010/png'} 
                                className="w-full h-full object-cover" 
                                style={{ transform: formData.flipBackdrop ? 'scaleX(-1)' : 'none' }}
                                alt="" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#141b29] via-[#141b29]/40 to-transparent z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141b29] via-transparent to-transparent z-10"></div>
                            
                            <div className="absolute inset-0 p-12 flex flex-col justify-center items-start max-w-2xl text-right z-20">
                                {formData.bannerNote && (
                                    <div className="mb-4 text-sm font-medium bg-[#6366f1]/80 text-white border border-[#6366f1]/30 px-3 py-1 rounded-lg backdrop-blur-md">
                                        {formData.bannerNote}
                                    </div>
                                )}
                                <div className="mb-6">
                                    {formData.isLogoEnabled && formData.logoUrl ? (
                                        <img src={formData.logoUrl} className="h-24 md:h-32 object-contain drop-shadow-2xl" alt="" />
                                    ) : (
                                        <h1 className="text-5xl font-black text-white drop-shadow-lg leading-tight">{formData.title || 'العنوان'}</h1>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mb-6 text-sm font-bold">
                                    <div className="flex items-center gap-1.5 text-yellow-400 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                                        <StarIcon className="w-4 h-4" />
                                        <span>{formData.rating.toFixed(1)}</span>
                                    </div>
                                    <span className="text-gray-500">|</span>
                                    <span className="text-white font-black">{formData.releaseYear}</span>
                                    <span className="text-gray-500">|</span>
                                    <span className="border border-gray-500 px-2 py-0.5 rounded text-xs font-black">{formData.ageRating || 'G'}</span>
                                </div>
                                <p className="text-gray-300 text-lg line-clamp-3 mb-10 leading-relaxed font-medium">{formData.description || 'وصف العمل يظهر هنا بشكل احترافي ومميز ليعبر عن قصة المحتوى الرائعة التي تقدمها المنصة للمشاهدين...'}</p>
                                <div className="flex gap-4">
                                    <div className="bg-[#00A7F8] text-black px-12 py-4 rounded-full font-black text-xl flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
                                        <PlayIcon className="w-6 h-6 fill-black"/> شاهد الآن
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-12 py-4 rounded-full font-black text-xl border border-white/20 hover:bg-white/20 transition-all">+ قائمتي</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="flex h-screen w-full bg-[#090b10] text-gray-200 overflow-hidden font-sans selection:bg-[var(--color-accent)] selection:text-black" dir="rtl">
            <div 
                className={`fixed inset-0 bg-black/60 z-[90] lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setIsSidebarOpen(false)} 
            />

            <aside className={`fixed inset-y-0 right-0 z-[100] w-72 bg-[#0f1014] border-l border-gray-800 flex flex-col shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                <div className="p-8 border-b border-gray-800 flex flex-col items-center gap-3">
                    <div className="text-3xl font-extrabold cursor-default flex flex-row items-baseline gap-1 justify-center">
                        <span className="text-white font-['Cairo']">سينما</span>
                        <span className="gradient-text font-['Lalezar'] tracking-wide text-4xl">تيكس</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                        {isNewContent ? 'New Content' : 'Edit Mode'}
                    </span>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>
                    
                    {[
                        { id: 'general', label: 'البيانات الأساسية', icon: DashboardIcon },
                        { id: 'categories', label: 'التصنيف والأنواع', icon: TagIcon },
                        { id: 'media', label: 'الصور والميديا', icon: PhotoIcon },
                        ...(isEpisodic ? [{ id: 'seasons', label: 'المواسم والحلقات', icon: LayersIcon }] : []),
                        ...(isStandalone ? [{ id: 'servers', label: 'السيرفرات', icon: ServerIcon }] : [])
                    ].map(tab => (
                        <div key={tab.id} className="relative">
                            <button 
                                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-[#1a1f29] text-white border-r-2 border-[var(--color-accent)]' : 'text-gray-400 hover:bg-[#161b22] hover:text-white'}`}
                            >
                                <tab.icon className="w-5 h-5"/>
                                <span>{tab.label}</span>
                            </button>
                        </div>
                    ))}

                    <div className="h-px bg-gray-800 my-4"></div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Live Preview</div>

                    <button 
                        onClick={() => { setActiveTab('preview'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'preview' ? 'bg-[#1a1f29] text-white border-r-2 border-blue-500' : 'text-gray-400 hover:bg-[#161b22] hover:text-white'}`}
                    >
                        <EyeIcon className="w-5 h-5"/>
                        <span>معاينة مباشرة</span>
                    </button>
                </nav>

                <div className="h-20 border-t border-gray-800 flex items-center px-4 bg-black/10">
                     <button onClick={onClose} className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200">
                        <ExitIcon className="w-5 h-5"/>
                        <span>خروج دون حفظ</span>
                     </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#090b10] relative shrink-0">
                <header className="h-20 border-b border-gray-800 bg-[#0f1014]/90 backdrop-blur-md flex items-center justify-between px-4 md:px-10 z-10 sticky top-0 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                             <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                {activeTab === 'preview' ? 'المعاينة الحية للمحتوى' : isNewContent ? 'إضافة محتوى جديد' : 'تعديل المحتوى'}
                             </h2>
                             <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 mt-1">
                                 <span>المكتبة</span>
                                 <span>/</span>
                                 <span className="text-[var(--color-accent)]">{formData.title || 'بدون عنوان'}</span>
                             </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block px-3 py-1 bg-gray-900 rounded border border-gray-800 font-mono text-xs text-gray-400">
                             ID: {formData.id || 'NEW'}
                        </div>
                        {formData.type && (
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-[var(--color-accent)] text-black px-3 py-1 rounded">
                                {formData.type}
                            </span>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-10">
                    <div className="max-w-6xl mx-auto space-y-10">
                        
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                                <div className="lg:col-span-12 rounded-2xl border border-blue-500/10 bg-gradient-to-r from-blue-900/10 to-transparent p-4 md:p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <CloudArrowDownIcon className="w-40 h-40"/>
                                    </div>
                                    <div className="relative z-10">
                                         <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                                             <CloudArrowDownIcon className="w-5 h-5"/> جلب بيانات تلقائي (TMDB)
                                         </h3>

                                         <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-4">
                                            <div className="flex rounded-lg bg-[#0f1014] p-1 border border-gray-700 self-start">
                                                <button type="button" onClick={() => setTmdbSearchMode('name')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${tmdbSearchMode === 'name' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>بحث بالاسم</button>
                                                <button type="button" onClick={() => setTmdbSearchMode('id')} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${tmdbSearchMode === 'id' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>بحث بالـ ID</button>
                                            </div>
                                            
                                            <div className="flex-1 w-full md:w-auto flex gap-2">
                                                 {tmdbSearchMode === 'name' ? (
                                                    <div className="relative flex-1">
                                                        <input 
                                                            type="text" 
                                                            value={tmdbSearchQuery} 
                                                            onChange={(e) => setTmdbSearchQuery(e.target.value)} 
                                                            onKeyDown={(e) => e.key === 'Enter' && searchTMDB()} 
                                                            placeholder="اكتب اسم الفيلم أو المسلسل..." 
                                                            className={inputClass + " pr-10"} 
                                                        />
                                                        <button type="button" onClick={searchTMDB} className="absolute left-1 top-1 bottom-1 bg-blue-600 text-white px-4 rounded hover:bg-blue-500"><SearchIcon className="w-4 h-4"/></button>
                                                    </div>
                                                 ) : (
                                                    <div className="flex gap-2 flex-1">
                                                        <input type="text" value={tmdbIdInput} onChange={(e) => setTmdbIdInput(e.target.value)} placeholder="TMDB ID..." className={inputClass} />
                                                        <button type="button" onClick={() => fetchFromTMDB()} disabled={fetchLoading} className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-500 whitespace-nowrap">{fetchLoading ? '...' : 'جلب'}</button>
                                                    </div>
                                                 )}
                                            </div>
                                            
                                            {isEpisodic && !isNewContent && (
                                                <button type="button" onClick={handleComprehensiveUpdate} disabled={updateLoading} className="flex items-center justify-center gap-2 bg-green-600/20 text-green-400 border border-green-600/30 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-all w-full md:w-auto justify-center"><RefreshIcon className="w-4 h-4"/> تحديث شامل</button>
                                            )}
                                         </div>

                                         {tmdbSearchMode === 'name' && tmdbSearchResults.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                                {tmdbSearchResults.map((result) => {
                                                    const badgeInfo = getSearchBadge(result.media_type);
                                                    return (
                                                        <div key={result.id} onClick={() => handleSelectSearchResult(result)} className="group cursor-pointer">
                                                            <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-700 relative">
                                                                {result.poster_path ? <img src={`https://image.tmdb.org/t/p/w200${result.poster_path}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs">No Image</div>}
                                                                <div className={`absolute top-1 left-1 z-10 px-2 py-0.5 rounded text-[9px] font-black text-white shadow-lg backdrop-blur-sm ${badgeInfo.color}`}>
                                                                    {badgeInfo.label}
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded">اختر</span></div>
                                                            </div>
                                                            <div className="mt-2 text-center">
                                                                <div className="text-xs font-bold text-white truncate">{result.title || result.name}</div>
                                                                <div className="text-[10px] text-gray-500">{result.release_date?.substring(0,4) || result.first_air_date?.substring(0,4)}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                         )}
                                    </div>
                                </div>

                                <div className={`${sectionBoxClass} lg:col-span-9 h-full flex flex-col`}>
                                    <h4 className="text-sm font-bold text-[#00A7F8] mb-6 uppercase border-b border-gray-800 pb-2">البيانات الأساسية</h4>
                                    <div className="space-y-6 flex-1">
                                        <div>
                                            <label className={labelClass}>عنوان العمل</label>
                                            <div className="flex items-stretch gap-2">
                                                <input type="text" name="title" value={formData.title} onChange={handleChange} className={`${inputClass} flex-1`} placeholder="اسم الفيلم أو المسلسل" />
                                                <button type="button" onClick={openTitleGallery} className="flex items-center justify-center rounded-lg bg-gray-800 px-4 text-white shadow-md transition-all hover:bg-gray-700 hover:text-[var(--color-accent)] border border-gray-700" title="اختر عنواناً بدلاً من TMDB"><LanguageIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>النص الوصفي (يظهر على البوستر)</label>
                                            <input type="text" name="bannerNote" value={formData.bannerNote || ''} onChange={handleChange} className={inputClass} placeholder="مثال: مترجم، مدبلج، حصري..." />
                                        </div>
                                        <div>
                                            <label className={labelClass}>الوصف (القصة)</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className={inputClass + " resize-none h-40"} placeholder="اكتب ملخص القصة..." />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>سنة الإنتاج</label><input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} className={inputClass} /></div>
                                            <div><label className={labelClass}>التقييم (10/x)</label><input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className={inputClass + " text-yellow-400 font-bold"} /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${sectionBoxClass} lg:col-span-3 h-full flex flex-col`}>
                                    <h4 className="text-sm font-bold text-gray-500 mb-6 uppercase border-b border-gray-800 pb-2">خيارات الحالة</h4>
                                    <div className="flex flex-col gap-4 flex-1">
                                        <div className="bg-[#161b22] p-4 rounded-xl border border-gray-700 space-y-4">
                                            <label className={labelClass}>الحالة (قريباً)</label>
                                            <ToggleSwitch 
                                                checked={formData.isUpcoming || false} 
                                                onChange={(val) => setFormData(prev => ({...prev, isUpcoming: val}))} 
                                                label={formData.isUpcoming ? "قريباً (Upcoming)" : "متاح الآن"}
                                            />
                                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                                تفعيل هذا الخيار سيظهر العمل في قسم "قريباً" ويمنع الوصول لصفحة التفاصيل (للأفلام أو السلسلة ككل).
                                            </p>
                                        </div>

                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4 border-b border-gray-800 pb-1">النوع</h4>
                                        <div className="flex flex-col gap-2">
                                            {[ContentType.Movie, ContentType.Series, ContentType.Program, ContentType.Play, ContentType.Concert].map((type) => (
                                                <button key={type} type="button" onClick={() => setFormData(prev => ({...prev, type: type}))} className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${formData.type === type ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)] font-bold text-sm' : 'bg-[#161b22] border-transparent text-gray-400 hover:border-gray-600 text-sm'}`}>
                                                    <span>{type === ContentType.Movie ? 'فيلم' : type === ContentType.Series ? 'مسلسل' : type === ContentType.Program ? 'برنامج' : type === ContentType.Play ? 'مسرحية' : 'حفلة'}</span>
                                                    {formData.type === type && <CheckSmallIcon className="w-4 h-4"/>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={`${sectionBoxClass} lg:col-span-9 h-full flex flex-col`}>
                                    <h4 className="text-sm font-bold text-gray-500 mb-6 uppercase border-b border-gray-800 pb-2">تفاصيل إضافية</h4>
                                    <div className="space-y-6 flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div><label className={labelClass}>المخرج</label><input type="text" name="director" value={formData.director || ''} onChange={handleChange} className={inputClass} /></div>
                                            <div><label className={labelClass}>الكاتب</label><input type="text" name="writer" value={formData.writer || ''} onChange={handleChange} className={inputClass} /></div>
                                            <div><label className={labelClass}>التصنيف العمري</label><input type="text" name="ageRating" value={formData.ageRating} onChange={handleChange} className={inputClass} placeholder="+13" /></div>
                                            {isStandalone && <div><label className={labelClass}>المدة</label><input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} className={inputClass} placeholder="1h 30m" /></div>}
                                        </div>
                                        
                                        <div className="border-t border-gray-800 pt-4">
                                            <label className={labelClass}>طاقم العمل</label>
                                            <div className="relative mb-3">
                                                <input type="text" value={castQuery} onChange={(e) => searchCast(e.target.value)} className={inputClass} placeholder="بحث عن ممثل في TMDB..." />
                                                {isSearchingCast && <div className="absolute left-3 top-3"><BouncingDotsLoader size="sm" colorClass="bg-gray-500" delayMs={0} /></div>}
                                                {castResults.length > 0 && (
                                                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#1a1f29] border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                        {castResults.map(person => (
                                                            <div key={person.id} onClick={() => addCastMember(person)} className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer border-b border-gray-800 last:border-0">
                                                                <img src={person.profile_path ? `https://image.tmdb.org/t/p/w45${person.profile_path}` : 'https://placehold.co/45x45'} className="w-8 h-8 rounded-full object-cover" alt=""/>
                                                                <span className="text-xs text-white">{person.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar p-1">
                                                {formData.cast.map((c, i) => (
                                                    <span key={i} className="flex items-center gap-1 bg-gray-800 text-[11px] font-bold px-3 py-1 rounded-full border border-gray-700 text-gray-300">
                                                        {c} <button type="button" onClick={() => removeCastMember(c)} className="text-gray-500 hover:text-red-400 transition-colors mr-1"><CloseIcon className="w-3 h-3"/></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                                            <div><label className={labelClass}>Slug (الرابط)</label><input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className={inputClass + " font-mono text-xs text-blue-400"} /></div>
                                            <div><label className={labelClass}>كود (TMDB ID)</label><input type="text" name="tmdbId" value={formData.tmdbId || ''} onChange={handleChange} className={inputClass + " font-mono text-[var(--color-accent)]"} /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${sectionBoxClass} lg:col-span-3 h-full flex flex-col`}>
                                    <h4 className="text-sm font-bold text-gray-500 mb-6 uppercase border-b border-gray-800 pb-2">جمهور المشاهدة</h4>
                                    <div className="space-y-6 flex-1 justify-center flex flex-col">
                                        <button type="button" onClick={() => setFormData(prev => ({...prev, visibility: 'general'}))} className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all ${formData.visibility === 'general' ? 'border-green-500/50 bg-green-500/10 ring-1 ring-green-500/20' : 'border-gray-800 bg-[#161b22]'}`}>
                                            <div className={`p-3 rounded-full ${formData.visibility === 'general' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-700 text-gray-500'}`}><FamilyIcon className="w-6 h-6"/></div>
                                            <div className="text-right"><div className={`text-lg font-black ${formData.visibility === 'general' ? 'text-green-400' : 'text-gray-300'}`}>عائلي (عام)</div><div className="text-xs text-gray-500 font-bold">مناسب للجميع وآمن للأطفال</div></div>
                                        </button>
                                        <button type="button" onClick={() => setFormData(prev => ({...prev, visibility: 'adults'}))} className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all ${formData.visibility === 'adults' ? 'border-red-500/50 bg-red-500/10 ring-1 ring-red-500/20' : 'border-gray-800 bg-[#161b22]'}`}>
                                            <div className={`p-3 rounded-full ${formData.visibility === 'adults' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-gray-700 text-gray-500'}`}><AdultIcon className="w-6 h-6"/></div>
                                            <div className="text-right"><div className={`text-lg font-black ${formData.visibility === 'adults' ? 'text-red-400' : 'text-gray-300'}`}>للكبار فقط</div><div className="text-xs text-gray-500 font-bold">+18 محتوى مقيد للبالغين</div></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className={sectionBoxClass + " animate-fade-in-up"}>
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">التصنيفات الرئيسية</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {filteredCategories.map((cat: Category) => (
                                                <button key={cat} type="button" onClick={() => handleCategoryChange(cat)} className={`flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold transition-all duration-300 ${formData.categories.includes(cat) ? 'scale-105 border-transparent bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-black shadow-lg shadow-[var(--color-accent)]/20' : `${INPUT_BG} border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white`}`}>
                                                    {cat} {formData.categories.includes(cat) && <CheckSmallIcon />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">تصنيفات البحث</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {SEARCH_CATEGORIES.map((cat) => (
                                                <button key={cat} type="button" onClick={() => handleCategoryChange(cat as Category)} className={`flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold transition-all duration-300 ${formData.categories.includes(cat as Category) ? 'scale-105 border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-lg shadow-purple-500/10' : `${INPUT_BG} border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white`}`}>
                                                    {cat} {formData.categories.includes(cat as Category) && <CheckSmallIcon />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">النوع الفني</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {genres.map((g: Genre) => (
                                                <button key={g} type="button" onClick={() => handleGenreChange(g)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-200 ${formData.genres.includes(g) ? 'bg-white text-black border-white' : `${INPUT_BG} border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white`}`}>
                                                    {g} {formData.genres.includes(g) && <CheckSmallIcon />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="flex flex-col gap-8 animate-fade-in-up">
                                <div className={`w-full space-y-6 ${sectionBoxClass}`}>
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><PhotoIcon className="w-5 h-5 text-[var(--color-accent)]"/> الصور الأساسية</h3>
                                    {renderImageInput("البوستر العمودي (Poster)", formData.poster, (val) => setFormData(prev => ({...prev, poster: val})), 'poster', "https://...", "w-20 h-28")}
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className={labelClass}>خلفية عريضة (Backdrop)</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-500">عكس اتجاه الصورة (Horizontal Flip)</span>
                                                <ToggleSwitch 
                                                    checked={formData.flipBackdrop || false} 
                                                    onChange={(val) => setFormData(prev => ({...prev, flipBackdrop: val}))} 
                                                    label={formData.flipBackdrop ? "ON" : "OFF"}
                                                    className="scale-75"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-stretch gap-2">
                                            <input 
                                                type="text" 
                                                value={formData.backdrop || ''} 
                                                onChange={(e) => setFormData(prev => ({...prev, backdrop: e.target.value}))} 
                                                className={`${inputClass} flex-1 dir-ltr`} 
                                                placeholder="https://..." 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => openGallery('backdrop', (val) => setFormData(prev => ({...prev, backdrop: val})))} 
                                                className="flex items-center justify-center rounded-lg bg-gray-800 px-4 text-white shadow-md transition-all hover:bg-gray-700 hover:text-[var(--color-accent)] border border-gray-700" 
                                                title="اختر من المعرض"
                                            >
                                                <PhotoIcon className="w-5 h-5"/>
                                            </button>
                                            {formData.backdrop && (
                                                <div className="w-32 h-20 bg-black flex-shrink-0 overflow-hidden rounded-lg border border-gray-700 shadow-sm">
                                                    <img src={formData.backdrop} style={{ transform: formData.flipBackdrop ? 'scaleX(-1)' : 'none' }} className="h-full w-full object-cover" alt="preview" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         {renderImageInput("بوستر عريض (Horizontal)", formData.horizontalPoster, (val) => setFormData(prev => ({...prev, horizontalPoster: val})), 'backdrop', "https://...", "w-24 h-14")}
                                         {renderImageInput("توب 10 (Top 10)", formData.top10Poster, (val) => setFormData(prev => ({...prev, top10Poster: val})), 'poster', "https://...", "w-16 h-20")}
                                    </div>
                                    <div className="border-t border-gray-800 pt-6 mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className={labelClass}>اللوجو (شعار شفاف)</label>
                                            <ToggleSwitch checked={formData.isLogoEnabled || false} onChange={(val) => setFormData(prev => ({...prev, isLogoEnabled: val}))} label={formData.isLogoEnabled ? "مفعل" : "معطل"}/>
                                        </div>
                                        {renderImageInput("", formData.logoUrl, (val) => setFormData(prev => ({...prev, logoUrl: val})), 'logo', "https://...", "hidden")}
                                        {formData.logoUrl && (
                                            <div className="mt-2 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-gray-800 p-4 rounded-lg flex justify-center">
                                                <img src={formData.logoUrl} className="h-16 object-contain" alt="" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                         <label className={labelClass}>رابط التريلر (YouTube)</label>
                                         <div className="flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <input type="text" value={formData.trailerUrl || ''} onChange={(e) => setFormData(prev => ({...prev, trailerUrl: e.target.value}))} className={inputClass} placeholder="https://youtube.com/..." />
                                                <button type="button" onClick={() => setYouTubeSearchState({ isOpen: true, targetId: 'main' })} className="absolute left-1 top-1 bottom-1 bg-red-600/10 border border-red-600/30 text-red-500 rounded-md px-3 text-[10px] font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"><YouTubeIcon className="w-4 h-4" /></button>
                                            </div>
                                            {formData.trailerUrl && <a href={formData.trailerUrl} target="_blank" className="p-3 bg-red-600 rounded-lg text-white hover:bg-red-500"><PlayIcon className="w-5 h-5"/></a>}
                                         </div>
                                    </div>
                                </div>
                                <div className={`w-full ${sectionBoxClass}`}>
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">📱 تخصيص الموبايل</h3>
                                    {renderImageInput("صورة الخلفية للموبايل", formData.mobileBackdropUrl, (val) => setFormData(prev => ({...prev, mobileBackdropUrl: val})), 'poster', "https://...", "hidden")}
                                    <div className="mt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-gray-400 uppercase">تفعيل القص التلقائي</span>
                                            <ToggleSwitch checked={formData.enableMobileCrop || false} onChange={(val) => setFormData(prev => ({...prev, enableMobileCrop: val}))} label={formData.enableMobileCrop ? "مفعل" : "معطل"}/>
                                        </div>
                                        {formData.enableMobileCrop && (
                                            <MobileSimulator imageUrl={formData.mobileBackdropUrl || formData.backdrop || ''} posX={formData.mobileCropPositionX ?? 50} posY={formData.mobileCropPositionY ?? 50} contentData={formData} onUpdateX={(v) => setFormData(prev => ({...prev, mobileCropPositionX: v}))} onUpdateY={(v) => setFormData(prev => ({...prev, mobileCropPositionY: v}))}/>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seasons' && isEpisodic && (
                            <div className="animate-fade-in-up space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0f1014] p-4 rounded-xl border border-gray-800 gap-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><LayersIcon className="w-6 h-6 text-[var(--color-accent)]"/> قائمة المواسم</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button type="button" onClick={handleComprehensiveUpdate} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all w-full md:w-auto justify-center"><RefreshIcon className="w-4 h-4"/> تحديث كافة المواسم</button>
                                        <button type="button" onClick={() => globalFileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-gray-700 text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-800 hover:text-white w-full md:w-auto justify-center"><ExcelIcon className="w-4 h-4"/> استيراد Excel</button>
                                        <input type="file" className="hidden" ref={globalFileInputRef} accept=".xlsx" onChange={handleBulkSeriesImport}/>
                                        <button type="button" onClick={handleAddSeason} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-black rounded-lg text-sm font-bold hover:bg-white transition-colors w-full md:w-auto justify-center"><PlusIcon className="w-4 h-4"/> إضافة موسم</button>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {formData.seasons?.map((season) => (
                                        <div key={season.id} className="bg-[#0f1014] border border-gray-800 rounded-xl overflow-hidden transition-all hover:border-gray-700">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#161b22] cursor-pointer gap-4" onClick={() => toggleSeason(season.id)}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`transition-transform duration-300 ${expandedSeasons.has(season.id) ? 'rotate-180' : ''}`}><ChevronDownIcon className="w-5 h-5 text-gray-500"/></div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <input onClick={e => e.stopPropagation()} value={season.title} onChange={e => handleUpdateSeason(season.id, 'title', e.target.value)} className="bg-transparent text-lg font-bold text-white border-none focus:ring-0 p-0 w-32"/>
                                                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{season.episodes.length} حلقة</span>
                                                            {(season.isUpcoming || season.status === 'coming_soon') && <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-black animate-pulse">قريباً</span>}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 mt-1">ID: {season.id}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleUpdateSpecificSeasonFromTMDB(season.id, season.seasonNumber); }} className="flex items-center gap-1 p-2 hover:bg-blue-900/30 text-blue-400 rounded text-xs font-bold" title="تحديث هذا الموسم فقط"><RefreshIcon className="w-3 h-3"/> تحديث</button>
                                                    <input onClick={e => e.stopPropagation()} type="file" id={`excel-${season.id}`} className="hidden" accept=".xlsx" onChange={(e) => handleSeasonExcelImport(e, season.id, season.seasonNumber)}/>
                                                    <label htmlFor={`excel-${season.id}`} className="p-2 hover:bg-green-900/30 text-green-600 rounded cursor-pointer" title="استيراد حلقات"><ExcelIcon className="w-4 h-4"/></label>
                                                    
                                                    {/* زر توليد الروابط التلقائية */}
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); openAutoLinkModal(season.id); }} className="p-2 hover:bg-green-600/10 text-green-500 rounded font-bold text-[10px] flex items-center gap-1" title="توليد روابط تلقائية"><LinkIcon className="w-4 h-4"/> روابط</button>

                                                    {/* زر تحديث صور الحلقات دفعة واحدة */}
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); openBulkImageModal(season.id); }} className="p-2 hover:bg-purple-600/10 text-purple-400 rounded font-bold text-[10px] flex items-center gap-1 bg-purple-500/5 border border-purple-500/15" title="تحديث صور كافة الحلقات أو نطاق محدد دفعة واحدة"><PhotoIcon className="w-3.5 h-3.5 text-purple-400"/> صور الحلقات</button>

                                                    {/* زر تسمية سيرفرات الحلقات دفعة واحدة */}
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); openBulkServerNamesModal(season.id); }} className="p-2 hover:bg-blue-600/10 text-blue-400 rounded font-bold text-[10px] flex items-center gap-1 bg-blue-500/5 border border-blue-500/15" title="تسمية سيرفرات كافة الحلقات أو نطاق محدد دفعة واحدة"><ServerIcon className="w-3.5 h-3.5 text-blue-400"/> تسمية السيرفرات</button>

                                                    {/* زر تفريغ الروابط والسيرفرات للموسم */}
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); requestClearSeasonServers(season.id, season.title || `الموسم ${season.seasonNumber}`); }} className="p-2 hover:bg-amber-500/10 text-amber-500 rounded font-bold text-[10px] flex items-center gap-1 bg-amber-500/5 border border-amber-500/15" title="تفريغ كافة الروابط والسيرفرات لهذا الموسم"><TrashIcon className="w-3.5 h-3.5 text-amber-500"/> تفريغ الروابط</button>

                                                    <button type="button" onClick={(e) => { e.stopPropagation(); openBulkActionModal(season.id, 'add'); }} className="p-2 hover:bg-blue-600/10 text-blue-500 rounded font-bold text-[10px] flex items-center gap-1" title="إضافة حلقات متعددة"><StackIcon className="w-4 h-4"/> +</button>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); openBulkActionModal(season.id, 'delete'); }} className="p-2 hover:bg-red-600/10 text-red-500 rounded font-bold text-[10px] flex items-center gap-1" title="حذف حلقات متعددة"><StackIcon className="w-4 h-4"/> -</button>
                                                    
                                                    {season.episodes && season.episodes.length > 0 && (
                                                        <button type="button" onClick={(e) => {e.stopPropagation(); handleSmartAddEpisode(season.id)}} className="p-2 hover:bg-yellow-600/10 text-yellow-500 rounded font-bold text-[10px] flex items-center gap-1" title="إضافة حلقة ذكية">إضافة حلقة ذكية ⚡</button>
                                                    )}
                                                    <button type="button" onClick={(e) => {e.stopPropagation(); handleAddEpisode(season.id)}} className="p-2 hover:bg-gray-800 text-blue-400 rounded" title="إضافة حلقة"><PlusIcon className="w-4 h-4"/></button>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); requestDeleteSeason(season.id, season.title || `الموسم ${season.seasonNumber}`); }} className="p-2 hover:bg-red-900/30 text-red-500 rounded" title="حذف الموسم"><TrashIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>

                                            {expandedSeasons.has(season.id) && (
                                                <div className="p-4 md:p-6 border-t border-gray-800 bg-[#0a0a0a]">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 md:p-6 bg-[#13161c] rounded-2xl border border-gray-800/50">
                                                        <div className="col-span-full mb-4 border-b border-gray-800 pb-2 flex flex-wrap items-center justify-between gap-4">
                                                            <h4 className="text-sm font-bold text-blue-400">بيانات الموسم {season.seasonNumber}</h4>
                                                            <div className="flex items-center gap-6">
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">عكس الخلفية</label>
                                                                    <ToggleSwitch 
                                                                        checked={season.flipBackdrop || false} 
                                                                        onChange={(val) => handleUpdateSeason(season.id, 'flipBackdrop', val)} 
                                                                        label={season.flipBackdrop ? "ON" : "OFF"}
                                                                        className="scale-75 origin-left"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">موسم قادم (قريباً)</label>
                                                                    <ToggleSwitch 
                                                                        checked={season.isUpcoming || false} 
                                                                        onChange={(val) => handleUpdateSeason(season.id, 'isUpcoming', val)} 
                                                                        label={season.isUpcoming ? "نعم" : "لا"}
                                                                        className="scale-75 origin-left"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {formData.seasons?.length === 1 ? (
                                                            <div className="col-span-full p-8 bg-black/20 rounded-2xl border border-dashed border-gray-800 text-center animate-fade-in">
                                                                <p className="text-gray-400 text-sm font-bold">يتم مزامنة صور وميديا هذا الموسم تلقائياً مع بيانات العمل الأساسية.</p>
                                                                <button type="button" onClick={() => setActiveTab('media')} className="mt-4 text-[var(--color-accent)] text-xs font-black hover:underline flex items-center justify-center gap-2 mx-auto"><PhotoIcon className="w-4 h-4" /> انتقل لقسم "الصور والميديا" للتعديل</button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {renderImageInput("بوستر الموسم (Booster)", season.poster, (val) => handleUpdateSeason(season.id, 'poster', val), 'poster', "Poster URL")}
                                                                {renderImageInput("خلفية الموسم (Background)", season.backdrop, (val) => handleUpdateSeason(season.id, 'backdrop', val), 'backdrop', "Backdrop URL")}
                                                                {renderImageInput("بوستر عريض (Wide)", season.horizontalPoster, (val) => handleUpdateSeason(season.id, 'horizontalPoster', val), 'backdrop', "Horizontal Poster URL")}
                                                                {renderImageInput("شعار الموسم (Logo)", season.logoUrl, (val) => handleUpdateSeason(season.id, 'logoUrl', val), 'logo', "Logo URL")}
                                                                {renderImageInput("صورة الموبايل (Mobile)", season.mobileImageUrl, (val) => handleUpdateSeason(season.id, 'mobileImageUrl', val), 'poster', "Mobile Image URL")}
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <label className={labelClass}>رابط التريلر (Trailer Link)</label>
                                                                        <div className="flex gap-2">
                                                                            <div className="flex-1 relative">
                                                                                <input value={season.trailerUrl || ''} onChange={(e) => handleUpdateSeason(season.id, 'trailerUrl', e.target.value)} className={inputClass} placeholder="YouTube Trailer URL" />
                                                                                <button type="button" onClick={() => setYouTubeSearchState({ isOpen: true, targetId: season.id })} className="absolute left-1 top-1 bottom-1 bg-red-600/10 border border-red-600/30 text-red-500 rounded-md px-3 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"><YouTubeIcon className="w-4 h-4" /></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div><label className={labelClass}>سنة إنتاج الموسم</label><input type="number" value={season.releaseYear || ''} onChange={e => handleUpdateSeason(season.id, 'releaseYear', parseInt(e.target.value))} className={inputClass} placeholder="مثال: 2024"/></div>
                                                                </div>
                                                                <div className="col-span-full"><label className={labelClass}>قصة الموسم</label><textarea value={season.description || ''} onChange={(e) => handleUpdateSeason(season.id, 'description', e.target.value)} className={inputClass} rows={2}/></div>
                                                                <div className="col-span-full mt-4 p-4 border-t border-gray-800">
                                                                    <div className="flex justify-between items-center mb-4"><label className={labelClass}>تخصيص الموبايل لهذا الموسم</label><ToggleSwitch checked={season.enableMobileCrop || false} onChange={(val) => handleUpdateSeason(season.id, 'enableMobileCrop', val)} label={season.enableMobileCrop ? "مفعل" : "معطل"}/></div>
                                                                    {season.enableMobileCrop && (<div className="mt-2"><MobileSimulator imageUrl={season.mobileImageUrl || season.backdrop || formData.backdrop || ''} posX={season.mobileCropPositionX ?? 50} posY={season.mobileCropPositionY ?? 50} contentData={{...formData, ...season, id: formData.id} as Content} onUpdateX={(v) => handleUpdateSeason(season.id, 'mobileCropPositionX', v)} onUpdateY={(v) => handleUpdateSeason(season.id, 'mobileCropPositionY', v)} /></div>)}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-widest">قائمة الحلقات</h4>
                                                        {season.episodes.map((ep, idx) => (
                                                            <div key={ep.id} className="flex flex-col md:flex-row gap-4 p-4 md:p-5 rounded-2xl border border-gray-800 bg-[#161b22] hover:border-gray-700 transition-all group">
                                                                <div className="w-full md:w-32 h-40 md:h-24 bg-black rounded-xl overflow-hidden border border-gray-800 flex-shrink-0 relative group/thumb">
                                                                    {ep.thumbnail ? <img src={ep.thumbnail} className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" alt=""/> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">No Image</div>}
                                                                    <button type="button" onClick={() => openGallery('backdrop', (url) => handleUpdateEpisode(season.id, ep.id, 'thumbnail', url))} className="absolute inset-0 bg-black/60 hidden group-hover/thumb:flex items-center justify-center text-white"><PhotoIcon className="w-5 h-5"/></button>
                                                                </div>
                                                                
                                                                <div className="flex-1 space-y-4 md:space-y-3 w-full">
                                                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                                                            <span className="bg-black text-gray-500 font-mono text-xs px-2 py-1 rounded-md border border-gray-800 shrink-0">#{idx+1}</span>
                                                                            <input value={ep.title || ''} onChange={(e) => handleUpdateEpisode(season.id, ep.id, 'title', e.target.value)} className="bg-transparent border-b border-gray-700 text-sm font-bold text-white focus:border-[var(--color-accent)] focus:outline-none flex-1 md:w-48 transition-colors"/>
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                                                                            {ep.isScheduled && (
                                                                                <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                                                                    <ClockIcon className="w-3 h-3" />
                                                                                    <span>{new Date(ep.scheduledAt).toLocaleString('ar-EG', {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                                                                                </div>
                                                                            )}

                                                                            <input value={ep.duration || ''} onChange={(e) => handleUpdateEpisode(season.id, ep.id, 'duration', e.target.value)} className="bg-transparent border-b border-gray-700 text-xs text-gray-400 w-20 text-center" placeholder="00:00"/>
                                                                            <label className="flex items-center gap-2 cursor-pointer bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700">
                                                                                <input type="checkbox" checked={ep.isLastEpisode} onChange={e => handleUpdateEpisode(season.id, ep.id, 'isLastEpisode', e.target.checked)} className="accent-red-500 h-4 w-4"/>
                                                                                {ep.isLastEpisode && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider whitespace-nowrap">الحلقة الأخيرة</span>}
                                                                                {!ep.isLastEpisode && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap">الأخيرة؟</span>}
                                                                            </label>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="text-[9px] font-bold text-gray-600 mb-1 block uppercase">رابط صورة الحلقة</label>
                                                                            <input value={ep.thumbnail || ''} onChange={(e) => handleUpdateEpisode(season.id, ep.id, 'thumbnail', e.target.value)} className="w-full bg-black/30 border border-gray-800 rounded-lg px-3 py-2 text-[10px] text-gray-400 focus:border-[var(--color-accent)] focus:outline-none dir-ltr" placeholder="Link..."/>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[9px] font-bold text-gray-400 mb-1 block uppercase">وسام مخصص (افصل بفاصلة)</label>
                                                                            <div className="flex flex-col gap-2">
                                                                                <input value={ep.badgeText || ''} onChange={(e) => handleUpdateEpisode(season.id, ep.id, 'badgeText', e.target.value)} className="w-full bg-black/30 border border-gray-800 rounded-lg px-3 py-2 text-[10px] text-amber-400 focus:border-amber-500 focus:outline-none" placeholder="مثال: مترجم, حصري..."/>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {['مترجم', 'VIP', 'حصري', 'جديد', 'قريباً', 'HD'].map(badge => (
                                                                                        <button 
                                                                                            key={badge}
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                const currentBadges = ep.badgeText ? ep.badgeText.split(',').map(b=>b.trim()).filter(Boolean) : [];
                                                                                                if (currentBadges.includes(badge)) {
                                                                                                    handleUpdateEpisode(season.id, ep.id, 'badgeText', currentBadges.filter(b => b !== badge).join(', '));
                                                                                                } else {
                                                                                                    handleUpdateEpisode(season.id, ep.id, 'badgeText', [...currentBadges, badge].join(', '));
                                                                                                }
                                                                                            }}
                                                                                            className={`px-2 py-0.5 text-[8px] rounded-md font-bold transition-all border ${
                                                                                                ep.badgeText?.includes(badge) 
                                                                                                ? 'bg-amber-500 text-black border-amber-500' 
                                                                                                : 'bg-black/50 text-gray-400 border-gray-700 hover:border-gray-500'
                                                                                            }`}
                                                                                        >
                                                                                            {badge}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <input value={ep.description || ''} onChange={(e) => handleUpdateEpisode(season.id, ep.id, 'description', e.target.value)} className="w-full bg-transparent text-xs text-gray-500 focus:outline-none placeholder:text-gray-700" placeholder="اكتب وصفاً مختصراً لهذه الحلقة..."/>
                                                                </div>

                                                                <div className="flex flex-row md:flex-col gap-2 mt-2 md:mt-0 border-t border-gray-800 md:border-0 pt-4 md:pt-0">
                                                                    <button type="button" onClick={() => setEditingServersForEpisode(ep)} className={`flex-1 md:flex-none px-4 py-3 md:py-2 text-xs md:text-[10px] font-black rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all ${ep.servers?.length ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>
                                                                        <ServerIcon className="w-4 h-4 md:w-3.5 md:h-3.5"/> سيرفرات ({ep.servers?.length || 0})
                                                                    </button>
                                                                    
                                                                    <div className="flex flex-row gap-2 w-full">
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => openEpisodeScheduling(season.id, ep.id, ep.scheduledAt || '')}
                                                                            className={`flex-1 p-3 md:p-2 rounded-xl transition-all border shadow-sm flex items-center justify-center ${ep.isScheduled ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'text-gray-400 bg-gray-800 border-transparent hover:bg-gray-700 hover:text-white'}`}
                                                                            title="جدولة نشر الحلقة"
                                                                        >
                                                                            <CalendarIcon className="w-5 h-5"/>
                                                                        </button>

                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => {
                                                                                if (ep.servers && ep.servers.length > 0 && ep.servers[0].url) {
                                                                                    setPreviewVideoState({ isOpen: true, url: ep.servers[0].url, title: ep.title || 'الحلقة', poster: formData.backdrop || formData.poster });
                                                                                } else {
                                                                                    addToast("لا توجد سيرفرات مضافة لهذه الحلقة للمعاينة.", "info");
                                                                                }
                                                                            }}
                                                                            className="flex-1 p-3 md:p-2 rounded-xl transition-all border shadow-sm flex items-center justify-center text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500 hover:text-white"
                                                                            title="معاينة الحلقة"
                                                                        >
                                                                            <PlayIcon className="w-5 h-5"/>
                                                                        </button>

                                                                        <button type="button" onClick={() => requestDeleteEpisode(season.id, ep.id, ep.title || '')} className="flex-1 p-3 md:p-2 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-red-white rounded-xl transition-all border border-red-500/20 shadow-sm flex items-center justify-center" title="حذف الحلقة">
                                                                            <TrashIcon className="w-5 h-5"/>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'servers' && isStandalone && (
                             <div className={`${sectionBoxClass} animate-fade-in-up flex flex-col items-center justify-center py-20 text-center gap-8`}>
                                 <div className="flex flex-col items-center">
                                    <ServerIcon className="w-16 h-16 text-gray-700 mb-4"/>
                                    <h3 className="text-xl font-bold text-white mb-2">سيرفرات المشاهدة والتحميل</h3>
                                    <p className="text-gray-500 text-sm mb-6 max-w-md">أضف روابط المشاهدة والتحميل لهذا الفيلم. يمكنك إضافة عدة سيرفرات لضمان التوفر أو الاستيراد من ملف Excel.</p>
                                 </div>

                                 <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                                      <button type="button" onClick={() => setIsManagingMovieServers(true)} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3">
                                          <ServerIcon className="w-5 h-5" />
                                          إدارة السيرفرات يدوياً ({formData.servers?.length || 0})
                                      </button>

                                      <div className="h-10 w-px bg-gray-800 hidden md:block"></div>

                                      <button 
                                          type="button" 
                                          onClick={() => movieExcelInputRef.current?.click()}
                                          className="px-10 py-4 bg-green-600/20 border border-green-500/30 text-green-400 font-black rounded-2xl hover:bg-green-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                                      >
                                          <ExcelIcon className="w-5 h-5" />
                                          استيراد سيرفرات من Excel
                                      </button>
                                      <input type="file" className="hidden" ref={movieExcelInputRef} accept=".xlsx" onChange={handleMovieExcelImport}/>

                                      <div className="h-10 w-px bg-gray-800 hidden md:block"></div>

                                      <button 
                                          type="button" 
                                          onClick={() => {
                                              if (formData.servers && formData.servers.length > 0 && formData.servers[0].url) {
                                                  setPreviewVideoState({ isOpen: true, url: formData.servers[0].url, title: formData.title || 'الفيلم', poster: formData.backdrop || formData.poster });
                                              } else {
                                                  addToast("لا توجد سيرفرات مضافة للفيلم للمعاينة.", "info");
                                              }
                                          }}
                                          className="px-10 py-4 bg-purple-600/20 border border-purple-500/30 text-purple-400 font-black rounded-2xl hover:bg-purple-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                                      >
                                          <PlayIcon className="w-5 h-5" />
                                          معاينة الفيلم
                                      </button>
                                 </div>

                                 <div className="pt-8 border-t border-gray-800 w-full max-w-xs mx-auto">
                                      <button type="button" onClick={() => handleDeleteSection('servers')} className="text-red-500/60 text-xs font-bold hover:text-red-500 hover:underline transition-all">حذف كافة روابط السيرفرات</button>
                                 </div>
                             </div>
                        )}

                        {activeTab === 'autoLink' && (
                            <div className={`${sectionBoxClass} animate-fade-in-up space-y-8`}>
                                <div className="border-b border-gray-800 pb-5">
                                    <h3 className="text-xl font-black text-white flex items-center gap-3 font-['Cairo']">
                                        <LinkIcon className="w-7 h-7 text-green-500 animate-pulse" />
                                        إدارة السيرفرات والربط التلقائي للمحتوى
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                        هذا النظام الذكي يلغي الحاجة لإدخال الروابط يدوياً حلقة بحلقة. من خلال ربط العمل بسيرفر معين وتحديد مسار المجلد (Slug)، سيقوم النظام بتركيب روابط الحلقات تلقائياً وبالديناميكية الكاملة أثناء التشغيل.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Config */}
                                    <div className="space-y-6">
                                        <div className="bg-[#13161c] p-6 rounded-2xl border border-gray-800 space-y-5">
                                            <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                تركيب قالب الروابط التلقائي
                                            </h4>

                                            <div>
                                                <label className={labelClass}>سيرفر البث الرئيسي (الدومين النشط)</label>
                                                <select
                                                    value={formData.autoLinkConfig?.serverId || ''}
                                                    onChange={e => {
                                                        const sId = e.target.value;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            autoLinkConfig: {
                                                                ...(prev.autoLinkConfig || { seriesSlug: '', suffix: '.mp4', padZero: true, padTwoZeros: false }),
                                                                serverId: sId
                                                            }
                                                        }));
                                                    }}
                                                    className={`${inputClass} text-sm focus:ring-green-500`}
                                                >
                                                    <option value="">-- اختر السيرفر المستهدف --</option>
                                                    {globalServers.map(server => (
                                                        <option key={server.id} value={server.id}>
                                                            {server.name} ({server.baseDomain})
                                                        </option>
                                                    ))}
                                                </select>
                                                {globalServers.length === 0 && (
                                                    <p className="text-[11px] text-red-500 font-bold mt-2">لا يوجد سيرفرات بث مضافة في لوحة الإدارة حالياً.</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelClass}>مسار العمل / المجلد (Slug)</label>
                                                <input 
                                                    type="text"
                                                    value={formData.autoLinkConfig?.seriesSlug || ''}
                                                    onChange={e => {
                                                        const slugVal = e.target.value;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            autoLinkConfig: {
                                                                ...(prev.autoLinkConfig || { serverId: '', suffix: '.mp4', padZero: true, padTwoZeros: false }),
                                                                seriesSlug: slugVal
                                                            }
                                                        }));
                                                    }}
                                                     className={`${inputClass} font-mono text-left focus:ring-green-500`}
                                                     dir="ltr"
                                                     placeholder="مثال: series/Al-Ikhwa-Giran/"
                                                 />

                                                 {/* Smart URL Detector & Extractor */}
                                                 {(() => {
                                                     const val = formData.autoLinkConfig?.seriesSlug || '';
                                                     const isUrl = val.startsWith('http://') || val.startsWith('https://') || val.includes('://');
                                                     if (!isUrl) return null;

                                                     try {
                                                         const urlObj = new URL(val.startsWith('http') ? val : 'https://' + val);
                                                         const hostname = urlObj.hostname;
                                                         const pathname = urlObj.pathname;
                                                         const segments = pathname.split('/').filter(Boolean);
                                                         
                                                         let extractedSlug = '';
                                                         let extractedSuffix = '.mp4';
                                                         let hasFileSegment = false;
                                                         let detectedServerId = '';
                                                         let detectedServerName = '';

                                                         if (segments.length > 0) {
                                                             const lastSegment = segments[segments.length - 1];
                                                             const dotIndex = lastSegment.lastIndexOf('.');
                                                             if (dotIndex !== -1) {
                                                                 hasFileSegment = true;
                                                                 extractedSuffix = lastSegment.substring(dotIndex);
                                                                 const slugSegments = segments.slice(0, -1);
                                                                 extractedSlug = slugSegments.join('/') + '/';
                                                             } else {
                                                                 extractedSlug = segments.join('/') + '/';
                                                             }
                                                         }

                                                         // Clean up extractedSlug to have no leading slash and end with a slash if not empty
                                                         if (extractedSlug && !extractedSlug.endsWith('/')) {
                                                             extractedSlug += '/';
                                                         }

                                                         // Try to match a registered server by base domain
                                                         const matchedServer = globalServers.find(gs => {
                                                             try {
                                                                 const gsUrl = new URL(gs.baseDomain.startsWith('http') ? gs.baseDomain : 'https://' + gs.baseDomain);
                                                                 return gsUrl.hostname.replace('www.', '').toLowerCase() === hostname.replace('www.', '').toLowerCase();
                                                             } catch {
                                                                 return false;
                                                             }
                                                         });

                                                         if (matchedServer) {
                                                             detectedServerId = matchedServer.id;
                                                             detectedServerName = matchedServer.name;
                                                         }

                                                         return (
                                                             <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs flex flex-col gap-2 mt-2 font-bold animate-fade-in text-right" dir="rtl">
                                                                 <div className="flex items-center gap-1.5 text-amber-500">
                                                                     <span className="animate-pulse">⚡ ذكاء المحرك: تم كشف رابط كامل!</span>
                                                                 </div>
                                                                 <div className="text-[11px] text-gray-300 space-y-1 font-normal text-right" dir="rtl">
                                                                     {extractedSlug && (
                                                                         <div>• المسار المستخلص: <span className="text-amber-400 font-mono font-bold" dir="ltr">{extractedSlug}</span></div>
                                                                     )}
                                                                     {hasFileSegment && (
                                                                         <div>• الامتداد المستخلص: <span className="text-amber-400 font-mono font-bold" dir="ltr">{extractedSuffix}</span></div>
                                                                     )}
                                                                     {detectedServerName && (
                                                                         <div>• السيرفر المطابق بقاعدة البيانات: <span className="text-emerald-400 font-bold">{detectedServerName}</span></div>
                                                                     )}
                                                                 </div>
                                                                 <button
                                                                     type="button"
                                                                     onClick={() => {
                                                                         setFormData(prev => {
                                                                             const currentConfig: AutoLinkConfig = prev.autoLinkConfig || { serverId: '', seriesSlug: '', suffix: '.mp4', padZero: true, padTwoZeros: false };
                                                                             const updatedConfig = { ...currentConfig };
                                                                             if (extractedSlug) updatedConfig.seriesSlug = extractedSlug;
                                                                             if (hasFileSegment) updatedConfig.suffix = extractedSuffix;
                                                                             if (detectedServerId) updatedConfig.serverId = detectedServerId;
                                                                             return {
                                                                                 ...prev,
                                                                                 autoLinkConfig: updatedConfig
                                                                             };
                                                                         });
                                                                         addToast("تم استخراج المسار والامتداد (وتحديد السيرفر إن وجد) بنجاح 🚀", "success");
                                                                     }}
                                                                     className="mt-2 w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-[11px] transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-md"
                                                                 >
                                                                     <span>استخرج المسار من الرابط 🔗</span>
                                                                 </button>
                                                             </div>
                                                         );
                                                     } catch {
                                                         return null;
                                                     }
                                                 })()}
                                                <span className="text-[10px] text-gray-500 mt-1.5 block">
                                                    هو اسم مجلد المسلسل على خادم الفيديو الخاص بك. يفضل إنهاؤه بشرطة مائلة `/`.
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>الامتداد (Suffix)</label>
                                                    <input 
                                                        type="text"
                                                        value={formData.autoLinkConfig?.suffix || '.mp4'}
                                                        onChange={e => {
                                                            const suffixVal = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                autoLinkConfig: {
                                                                    ...(prev.autoLinkConfig || { serverId: '', seriesSlug: '', padZero: true, padTwoZeros: false }),
                                                                    suffix: suffixVal
                                                                }
                                                            }));
                                                        }}
                                                        className={`${inputClass} text-left font-mono focus:ring-green-500`}
                                                        dir="ltr"
                                                        placeholder=".mp4"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-end">
                                                    <label className={labelClass}>تعبئة الأرقام بالصفر</label>
                                                    <div className="flex flex-col gap-2 mt-1">
                                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                                            <input 
                                                                type="checkbox"
                                                                checked={formData.autoLinkConfig?.padZero ?? true}
                                                                onChange={e => {
                                                                    const val = e.target.checked;
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        autoLinkConfig: {
                                                                            ...(prev.autoLinkConfig || { serverId: '', seriesSlug: '', suffix: '.mp4', padTwoZeros: false }),
                                                                            padZero: val,
                                                                            padTwoZeros: val ? false : (prev.autoLinkConfig?.padTwoZeros || false)
                                                                        }
                                                                    }));
                                                                }}
                                                                className="rounded bg-gray-900 border-gray-700 text-green-500 focus:ring-0"
                                                            />
                                                            صفر للآحاد (01، 02)
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                                                            <input 
                                                                type="checkbox"
                                                                checked={formData.autoLinkConfig?.padTwoZeros ?? false}
                                                                onChange={e => {
                                                                    const val = e.target.checked;
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        autoLinkConfig: {
                                                                            ...(prev.autoLinkConfig || { serverId: '', seriesSlug: '', suffix: '.mp4', padZero: true }),
                                                                            padTwoZeros: val,
                                                                            padZero: val ? false : (prev.autoLinkConfig?.padZero || false)
                                                                        }
                                                                    }));
                                                                }}
                                                                className="rounded bg-gray-900 border-gray-700 text-green-500 focus:ring-0"
                                                            />
                                                            صفرين للآحاد (001، 002)
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Visual Simulator & Guide */}
                                    <div className="space-y-6">
                                        <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-4 font-['Cairo']">
                                            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                                                <EyeIcon className="w-5 h-5 text-blue-500" />
                                                معاينة ومحاكاة الربط الذكي
                                            </h4>
                                            
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                إليك كيف سيقوم النظام بتركيب الروابط تلقائياً للحلقات في لوحة العرض:
                                            </p>

                                            <div className="bg-black/40 p-4 rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
                                                <div>
                                                    <span className="text-gray-500 block mb-1">دومين السيرفر الحالي:</span>
                                                    <span className="text-green-400 font-bold block bg-black/60 px-3 py-1.5 rounded border border-gray-900 overflow-x-auto whitespace-nowrap">
                                                        {(() => {
                                                            const sId = formData.autoLinkConfig?.serverId;
                                                            const srv = globalServers.find(s => s.id === sId);
                                                            return srv ? srv.baseDomain : 'https://[اختر سيرفر من القائمة]';
                                                        })()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-gray-500 block mb-1">رابط الحلقة الأولى المتوقع:</span>
                                                    <span className="text-white block bg-black/60 px-3 py-1.5 rounded border border-gray-900 overflow-x-auto whitespace-nowrap">
                                                        {(() => {
                                                            const sId = formData.autoLinkConfig?.serverId;
                                                            const srv = globalServers.find(s => s.id === sId);
                                                            const bDom = srv ? srv.baseDomain : 'https://example-server.com';
                                                            const cleanB = bDom.endsWith('/') ? bDom.slice(0, -1) : bDom;
                                                            const slg = formData.autoLinkConfig?.seriesSlug || '';
                                                            const cleanS = getCleanedSlug(slg);
                                                            const sufx = formData.autoLinkConfig?.suffix || '.mp4';
                                                            const pZ = formData.autoLinkConfig?.padZero ?? true;
                                                            const pTZ = formData.autoLinkConfig?.padTwoZeros ?? false;
                                                            
                                                            let numStr = '1';
                                                            if (pTZ) numStr = '001';
                                                            else if (pZ) numStr = '01';
                                                            
                                                            return `${cleanB}/${cleanS}${numStr}${sufx}`;
                                                        })()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-gray-500 block mb-1">رابط الحلقة 15 المتوقع:</span>
                                                    <span className="text-gray-300 block bg-black/60 px-3 py-1.5 rounded border border-gray-950 overflow-x-auto whitespace-nowrap">
                                                        {(() => {
                                                            const sId = formData.autoLinkConfig?.serverId;
                                                            const srv = globalServers.find(s => s.id === sId);
                                                            const bDom = srv ? srv.baseDomain : 'https://example-server.com';
                                                            const cleanB = bDom.endsWith('/') ? bDom.slice(0, -1) : bDom;
                                                            const slg = formData.autoLinkConfig?.seriesSlug || '';
                                                            const cleanS = getCleanedSlug(slg);
                                                            const sufx = formData.autoLinkConfig?.suffix || '.mp4';
                                                            const pTZ = formData.autoLinkConfig?.padTwoZeros ?? false;
                                                            
                                                            let numStr = '15';
                                                            if (pTZ) numStr = '015';
                                                            
                                                            return `${cleanB}/${cleanS}${numStr}${sufx}`;
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-500 text-xs leading-relaxed space-y-1">
                                                <strong className="block">💡 ميزة الدومينات الذكية:</strong>
                                                <span>
                                                    إذا قمت بتغيير (الدومين) الخاص بالسيرفر من تبويب "السيرفرات" في لوحة التحكم مستقبلاً، فإن جميع روابط تشغيل الحلقات ستتحول تلقائياً وثنائياً إلى الدومين الجديد دون الحاجة لتعديل أي مسلسل بمفرده!
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'related' && (
                            <div className={`${sectionBoxClass} animate-fade-in-up space-y-8`}>
                                <div className="border-b border-gray-800 pb-5">
                                    <h3 className="text-xl font-black text-white flex items-center gap-3 font-['Cairo']">
                                        <StackIcon className="w-7 h-7 text-indigo-500" />
                                        تخصيص الأعمال والمحتوى ذو الصلة
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                        افتراضياً، يقوم النظام بعرض ترشيحات تلقائية (أعمال مشابهة) بناءً على التصنيفات والأنواع المشتركة. يمكنك من هنا ربط وتحديد أعمال معينة يدوياً لتظهر كـ "أعمال مشابهة" لهذا العمل بشكل مخصص.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-['Cairo']">
                                    {/* Left Column: Linked list */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-gray-800 pb-2">
                                            <span>الأعمال المرتبطة حالياً ({formData.relatedContentIds?.length || 0})</span>
                                            {formData.relatedContentIds && formData.relatedContentIds.length > 0 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(p => ({ ...p, relatedContentIds: [] }))}
                                                    className="text-[10px] text-red-400 hover:text-red-500 border border-red-500/20 px-2 py-0.5 rounded bg-red-500/5 hover:underline font-bold"
                                                >
                                                    حذف الجميع
                                                </button>
                                            )}
                                        </h4>

                                        {(!formData.relatedContentIds || formData.relatedContentIds.length === 0) ? (
                                            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 text-center text-gray-500 text-xs font-['Cairo']">
                                                لا توجد أعمال مرتبطة حالياً بشكل مخصص.
                                                <span className="block mt-1 text-gray-600">سيتم استخدام نظام التصنيفات المشابهة التلقائي.</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                                                {formData.relatedContentIds.map((id) => {
                                                    const item = allContentList.find(c => c.id === id);
                                                    if (!item) return null;
                                                    return (
                                                        <div key={id} className="flex items-center justify-between bg-[#13161c] p-3 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors font-['Cairo']">
                                                            <div className="flex items-center gap-3">
                                                                <img src={item.poster} className="w-10 h-14 object-cover rounded-md bg-gray-800 border border-gray-700" alt="" />
                                                                <div>
                                                                    <div className="text-xs font-black text-white">{item.title}</div>
                                                                    <div className="text-[10px] text-gray-500 mt-1">{item.type} • {item.releaseYear}</div>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        relatedContentIds: (prev.relatedContentIds || []).filter(cid => cid !== id)
                                                                    }));
                                                                }}
                                                                className="text-xs text-red-500 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-colors font-bold"
                                                            >
                                                                إلغاء الربط
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Search & Add */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-300">البحث وإضافة أعمال جديدة</h4>
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                value={relatedSearchQuery}
                                                onChange={e => setRelatedSearchQuery(e.target.value)}
                                                placeholder="ابحث باسم الفيلم أو المسلسل..."
                                                className={inputClass}
                                            />
                                            <div className="absolute left-3 top-3.5 text-gray-500">
                                                <SearchIcon className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                            {(() => {
                                                const queryNormalized = normalizeText(relatedSearchQuery.trim());
                                                if (!queryNormalized) {
                                                    return (
                                                        <div className="text-center text-[10px] text-gray-600 border border-dashed border-gray-800 py-6 rounded-lg font-['Cairo'] pb-8 pt-8">
                                                            ابدأ بكتابة كلمات البحث للعثور على المحتوى
                                                        </div>
                                                    );
                                                }

                                                const filtered = allContentList.filter(c => {
                                                    if (c.id === formData.id) return false; // Don't link itself
                                                    if (formData.relatedContentIds?.includes(c.id)) return false; // Already linked
                                                    const titleNorm = normalizeText(c.title || '');
                                                    return titleNorm.includes(queryNormalized);
                                                });

                                                if (filtered.length === 0) {
                                                    return (
                                                        <div className="text-center text-xs text-gray-500 py-6 font-['Cairo']">
                                                            لم يتم العثور على نتائج تطابق معيار البحث.
                                                        </div>
                                                    );
                                                }

                                                return filtered.slice(0, 8).map(c => (
                                                    <div key={c.id} className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-gray-900 hover:border-gray-800 transition-colors font-['Cairo']">
                                                        <div className="flex items-center gap-3">
                                                            <img src={c.poster} className="w-9 h-12 object-cover rounded bg-gray-800" alt="" />
                                                            <div>
                                                                <div className="text-xs font-bold text-white leading-tight">{c.title}</div>
                                                                <div className="text-[10px] text-gray-500 mt-1">{c.type === ContentType.Movie ? 'فيلم' : 'مسلسل'} • {c.releaseYear}</div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    relatedContentIds: [...(prev.relatedContentIds || []), c.id]
                                                                }));
                                                            }}
                                                            className="text-xs bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all font-bold"
                                                        >
                                                            ربط مخصص +
                                                        </button>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preview' && renderLivePreview()}

                    </div>
                </div>

                {showSchedulingUI && (
                    <div className="px-4 md:px-10 py-6 bg-[#1a2230] border-t border-gray-800 animate-fade-in-up">
                        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">تحديد موعد النشر المجدول (المحتوى بالكامل)</h4>
                                    <p className="text-xs text-gray-500 mt-1">اختر متى تريد أن يظهر هذا المحتوى للجمهور تلقائياً.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold">تاريخ النشر</label>
                                    <input 
                                        type="datetime-local" 
                                        value={formData.scheduledAt || ''} 
                                        onChange={(e) => setFormData(prev => ({...prev, scheduledAt: e.target.value}))}
                                        className="bg-[#0f1014] border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none w-full md:w-64 shadow-lg text-sm"
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        setFormData(prev => ({...prev, isScheduled: false, scheduledAt: ''}));
                                        setShowSchedulingUI(false);
                                    }}
                                    className="p-3 mt-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                    title="إلغاء الجدولة"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="h-20 border-t border-gray-800 bg-[#0f1014]/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-10 z-50 sticky bottom-0 w-full shadow-[0_-5px_20px_rgba(0,0,0,0.5)] shrink-0">
                      <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-none px-8 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-800/50 border border-gray-700 hover:bg-gray-800 hover:text-white transition-all shadow-sm disabled:opacity-50">إلغاء</button>
                      
                      <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={() => setShowSchedulingUI(!showSchedulingUI)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all transform active:scale-95 shadow-lg
                                ${showSchedulingUI 
                                    ? 'bg-amber-500 text-black shadow-amber-500/20' 
                                    : 'bg-gray-800 text-amber-500 border border-amber-500/30 hover:bg-amber-500/10'}`}
                          >
                            <CalendarIcon className="w-5 h-5" />
                            <span>{showSchedulingUI ? 'تعديل الجدولة' : 'جدولة النشر'}</span>
                          </button>

                          <button 
                            type="button" 
                            onClick={(e) => handleSubmit(e, showSchedulingUI)} 
                            disabled={isSubmitting} 
                            className={`flex-none px-8 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-black shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {isSubmitting ? <BouncingDotsLoader size="sm" colorClass="bg-black" delayMs={300} /> : <CheckSmallIcon className="w-4 h-4" />}
                            <span>{isSubmitting ? 'جاري الحفظ...' : (showSchedulingUI ? 'حفظ وجدولة' : 'حفظ ونشر المحتوى')}</span>
                          </button>
                      </div>
                </footer>
            </main>

            {galleryState.isOpen && (
                <ImageGalleryModal 
                    isOpen={galleryState.isOpen} 
                    onClose={() => setGalleryState(prev => ({ ...prev, isOpen: false }))} 
                    tmdbId={formData.tmdbId || formData.id} 
                    type={formData.type} 
                    targetField={galleryState.imageType} 
                    onSelect={(url) => {
                        galleryState.onSelect(url);
                        if (galleryState.imageType === 'logo') {
                            setFormData(prev => ({ ...prev, isLogoEnabled: true }));
                        }
                    }} 
                />
            )}
            {isTitleModalOpen && <TitleGalleryModal isOpen={isTitleModalOpen} onClose={() => setIsTitleModalOpen(false)} tmdbId={formData.tmdbId || formData.id || ''} type={formData.type} onSelect={(title) => setFormData(prev => ({...prev, title}))} />}
            {editingServersForEpisode && (
                <ServerManagementModal 
                    episode={editingServersForEpisode} 
                    onClose={() => setEditingServersForEpisode(null)} 
                    onSave={handleUpdateEpisodeServers} 
                    globalServers={globalServers}
                    onRefreshGlobalServers={async () => {
                        try {
                            const data = await getServers();
                            setGlobalServers(data);
                        } catch (err) {
                            console.error("Failed to refresh global servers:", err);
                        }
                    }}
                    addToast={addToast}
                />
            )}
            {isManagingMovieServers && (
                <ServerManagementModal 
                    episode={{id: 0, title: 'الفيلم', progress: 0, servers: formData.servers || []}} 
                    onClose={() => setIsManagingMovieServers(false)} 
                    onSave={handleUpdateMovieServers} 
                    globalServers={globalServers}
                    onRefreshGlobalServers={async () => {
                        try {
                            const data = await getServers();
                            setGlobalServers(data);
                        } catch (err) {
                            console.error("Failed to refresh global servers:", err);
                        }
                    }}
                    addToast={addToast}
                />
            )}
            <DeleteConfirmationModal isOpen={deleteSeasonState.isOpen} onClose={() => setDeleteSeasonState({ isOpen: false, seasonId: null, title: '' })} onConfirm={executeDeleteSeason} title="حذف الموسم" message={`هل أنت متأكد من حذف ${deleteSeasonState.title}؟`} />
            <DeleteConfirmationModal isOpen={deleteEpisodeState.isOpen} onClose={() => setDeleteEpisodeState({ isOpen: false, seasonId: null, episodeId: null, title: '' })} onConfirm={executeDeleteEpisode} title="حذف الحلقة" message={`هل أنت متأكد من حذف ${deleteEpisodeState.title}؟`} />
            <DeleteConfirmationModal isOpen={clearSeasonServersState.isOpen} onClose={() => setClearSeasonServersState({ isOpen: false, seasonId: null, title: '' })} onConfirm={executeClearSeasonServers} title="تفريغ روابط وسيرفرات الموسم" message={`هل أنت متأكد من تفريغ وحذف جميع الروابط والسيرفرات لكافة حلقات "${clearSeasonServersState.title}"؟ لا يمكن التراجع عن هذا الإجراء.`} />
            
            {/* BULK ACTION MODAL */}
            {bulkActionState.isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setBulkActionState(prev => ({ ...prev, isOpen: false }))}>
                    <div className="w-full max-w-md bg-[#0f1014] border border-gray-800 rounded-2xl p-6 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <StackIcon className="w-6 h-6 text-[var(--color-accent)]"/>
                                {bulkActionState.type === 'add' ? 'إضافة حلقات متعددة' : 'حذف حلقات متعددة'}
                            </h3>
                            <button onClick={() => setBulkActionState(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-white"><CloseIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className={labelClass}>من الحلقة رقم</label>
                                    <input type="number" min="1" value={bulkActionState.startFrom} onChange={(e) => setBulkActionState(prev => ({ ...prev, startFrom: e.target.value === '' ? '' : parseInt(e.target.value) }))} className={inputClass} />
                                </div>
                                <div className="flex-1">
                                    <label className={labelClass}>إلى الحلقة رقم</label>
                                    <input type="number" min="1" value={bulkActionState.endTo} onChange={(e) => setBulkActionState(prev => ({ ...prev, endTo: e.target.value === '' ? '' : parseInt(e.target.value) }))} className={inputClass} />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 bg-gray-900 p-3 rounded border border-gray-800 leading-relaxed">
                                {bulkActionState.type === 'add' 
                                    ? `سيتم إضافة حلقات جديدة تبدأ من ${bulkActionState.startFrom || '?'} وتنتهي عند ${bulkActionState.endTo || '?'}. لن يتم تكرار الحلقات الموجودة بالفعل.`
                                    : `تحذير: سيتم حذف جميع الحلقات التي تقع أرقامها بين ${bulkActionState.startFrom || '?'} و ${bulkActionState.endTo || '?'} نهائياً.`
                                }
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setBulkActionState(prev => ({ ...prev, isOpen: false }))} className="flex-1 rounded-lg bg-gray-800 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-700">إلغاء</button>
                            <button onClick={executeBulkAction} className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white shadow-lg ${bulkActionState.type === 'add' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'}`}>
                                {bulkActionState.type === 'add' ? 'تأكيد الإضافة' : 'تأكيد الحذف'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW: AUTO-LINK GENERATION MODAL */}
            {autoLinkState.isOpen && (
                <div className="fixed inset-0 z-[320] bg-[#07080b]/98 backdrop-blur-md overflow-y-auto font-['Cairo'] text-right flex flex-col p-4 md:p-8" dir="rtl" onClick={() => setAutoLinkState(prev => ({ ...prev, isOpen: false }))}>
                    <div className="w-full max-w-4xl mx-auto flex-1 bg-[#10121a] border border-green-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-2 md:my-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-gray-800 bg-[#161b22] px-6 py-5">
                            <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-xl text-green-400">
                                    <LinkIcon className="w-6 h-6"/>
                                </div>
                                <div className="flex flex-col">
                                    <span>توليد روابط الحلقات تلقائياً للموسم</span>
                                    <span className="text-gray-400 text-xs mt-0.5">قم بتكوين قالب الروابط لتوليد روابط لجميع الحلقات بضغطة زر واحدة</span>
                                </div>
                            </h3>
                            <button onClick={() => setAutoLinkState(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 p-2 rounded-xl transition-all"><CloseIcon className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-green-400/90 border-b border-gray-800 pb-2">بيانات الخادم والمسار</h4>
                                    
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className={`${labelClass} !mb-0`}>سيرفر البث (الدومين النشط)</label>
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setAutoLinkNewServerOpen(!autoLinkNewServerOpen);
                                                    setAutoLinkNewServerName('');
                                                    setAutoLinkNewServerDomain('');
                                                }}
                                                className="text-[10px] font-bold text-green-400 hover:text-green-300 hover:underline flex items-center gap-1 select-none"
                                            >
                                                {autoLinkNewServerOpen ? '✕ إغلاق الإضافة السريعة' : '➕ إضافة خادم بث رسمي سريعا'}
                                            </button>
                                        </div>
                                        <select
                                            value={autoLinkState.serverId}
                                            onChange={e => setAutoLinkState(prev => ({...prev, serverId: e.target.value}))}
                                            className={`${inputClass} focus:ring-green-500 focus:border-green-500 text-sm`}
                                        >
                                            <option value="">-- اختر السيرفر --</option>
                                            {globalServers.map(server => (
                                                <option key={server.id} value={server.id}>
                                                    {server.name} ({server.baseDomain})
                                                </option>
                                            ))}
                                        </select>
                                        {globalServers.length === 0 && (
                                            <p className="text-[10px] text-red-500 mt-1.5 font-bold">لا توجد سيرفرات بث مسجلة! يرجى إضافة سيرفر من لوحة الإدارة أو تكوينه بالأسفل.</p>
                                        )}
                                    </div>

                                    {autoLinkNewServerOpen && (
                                        <div className="bg-[#171a25] border border-green-500/20 p-4 rounded-2xl space-y-3 animate-fade-in-down">
                                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                                <span className="text-xs font-black text-green-400">تسجيل خادم بث رسمي جديد</span>
                                                <span className="text-[10px] text-gray-500 font-bold">توفيراً للوقت</span>
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <label className="mb-1 block text-[10px] font-bold text-gray-400">اسم السيرفر الجديد</label>
                                                    <input 
                                                        type="text" 
                                                        value={autoLinkNewServerName} 
                                                        onChange={e => setAutoLinkNewServerName(e.target.value)} 
                                                        placeholder="مثال: Uqload" 
                                                        className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500 font-bold"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-[10px] font-bold text-gray-400 font-['Cairo']">رابط / دومين السيرفر (أو الصق رابط فيديو كامل)</label>
                                                    <input 
                                                        type="text" 
                                                        value={autoLinkNewServerDomain} 
                                                        onChange={e => setAutoLinkNewServerDomain(e.target.value)} 
                                                        placeholder="مثال: https://uqload.co/ أو الصق رابط كامل هنا..." 
                                                        className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500 font-mono text-left dir-ltr"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>

                                            {/* المحرك الذكي لكشف الروابط التلقائية واستخراج الدومين */}
                                            {(() => {
                                                const urlVal = autoLinkNewServerDomain.trim();
                                                const isFullUrl = urlVal && (urlVal.includes('.mp4') || urlVal.includes('.m3u8') || urlVal.includes('?') || (urlVal.match(/\//g) || []).length > 3);
                                                if (!isFullUrl) return null;
                                                
                                                try {
                                                    const urlObj = new URL(urlVal.startsWith('http') ? urlVal : 'https://' + urlVal);
                                                    const host = urlObj.hostname.replace('www.', '');
                                                    const domainOnly = `${urlObj.protocol}//${urlObj.host}/`;
                                                    const rawName = host.split('.')[0];
                                                    const serverNameDefault = rawName.charAt(0).toUpperCase() + rawName.slice(1);
                                                    
                                                    return (
                                                        <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-3 rounded-xl text-[11px] flex flex-col gap-2 font-bold my-1 animate-pulse">
                                                            <div className="flex items-center gap-1.5">
                                                                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                </svg>
                                                                <span>تم كشف رابط كامل! هل تريد استخراج رابط الخادم؟</span>
                                                            </div>
                                                            <div className="flex justify-end gap-1.5">
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => {
                                                                        setAutoLinkNewServerDomain(domainOnly);
                                                                        if (!autoLinkNewServerName.trim()) {
                                                                            setAutoLinkNewServerName(serverNameDefault);
                                                                        }
                                                                        addToast(`تم استخراج رابط الخادم: ${domainOnly}`, "info");
                                                                    }}
                                                                    className="px-2.5 py-1 bg-amber-500 text-black font-black hover:bg-amber-400 rounded-lg text-[10px] shadow-sm cursor-pointer select-none"
                                                                >
                                                                    استخرج رابط الخادم ليكون الدومين الأساسي ⚡
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                } catch {
                                                    return null;
                                                }
                                            })()}

                                            {/* كاشف السيرفرات المكررة مع توفير اختيار سريع */}
                                            {(() => {
                                                if (!autoLinkNewServerName.trim() && !autoLinkNewServerDomain.trim()) return null;
                                                const normalized = autoLinkNewServerName.trim().toLowerCase();
                                                let checkDomain = autoLinkNewServerDomain.trim();
                                                if (checkDomain) {
                                                    if (!checkDomain.startsWith('http://') && !checkDomain.startsWith('https://')) {
                                                        checkDomain = 'https://' + checkDomain;
                                                    }
                                                    if (!checkDomain.endsWith('/')) {
                                                        checkDomain += '/';
                                                    }
                                                }
                                                const checkClean = checkDomain ? checkDomain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase() : '';

                                                const matched = globalServers.find(gs => {
                                                    const isNameMatch = normalized ? gs.name.trim().toLowerCase() === normalized : false;
                                                    const gsClean = gs.baseDomain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
                                                    const isDomainMatch = checkClean ? gsClean === checkClean : false;
                                                    return isNameMatch || isDomainMatch;
                                                });

                                                if (!matched) return null;
                                                return (
                                                    <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-3 rounded-xl text-[11px] flex flex-col gap-2 font-bold my-1">
                                                        <div className="flex flex-col gap-0.5 text-right">
                                                            <span>⚠️ هذا الخادم مضاف مسبقاً بقاعدة البيانات!</span>
                                                            <p className="text-[10px] text-gray-300 font-normal">
                                                                موجود باسم: <span className="text-white font-bold">"{matched.name}"</span> ودومين: <code className="text-emerald-400 font-mono font-bold font-xs bg-emerald-500/5 px-1 py-0.5 rounded">{matched.baseDomain}</code>
                                                            </p>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                setAutoLinkState(prev => ({ ...prev, serverId: matched.id }));
                                                                setAutoLinkNewServerName('');
                                                                setAutoLinkNewServerDomain('');
                                                                setAutoLinkNewServerOpen(false);
                                                                addToast(`تم اختيار السيرفر "${matched.name}" وتحديده بنجاح!`, "info");
                                                            }}
                                                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-[10px] text-center shadow-sm select-none cursor-pointer"
                                                        >
                                                            اعتماده واختياره مباشرة 🔗
                                                        </button>
                                                    </div>
                                                );
                                            })()}

                                            <div className="flex gap-2 justify-end pt-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setAutoLinkNewServerOpen(false)}
                                                    className="px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    إلغاء
                                                </button>
                                                <button 
                                                    type="button" 
                                                    disabled={autoLinkNewServerSaving}
                                                    onClick={async () => {
                                                        if (!autoLinkNewServerName.trim()) {
                                                            addToast("يرجى إدخال اسم السيرفر.", "error");
                                                            return;
                                                        }

                                                        let domain = autoLinkNewServerDomain.trim();
                                                        if (!domain) {
                                                            domain = "https://";
                                                        } else {
                                                            if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
                                                                domain = 'https://' + domain;
                                                            }
                                                            if (!domain.endsWith('/')) {
                                                                domain += '/';
                                                            }
                                                        }

                                                        // Check if still somehow there's a duplicate
                                                        const nameNorm = autoLinkNewServerName.trim().toLowerCase();
                                                        const cleanD = domain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
                                                        const alreadyExist = globalServers.find(gs => {
                                                            const isNM = gs.name.trim().toLowerCase() === nameNorm;
                                                            const gsC = gs.baseDomain.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
                                                            const isDM = cleanD && cleanD !== 'https://' ? gsC === cleanD : false;
                                                            return isNM || isDM;
                                                        });

                                                        if (alreadyExist) {
                                                            setAutoLinkState(prev => ({ ...prev, serverId: alreadyExist.id }));
                                                            setAutoLinkNewServerName('');
                                                            setAutoLinkNewServerDomain('');
                                                            setAutoLinkNewServerOpen(false);
                                                            addToast(`هذا السيرفر مضاف مسبقاً باسم "${alreadyExist.name}". تم اختياره تلقائياً!`, "info");
                                                            return;
                                                        }

                                                        setAutoLinkNewServerSaving(true);
                                                        try {
                                                            await addServer({
                                                                name: autoLinkNewServerName.trim(),
                                                                baseDomain: domain
                                                            });
                                                            const serversData = await getServers();
                                                            setGlobalServers(serversData);

                                                            const newlyAdded = serversData.find(s => s.name.trim().toLowerCase() === autoLinkNewServerName.trim().toLowerCase());
                                                            if (newlyAdded) {
                                                                setAutoLinkState(prev => ({ ...prev, serverId: newlyAdded.id }));
                                                            }

                                                            addToast(`تم إضافة خادم البث "${autoLinkNewServerName}" بنجاح واختياره!`, "success");
                                                            setAutoLinkNewServerName('');
                                                            setAutoLinkNewServerDomain('');
                                                            setAutoLinkNewServerOpen(false);
                                                        } catch (err) {
                                                            addToast("حدث خطأ أثناء إضافة خادم البث الجديد.", "error");
                                                        } finally {
                                                            setAutoLinkNewServerSaving(false);
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 text-[10px] font-black text-black bg-green-500 hover:bg-green-400 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                                >
                                                    {autoLinkNewServerSaving ? 'جاري الإضافة...' : '➕ حفظ وتحديد الخادم'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className={labelClass}>مسار / اسم السلسلة متبوعاً بشرطة مائلة (Series Slug)</label>
                                        <input 
                                            type="text" 
                                            value={autoLinkState.seriesSlug} 
                                            onChange={e => setAutoLinkState(prev => ({...prev, seriesSlug: e.target.value}))} 
                                            className={`${inputClass} font-mono focus:ring-green-500 focus:border-green-500 text-left`}
                                            dir="ltr"
                                            placeholder="مثال: Baba-w-Mama-Giran/" 
                                        />
                                        
                                        {/* Smart URL Detector & Extractor */}
                                        {(() => {
                                            const val = autoLinkState.seriesSlug || '';
                                            const isUrl = val.startsWith('http://') || val.startsWith('https://') || val.includes('://');
                                            if (!isUrl) return null;

                                            try {
                                                const urlObj = new URL(val.startsWith('http') ? val : 'https://' + val);
                                                const hostname = urlObj.hostname;
                                                const pathname = urlObj.pathname;
                                                const segments = pathname.split('/').filter(Boolean);
                                                
                                                let extractedSlug = '';
                                                let extractedSuffix = '.mp4';
                                                let hasFileSegment = false;
                                                let detectedServerId = '';
                                                let detectedServerName = '';

                                                if (segments.length > 0) {
                                                    const lastSegment = segments[segments.length - 1];
                                                    const dotIndex = lastSegment.lastIndexOf('.');
                                                    if (dotIndex !== -1) {
                                                        hasFileSegment = true;
                                                        extractedSuffix = lastSegment.substring(dotIndex);
                                                        const slugSegments = segments.slice(0, -1);
                                                        extractedSlug = slugSegments.join('/') + '/';
                                                    } else {
                                                        extractedSlug = segments.join('/') + '/';
                                                    }
                                                }

                                                // Clean up extractedSlug to have no leading slash and end with a slash if not empty
                                                if (extractedSlug && !extractedSlug.endsWith('/')) {
                                                    extractedSlug += '/';
                                                }

                                                // Try to match a registered server by base domain
                                                const matchedServer = globalServers.find(gs => {
                                                    try {
                                                        const gsUrl = new URL(gs.baseDomain.startsWith('http') ? gs.baseDomain : 'https://' + gs.baseDomain);
                                                        return gsUrl.hostname.replace('www.', '').toLowerCase() === hostname.replace('www.', '').toLowerCase();
                                                    } catch {
                                                        return false;
                                                    }
                                                });

                                                if (matchedServer) {
                                                    detectedServerId = matchedServer.id;
                                                    detectedServerName = matchedServer.name;
                                                }

                                                return (
                                                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs flex flex-col gap-2 mt-2 font-bold animate-fade-in">
                                                        <div className="flex items-center gap-1.5 text-amber-500">
                                                            <span className="animate-pulse">⚡ ذكاء المحرك: تم كشف رابط كامل!</span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-300 space-y-1 font-normal text-right" dir="rtl">
                                                            {extractedSlug && (
                                                                <div>• المسار المستخلص: <span className="text-amber-400 font-mono font-bold" dir="ltr">{extractedSlug}</span></div>
                                                            )}
                                                            {hasFileSegment && (
                                                                <div>• الامتداد المستخلص: <span className="text-amber-400 font-mono font-bold" dir="ltr">{extractedSuffix}</span></div>
                                                            )}
                                                            {detectedServerName && (
                                                                <div>• السيرفر المطابق بقاعدة البيانات: <span className="text-emerald-400 font-bold">{detectedServerName}</span></div>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setAutoLinkState(prev => {
                                                                    const updated = { ...prev };
                                                                    if (extractedSlug) updated.seriesSlug = extractedSlug;
                                                                    if (hasFileSegment) updated.suffix = extractedSuffix;
                                                                    if (detectedServerId) updated.serverId = detectedServerId;
                                                                    return updated;
                                                                });
                                                                addToast("تم استخراج المسار والامتداد (وتحديد السيرفر إن وجد) بنجاح 🚀", "success");
                                                            }}
                                                            className="mt-2 w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-[11px] transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-md"
                                                        >
                                                            <span>استخرج المسار من الرابط 🔗</span>
                                                        </button>
                                                    </div>
                                                );
                                            } catch {
                                                return null;
                                            }
                                        })()}

                                        <p className="text-[10px] text-gray-500 mt-1.5 font-bold">تلميح: اسم المجلد على السيرفر (مثال: `Baba-w-Mama-Giran/` أو `series/El-Set-Monaliza/` )</p>
                                    </div>
                                    
                                    <div>
                                        <label className={labelClass}>صيغة / امتداد الفيديو (Suffix)</label>
                                        <input 
                                            type="text" 
                                            value={autoLinkState.suffix} 
                                            onChange={e => setAutoLinkState(prev => ({...prev, suffix: e.target.value}))} 
                                            className={`${inputClass} dir-ltr focus:ring-green-500 focus:border-green-500 text-left`} 
                                            placeholder="مثال: .mp4" 
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-green-400/90 border-b border-gray-800 pb-2">خيارات ترقيم الحلقات</h4>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className={labelClass}>من الحلقة</label>
                                            <input type="number" min="1" value={autoLinkState.startNum} onChange={e => setAutoLinkState(prev => ({...prev, startNum: e.target.value === '' ? '' : parseInt(e.target.value)}))} className={`${inputClass} focus:ring-green-500 focus:border-green-500`} placeholder="رقم البداية" />
                                        </div>
                                        <div className="flex-1">
                                            <label className={labelClass}>إلى الحلقة</label>
                                            <input type="number" min="1" value={autoLinkState.endNum} onChange={e => setAutoLinkState(prev => ({...prev, endNum: e.target.value === '' ? '' : parseInt(e.target.value)}))} className={`${inputClass} focus:ring-green-500 focus:border-green-500`} placeholder="رقم النهاية" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between bg-[#161b22] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                                            <span className="text-xs font-bold text-gray-300">إضافة صفر للأرقام الفردية (01, 02 بدل 1, 2)</span>
                                            <ToggleSwitch checked={autoLinkState.padZero} onChange={val => setAutoLinkState(prev => ({...prev, padZero: val, padTwoZeros: val ? false : prev.padTwoZeros}))} label={autoLinkState.padZero ? "مفعل" : "معطل"} />
                                        </div>
                                        <div className="flex items-center justify-between bg-[#161b22] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                                            <span className="text-xs font-bold text-gray-300">إضافة صفرين للأرقام الفردية (001, 002, 010 بدل 1, 2, 10)</span>
                                            <ToggleSwitch checked={autoLinkState.padTwoZeros} onChange={val => setAutoLinkState(prev => ({...prev, padTwoZeros: val, padZero: val ? false : prev.padZero}))} label={autoLinkState.padTwoZeros ? "مفعل" : "معطل"} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full pointer-events-none"></div>
                                <span className="text-[10px] text-green-500 font-bold uppercase block mb-2">معاينة للرابط (الحلقة الأولى):</span>
                                <div className="text-xs md:text-sm text-white font-mono break-all dir-ltr text-left bg-black/50 p-4 rounded-xl border border-green-500/20 shadow-inner">
                                    {(() => {
                                        const matchedServer = globalServers.find(s => s.id === autoLinkState.serverId);
                                        const base = matchedServer ? matchedServer.baseDomain : 'https://[SERVER_DOMAIN]/';
                                        const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
                                        const slug = autoLinkState.seriesSlug || '[SERIES_SLUG]/';
                                        const cleanSlug = getCleanedSlug(slug);
                                        
                                        const num = autoLinkState.startNum || 1;
                                        let numStr = `${num}`;
                                        if (autoLinkState.padTwoZeros) {
                                            numStr = num < 10 ? `00${num}` : (num < 100 ? `0${num}` : `${num}`);
                                        } else if (autoLinkState.padZero) {
                                            numStr = num < 10 ? `0${num}` : `${num}`;
                                        }
                                        
                                        return `${cleanBase}/${cleanSlug}${numStr}${autoLinkState.suffix || '.mp4'}`;
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 p-6 border-t border-gray-800 bg-[#161b22]/50 justify-end">
                            <button onClick={() => setAutoLinkState(prev => ({ ...prev, isOpen: false }))} className="px-6 py-3 rounded-xl bg-gray-800 text-sm font-bold text-gray-300 hover:bg-gray-700 transition-all">إلغاء</button>
                            <button onClick={executeAutoLinkGeneration} className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <LinkIcon className="w-5 h-5" />
                                توليد واعتماد الروابط
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK EPISODE IMAGE MODAL */}
            {bulkImageState.isOpen && (
                <div className="fixed inset-0 z-[330] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setBulkImageState(prev => ({ ...prev, isOpen: false }))}>
                    <div className="w-full max-w-lg bg-[#0f1014] border border-purple-500/30 rounded-2xl p-6 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 font-['Cairo']">
                                <PhotoIcon className="w-6 h-6 text-purple-400"/>
                                تحديث صور الحلقات دفعة واحدة
                            </h3>
                            <button onClick={() => setBulkImageState(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-white"><CloseIcon className="w-5 h-5"/></button>
                        </div>

                        <div className="space-y-4 font-['Cairo']">
                            <div>
                                <label className={labelClass}>رابط الصورة للمشغل/الحلقات</label>
                                <input 
                                    type="text" 
                                    value={bulkImageState.imageUrl} 
                                    onChange={e => setBulkImageState(prev => ({ ...prev, imageUrl: e.target.value }))} 
                                    className={`${inputClass} text-left font-mono focus:ring-purple-500 focus:border-purple-500`}
                                    dir="ltr"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-[10px] text-gray-500 mt-1.5 font-bold">تلميح: يمكنك مسح الرابط الحالي وإدخال رابط صورة المشغل المطلوب تطبيقه دفعة واحدة.</p>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass}>نطاق التطبيق</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setBulkImageState(prev => ({ ...prev, applyRange: 'all' }))}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${bulkImageState.applyRange === 'all' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                                    >
                                        <span>جميع الحلقات</span>
                                        <span className="text-[9px] text-gray-500">تطبيق على كافة الحلقات بلا استثناء</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setBulkImageState(prev => ({ ...prev, applyRange: 'range' }))}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${bulkImageState.applyRange === 'range' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                                    >
                                        <span>نطاق محدد</span>
                                        <span className="text-[9px] text-gray-500">تحديد حلقة ابتدائية ونهائية بالتحديد</span>
                                    </button>
                                </div>
                            </div>

                            {bulkImageState.applyRange === 'range' && (
                                <div className="flex gap-4 animate-fade-in-down">
                                    <div className="flex-1">
                                        <label className={labelClass}>من الحلقة رقم</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={bulkImageState.fromEpisodes} 
                                            onChange={e => setBulkImageState(prev => ({ ...prev, fromEpisodes: e.target.value === '' ? '' : parseInt(e.target.value) }))} 
                                            className={`${inputClass} focus:ring-purple-500 focus:border-purple-500`} 
                                            placeholder="رقم البداية" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className={labelClass}>إلى الحلقة رقم</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={bulkImageState.toEpisodes} 
                                            onChange={e => setBulkImageState(prev => ({ ...prev, toEpisodes: e.target.value === '' ? '' : parseInt(e.target.value) }))} 
                                            className={`${inputClass} focus:ring-purple-500 focus:border-purple-500`} 
                                            placeholder="رقم النهاية" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800 font-['Cairo']">
                            <button onClick={() => setBulkImageState(prev => ({ ...prev, isOpen: false }))} className="flex-1 rounded-lg bg-gray-800 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-700">إلغاء</button>
                            <button onClick={executeApplyBulkImage} className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <PhotoIcon className="w-4 h-4" />
                                تطبيق على الحلقات
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK EPISODE SERVERS RENAME MODAL */}
            {bulkServerNamesState.isOpen && (
                <div className="fixed inset-0 z-[330] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setBulkServerNamesState(prev => ({ ...prev, isOpen: false }))}>
                    <div className="w-full max-w-lg bg-[#0f1014] border border-blue-500/30 rounded-2xl p-6 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                            <h3 className="text-lg font-black text-white flex items-center gap-2 font-['Cairo']">
                                <ServerIcon className="w-6 h-6 text-blue-400"/>
                                تسمية السيرفرات دفعة واحدة للموسم
                            </h3>
                            <button onClick={() => setBulkServerNamesState(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-white"><CloseIcon className="w-5 h-5"/></button>
                        </div>

                        <div className="space-y-4 font-['Cairo'] text-right">
                            <p className="text-xs text-gray-400 leading-relaxed">
                                سيتم تحديث أسماء السيرفرات لحلقات هذا الموسم بالترتيب. على سبيل المثال: الاسم الأول سيتم تطبيقه على السيرفر الأول في كل حلقة، والاسم الثاني على السيرفر الثاني، وهكذا. يمكنك ترك الحقل فارغاً لعدم تعديل اسم السيرفر في ذلك الترتيب.
                            </p>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                <label className={labelClass}>أسماء السيرفرات بالترتيب</label>
                                {bulkServerNamesState.serverNames.map((name, index) => (
                                    <div key={index} className="flex items-center gap-2 animate-fade-in-down">
                                        <span className="text-xs font-bold text-gray-500 w-16 text-left">سيرفر {index + 1}:</span>
                                        <input 
                                            type="text" 
                                            value={name} 
                                            onChange={e => handleServerNameChange(index, e.target.value)} 
                                            className={`${inputClass} focus:ring-blue-500 focus:border-blue-500 py-2`}
                                            placeholder={`مثال: سيرفر سريع، VIP، إلخ.`}
                                        />
                                        {bulkServerNamesState.serverNames.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveServerNameField(index)} 
                                                className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg border border-red-500/20 transition-all flex-shrink-0"
                                                title="حذف هذا الاسم"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button 
                                type="button" 
                                onClick={handleAddServerNameField} 
                                className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5"
                            >
                                <PlusIcon className="w-4 h-4"/>
                                إضافة حقل اسم سيرفر إضافي
                            </button>

                            <div className="space-y-2 border-t border-gray-800/80 pt-4">
                                <label className={labelClass}>نطاق التطبيق</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setBulkServerNamesState(prev => ({ ...prev, applyRange: 'all' }))}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${bulkServerNamesState.applyRange === 'all' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                                    >
                                        <span>جميع الحلقات</span>
                                        <span className="text-[9px] text-gray-500">تطبيق على كافة الحلقات بلا استثناء</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setBulkServerNamesState(prev => ({ ...prev, applyRange: 'range' }))}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${bulkServerNamesState.applyRange === 'range' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                                    >
                                        <span>نطاق محدد</span>
                                        <span className="text-[9px] text-gray-500">تحديد حلقة ابتدائية ونهائية بالتحديد</span>
                                    </button>
                                </div>
                            </div>

                            {bulkServerNamesState.applyRange === 'range' && (
                                <div className="flex gap-4 animate-fade-in-down">
                                    <div className="flex-1">
                                        <label className={labelClass}>من الحلقة رقم</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={bulkServerNamesState.fromEpisodes} 
                                            onChange={e => setBulkServerNamesState(prev => ({ ...prev, fromEpisodes: e.target.value === '' ? '' : parseInt(e.target.value) }))} 
                                            className={`${inputClass} focus:ring-blue-500 focus:border-blue-500`} 
                                            placeholder="رقم البداية" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className={labelClass}>إلى الحلقة رقم</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={bulkServerNamesState.toEpisodes} 
                                            onChange={e => setBulkServerNamesState(prev => ({ ...prev, toEpisodes: e.target.value === '' ? '' : parseInt(e.target.value) }))} 
                                            className={`${inputClass} focus:ring-blue-500 focus:border-blue-500`} 
                                            placeholder="رقم النهاية" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800 font-['Cairo']">
                            <button onClick={() => setBulkServerNamesState(prev => ({ ...prev, isOpen: false }))} className="flex-1 rounded-lg bg-gray-800 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-700">إلغاء</button>
                            <button onClick={executeApplyBulkServerNames} className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <ServerIcon className="w-4 h-4" />
                                تطبيق الأسماء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EPISODE SCHEDULING MODAL */}
            {episodeSchedulingState.isOpen && (
                <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setEpisodeSchedulingState(prev => ({ ...prev, isOpen: false }))}>
                    <div className="w-full max-w-sm bg-[#0f1014] border border-amber-500/30 rounded-2xl p-6 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <CalendarIcon className="w-5 h-5"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">جدولة نشر الحلقة</h3>
                                <p className="text-xs text-gray-400">حدد موعد ظهور هذه الحلقة للمستخدمين.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>تاريخ ووقت النشر</label>
                                <input 
                                    type="datetime-local" 
                                    value={episodeSchedulingState.currentDate || ''} 
                                    onChange={(e) => setEpisodeSchedulingState(prev => ({ ...prev, currentDate: e.target.value }))}
                                    className={inputClass + " border-amber-500/30 focus:border-amber-500"} 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setEpisodeSchedulingState(prev => ({ ...prev, currentDate: '' }))}
                                    className="text-xs text-red-400 hover:text-red-300 mt-2 underline"
                                >
                                    مسح التاريخ (إلغاء الجدولة)
                                </button>
                            </div>

                            <div className="bg-[#161b22] rounded-xl p-4 space-y-3 border border-gray-800">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <BellIcon className="w-3 h-3"/> إعدادات الإشعارات
                                </h4>
                                
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${episodeSchedulingState.notifyUsers ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-600'}`}>
                                        {episodeSchedulingState.notifyUsers && <CheckSmallIcon className="w-3.5 h-3.5 text-white"/>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={episodeSchedulingState.notifyUsers} onChange={(e) => setEpisodeSchedulingState(prev => ({ ...prev, notifyUsers: e.target.checked }))} />
                                    <div className="text-xs text-gray-300">إرسال إشعار للمستخدمين عند النشر</div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${episodeSchedulingState.notifyAdmins ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'}`}>
                                        {episodeSchedulingState.notifyAdmins && <CheckSmallIcon className="w-3.5 h-3.5 text-white"/>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={episodeSchedulingState.notifyAdmins} onChange={(e) => setEpisodeSchedulingState(prev => ({ ...prev, notifyAdmins: e.target.checked }))} />
                                    <div className="text-xs text-gray-300">إشعار الأدمن عند اكتمال النشر</div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
                            <button onClick={() => setEpisodeSchedulingState(prev => ({ ...prev, isOpen: false }))} className="flex-1 rounded-lg bg-gray-800 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-700">إغلاق</button>
                            <button onClick={confirmEpisodeSchedule} className="flex-1 rounded-lg py-2.5 text-sm font-bold text-black bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20">
                                حفظ الجدولة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {youTubeSearchState.isOpen && (
                <YouTubeSearchModal 
                    isOpen={youTubeSearchState.isOpen}
                    onClose={() => setYouTubeSearchState({ isOpen: false, targetId: null })}
                    initialQuery={formData.title}
                    onSelect={(url) => {
                        const { targetId } = youTubeSearchState;
                        if (targetId === 'main') {
                            setFormData(prev => ({ ...prev, trailerUrl: url }));
                        } else if (typeof targetId === 'number') {
                            handleUpdateSeason(targetId, 'trailerUrl', url);
                        }
                        setYouTubeSearchState({ isOpen: false, targetId: null });
                        addToast("تم تحديث رابط التريلر بنجاح!", "success");
                    }}
                />
            )}

            {previewVideoState.isOpen && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-md" onClick={() => setPreviewVideoState({ isOpen: false, url: '', title: '', poster: '' })}>
                    <div className="w-full max-w-6xl bg-[#0a0c10] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#161b22]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <PlayIcon className="w-5 h-5 text-[#00cba9]"/>
                                معاينة: {previewVideoState.title}
                            </h3>
                            <button onClick={() => setPreviewVideoState({ isOpen: false, url: '', title: '', poster: '' })} className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-red-500/20 p-2 rounded-lg">
                                <CloseIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="w-full aspect-video bg-black relative">
                            <VideoPlayer 
                                manualSrc={previewVideoState.url} 
                                poster={previewVideoState.poster} 
                                title={previewVideoState.title} 
                                onClose={() => setPreviewVideoState({ isOpen: false, url: '', title: '', poster: '' })} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentEditModal;