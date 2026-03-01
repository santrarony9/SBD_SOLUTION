'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface PriceRange {
    id?: string;
    minPrice: number;
    maxPrice?: number;
    label: string;
}

interface ShopByPriceProps {
    priceRanges: PriceRange[];
}

export default function ShopByPrice({ priceRanges }: ShopByPriceProps) {
    if (!priceRanges || priceRanges.length === 0) return null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {priceRanges.map((range, idx) => (
                <motion.div
                    key={range.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative h-32 md:h-40 overflow-hidden"
                >
                    <Link
                        href={`/shop?minPrice=${range.minPrice}&maxPrice=${range.maxPrice || ''}`}
                        className="flex items-center justify-center w-full h-full border border-brand-navy/10 bg-white/50 backdrop-blur-sm relative z-10 transition-colors duration-500 group-hover:border-brand-gold/0"
                    >
                        {/* Animated Background Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-0 bg-brand-navy group-hover:h-full transition-all duration-500 ease-out-expo z-0" />

                        {/* Interactive Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-transparent group-hover:border-brand-gold transition-all duration-500 delay-100" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-transparent group-hover:border-brand-gold transition-all duration-500 delay-100" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center gap-1 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-xl md:text-2xl font-serif text-brand-navy group-hover:text-white transition-colors duration-500 px-4 text-center">
                                {range.label?.replace(' - ', ' \u2014 ') || 'Browse Range'}
                            </span>
                            <motion.span
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                className="h-[1px] bg-brand-gold opacity-0 group-hover:opacity-100 transition-all duration-500"
                            />
                            <span className="text-[8px] uppercase tracking-[0.3em] font-black text-brand-gold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                View Collection
                            </span>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
