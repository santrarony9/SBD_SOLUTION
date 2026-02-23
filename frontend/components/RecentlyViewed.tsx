'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';

interface Product {
    id: string;
    name: string;
    slug: string;
    images: string[];
    goldPurity: number;
    goldWeight: number;
    diamondCarat: number;
    diamondClarity: string;
}

export default function RecentlyViewed() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice: globalFormatPrice } = useCurrency();

    useEffect(() => {
        async function loadRecentlyViewed() {
            try {
                const data = await fetchAPI('/marketing/recently-viewed');
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to load recently viewed", error);
            } finally {
                setLoading(false);
            }
        }

        loadRecentlyViewed();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-white border-t border-brand-gold/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-6 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-64 space-y-4">
                                <SkeletonLoader className="aspect-square w-full rounded-sm" />
                                <SkeletonLoader variant="text" className="w-3/4 h-4" />
                                <SkeletonLoader variant="text" className="w-1/2 h-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-white border-t border-brand-gold/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em] inline-block mb-2">Picked from your history</span>
                        <h2 className="text-2xl md:text-3xl font-serif text-brand-navy">Recently Viewed</h2>
                    </div>
                    <Link href="/shop" className="text-brand-navy text-[10px] font-bold uppercase tracking-widest border-b border-brand-navy pb-1">
                        Continue Shopping
                    </Link>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-shrink-0 w-64 snap-start group"
                        >
                            <Link href={`/product/${product.slug}`}>
                                <div className="relative aspect-square mb-4 bg-brand-cream/20 overflow-hidden rounded-sm border border-brand-charcoal/5">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-brand-gold/20 font-serif text-2xl">
                                            SBD
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/5 transition-colors duration-300" />
                                </div>
                                <h3 className="text-sm font-serif text-brand-navy mb-1 line-clamp-1 group-hover:text-brand-gold transition-colors italic">
                                    {product.name}
                                </h3>
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                                        <span>{product.goldPurity}K Gold</span>
                                        <span>{product.diamondCarat} CT</span>
                                    </div>
                                    <p className="text-xs font-bold text-brand-navy mt-1">
                                        {globalFormatPrice((product as any).price || (product as any).pricing?.finalPrice || 0)}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
