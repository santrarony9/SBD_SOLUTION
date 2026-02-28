'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFestive } from '@/context/FestiveContext';

export default function FestiveSplashTransition() {
    const pathname = usePathname();
    const [isSplashing, setIsSplashing] = useState(false);
    const [lastPathname, setLastPathname] = useState(pathname);
    const { config, isFestiveActive } = useFestive();

    // Fallback colors for splash
    const isHoli = config?.currentFestival === 'HOLI';
    const [splashColors, setSplashColors] = useState<string[]>([]);

    useEffect(() => {
        if (isHoli) {
            setSplashColors(['#ff0080', '#fbff00', '#00ff40', '#0099ff', '#ff5a00', '#ae00ff']);
        } else if (typeof document !== 'undefined') {
            setSplashColors([
                getComputedStyle(document.documentElement).getPropertyValue('--brand-gold').trim(),
                getComputedStyle(document.documentElement).getPropertyValue('--festive-accent-1').trim(),
                getComputedStyle(document.documentElement).getPropertyValue('--festive-accent-2').trim(),
                getComputedStyle(document.documentElement).getPropertyValue('--brand-navy').trim()
            ].filter(c => c));
        }
    }, [isHoli]);

    useEffect(() => {
        if (!isFestiveActive) return;

        if (pathname !== lastPathname) {
            setIsSplashing(true);
            setLastPathname(pathname);

            // Auto-hide after animation
            const timer = setTimeout(() => {
                setIsSplashing(false);
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [pathname, lastPathname]);

    if (!isFestiveActive) return null;

    return (
        <AnimatePresence mode="wait">
            {isSplashing && (
                <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">
                    {/* Multiple "Splashes" expanding from center */}
                    {splashColors.map((color, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1.5, 3],
                                opacity: [0, 0.6, 0],
                                rotate: [0, 45, 90]
                            }}
                            transition={{
                                duration: 1.2,
                                ease: "easeOut",
                                delay: i * 0.05
                            }}
                            className="absolute rounded-full"
                            style={{
                                width: '100vw',
                                height: '100vw',
                                backgroundColor: color,
                                filter: 'blur(40px)',
                                mixBlendMode: 'screen',
                                transformOrigin: 'center center'
                            }}
                        />
                    ))}

                    {/* Irregular Water Splash Path Animation */}
                    <motion.svg
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 2], opacity: [0, 0.5, 0] }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        viewBox="0 0 300 300"
                        className="w-full h-full absolute"
                    >
                        <motion.path
                            fill="white"
                            animate={{
                                d: [
                                    "M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,85.1,-0.6C83.1,14.5,75.7,29,66.4,41.4Z",
                                    "M52.1,-75.4C64.3,-66.1,68.9,-46.7,73.4,-28.5C77.9,-10.3,82.3,6.7,78.1,21.5C73.9,36.3,61.1,48.9,46.8,59.3Z",
                                    "M30.7,-46.4C40.1,-39.2,49.2,-28.1,56.4,-14.7C63.7,-1.3,67.1,15.7,65.1,30.6C63.1,44.5,55.7,59,46.4,71.4Z"
                                ]
                            }}
                            transition={{ duration: 1, repeat: 0 }}
                            transform="translate(150 150)"
                            style={{ mixBlendMode: 'overlay', filter: 'blur(20px)' }}
                        />
                    </motion.svg>
                </div>
            )}
        </AnimatePresence>
    );
}
