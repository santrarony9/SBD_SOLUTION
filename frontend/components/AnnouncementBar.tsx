'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

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

    const content = (
        <div className="bg-brand-gold text-brand-navy py-2 px-4 text-center text-[10px] md:text-xs font-black uppercase tracking-[0.25em] relative z-[60] overflow-hidden group">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>

            <span className="relative z-10">{setting.text}</span>
            {setting.link && <span className="ml-2 underline font-serif italic relative z-10 group-hover:text-white transition-colors">Explore Now</span>}
        </div>
    );

    if (setting.link) {
        return <Link href={setting.link}>{content}</Link>;
    }

    return content;
}
