'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { FESTIVE_CONFIG, isFestiveModeActive } from '@/config/festive-config';

export default function AnnouncementBar() {
    const [setting, setSetting] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchSetting = async () => {
            try {
                const data = await fetchAPI('/store/settings/announcement');
                if (data && data.value) {
                    setSetting(data.value);
                }
            } catch (e) {
                console.error("AnnouncementBar fetch failed", e);
            }
        };
        fetchSetting();
    }, []);

    if (!isMounted || !setting || !setting.isActive) return null;

    const isFestive = isFestiveModeActive();

    // Festive Content
    const bannerText = (isFestive && FESTIVE_CONFIG.theme.greeting) ? FESTIVE_CONFIG.theme.greeting : setting.text;
    const bannerLink = (isFestive) ? "/shop?collection=festive" : setting.link;

    const content = (
        <div className={`py-2 px-4 text-center text-[10px] md:text-xs font-black uppercase tracking-[0.25em] relative z-[60] overflow-hidden group transition-all duration-700 ${isFestive ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-green-500 text-white' : 'bg-brand-gold text-brand-navy'
            }`}>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>

            <span className="relative z-10">{bannerText}</span>
            {bannerLink && <span className="ml-2 underline font-serif italic relative z-10 group-hover:text-white transition-colors">Explore Now</span>}
        </div>
    );

    if (bannerLink) {
        return <Link href={bannerLink}>{content}</Link>;
    }

    return content;
}
