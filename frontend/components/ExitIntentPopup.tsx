'use client';

import { useEffect, useState } from 'react';
import { PiX } from 'react-icons/pi';

export default function ExitIntentPopup() {
    const [setting, setSetting] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/store/settings/exit_intent`);
                if (res.ok) {
                    const text = await res.text();
                    if (text) {
                        const data = JSON.parse(text);
                        setSetting(data.value);
                    }
                }
            } catch (e) {
                console.error("ExitIntent fetch failed", e);
            }
        };
        fetchSetting();
    }, []);

    useEffect(() => {
        if (!setting || !setting.isActive || hasShown) return;

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 0 && !hasShown) {
                setIsVisible(true);
                setHasShown(true);
                // Disable scrolling when popup is active
                document.body.style.overflow = 'hidden';
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [setting, hasShown]);

    const closePopup = () => {
        setIsVisible(false);
        document.body.style.overflow = 'auto';
    };

    if (!isVisible || !setting) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md relative overflow-hidden shadow-2xl rounded-sm border-t-4 border-brand-gold">
                <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 text-gray-400 hover:text-brand-navy transition-colors"
                >
                    <PiX className="h-6 w-6" />
                </button>

                <div className="p-10 text-center">
                    <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Special Offer</span>
                    <h2 className="text-3xl font-serif text-brand-navy mb-4">
                        {setting.title || "Wait! Before you leave..."}
                    </h2>
                    <p className="text-gray-500 font-light text-sm mb-8">
                        {setting.message || "Get an exclusive discount on your signature piece today. Don't let your dream jewellery slip away."}
                    </p>

                    <div className="bg-brand-cream py-4 px-6 mb-8 rounded-sm border border-brand-gold/20">
                        <span className="text-gray-400 text-[10px] uppercase block mb-1">Your Personal Code</span>
                        <span className="text-2xl font-mono font-bold text-brand-navy tracking-widest uppercase">
                            {setting.discountCode || "WELCOME10"}
                        </span>
                    </div>

                    <button
                        onClick={closePopup}
                        className="w-full bg-brand-navy text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-brand-gold hover:text-brand-navy transition-all duration-300"
                    >
                        Reveal My Discount
                    </button>

                    <button
                        onClick={closePopup}
                        className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest hover:text-brand-navy underline underline-offset-4"
                    >
                        No thanks, I'll pass
                    </button>
                </div>

                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl"></div>
            </div>
        </div>
    );
}
