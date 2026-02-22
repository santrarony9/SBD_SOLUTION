'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

import { motion, AnimatePresence } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';

export default function FlashSale() {
    const [setting, setSetting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<{ h: string, m: string, s: string } | null>(null);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const setting = await fetchAPI('/store/settings/flash_sale');
                if (setting && setting.value) {
                    setSetting(setting.value);
                }
            } catch (e) {
                console.error("FlashSale fetch failed", e);
            } finally {
                setLoading(false);
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
                setTimeLeft(null);
                clearInterval(interval);
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({
                h: h.toString().padStart(2, '0'),
                m: m.toString().padStart(2, '0'),
                s: s.toString().padStart(2, '0')
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [setting]);

    if (loading) {
        return (
            <div className="bg-brand-navy h-16 w-full flex items-center justify-center">
                <SkeletonLoader variant="text" className="w-1/3 bg-white/10" />
            </div>
        );
    }

    if (!setting || !setting.isActive || !timeLeft) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-navy border-y border-brand-gold/20 py-5 px-6 flex flex-col md:flex-row items-center justify-center gap-8 text-center relative overflow-hidden"
        >
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>

            <div className="flex items-center gap-3 relative z-10">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                <span className="text-white text-[11px] font-bold uppercase tracking-[0.3em]">{setting.text || 'Flash Sale Ends In:'}</span>
            </div>

            <div className="flex gap-4 relative z-10">
                <TimeUnit value={timeLeft.h} label="Hours" />
                <TimeUnit value={timeLeft.m} label="Mins" />
                <TimeUnit value={timeLeft.s} label="Secs" />
            </div>

            <button className="relative z-10 bg-brand-gold text-brand-navy px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-lg active:scale-95">
                Shop the Moment
            </button>
        </motion.div>
    );
}

function TimeUnit({ value, label }: { value: string, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="flex gap-1">
                {value.split('').map((digit, i) => (
                    <motion.div
                        key={`${label}-${i}-${digit}`}
                        initial={{ rotateX: 90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        className="bg-white/10 backdrop-blur-md border border-white/10 w-8 h-10 md:w-10 md:h-12 flex items-center justify-center text-brand-gold font-serif text-xl md:text-2xl"
                    >
                        {digit}
                    </motion.div>
                ))}
            </div>
            <span className="text-[8px] uppercase tracking-widest text-brand-gold/50 mt-1 font-bold">{label}</span>
        </div>
    );
}
