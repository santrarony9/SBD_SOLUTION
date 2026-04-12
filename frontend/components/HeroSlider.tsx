'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useFestive } from '@/context/FestiveContext';

interface Banner {
    id: string;
    imageUrl: string;
    mobileImageUrl?: string;
    title?: string;
    link?: string;
}

interface HeroText {
    title: string;
    subtitle: string;
}

interface HeroSliderProps {
    banners: Banner[];
    heroText: HeroText;
}

export default function HeroSlider({ banners, heroText }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { config, isFestiveActive } = useFestive();
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Parallax logic
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

    // Screen size detection
    useEffect(() => {
        setMounted(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Optimized banners based on device
    const [activeBanners, setActiveBanners] = useState<Banner[]>([]);

    useEffect(() => {
        if (!mounted) return;

        let filtered = banners && Array.isArray(banners) && banners.length > 0 ? banners : [{
            id: 'default',
            imageUrl: '/hero-jewellery.png',
            mobileImageUrl: '/hero-jewellery.png',
            title: 'Royal Diamond Collection',
            link: '/shop'
        }];

        // If on mobile, prioritize mobile banners if they exist
        if (isMobile) {
            const hasMobileSpecific = filtered.some(b => b.mobileImageUrl);
            if (hasMobileSpecific) {
                // If the user has uploaded specific mobile banners, let's show them.
                // We show banners that have either a mobile image OR ONLY a desktop image (fallback)
                // BUT we exclude banners that are clearly "Desktop-only" if there are mobile counterparts?
                // Actually, let's just show banners that have a mobileImageUrl OR (has ONLY imageUrl but no other version)
                // Simplest: only hide mobile-only banners on desktop, and desktop-only on mobile if mobile versions exist.
                filtered = filtered.filter(b => b.mobileImageUrl || b.imageUrl);

                // If there are specific mobile banners (M), the user likely wants to hide the desktop-only ones.
                const mobileOnlyCount = filtered.filter(b => b.mobileImageUrl && !b.imageUrl).length;
                if (mobileOnlyCount > 0) {
                    // Hide banners that have NO mobileImageUrl but DO have an imageUrl
                    filtered = filtered.filter(b => b.mobileImageUrl || !b.imageUrl);
                }
            }
        } else {
            // On Desktop, hide banners that are clearly "Mobile-only" (no imageUrl but has mobileImageUrl)
            filtered = filtered.filter(b => b.imageUrl || !b.mobileImageUrl);
        }

        setActiveBanners(filtered);
    }, [banners, isMobile, mounted]);

    // Auto-slide effect
    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [activeBanners.length]);

    // Keep index in bounds if activeBanners length changes
    useEffect(() => {
        if (currentIndex >= activeBanners.length) {
            setCurrentIndex(0);
        }
    }, [activeBanners.length, currentIndex]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    const currentBanner = activeBanners[currentIndex] || activeBanners[0];

    // Helper to detect if a text is empty or a technical CMS placeholder slug
    const isPlaceholder = (text?: string) => {
        if (!text) return true;
        const cleaned = text.trim();
        if (cleaned === '') return true;
        if (cleaned.includes('_')) return true; // e.g. OFFER_BANNER1
        if (cleaned === 'welcomeoffer') return true;
        if (/^banner/i.test(cleaned)) return true;
        return false;
    };

    const hasAnyContent = !isPlaceholder(currentBanner?.title) || !isPlaceholder(heroText?.title) || !isPlaceholder(heroText?.subtitle);

    if (!mounted || activeBanners.length === 0) {
        return <section className="relative h-[100dvh] bg-brand-navy" />;
    }
    return (
        <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden bg-brand-navy">
            {/* Background Images Layer */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentBanner?.id || currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                    style={{ y: y1, scale }}
                >
                    {/* Desktop Image */}
                    <div className="hidden md:block absolute inset-0">
                        <Image
                            src={currentBanner?.imageUrl || '/hero-jewellery.png'}
                            alt={currentBanner?.title || "Royal Diamond Collection"}
                            fill
                            priority
                            className="object-cover w-full h-full"
                            style={{ objectPosition: 'center center' }}
                            quality={100}
                        />
                    </div>

                    {/* Mobile Image */}
                    <div className="block md:hidden absolute inset-0">
                        <Image
                            src={currentBanner?.mobileImageUrl || currentBanner?.imageUrl || '/hero-jewellery.png'}
                            alt={currentBanner?.title || "Royal Diamond Collection"}
                            fill
                            priority
                            className="object-cover w-full h-full"
                            style={{ objectPosition: 'center center' }}
                            quality={90}
                        />
                    </div>

                    {/* Sophisticated Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/10 to-brand-navy/95 mix-blend-multiply z-0" />
                </motion.div>
            </AnimatePresence>

            {/* Static Content Overlay */}
            <motion.div 
                style={{ opacity }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 w-full max-w-6xl mx-auto"
            >
                {/* Case: Festive Branding Banner */}
                {isFestiveActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 md:mb-10 flex flex-col items-center gap-3"
                    >
                        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-white shadow-2xl glass ${config?.currentFestival === 'HOLI'
                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-green-500'
                            : 'border border-brand-gold/30 shadow-brand-gold/10'
                            }`}>
                            <span className={`text-[10px] md:text-sm font-black uppercase tracking-[0.3em] whitespace-nowrap ${config?.currentFestival === 'HOLI' ? 'text-holi-animated' : ''}`}>
                                {config?.theme?.greeting || 'Welcome to Spark Blue Diamond'}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Main Hero Text (Static Global Setting) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    {!isPlaceholder(heroText?.title) && (
                        <h1 className="fluid-h1 font-serif text-white mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-2xl max-w-5xl text-balance">
                            {heroText?.title?.includes('Eternal') ? (
                                <>
                                    {heroText.title.split('Eternal')[0]}
                                    <span className="text-brand-gold italic pr-2">Eternal</span>
                                    {heroText.title.split('Eternal')[1]}
                                </>
                            ) : (
                                heroText?.title
                            )}
                        </h1>
                    )}

                    {!isPlaceholder(heroText?.subtitle) && (
                        <p className="text-gray-100 max-w-2xl text-sm sm:text-lg md:text-xl mb-8 md:mb-12 font-light tracking-widest leading-relaxed drop-shadow-md px-4">
                            {heroText?.subtitle}
                        </p>
                    )}

                    {hasAnyContent && (
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-8 w-full sm:w-auto px-4 md:px-0">
                            <Link
                                href={currentBanner.link || "/shop"}
                                className="bg-white text-brand-navy px-6 py-3 md:px-12 md:py-4 uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs hover:bg-brand-gold hover:text-white transition-all duration-700 ease-out shadow-2xl hover:shadow-brand-gold/40 w-full sm:w-auto btn-gold-glow"
                            >
                                Shop Collection
                            </Link>
                            <Link
                                href="/about"
                                className="bg-transparent text-white px-6 py-3 md:px-12 md:py-4 uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs hover:bg-white/10 transition-all duration-500 border border-white/30 hover:border-white w-full sm:w-auto backdrop-blur-sm"
                            >
                                Our Heritage
                            </Link>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Navigation Controls */}
            {activeBanners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20 p-2"
                    >
                        <PiCaretLeft className="w-8 h-8 md:w-12 md:h-12" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20 p-2"
                    >
                        <PiCaretRight className="w-8 h-8 md:w-12 md:h-12" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {activeBanners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-brand-gold w-8' : 'bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
                <div className="animate-bounce-slow opacity-80 pointer-events-auto flex justify-center items-center">
                    <button 
                        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                        className="text-white/60 text-[10px] tracking-[0.4em] uppercase hover:text-brand-gold transition-colors py-2 px-4 shadow-sm"
                        style={{ textIndent: '0.4em' }} // Push text right to compensate for trailing tracking space
                        aria-label="Scroll down to explore"
                    >
                        Explore
                    </button>
                </div>
            </div>
        </section>
    );
}
