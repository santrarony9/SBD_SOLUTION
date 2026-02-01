'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnnouncementBar() {
    const [setting, setSetting] = useState<any>(null);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/store/settings/announcement`);
                if (res.ok) {
                    const data = await res.json();
                    setSetting(data.value);
                }
            } catch (e) {
                console.error("AnnouncementBar fetch failed", e);
            }
        };
        fetchSetting();
    }, []);

    if (!setting || !setting.isActive) return null;

    const content = (
        <div className="bg-brand-gold text-brand-navy py-2 px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] relative z-[60]">
            {setting.text}
            {setting.link && <span className="ml-2 underline font-serif italic">Explore Now</span>}
        </div>
    );

    if (setting.link) {
        return <Link href={setting.link}>{content}</Link>;
    }

    return content;
}
