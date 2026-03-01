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
    return (
        <section className="relative py-16 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-serif text-brand-navy tracking-widest uppercase font-light">Shop by Category</h2>
                </div>

                {/* Bento Box Layout */}
                <div className="flex flex-col md:flex-row gap-4 h-[800px] md:h-[500px]">

                    {/* Left Large Column (Category 0) */}
                    {categories[0] && (
                        <Link href={`/shop?category=${categories[0].slug}`} className="group relative w-full md:w-[45%] h-1/3 md:h-full overflow-hidden block">
                            <Image
                                src={categories[0].imageUrl || categories[0].image || 'https://images.unsplash.com/photo-1599643478514-4a5202334335?q=80&w=1000&auto=format&fit=crop'}
                                alt={categories[0].name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                            <span className="absolute bottom-6 left-6 text-white text-sm md:text-base tracking-[0.2em] font-light uppercase z-10">
                                {categories[0].name}
                            </span>
                        </Link>
                    )}

                    {/* Right Columns Container */}
                    <div className="w-full md:w-[55%] flex flex-col gap-4 h-2/3 md:h-full">

                        {/* Top Row */}
                        <div className="flex flex-row gap-4 h-1/2">
                            {/* Category 1 */}
                            {categories[1] && (
                                <Link href={`/shop?category=${categories[1].slug}`} className="group relative w-1/2 h-full overflow-hidden block bg-gray-100">
                                    <Image
                                        src={categories[1].imageUrl || categories[1].image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop'}
                                        alt={categories[1].name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0" />
                                    <span className="absolute top-4 left-4 text-white drop-shadow-md text-xs md:text-sm tracking-[0.2em] font-light uppercase z-10">
                                        {categories[1].name}
                                    </span>
                                </Link>
                            )}

                            {/* Category 2 */}
                            {categories[2] && (
                                <Link href={`/shop?category=${categories[2].slug}`} className="group relative w-1/2 h-full overflow-hidden block bg-gray-100">
                                    <Image
                                        src={categories[2].imageUrl || categories[2].image || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop'}
                                        alt={categories[2].name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0" />
                                    <span className="absolute top-4 left-4 text-white drop-shadow-md text-xs md:text-sm tracking-[0.2em] font-light uppercase z-10">
                                        {categories[2].name}
                                    </span>
                                </Link>
                            )}
                        </div>

                        {/* Bottom Row */}
                        <div className="flex flex-row gap-4 h-1/2">
                            {/* Category 3 (Wide) */}
                            {categories[3] && (
                                <Link href={`/shop?category=${categories[3].slug}`} className="group relative w-[70%] h-full overflow-hidden block bg-gray-100">
                                    <Image
                                        src={categories[3].imageUrl || categories[3].image || 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop'}
                                        alt={categories[3].name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 object-center"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
                                    <span className="absolute bottom-4 right-6 text-white text-xs md:text-sm tracking-[0.2em] font-light uppercase z-10">
                                        {categories[3].name}
                                    </span>
                                </Link>
                            )}

                            {/* View All Block */}
                            <Link href="/shop" className="group w-[30%] h-full bg-[#1a2238] flex flex-col items-center justify-center transition-colors hover:bg-brand-gold">
                                <span className="text-white text-3xl font-light mb-2 transition-transform group-hover:translate-x-2">›</span>
                                <span className="text-white text-[10px] tracking-widest uppercase font-bold">All</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
