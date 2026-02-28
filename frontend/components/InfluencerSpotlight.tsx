'use client';

import { useState, useEffect } from 'react';
import { PiDiamondsFour, PiArrowRight } from 'react-icons/pi';
import { fetchAPI } from '@/lib/api';

export default function InfluencerSpotlight() {
    const [promos, setPromos] = useState<any[]>([]);

    useEffect(() => {
        const loadPromos = async () => {
            try {
                const data = await fetchAPI('/promos');
                // Filter for promos that have a creator name to feature in the spotlight
                const creatorPromos = data?.filter((p: any) => p.creatorName && p.creatorName.trim() !== '') || [];
                setPromos(creatorPromos);
            } catch (error) {
                console.error('Failed to load creator promos:', error);
            }
        };
        loadPromos();
    }, []);

    if (promos.length === 0) return null;

    // We'll use hardcoded premium influencer placeholder images mapped to the index for demo purposes.
    // In a real rollout, you'd add an `imageUrl` field to the PromoCode model.
    const getInfluencerImage = (index: number) => {
        const images = [
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Elegant Indian Woman in Jewelry
            'https://images.unsplash.com/photo-1599839619722-39751411ea63?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Another Elegant Look
            'https://images.unsplash.com/photo-1583095123985-714cddf2def5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ];
        return images[index % images.length];
    };

    return (
        <section className="py-24 bg-brand-navy text-white relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-brand-gold flex items-center justify-center gap-3">
                        <PiDiamondsFour className="text-brand-gold spin-slow" />
                        The Spark Blue Muses
                        <PiDiamondsFour className="text-brand-gold spin-slow" />
                    </p>
                    <h2 className="text-3xl md:text-5xl font-serif text-white">Curated by Creators</h2>
                    <p className="text-sm md:text-base text-gray-300 font-light max-w-xl mx-auto">
                        Discover the pieces our favorite influencers are wearing this season, and unlock their exclusive royal privileges.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {promos.map((promo, index) => (
                        <div key={promo.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer">
                            {/* Influencer Portrait */}
                            <img
                                src={getInfluencerImage(index)}
                                alt={promo.creatorName}
                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:-translate-y-2">
                                <p className="text-brand-gold text-[10px] font-black uppercase tracking-widest mb-2">
                                    Featuring
                                </p>
                                <h3 className="text-3xl font-serif text-white mb-4">
                                    {promo.creatorName}
                                </h3>

                                <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 translate-y-4 group-hover:translate-y-0">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-1">Exclusive Code</p>
                                        <p className="font-mono text-xl font-bold tracking-widest text-brand-gold">{promo.code}</p>
                                        <p className="text-sm text-gray-200 mt-1">
                                            {promo.discountType === 'PERCENTAGE' ? `Gets you ${promo.discountValue}% OFF` : `Gets you ₹${promo.discountValue} OFF`}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(promo.code);
                                            alert(`Code ${promo.code} copied to clipboard!`);
                                        }}
                                        className="w-full bg-white text-brand-navy py-3 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-between hover:bg-brand-gold transition-colors"
                                    >
                                        <span>Copy Code</span>
                                        <PiArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
