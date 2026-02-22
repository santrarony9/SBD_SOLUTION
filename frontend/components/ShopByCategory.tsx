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
        <section className="py-8 bg-white border-b border-brand-gold/5">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col md:items-center">
                    {/* Optional Label */}
                    <span className="text-brand-gold text-[9px] font-bold uppercase tracking-[0.4em] mb-4 text-center block w-full">Spark Your Selection</span>

                    {/* Pill Bar */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/shop?category=${category.slug}`}
                                className="group relative whitespace-nowrap px-6 py-2.5 rounded-full border border-gray-100 bg-white text-brand-navy hover:bg-brand-navy hover:text-white hover:border-brand-navy transition-all duration-500 shadow-sm hover:shadow-md flex items-center justify-center min-w-[100px]"
                            >
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] relative z-10">
                                    {category.name}
                                </span>

                                {/* Premium Accent Dot */}
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
