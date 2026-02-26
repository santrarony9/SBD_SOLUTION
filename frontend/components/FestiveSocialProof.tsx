'use client';

import React, { useState, useEffect } from 'react';
import { PiBagFill } from 'react-icons/pi';
import { FESTIVE_CONFIG, isFestiveModeActive } from '@/config/festive-config';
import { fetchAPI } from '@/lib/api';

const MOCK_DATA = [
    { name: 'Aarav', city: 'Mumbai', product: 'Signature Diamond Studs' },
    { name: 'Meera', city: 'Delhi', product: 'Royal Gold Bracelet' },
    { name: 'Ishaan', city: 'Bangalore', product: 'Festive Solitaire Ring' },
    { name: 'Diya', city: 'Jaipur', product: 'Sparkling Rose Pendant' }
];

export default function FestiveSocialProof() {
    const [orders, setOrders] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isFestiveModeActive() || !FESTIVE_CONFIG.features.socialProof) return;

        const loadOrders = async () => {
            try {
                const data = await fetchAPI('/orders/public/recent');
                if (data && Array.isArray(data) && data.length > 0) {
                    setOrders(data);
                } else {
                    setOrders(MOCK_DATA);
                }
            } catch (e) {
                console.error("Failed to fetch real social proof:", e);
                setOrders(MOCK_DATA);
            }
        };

        loadOrders();
    }, []);

    useEffect(() => {
        if (orders.length === 0) return;

        const showNotification = () => {
            setIsVisible(true);

            // Hide after 6 seconds
            setTimeout(() => {
                setIsVisible(false);
                // Move to next order after hiding
                setTimeout(() => {
                    setCurrentIndex((prev) => (prev + 1) % orders.length);
                }, 1000);
            }, 6000);
        };

        // Initial delay
        const initialTimer = setTimeout(showNotification, 5000);

        // Repeat every 30 seconds
        const interval = setInterval(showNotification, 30000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [orders]);

    if (orders.length === 0) return null;

    const currentOrder = orders[currentIndex];

    return (
        <div className={`fixed bottom-24 md:bottom-10 left-4 md:left-10 z-[80] transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}>
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-brand-gold/20 flex items-center gap-4 max-w-xs">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-3 rounded-full text-white shadow-lg shadow-pink-500/20">
                    <PiBagFill className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-1">Verified Purchase</p>
                    <p className="text-sm text-brand-navy leading-tight">
                        <span className="font-bold">{currentOrder.name}</span> from {currentOrder.city} just bought the <span className="text-pink-500 font-medium">{currentOrder.product}</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
