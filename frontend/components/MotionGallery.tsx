'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';

export default function MotionGallery() {
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const loadItems = async () => {
            try {
                const items = await fetchAPI('/gallery');
                if (items && Array.isArray(items) && items.length > 0) {
                    setGalleryItems(items);
                    setActiveIndex(Math.floor(items.length / 2)); // Start in middle
                }
            } catch (error) {
                console.error("Failed to load gallery items", error);
            }
        };
        loadItems();
    }, []);

    const handleNext = () => {
        if (galleryItems.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    };

    const handlePrev = () => {
        if (galleryItems.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    };

    if (galleryItems.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden relative">
            <div className="text-center mb-16 px-4">
                <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3 animate-fade-in-up">Curated For You</span>
                <h2 className="text-3xl md:text-5xl font-serif text-brand-navy animate-fade-in-up animate-delay-100">Top Picks</h2>
            </div>

            <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center perspective-1000">
                <AnimatePresence mode='popLayout'>
                    {galleryItems.map((item, index) => {
                        let offset = (index - activeIndex);
                        const length = galleryItems.length;

                        // Circular buffer logic
                        if (offset > length / 2) offset -= length;
                        if (offset < -length / 2) offset += length;

                        // Show 2 neighbors on each side (5 total visible)
                        if (Math.abs(offset) > 2) return null;

                        const isActive = offset === 0;
                        const direction = offset > 0 ? 1 : -1;
                        const absOffset = Math.abs(offset);

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.0 : (1 - (absOffset * 0.15)), // 1.0 -> 0.85 -> 0.70
                                    opacity: isActive ? 1 : (1 - (absOffset * 0.2)),
                                    x: isActive ? '0%' : `${direction * (50 + (absOffset * 25))}%`, // Spacing: Center -> 50% -> 75%
                                    zIndex: 30 - absOffset, // 30 -> 29 -> 28
                                    rotateY: isActive ? 0 : direction * -45, // Fan effect facing center
                                    filter: isActive ? 'blur(0px) brightness(1)' : `blur(${absOffset * 2}px) brightness(${1 - (absOffset * 0.2)})`
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute w-[260px] md:w-[350px] aspect-[3/4] rounded-2xl shadow-xl md:shadow-2xl overflow-hidden cursor-pointer bg-gray-100 border border-white/20"
                                onClick={() => {
                                    if (offset !== 0) setActiveIndex((activeIndex + offset + length) % length);
                                }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Gradient overlay for better text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                                    {/* Text Content - Matches sketch "Daily Wear", "Office" placement */}
                                    <div className="absolute bottom-6 left-0 w-full px-6 text-center transform transition-transform duration-500">
                                        <h3 className={`font-serif text-white mb-1 drop-shadow-md ${isActive ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-brand-gold text-[10px] uppercase tracking-[0.2em] mb-4 drop-shadow font-bold">
                                            {item.subtitle || 'Collection'}
                                        </p>

                                        {isActive && item.link && (
                                            <Link href={item.link}>
                                                <span className="inline-block border border-white/30 bg-white/10 text-white px-8 py-2.5 text-[10px] uppercase tracking-widest hover:bg-white hover:text-brand-navy transition-all rounded-full backdrop-blur-md shadow-lg">
                                                    Explore
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                <button
                    onClick={handlePrev}
                    className="absolute left-2 md:left-20 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-navy/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all shadow-sm"
                >
                    <PiCaretLeft size={20} />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-2 md:right-20 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-navy/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all shadow-sm"
                >
                    <PiCaretRight size={20} />
                </button>
            </div>
        </section>
    );
}
