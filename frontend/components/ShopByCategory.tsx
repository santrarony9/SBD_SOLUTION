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
        <section className="py-6 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col">
                    {/* Pill Bar - Matching Screenshot Style */}
                    <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth touch-pan-x">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/shop?category=${category.slug}`}
                                className="group whitespace-nowrap px-8 py-3 rounded-full border border-gray-100 bg-white text-brand-navy hover:shadow-lg transition-all duration-300 flex items-center justify-center min-w-[120px]"
                            >
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em]">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Decorative Brand Line - Exactly as in Screenshot (Half Gold, Half Navy) */}
                    <div className="relative h-1 w-full flex">
                        <div className="h-full bg-brand-gold w-3/5"></div>
                        <div className="h-full bg-brand-navy w-2/5"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
