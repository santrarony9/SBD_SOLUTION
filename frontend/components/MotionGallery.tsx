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
                let items = await fetchAPI('/gallery');
                if (items && Array.isArray(items) && items.length > 0) {
                    // Ensure enough items for unique keys in 5-slot view
                    while (items.length < 6) {
                        items = [...items, ...items].map((item, idx) => ({ ...item, id: `${item.id}-${idx}` })); // Unique IDs for duplicates
                    }
                    setGalleryItems(items);
                    setActiveIndex(Math.floor(items.length / 2));
                }
            } catch (error) {
                console.error("Failed to load gallery items", error);
            }
        };
        loadItems();
    }, []);

    const [isPaused, setIsPaused] = useState(false);

    // Auto-Play
    useEffect(() => {
        if (galleryItems.length === 0 || isPaused) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % galleryItems.length);
        }, 5000); // Slowed down to 5 seconds
        return () => clearInterval(interval);
    }, [galleryItems.length, isPaused]);

    const handleNext = () => {
        if (galleryItems.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    };

    const handlePrev = () => {
        if (galleryItems.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    };

    // if (galleryItems.length === 0) return null; // Old behavior: Hide if empty

    // New behavior: Show placeholder if empty
    if (galleryItems.length === 0) {
        return (
            <section className="py-24 bg-white relative">
                <div className="text-center mb-16 px-4">
                    <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3 animate-fade-in-up">Curated For You</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-brand-navy animate-fade-in-up animate-delay-100">Top Picks</h2>
                </div>
                <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-gray-200 mx-6 rounded-2xl bg-gray-50">
                    <p className="text-brand-navy font-serif text-xl mb-2">Curated Collection Coming Soon</p>
                    <p className="text-gray-500 text-sm">Stay tuned for our exclusive motion gallery.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-white relative">
            <div className="text-center mb-16 px-4">
                <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3 animate-fade-in-up">Curated For You</span>
                <h2 className="text-3xl md:text-5xl font-serif text-brand-navy animate-fade-in-up animate-delay-100">Top Picks</h2>
            </div>

            <div
                className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center overflow-visible"
                style={{ perspective: '1000px' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <AnimatePresence initial={false} mode='popLayout'>
                    {[-2, -1, 0, 1, 2].map((offset) => {
                        const itemIndex = (activeIndex + offset + galleryItems.length * 100) % galleryItems.length;
                        const item = galleryItems[itemIndex];

                        if (!item) return null;

                        const isActive = offset === 0;
                        const direction = offset > 0 ? 1 : -1;
                        const absOffset = Math.abs(offset);

                        // Use explicit pixel offsets for reliability
                        const xOffset = offset * 220; // 220px separation

                        return (
                            <motion.div
                                key={item.id + '-' + offset} // Force re-mount on position change to avoid layout thrashing
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    scale: isActive ? 1.0 : (1 - (absOffset * 0.15)),
                                    opacity: isActive ? 1 : 0.7,
                                    x: `calc(-50% + ${xOffset}px)`, // Center anchor + offset
                                    zIndex: 50 - absOffset,
                                    rotateY: isActive ? 0 : direction * -15,
                                    filter: isActive ? 'blur(0px) brightness(1.05)' : `blur(${absOffset * 2}px) brightness(${1 - (absOffset * 0.2)})`,
                                    boxShadow: isActive
                                        ? '0 20px 50px -10px rgba(212, 175, 55, 0.4)'
                                        : '0 10px 30px -10px rgba(0,0,0,0.3)'
                                }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                transition={{
                                    type: "spring",
                                    stiffness: 80,
                                    damping: 20,
                                    mass: 1
                                }}
                                className={`absolute left-1/2 top-4 w-[280px] md:w-[380px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border ${isActive ? 'border-brand-gold/50' : 'border-white/10'} bg-brand-navy`}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transformOrigin: 'center center' // Ensure rotation happens from center
                                }}
                                onClick={() => {
                                    if (offset !== 0) setActiveIndex((prev) => (prev + offset + galleryItems.length) % galleryItems.length);
                                }}
                            >
                                <div className="relative w-full h-full group">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Lustrous Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent opacity-${isActive ? '60' : '80'}`} />

                                    {/* Light Sheen Effect */}
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}

                                    {/* Text Content */}
                                    <div className="absolute bottom-8 left-0 w-full px-6 text-center">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <h3 className={`font-serif text-white mb-2 drop-shadow-md ${isActive ? 'text-2xl md:text-3xl' : 'text-lg opacity-80'}`}>
                                                {item.title}
                                            </h3>
                                            <div className="flex justify-center items-center gap-2 mb-4">
                                                <span className="h-[1px] w-8 bg-brand-gold/50"></span>
                                                <p className="text-brand-gold text-[10px] uppercase tracking-[0.25em] font-bold drop-shadow">
                                                    {item.subtitle || 'COLLECTION'}
                                                </p>
                                                <span className="h-[1px] w-8 bg-brand-gold/50"></span>
                                            </div>
                                        </motion.div>

                                        {isActive && item.link && (
                                            <Link href={item.link}>
                                                <span className="inline-block border border-brand-gold/50 bg-brand-gold/10 text-brand-gold px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-all rounded-sm backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]">
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
