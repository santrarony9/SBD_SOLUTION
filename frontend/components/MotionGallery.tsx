'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import Link from 'next/link';

// Mock Data matching the sketch (Party, Daily Wear, Office)
const GALLERY_ITEMS = [
    {
        id: 1,
        title: "Party Wear",
        subtitle: "Statement Pieces",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop",
        link: "/shop?tag=party"
    },
    {
        id: 2,
        title: "Daily Wear",
        subtitle: "Effortless Elegance",
        image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2072&auto=format&fit=crop", // Ring/Daily
        link: "/shop?tag=daily"
    },
    {
        id: 3,
        title: "Office Wear",
        subtitle: "Professional Charm",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop",
        link: "/shop?tag=office"
    },
    {
        id: 4,
        title: "Bridal Collection",
        subtitle: "Royal Heritage",
        image: "https://images.unsplash.com/photo-1596918805342-fd82b0e0078d?q=80&w=2072&auto=format&fit=crop",
        link: "/shop?category=bridal"
    },
    {
        id: 5,
        title: "Gift Guide",
        subtitle: "For Loved Ones",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop",
        link: "/shop?tag=gift"
    }
];

export default function MotionGallery() {
    const [activeIndex, setActiveIndex] = useState(1); // Start with 'Daily Wear' (index 1 if 0-based, but let's see logic)

    // Center "Daily Wear" initially. In our array it's index 1.

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % GALLERY_ITEMS.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
    };

    // Calculate position for each item relative to active index
    const getCardStyle = (index: number) => {
        // Handling cyclic list for 3 exposed items? 
        // For simplicity, let's just do a centered view with strict index management first.

        const diff = (index - activeIndex);

        // We need to handle wrap-around visually or just limit logic.
        // Let's use a simpler approach: Map specific visual slots to indices.
        // Actually, distinct Framer Motion variants is better.
        return {};
    };

    return (
        <section className="py-24 bg-white overflow-hidden relative">
            <div className="text-center mb-16">
                <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">Curated For You</span>
                <h2 className="text-3xl md:text-5xl font-serif text-brand-navy">Top Picks</h2>
            </div>

            <div className="relative h-[500px] w-full flex items-center justify-center perspective-1000">
                <AnimatePresence mode='popLayout'>
                    {GALLERY_ITEMS.map((item, index) => {
                        // Determine position relative to active
                        // We treat the list as circular for calculation
                        let offset = (index - activeIndex);
                        const length = GALLERY_ITEMS.length;

                        // Normalizing offset to be between -length/2 and length/2
                        if (offset > length / 2) offset -= length;
                        if (offset < -length / 2) offset += length;

                        // We only show items with offset -1, 0, 1 (Left, Center, Right)
                        // Others are hidden or fading out
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
                                    scale: isActive ? 1.1 : 0.8,
                                    opacity: 1,
                                    x: isActive ? '0%' : isLeft ? '-60%' : '60%', // Overlap slightly
                                    zIndex: isActive ? 20 : 10,
                                    rotateY: isActive ? 0 : isLeft ? 25 : -25,
                                    filter: isActive ? 'blur(0px) brightness(1)' : 'blur(2px) brightness(0.7)'
                                }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute w-[280px] md:w-[350px] aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden cursor-pointer"
                                onClick={() => {
                                    if (isLeft) handlePrev();
                                    if (isRight) handleNext();
                                }}
                            >
                                <div className="relative w-full h-full">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                                    <div className="absolute bottom-0 left-0 w-full p-6 text-center transform transition-transform duration-500">
                                        <h3 className="text-2xl font-serif text-white mb-1">{item.title}</h3>
                                        <p className="text-brand-gold text-xs uppercase tracking-widest mb-4">{item.subtitle}</p>

                                        {isActive && (
                                            <Link href={item.link}>
                                                <span className="inline-block border border-white/30 text-white px-6 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-full backdrop-blur-sm">
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

                {/* Navigation Buttons Pattern from Sketch */}

                <button
                    onClick={handlePrev}
                    className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-brand-navy/20 flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all"
                >
                    <PiCaretLeft size={24} />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full border border-brand-navy/20 flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white transition-all"
                >
                    <PiCaretRight size={24} />
                </button>
            </div>

            {/* Decorative "Top Picks" Background Text usually seen in premium sites? optional */}
        </section>
    );
}
