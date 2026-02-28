'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PiBasket } from 'react-icons/pi';
import { formatPrice } from '@/lib/utils';
import { useComparison } from '@/context/ComparisonContext';
import { useCurrency } from '@/context/CurrencyContext';
import { PiCheckBold, PiHeart } from 'react-icons/pi';

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
    const { addToComparison, removeFromComparison, isInComparison } = useComparison();
    const { formatPrice: globalFormatPrice } = useCurrency();

    const isCompared = isInComparison(product.id);

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
            {/* Image & Action Container */}
            <Link href={`/product/${product.slug}`} className="block relative flex flex-col overflow-hidden bg-[#FDFDFD] p-1">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full aspect-square relative"
                >
                    <Image
                        src={displayImage}
                        alt={product.name}
                        fill
                        className="object-contain transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                        quality={85}
                    />

                    {/* Cover Image (Reveals on Hover) */}
                    {(product.coverImage || (product.images && product.images[1])) && (
                        <Image
                            src={product.coverImage || product.images![1]}
                            alt={product.name + " cover"}
                            fill
                            className="object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    )}
                </motion.div>

                {/* Quick Action Overlay (Absolute on Desktop, Static on Mobile) */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-brand-navy/[0.01] transition-all duration-300 pointer-events-none" />

                <div className="md:absolute static bottom-0 left-0 right-0 md:opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20 mt-1 md:mt-0">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        className="w-full min-h-[40px] md:min-h-[48px] bg-brand-navy text-white py-2 md:py-3.5 text-[9px] md:text-[10px] uppercase font-black tracking-[0.25em] hover:bg-brand-gold hover:text-brand-navy transition-all flex items-center justify-center gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
                    >
                        <PiBasket className="w-4 h-4" />
                        Quick Add
                    </motion.button>
                </div>

                {/* Compare Checkbox */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        isCompared ? removeFromComparison(product.id) : addToComparison(product.id);
                    }}
                    className={`absolute top-2 left-2 z-30 w-7 h-7 rounded-full border transition-all flex items-center justify-center ${isCompared ? 'bg-brand-gold border-brand-gold text-brand-navy' : 'bg-white/80 border-gray-200 text-transparent opacity-0 group-hover:opacity-100 hover:border-brand-gold'}`}
                    title="Compare"
                >
                    <PiCheckBold className={`w-3.5 h-3.5 ${isCompared ? 'opacity-100' : 'opacity-0'}`} />
                </button>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                    className={`absolute top-2 right-2 z-30 w-7 h-7 rounded-full border transition-all flex items-center justify-center bg-white/80 border-gray-200 text-gray-400 opacity-100 hover:text-red-500 hover:border-red-200 shadow-sm`}
                    title="Add to Wishlist"
                >
                    <PiHeart className="w-4 h-4" />
                </button>
            </Link>

            {/* Product Details */}
            <div className="pt-3.5 pb-4 px-3 text-center flex-grow flex flex-col justify-between relative bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[1px] bg-brand-gold/15"></div>

                <div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-brand-gold mb-1 font-black">
                        {product.category || 'Jewellery'}
                    </p>

                    <Link href={`/product/${product.slug}`}>
                        <h3 className="text-xs md:text-base font-serif text-brand-navy mb-1 group-hover:text-brand-gold transition-colors duration-300 leading-tight px-1 line-clamp-2 min-h-[2.4rem]">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex justify-center items-center gap-2.5 text-[8.5px] uppercase tracking-[0.1em] text-gray-400 mb-1.5 font-bold opacity-70">
                        {product.goldPurity && <span>{product.goldPurity}K Gold</span>}
                        {product.diamondCarat && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-brand-gold/40"></span>
                                <span>{product.diamondCarat.toFixed(2)}ct Diamond</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-base font-bold font-sans text-brand-navy tracking-tight">
                        {globalFormatPrice(product.price || (product as any).pricing?.finalPrice || 0)}
                    </span>
                    <div className="w-0 group-hover:w-10 h-[1px] bg-brand-gold/50 transition-all duration-500 mt-0.5"></div>
                </div>
            </div>
        </motion.div>
    );
}
