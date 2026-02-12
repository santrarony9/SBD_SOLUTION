'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';

interface Banner {
    id: string;
    imageUrl: string;
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

    // Fallback if no banners
    const activeBanners = banners.length > 0 ? banners : [{
        id: 'default',
        imageUrl: '/hero-jewellery.png',
        title: 'Est. 1995',
        link: '/shop'
    }];

    // Auto-slide effect
    useEffect(() => {
        if (activeBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [activeBanners.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    const currentBanner = activeBanners[currentIndex];

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-brand-navy">
            {/* Background Images Layer */}
            {activeBanners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                        }`}
                >
                    <Image
                        src={banner.imageUrl}
                        alt={banner.title || "Royal Diamond Collection"}
                        fill
                        priority={index === 0}
                        className={`object-cover transition-transform duration-[10s] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'
                            }`}
                        style={{ objectPosition: 'center center' }}
                    />
                    {/* Sophisticated Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/20 to-brand-navy/90 mix-blend-multiply" />
                </div>
            ))}

            {/* Static Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 w-full max-w-6xl mx-auto">
                {/* Dynamic Kicker from Banner */}
                <div className="h-8 overflow-hidden mb-6">
                    <h2
                        key={currentIndex} // Re-animate on change
                        className="text-brand-gold/90 font-serif italic text-lg md:text-2xl tracking-[0.3em] uppercase font-medium animate-fade-in-up"
                    >
                        {currentBanner.title}
                    </h2>
                </div>

                {/* Main Hero Text (Static Global Setting) */}
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-lg max-w-5xl">
                    {heroText.title.includes('Eternal') ? (
                        <>
                            {heroText.title.split('Eternal')[0]}
                            <span className="text-brand-gold italic pr-2">Eternal</span>
                            {heroText.title.split('Eternal')[1]}
                        </>
                    ) : (
                        heroText.title
                    )}
                </h1>

                <p className="text-gray-200 max-w-2xl text-sm sm:text-lg md:text-xl mb-8 md:mb-12 font-light tracking-wide leading-relaxed drop-shadow-md px-4">
                    {heroText.subtitle}
                </p>

                <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full md:w-auto px-6 md:px-0">
                    <Link
                        href={currentBanner.link || "/shop"}
                        className="bg-white text-brand-navy px-8 py-3 md:px-12 md:py-4 uppercase tracking-[0.25em] font-bold text-[10px] md:text-xs hover:bg-brand-gold hover:text-white transition-all duration-500 ease-out shadow-lg hover:shadow-brand-gold/20 w-full md:w-auto"
                    >
                        Shop Collection
                    </Link>
                    <Link
                        href="/about"
                        className="bg-transparent text-white px-8 py-3 md:px-12 md:py-4 uppercase tracking-[0.25em] font-bold text-[10px] md:text-xs hover:bg-white/10 transition-colors duration-500 border border-white/30 hover:border-white w-full md:w-auto"
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
