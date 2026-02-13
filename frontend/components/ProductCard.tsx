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
    goldPurity?: number;
    goldWeight?: number;
    diamondCarat?: number;
    diamondClarity?: string;
}

export default function ProductCard({ product }: { product: ProductProps }) {
    const { addToCart } = useCart();

    // Normalize image source
    const displayImage = product.image || (product.images && product.images[0]) || '/placeholder.jpg';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product.id, 1);
        // Toast notification would go here
    };

    return (
        <div className="group relative flex flex-col h-full bg-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-gold/10 rounded-sm">
            {/* Image Container - Switched to Square Aspect Ratio and Contain to prevent cropping */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50 padding-4">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105 multiply-blend-mode"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Overlay (Subtle Gradient) */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Quick Action Buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center pb-4">
                    <button
                        onClick={handleAddToCart}
                        className="bg-white text-brand-navy border border-brand-navy/10 px-6 py-2 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-brand-navy hover:text-white transition-colors shadow-sm flex items-center gap-2"
                        title="Add to Cart"
                    >
                        <PiBasket className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </Link>

            {/* Product Details */}
            <div className="pt-4 pb-4 px-1 text-center flex-grow flex flex-col justify-between">
                <div>
                    {/* Category kicker */}
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold/80 mb-2 font-bold">
                        {product.category || 'Jewellery'}
                    </p>

                    <Link href={`/product/${product.slug}`}>
                        <h3 className="text-base font-serif text-brand-navy mb-1 group-hover:text-brand-gold transition-colors duration-300 leading-snug lg:h-10 lg:line-clamp-2 px-2">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Specs Divider */}
                    <div className="flex justify-center items-center gap-3 text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-medium">
                        {product.goldPurity && <span>{product.goldPurity}K</span>}
                        {product.diamondCarat && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{product.diamondCarat.toFixed(2)}ct</span>
                            </>
                        )}
                    </div>
                </div>

                <span className="text-base font-bold font-sans text-brand-charcoal relative z-10">
                    ₹{formatPrice(product.price || (product as any).pricing?.finalPrice || 0)}
                </span>
            </div>
        </div>
    );
}
