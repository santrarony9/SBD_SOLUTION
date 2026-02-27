'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { motion } from 'framer-motion';
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

    if (!mounted || activeBanners.length === 0) {
        return <section className="relative h-[100dvh] bg-brand-navy" />;
    }
    return (
        <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden bg-brand-navy">
            {/* Background Images Layer */}
            {activeBanners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                        }`}
                >
                    {/* Desktop Image */}
                    <div className="hidden md:block absolute inset-0">
                        <Image
                            src={banner.imageUrl || '/hero-jewellery.png'}
                            alt={banner.title || "Royal Diamond Collection"}
                            fill
                            priority={index === 0}
                            className={`object-cover transition-transform duration-[10s] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'
                                }`}
                            style={{ objectPosition: 'center center' }}
                            quality={90}
                        />
                    </div>

                    {/* Mobile Image */}
                    <div className="block md:hidden absolute inset-0">
                        <Image
                            src={banner.mobileImageUrl || banner.imageUrl || '/hero-jewellery.png'}
                            alt={banner.title || "Royal Diamond Collection"}
                            fill
                            priority={index === 0}
                            className={`object-cover transition-transform duration-[10s] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'
                                }`}
                            style={{ objectPosition: 'center center' }}
                            quality={80}
                        />
                    </div>

                    {/* Sophisticated Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/20 to-brand-navy/90 mix-blend-multiply z-0" />
                </div>
            ))}

            {/* Static Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 w-full max-w-6xl mx-auto">
                {/* Case: Festive Branding Banner */}
                {isFestiveActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 md:mb-10 flex flex-col items-center gap-3"
                    >
                        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-white shadow-xl ${config?.currentFestival === 'HOLI'
                                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-green-500 shadow-pink-500/20'
                                : 'bg-[var(--brand-navy)] border border-[var(--brand-gold)]/30 shadow-[var(--brand-gold)]/10'
                            }`}>
                            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] whitespace-nowrap">
                                {config?.theme.greeting}
                            </span>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-sm shadow-sm"
                        >
                            <span className="text-white text-[9px] md:text-xs font-black uppercase tracking-[0.2em]">
                                Offer: {config?.theme.discountLabel}
                            </span>
                        </motion.div>
                    </motion.div>
                )}

                {/* Dynamic Kicker from Banner */}
                <div className="mb-4 md:mb-6 w-full px-4">
                    <h2
                        key={currentIndex} // Re-animate on change
                        className="text-brand-gold/90 font-serif italic text-sm md:text-xl tracking-[0.2em] md:tracking-[0.3em] uppercase font-medium animate-fade-in-up text-balance"
                    >
                        {currentBanner.title}
                    </h2>
                </div>

                {/* Main Hero Text (Static Global Setting) */}
                <h1 className="fluid-h1 font-serif text-white mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-lg max-w-5xl text-balance">
                    {heroText?.title?.includes('Eternal') ? (
                        <>
                            {heroText.title.split('Eternal')[0]}
                            <span className="text-brand-gold italic pr-2">Eternal</span>
                            {heroText.title.split('Eternal')[1]}
                        </>
                    ) : (
                        heroText?.title || "Royal Diamond Collection"
                    )}
                </h1>

                <p className="text-gray-200 max-w-2xl text-sm sm:text-lg md:text-xl mb-8 md:mb-12 font-light tracking-wide leading-relaxed drop-shadow-md px-4">
                    {heroText?.subtitle || "Exquisite craftsmanship since 2020"}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-8 w-full sm:w-auto px-4 md:px-0">
                    <Link
                        href={currentBanner.link || "/shop"}
                        className="bg-white text-brand-navy px-6 py-3 md:px-12 md:py-4 uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs hover:bg-brand-gold hover:text-white transition-all duration-500 ease-out shadow-lg hover:shadow-brand-gold/20 w-full sm:w-auto"
                    >
                        Shop Collection
                    </Link>
                    <Link
                        href="/about"
                        className="bg-transparent text-white px-6 py-3 md:px-12 md:py-4 uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs hover:bg-white/10 transition-colors duration-500 border border-white/30 hover:border-white w-full sm:w-auto"
                    >
                        Our Heritage
                    </Link>
                </div>
            </div>

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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow opacity-80 z-20">
                <span className="text-white/60 text-[10px] tracking-[0.4em] uppercase">Explore</span>
            </div>
        </section>
    );
}
