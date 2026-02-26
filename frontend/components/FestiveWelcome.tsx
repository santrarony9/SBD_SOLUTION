'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PiX, PiConfetti } from 'react-icons/pi';
import { useFestive } from '@/context/FestiveContext';

export default function FestiveWelcome() {
    const [isVisible, setIsVisible] = useState(false);
    const [isScratched, setIsScratched] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { config, isFestiveActive } = useFestive();

    useEffect(() => {
        setIsMounted(true);
        if (!config) return;
        const hasSeen = localStorage.getItem(`festive_welcome_${config.currentFestival}`);
        if (!hasSeen && isFestiveActive && config.features.welcomeModal) {
            // Show after 2 seconds for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
                document.body.style.overflow = 'hidden';
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isFestiveActive, config]);

    // Setup Scratch Logic
    useEffect(() => {
        if (!isVisible || !canvasRef.current || isScratched) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill with "Gulal" texture (pink/purple gradient)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff0080');
        gradient.addColorStop(0.5, '#7e00ff');
        gradient.addColorStop(1, '#ff0080');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text over scratch area
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 + 5);

        let painting = false;

        const getPos = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            if ('touches' in e) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                };
            }
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const scratch = (e: MouseEvent | TouchEvent) => {
            if (!painting) return;
            const { x, y } = getPos(e);

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fill();

            // Check if enough is scratched
            checkScratched();
        };

        const checkScratched = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;

            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] === 0) transparentPixels++;
            }

            const percentage = (transparentPixels / (pixels.length / 4)) * 100;
            if (percentage > 40) {
                setIsScratched(true);
            }
        };

        canvas.addEventListener('mousedown', () => painting = true);
        canvas.addEventListener('touchstart', () => painting = true);
        window.addEventListener('mouseup', () => painting = false);
        window.addEventListener('touchend', () => painting = false);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('touchmove', scratch);

        return () => {
            canvas.removeEventListener('mousemove', scratch);
            canvas.removeEventListener('touchmove', scratch);
        };
    }, [isVisible]);

    const closeWelcome = () => {
        setIsVisible(false);
        document.body.style.overflow = 'auto';
        localStorage.setItem(`festive_welcome_${config?.currentFestival}`, 'true');
    };

    if (!isMounted || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-navy/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-lg relative overflow-hidden shadow-2xl rounded-2xl border-2 border-brand-gold/20">
                {/* Close Button */}
                <button
                    onClick={closeWelcome}
                    className="absolute top-4 right-4 text-gray-400 hover:text-brand-navy transition-colors z-20"
                >
                    <PiX className="h-6 w-6" />
                </button>

                {/* Holi Decor */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="p-8 md:p-12 text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 bg-brand-gold/10 rounded-full mb-6">
                        <span className="text-brand-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">Special Festive Gift</span>
                    </div>

                    <h2 className="fluid-h2 font-serif text-brand-navy mb-4 leading-tight">
                        {config?.theme.greeting}
                    </h2>

                    <p className="text-gray-500 font-light text-sm md:text-base mb-10 text-balance">
                        Step into the season of joy with ₹500 off on all orders, and ₹1000 off on orders above ₹10,000.
                    </p>

                    {/* Scratch Card Gamification */}
                    <div className="relative mx-auto w-64 h-32 bg-gray-50 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-dashed border-brand-gold/30">
                        {/* Hidden Content */}
                        <div className={`text-center transition-all duration-700 ${isScratched ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                            <span className="text-[10px] text-gray-400 uppercase block mb-1">Your Personal Holi Code</span>
                            <span className="text-2xl font-mono font-black text-brand-navy tracking-widest uppercase">
                                {config?.theme.couponCode}
                            </span>
                            <div className="mt-2 text-brand-gold font-bold text-sm tracking-widest">
                                {config?.theme.discountLabel}
                            </div>
                        </div>

                        {/* Scratch Overlay */}
                        {!isScratched && (
                            <canvas
                                ref={canvasRef}
                                width={256}
                                height={128}
                                className="absolute inset-0 cursor-crosshair z-10 rounded-xl"
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={closeWelcome}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-500 ${isScratched
                                ? 'bg-brand-navy text-white hover:bg-brand-gold hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isScratched ? 'Shop Holi Collection' : 'Scratch Above to Unlock'}
                        </button>
                    </div>

                    <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                        T&C Apply • Valid until {config ? new Date(config.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                    </p>
                </div>
            </div>

            {/* Pop confetti when scratched */}
            {isScratched && (
                <div className="fixed inset-0 pointer-events-none z-[120]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <PiConfetti className="w-64 h-64 text-brand-gold opacity-20 animate-ping" />
                    </div>
                </div>
            )}
        </div>
    );
}
