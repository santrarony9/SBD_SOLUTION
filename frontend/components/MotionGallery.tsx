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

                        if (offset > length / 2) offset -= length;
                        if (offset < -length / 2) offset += length;

                        if (Math.abs(offset) > 1) return null;

                        const isActive = offset === 0;
                        const isLeft = offset === -1;
                        const isRight = offset === 1;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{
                                    scale: 0.8,
                                    opacity: 0,
                                    x: isLeft ? '-100%' : isRight ? '100%' : 0,
                                    rotateY: isLeft ? 45 : isRight ? -45 : 0
                                }}
                                animate={{
                                    scale: isActive ? 1.0 : 0.8, // Slightly reduced scale for mobile fitting
                                    opacity: 1,
                                    x: isActive ? '0%' : isLeft ? '-60%' : '60%',
                                    zIndex: isActive ? 20 : 10,
                                    rotateY: isActive ? 0 : isLeft ? 25 : -25,
                                    filter: isActive ? 'blur(0px) brightness(1)' : 'blur(2px) brightness(0.7)'
                                }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute w-[260px] md:w-[350px] aspect-[3/4] rounded-2xl shadow-xl md:shadow-2xl overflow-hidden cursor-pointer bg-gray-100"
                                onClick={() => {
                                    if (isLeft) handlePrev();
                                    if (isRight) handleNext();
                                }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                                    <div className="absolute bottom-0 left-0 w-full p-6 text-center transform transition-transform duration-500">
                                        <h3 className="text-xl md:text-2xl font-serif text-white mb-1 drop-shadow-md">{item.title}</h3>
                                        {item.subtitle && <p className="text-brand-gold text-[10px] uppercase tracking-widest mb-4 drop-shadow">{item.subtitle}</p>}

                                        {isActive && item.link && (
                                            <Link href={item.link}>
                                                <span className="inline-block border border-white/50 text-white px-6 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-full backdrop-blur-md">
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
