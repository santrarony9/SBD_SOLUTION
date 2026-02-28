'use client';

import { useState, useEffect } from 'react';
import { PiGift, PiCopy, PiCheckCircle, PiX } from 'react-icons/pi';
import { fetchAPI } from '@/lib/api';
import { safeLocalStorage } from '@/lib/storage';

export default function CreatorPromoWidget() {
    const [activePromo, setActivePromo] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        // Fetch all promos and just pick the first active one that has a creatorName for demo purposes
        // In a real scenario, you might pass a specific promo code in the URL like ?ref=SONA10
        const loadPromos = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const refCode = urlParams.get('ref');

                const promos = await fetchAPI('/promos');
                if (promos && promos.length > 0) {
                    // If URL has ?ref=CODE, use that code. Otherwise, find first code with a creator name.
                    let targetPromo = null;
                    if (refCode) {
                        targetPromo = promos.find((p: any) => p.code.toUpperCase() === refCode.toUpperCase());
                    } else {
                        targetPromo = promos.find((p: any) => p.creatorName && p.creatorName.trim() !== '');
                    }

                    if (targetPromo) {
                        setActivePromo(targetPromo);
                        // Delay appearance slightly for a nice effect
                        setTimeout(() => setIsVisible(true), 1500);
                    }
                }
            } catch (error) {
                console.error('Failed to load active promos:', error);
            }
        };

        const widgetClosed = safeLocalStorage.getItem('sbd_creator_widget_closed');
        if (widgetClosed !== 'true') {
            loadPromos();
        }
    }, []);

    const handleCopy = () => {
        if (!activePromo) return;
        navigator.clipboard.writeText(activePromo.code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    const handleClose = () => {
        setIsVisible(false);
        setIsClosed(true);
        safeLocalStorage.setItem('sbd_creator_widget_closed', 'true');
    };

    if (!activePromo || !isVisible || isClosed) return null;

    const discountText = activePromo.discountType === 'PERCENTAGE'
        ? `${activePromo.discountValue}% OFF`
        : `₹${activePromo.discountValue} OFF`;

    return (
        <div className="fixed bottom-6 left-6 z-[60] animate-bounce-in-up">
            <div className="bg-white/95 backdrop-blur-xl border border-brand-gold/20 shadow-[-10px_20px_40px_rgba(45,0,86,0.15)] rounded-2xl p-1 pr-4 pl-1 flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-2 -right-2 bg-white text-gray-400 border border-gray-100 rounded-full p-1 hover:text-brand-navy hover:scale-110 transition-all shadow-sm"
                >
                    <PiX size={12} />
                </button>

                {/* Creator Avatar / Gift Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-brand-gold via-[#ffd085] to-brand-gold rounded-xl flex items-center justify-center text-brand-navy shadow-inner shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 animate-sparkle"></div>
                    <PiGift className="text-3xl relative z-10" />
                </div>

                {/* Content */}
                <div className="py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-0.5">
                        {activePromo.creatorName ? `${activePromo.creatorName}'s Gift` : 'Special Promo'}
                    </p>
                    <p className="text-sm font-serif text-brand-navy leading-tight pr-6">
                        Unlock <b>{discountText}</b> your entire order.
                    </p>

                    <button
                        onClick={handleCopy}
                        className={`mt-2 text-[10px] font-bold tracking-widest flex items-center gap-1.5 transition-colors group/btn ${isCopied ? "text-green-600" : "text-brand-navy hover:text-brand-gold"}`}
                    >
                        {isCopied ? (
                            <>
                                <PiCheckCircle size={14} />
                                CODE COPIED
                            </>
                        ) : (
                            <>
                                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono group-hover/btn:bg-brand-gold/10 transition-colors uppercase">
                                    {activePromo.code}
                                </span>
                                <PiCopy size={14} />
                                COPY CODE
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
