'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PiBasket } from 'react-icons/pi';

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
        <div className="group relative flex flex-col h-full bg-white transition-all duration-500 hover:shadow-xl hover:shadow-brand-gold/10">
            {/* Image Container */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-cream/10">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Overlay (Subtle Gradient) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Quick Action Buttons */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center pb-6">
                    <button
                        onClick={handleAddToCart}
                        className="bg-white/95 backdrop-blur text-brand-navy px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-brand-navy hover:text-white transition-colors shadow-lg flex items-center gap-2"
                        title="Add to Cart"
                    >
                        <PiBasket className="w-4 h-4" />
                        Quick Add
                    </button>
                </div>
            </Link>

            {/* Product Details */}
            <div className="pt-5 pb-4 px-2 text-center flex-grow flex flex-col justify-between">
                <div>
                    {/* Category kicker */}
                    <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 mb-2">
                        {product.category || 'Fine Jewellery'}
                    </p>

                    <Link href={`/product/${product.slug}`}>
                        <h3 className="text-xl font-serif text-brand-navy mb-2 group-hover:text-brand-gold transition-colors duration-300 leading-tight">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Specs Divider */}
                    <div className="flex justify-center items-center gap-3 text-[10px] uppercase tracking-widest text-gray-500 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        {product.goldPurity && <span>{product.goldPurity}K</span>}
                        {product.diamondCarat && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-brand-gold/50"></span>
                                <span>{product.diamondCarat.toFixed(2)}ct</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-2 relative">
                    <span className="text-lg font-serif font-medium text-brand-charcoal relative z-10 group-hover:text-brand-gold transition-colors">
                        ₹{Math.round(product.price || (product as any).pricing?.finalPrice || 0).toLocaleString('en-IN')}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-brand-gold scale-0 group-hover:scale-100 transition-transform duration-500 origin-center"></div>
                </div>
            </div>
        </div>
    );
}
