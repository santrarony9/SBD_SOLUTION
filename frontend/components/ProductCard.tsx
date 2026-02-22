'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PiBasket } from 'react-icons/pi';
import { formatPrice } from '@/lib/utils';

interface ProductProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category?: string;
    images?: string[];
    coverImage?: string;
    goldPurity?: number;
    goldWeight?: number;
    diamondCarat?: number;
    diamondClarity?: string;
}

import { motion } from 'framer-motion';

export default function ProductCard({ product }: { product: ProductProps }) {
    const { addToCart } = useCart();

    // Normalize image source
    const displayImage = product.image || (product.images && product.images[0]) || '/placeholder.jpg';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product.id, 1);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5 }}
            className="group relative flex flex-col h-full bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-brand-gold/15 rounded-none border border-transparent hover:border-brand-gold/10"
        >
            {/* Image Container */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50/50 p-4">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full h-full relative"
                >
                    <Image
                        src={displayImage}
                        alt={product.name}
                        fill
                        className="object-contain p-2 transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />

                    {/* Cover Image (Reveals on Hover) */}
                    {(product.coverImage || (product.images && product.images[1])) && (
                        <Image
                            src={product.coverImage || product.images![1]}
                            alt={product.name + " cover"}
                            fill
                            className="object-contain p-2 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    )}
                </motion.div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/5 transition-all duration-500" />

                <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-brand-navy text-brand-gold py-3 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-xl flex items-center justify-center gap-2 backdrop-blur-md"
                    >
                        <PiBasket className="w-4 h-4" />
                        Quick Add
                    </button>
                </div>
            </Link>

            {/* Product Details */}
            <div className="pt-5 pb-5 px-3 text-center flex-grow flex flex-col justify-between relative bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-brand-gold/20"></div>

                <div className="mt-2">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-brand-gold/70 mb-2 font-black">
                        {product.category || 'Jewellery'}
                    </p>

                    <Link href={`/product/${product.slug}`}>
                        <h3 className="text-sm md:text-base font-serif text-brand-navy mb-2 group-hover:text-brand-gold transition-colors duration-300 leading-relaxed px-2 line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex justify-center items-center gap-3 text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-3 font-bold opacity-60">
                        {product.goldPurity && <span>{product.goldPurity}K Gold</span>}
                        {product.diamondCarat && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-brand-gold/30"></span>
                                <span>{product.diamondCarat.toFixed(2)}ct Diamond</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold font-sans text-brand-navy tracking-tight">
                        ₹{formatPrice(product.price || (product as any).pricing?.finalPrice || 0)}
                    </span>
                    <div className="w-0 group-hover:w-16 h-[2px] bg-brand-gold/40 transition-all duration-700 mt-1"></div>
                </div>
            </div>
        </motion.div>
    );
}
