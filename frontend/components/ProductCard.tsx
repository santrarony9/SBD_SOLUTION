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
        <div className="group relative transition-all duration-700 hover:-translate-y-1">
            {/* Image Container */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-cream/20">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Overlay (Subtle Darken) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                {/* Add to Cart Button (Minimalist, Fad-in) */}
                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-4 right-4 bg-white text-brand-navy p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-brand-navy hover:text-brand-gold"
                    title="Add to Cart"
                >
                    <PiBasket className="w-5 h-5" />
                </button>
            </Link>

            {/* Product Details - Clean & Centered */}
            <div className="pt-6 pb-2 text-center">

                {/* Category kicker */}
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    {product.category || 'Fine Jewellery'}
                </p>

                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-lg font-serif text-brand-navy mb-2 group-hover:text-brand-gold transition-colors duration-300">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex justify-center gap-2 text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    {product.goldPurity && <span>{product.goldPurity}K Gold</span>}
                    {product.goldWeight && <span>• {product.goldWeight}g</span>}
                    {product.diamondCarat && <span>• {product.diamondCarat.toFixed(2)}ct Dia</span>}
                </div>

                <p className="text-sm font-medium text-brand-charcoal/80">
                    ₹{Math.round(product.price || (product as any).pricing?.finalPrice || 0).toLocaleString('en-IN')}
                </p>
            </div>
        </div>
    );
}
