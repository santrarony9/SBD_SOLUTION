'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import ProductCard from './ProductCard';

interface CategoryCarouselProps {
    category: {
        id: string;
        name: string;
        slug: string;
        imageUrl?: string;
    };
    products: any[];
}

export default function CategoryCarousel({ category, products }: CategoryCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0 || !category) return null;

    return (
        <section className="py-16 border-b border-brand-gold/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Discovery</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-brand-navy">{category.name}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={`/shop?category=${category.slug}`} className="text-brand-navy/60 hover:text-brand-navy text-[10px] font-bold uppercase tracking-widest border-b border-brand-navy/10 pb-1 transition-all">
                            View Collection
                        </Link>
                        <div className="flex gap-2 ml-4">
                            <button
                                onClick={() => scroll('left')}
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white hover:border-brand-navy transition-all"
                            >
                                <PiCaretLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-navy hover:bg-brand-navy hover:text-white hover:border-brand-navy transition-all"
                            >
                                <PiCaretRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory overscroll-x-contain touch-pan-x"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="min-w-[240px] md:min-w-[240px] snap-start">
                            <ProductCard product={{ ...product, image: product.imageUrl || product.image || (product.images && product.images[0]) }} />
                        </div>
                    ))}
                    {/* View More Card */}
                    <div className="min-w-[240px] md:min-w-[240px] snap-start">
                        <Link
                            href={`/shop?category=${category.slug}`}
                            className="h-full flex flex-col items-center justify-center bg-brand-navy/5 rounded-2xl border border-dashed border-brand-navy/10 group hover:bg-brand-navy/10 transition-all p-12 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-brand-navy shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <PiCaretRight size={24} />
                            </div>
                            <span className="text-brand-navy font-bold text-xs uppercase tracking-widest">Explore Full</span>
                            <span className="text-brand-gold font-serif text-xl mt-1">{category.name}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
