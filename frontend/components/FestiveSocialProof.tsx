'use client';

import React, { useState, useEffect } from 'react';
import { PiBagFill } from 'react-icons/pi';
import { FESTIVE_CONFIG, isFestiveModeActive } from '@/config/festive-config';

const MOCK_NAMES = ['Aarav', 'Ishaan', 'Vihaan', 'Ananya', 'Diya', 'Rohan', 'Sneha', 'Meera', 'Aditya', 'Kavya'];
const MOCK_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur'];
const MOCK_PRODUCTS = ['Holi Signature Necklace', 'Gulal Gold Bracelet', 'Diamond Studs', 'Royal Emerald Ring', 'Festive Choker', 'Sparkling Solitaire'];

export default function FestiveSocialProof() {
    const [notification, setNotification] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isFestiveModeActive() || !FESTIVE_CONFIG.features.socialProof) return;

        const showNotification = () => {
            const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
            const city = MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)];
            const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];

            setNotification({ name, city, product });
            setIsVisible(true);

            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // Initial delay
        const initialTimer = setTimeout(showNotification, 8000);

        // Repeat every 25-40 seconds
        const interval = setInterval(() => {
            showNotification();
        }, Math.random() * 15000 + 25000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (!notification) return null;

    return (
        <div className={`fixed bottom-24 md:bottom-10 left-4 md:left-10 z-[80] transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}>
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-brand-gold/20 flex items-center gap-4 max-w-xs">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-3 rounded-full text-white">
                    <PiBagFill className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-1">Recent Festive Order</p>
                    <p className="text-sm text-brand-navy leading-tight">
                        <span className="font-bold">{notification.name}</span> from {notification.city} just bought the <span className="text-pink-500 font-medium">{notification.product}</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
