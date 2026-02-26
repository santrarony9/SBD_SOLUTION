'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFestive } from '@/context/FestiveContext';

export default function FestiveStartupAnimation() {
    const { config, isFestiveActive, showAnimation, dismissAnimation } = useFestive();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (showAnimation) {
            // Automatically dismiss after 5 seconds if not a video or if user doesn't click
            const timer = setTimeout(() => {
                handleFinish();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [showAnimation]);

    const handleFinish = () => {
        setIsExiting(true);
        setTimeout(() => {
            dismissAnimation();
            setIsExiting(false);
        }, 8000); // Allow time for exit animation
    };

    if (!showAnimation || !config) return null;

    const festivalType = config.currentFestival;
    const animationUrl = config.features.animationUrl;

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="fixed inset-0 z-[2000] bg-brand-navy flex items-center justify-center overflow-hidden"
                >
                    {/* Background Ambient Glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vh] bg-pink-500/20 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vh] bg-yellow-400/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-4xl px-6 text-center">
                        {/* Dynamic Content based on Animation URL */}
                        {animationUrl ? (
                            <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                                {animationUrl.endsWith('.mp4') || animationUrl.endsWith('.webm') ? (
                                    <video
                                        src={animationUrl}
                                        autoPlay
                                        muted
                                        playsInline
                                        onEnded={handleFinish}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={animationUrl}
                                        alt="Festive Intro"
                                        className="w-full h-full object-cover animate-zoom-in"
                                    />
                                )}

                                {/* Skip Button */}
                                <button
                                    onClick={handleFinish}
                                    className="absolute bottom-6 right-6 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    Skip Intro
                                </button>
                            </div>
                        ) : (
                            // Default Splat/Text Animation for Holi/Others if no URL
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1, type: "spring" }}
                                className="space-y-8"
                            >
                                <div className="relative inline-block">
                                    <h1 className="text-6xl md:text-9xl font-serif text-white italic tracking-tighter drop-shadow-2xl">
                                        {festivalType === 'HOLI' ? 'Holi Hai!' : 'Spark Blue Diamond'}
                                    </h1>
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-pink-500 rounded-full blur-xl animate-ping"></div>
                                </div>
                                <p className="text-brand-gold font-serif text-xl md:text-3xl tracking-[0.2em] uppercase">
                                    {config.theme.greeting}
                                </p>

                                <button
                                    onClick={handleFinish}
                                    className="mt-12 px-12 py-4 bg-brand-gold text-brand-navy rounded-full font-black uppercase tracking-[0.4em] text-xs hover:scale-105 active:scale-95 transition-transform"
                                >
                                    Experience Magic
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 text-[9px] uppercase tracking-[0.6em] font-black">
                        Spark Blue Diamond • Premium Jewellery
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
