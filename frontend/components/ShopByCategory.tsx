'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    image?: string; // Fallback
}

interface ShopByCategoryProps {
    categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="relative py-12 bg-brand-cream overflow-hidden">
            {/* Background Accent for Glass Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-10 right-20 w-64 h-64 bg-brand-gold blur-[100px] rounded-full"></div>
                <div className="absolute bottom-10 left-20 w-80 h-80 bg-brand-navy blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center mb-10">
                    <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-3">Refined Selection</span>
                    <h2 className="text-3xl font-serif text-brand-navy">Shop by Category</h2>
                </div>

                {/* Glassmorphic Category Bar */}
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/shop?category=${category.slug}`}
                            className="
                                group relative px-8 py-3 rounded-xl transition-all duration-500
                                bg-white/40 backdrop-blur-md border border-white/40
                                hover:bg-brand-navy hover:border-brand-navy
                                shadow-[0_4px_30px_rgba(0,0,0,0.03)]
                                flex items-center justify-center min-w-[130px]
                            "
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy group-hover:text-brand-gold transition-colors duration-300">
                                {category.name}
                            </span>

                            {/* Inner Shine Effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </Link>
                    ))}
                </div>

                {/* Premium Branding Line */}
                <div className="mt-16 relative flex items-center justify-center">
                    <div className="h-[1px] w-full bg-brand-navy/5"></div>
                    <div className="absolute flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-navy/20"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-navy/10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
