"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <section className="relative h-screen min-h-[700px] w-full bg-brand-navy overflow-hidden">
            {/* Background Image/Video Placeholder - Ideally replace with actual high-res image */}
            <div className="absolute inset-0 w-full h-full bg-[url('/hero-jewellery.png')] bg-cover bg-center opacity-80 animate-scale-in transform transition-transform duration-[20s] hover:scale-110">
                {/* Fallback overlay if image missing */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/60 to-transparent"></div>
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                <div className={`max-w-xl space-y-8 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                    <h2 className="text-brand-gold font-sans uppercase tracking-[0.3em] text-sm animate-fade-in">
                        Exquisite Craftsmanship
                    </h2>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-serif font-bold leading-tight">
                        Timeless <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-brand-gold-light">Elegance</span>
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-md">
                        Discover our exclusive collection of IGI Certified diamonds and hallmarked gold, designed to celebrate your most precious moments.
                    </p>

                    <div className="flex space-x-4 pt-4">
                        <Link href="/shop" className="group relative px-8 py-4 bg-brand-gold text-brand-navy font-bold tracking-widest uppercase text-sm overflow-hidden transition-all hover:bg-white hover:text-brand-navy">
                            <span className="relative z-10">Shop Collection</span>
                            <span className="absolute inset-0 bg-white transform -translate-x-full transition-transform group-hover:translate-x-0 duration-300 ease-out"></span>
                        </Link>
                        <Link href="/about" className="px-8 py-4 border border-white text-white font-bold tracking-widest uppercase text-sm hover:bg-white hover:text-brand-navy transition-all duration-300">
                            Our Story
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-brand-gold to-transparent mx-auto"></div>
                <div className="text-brand-gold text-[10px] uppercase tracking-widest mt-2">Scroll</div>
            </div>
        </section>
    );
}
