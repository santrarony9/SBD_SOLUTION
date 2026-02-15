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
    // Filter out categories without images if preferred, or show placeholder
    // For now, we show all, assuming they have images or we use a gradient fallback.

    // Sort or filter if needed? usually the API returns them in order.
    // If there are too many, maybe limit to top 4-5 or 8?
    // Let's show up to 8 for now.
    const displayCategories = categories.slice(0, 8);

    if (displayCategories.length === 0) return null;

    return (
        <section className="py-12 bg-white">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                {/* <h2 className="text-center font-serif text-3xl text-brand-navy mb-8">Shop by Category</h2> */}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/shop?category=${category.slug}`}
                            className="group relative block aspect-[4/5] overflow-hidden rounded-sm"
                        >
                            {/* Image Layer */}
                            {category.imageUrl || category.image ? (
                                <Image
                                    src={category.imageUrl || category.image || ''}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-brand-cream flex items-center justify-center text-brand-gold/20">
                                    <span className="font-serif italic">SBD</span>
                                </div>
                            )}

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                            {/* Text Overlay - Bottom Left */}
                            <div className="absolute bottom-4 left-4 z-10">
                                <span className="text-white text-xs md:text-sm font-bold uppercase tracking-[0.15em] border-b border-transparent group-hover:border-white transition-all pb-1">
                                    {category.name}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
