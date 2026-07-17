'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

interface VideoReel {
    id: string;
    title?: string;
    tagline?: string;
    videoUrl: string;
    link?: string;
}

interface VideoShowcaseProps {
    videos: VideoReel[];
}

export default function VideoShowcase({ videos }: VideoShowcaseProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [videos]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const clientWidth = scrollContainerRef.current.clientWidth;
            // Scroll by one card width (assuming ~300px width + gap) or just let CSS snap handle it smoothly
            const scrollAmount = Math.max(clientWidth / 2, 320);
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 350); // wait for smooth scroll to finish
        }
    };

    if (!videos || videos.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-end mb-12">
                <div className="space-y-4">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase"
                    >
                        Immersive Beauty
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-serif text-brand-navy"
                    >
                        Witness the Sparkle
                    </motion.h2>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`p-4 rounded-full border transition-all duration-300 ${canScrollLeft
                                ? 'border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <PiCaretLeft size={24} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`p-4 rounded-full border transition-all duration-300 ${canScrollRight
                                ? 'border-brand-navy/20 text-brand-navy hover:bg-brand-navy hover:text-white'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <PiCaretRight size={24} />
                    </button>
                </div>
            </div>

            <div className="relative max-w-[1400px] mx-auto pb-12 px-6 lg:px-12">
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar justify-start md:justify-center"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {videos.map((video, index) => {
                        const host = API_URL.replace('/api', '');
                        const fullVideoUrl = video.videoUrl.startsWith('http') ? video.videoUrl : `${host}${video.videoUrl}`;
                        const isCloudinary = video.videoUrl && video.videoUrl.includes('res.cloudinary.com');

                        const CardContent = (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="relative w-[85vw] md:w-[350px] aspect-[9/16] flex-shrink-0 snap-center rounded-[2rem] overflow-hidden group shadow-xl"
                            >
                                {isCloudinary ? (
                                    <img
                                        src="/placeholder.jpg"
                                        alt="Placeholder"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <video
                                        src={fullVideoUrl}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        crossOrigin="anonymous"
                                    />
                                )}
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                                {/* Text Content */}
                                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    {video.tagline && (
                                        <span className="text-brand-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">
                                            {video.tagline}
                                        </span>
                                    )}
                                    {video.title && (
                                        <h3 className="text-2xl font-serif leading-tight">
                                            {video.title}
                                        </h3>
                                    )}
                                </div>
                            </motion.div>
                        );

                        return video.link ? (
                            <Link href={video.link} key={video.id} className="block">
                                {CardContent}
                            </Link>
                        ) : (
                            <div key={video.id}>
                                {CardContent}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Global CSS to hide scrollbar for webkit browsers */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
