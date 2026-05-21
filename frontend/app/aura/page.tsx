'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { fetchAPI, API_URL } from '@/lib/api';

import { PiSparkle, PiVideoCamera, PiArrowRight } from "react-icons/pi";
import Link from 'next/link';

export default function AuraCollectionPage() {
    const [config, setConfig] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [configRes, productsRes] = await Promise.all([
                fetchAPI('/store/settings/aura_collection_config'),
                fetchAPI('/products?isYouthTarget=true')
            ]);
            
            if (configRes?.value) {
                setConfig(typeof configRes.value === 'string' ? JSON.parse(configRes.value) : configRes.value);
            } else {
                // Default fallback
                setConfig({
                    title: "SBD AURA: The Everyday Luxury",
                    subtitle: "Discover delicate 9K gold masterpieces designed for the modern era.",
                    isActive: true
                });
            }
            setProducts(productsRes || []);
        } catch (error) {
            console.error("Failed to load Aura Collection", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
            </div>
        );
    }

    if (config && !config.isActive) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-serif text-brand-navy mb-4">Coming Soon</h1>
                <p className="text-gray-500">The Aura collection is currently being curated. Stay tuned!</p>
                <Link href="/shop" className="mt-8 text-brand-gold font-bold uppercase tracking-widest text-xs underline underline-offset-8">Return to Shop</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans text-brand-navy selection:bg-brand-gold selection:text-brand-navy">
            {/* Hero Section */}
            <section className="relative h-[80vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Desktop Banner */}
                {config?.bannerUrl && (
                    <img 
                        src={config.bannerUrl.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${config.bannerUrl}` : config.bannerUrl} 
                        className={`${config.mobileBannerUrl ? 'hidden md:block' : 'block'} absolute inset-0 w-full h-full object-cover`} 
                        alt="Aura Collection Desktop" 
                    />
                )}
                
                {/* Mobile Banner */}
                {config?.mobileBannerUrl && (
                    <img 
                        src={config.mobileBannerUrl.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${config.mobileBannerUrl}` : config.mobileBannerUrl} 
                        className="md:hidden absolute inset-0 w-full h-full object-cover" 
                        alt="Aura Collection Mobile" 
                    />
                )}

                {/* Fallback if no banners */}
                {!config?.bannerUrl && !config?.mobileBannerUrl && (
                    <div className="absolute inset-0 bg-brand-navy">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent"></div>

                <div className="relative z-10 text-center px-6 max-w-4xl animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold text-brand-navy text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl shadow-brand-gold/20">
                        <PiSparkle className="text-lg" />
                        The Aura Series
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 leading-tight drop-shadow-2xl">
                        {config?.title || "SBD AURA"}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow-lg">
                        {config?.subtitle || "Luxury for the new generation."}
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <a href="#collection" className="px-10 py-4 bg-brand-gold text-brand-navy text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 shadow-2xl">
                            Explore Collection
                        </a>
                    </div>
                </div>
            </section>

            {/* Collection Grid */}
            <main id="collection" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-serif text-brand-navy mb-4">Curated for the Youth</h2>
                        <p className="text-gray-500 leading-relaxed">
                            9-Carat gold is known for its durability and subtle, elegant hue. Each piece in the Aura collection is designed to be lived in, layered, and loved every single day.
                        </p>
                    </div>
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-gold"></span> 9K Purity
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-gold"></span> Everyday Wear
                        </div>
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {products.map((product) => (
                            <div key={product.id} className="group">
                                <ProductCard product={product} />
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Aura Exclusive</span>
                                    <Link href={`/product/${product.slug}`} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                        View Details <PiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <PiSparkle className="text-6xl text-gray-200 mx-auto mb-6" />
                        <h3 className="text-xl font-serif text-gray-400">Your next obsession is coming...</h3>
                        <p className="text-sm text-gray-400 mt-2">We're currently minting new 9K masterpieces for the Aura collection.</p>
                        <Link href="/shop" className="mt-8 inline-block bg-brand-navy text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest">Shop All Jewelry</Link>
                    </div>
                )}
            </main>

            {/* Video Feature Section (Pseudo-Reel) */}
            <section className="bg-brand-navy py-24 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-fade-in">
                        <div className="inline-flex items-center gap-2 text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                            <PiVideoCamera className="text-xl" />
                            Motion Gallery
                        </div>
                        <h2 className="text-5xl md:text-6xl font-serif text-white mb-8 leading-tight">
                            See Aura <br /><span className="italic text-brand-gold/80 font-light">in Motion</span>
                        </h2>
                        <p className="text-lg text-white/60 font-light leading-relaxed mb-10 max-w-md">
                            Jewellery isn't meant to be static. See how the Aura collection catches the light in real life.
                        </p>
                        <Link href="/gallery" className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-4 hover:gap-6 transition-all group">
                            Launch Full Motion Gallery <span className="text-brand-gold group-hover:scale-150 transition-transform">→</span>
                        </Link>
                    </div>
                    <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                         <img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover" alt="Video Preview" />
                         <div className="absolute bottom-8 left-8 right-8 z-20">
                             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                                 <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                             </div>
                             <p className="text-white font-serif text-xl">The 9K Stacker Ring</p>
                             <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Starting at ₹8,499</p>
                         </div>
                    </div>
                </div>
            </section>

            {/* Footer Newsletter Hook */}
            <section className="bg-brand-gold py-20 px-6 text-center">
                <h3 className="text-3xl font-serif text-brand-navy mb-4 italic">Join the Aura List</h3>
                <p className="text-[10px] uppercase font-black tracking-widest text-brand-navy/60 mb-10">Get early access to 9K drops and exclusive flash sales.</p>
                <div className="max-w-md mx-auto flex gap-2">
                    <input type="email" placeholder="Email Address" className="flex-1 bg-white/20 border-b-2 border-brand-navy p-3 text-xs outline-none placeholder:text-brand-navy/40 font-bold" />
                    <button className="bg-brand-navy text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-navy transition-all">Join</button>
                </div>
            </section>
        </div>
    );
}
