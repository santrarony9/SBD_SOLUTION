'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function FlashSale() {
    const [setting, setSetting] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const setting = await fetchAPI('/store/settings/flash_sale');
                if (setting && setting.value) {
                    setSetting(setting.value);
                }
            } catch (e) {
                console.error("FlashSale fetch failed", e);
            }
        };
        fetchSetting();
    }, []);

    useEffect(() => {
        if (!setting || !setting.isActive || !setting.endTime) return;

        const interval = setInterval(() => {
            const end = new Date(setting.endTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('EXPIRED');
                clearInterval(interval);
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [setting]);

    if (!setting || !setting.isActive || timeLeft === 'EXPIRED') return null;

    return (
        <div className="bg-brand-navy border-y border-brand-gold/20 py-4 px-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                <span className="text-white text-xs font-bold uppercase tracking-widest">{setting.text || 'Flash Sale Ends In:'}</span>
            </div>
            <div className="flex gap-4">
                <div className="text-brand-gold font-serif text-2xl md:text-3xl tracking-tighter">
                    {timeLeft}
                </div>
            </div>
            <button className="bg-brand-gold text-brand-navy px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
                Shop Deals
            </button>
        </div>
    );
}
