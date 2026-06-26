
import React, { useState, useEffect } from 'react';
import { getAdByPosition } from '@/firebase';
import type { Ad } from '@/types';
import AdDisplay from './AdDisplay';

interface AdZoneProps {
    position: string;
    className?: string;
}

const AdZone: React.FC<AdZoneProps> = ({ position, className }) => {
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchAd = async () => {
            setLoading(true);
            try {
                const fetchedAd = await getAdByPosition(position);
                if (isMounted && fetchedAd) {
                    setAd(fetchedAd);
                } else {
                    setAd(null);
                }
            } catch (error) {
                console.error('Standalone AdZone loading failed:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAd();
        return () => { isMounted = false; };
    }, [position]);

    if (loading) return null; 
    if (!ad) return null;

    const adType = ad.type || 'code';

    if (adType === 'banner' && ad.imageUrl) {
        return (
            <div className={`w-full flex justify-center items-center my-6 z-10 relative ad-slot-zone ${className || ''}`}>
                <a 
                    href={ad.destinationUrl || '#'} 
                    target="_blank" 
                    rel="nofollow noopener noreferrer"
                    className="block transition-transform hover:scale-[1.01] active:scale-[0.98] max-w-full mx-auto"
                >
                    <img 
                        src={ad.imageUrl} 
                        alt={ad.title || "Advertisement"} 
                        className="max-w-full h-auto rounded-2xl shadow-2xl object-contain border border-white/5 mx-auto"
                        style={{ maxHeight: '250px' }} 
                    />
                </a>
            </div>
        );
    }

    if (adType === 'code') {
        const minHeight = position === 'global_head' ? '0px' : '90px';
        
        return (
            <AdDisplay 
                adCode={ad.code || ad.scriptCode || ''} 
                className={`ad-zone-code-wrapper w-full flex justify-center my-4 ${className || ''}`}
                style={{ minHeight: minHeight }}
            />
        );
    }

    return null;
};

export default AdZone;
