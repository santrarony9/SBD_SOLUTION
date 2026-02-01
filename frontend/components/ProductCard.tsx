'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface ProductProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category?: string;
    images?: string[];
}

export default function ProductCard({ product }: { product: ProductProps }) {
    const { addToCart } = useCart();

    // Normalize image source
    const displayImage = product.image || (product.images && product.images[0]) || '/placeholder.jpg';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product.id, 1);
        alert('Added to Cart'); // Replace with toast later
    };

    return (
        <div className="group relative bg-white border border-transparent hover:border-brand-gold/30 transition-all duration-500 ease-out-expo hover:shadow-2xl hover:shadow-brand-navy/10">
            {/* Image Container with Zoom Effect */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Overlay Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Quick Add Button - Slides Up */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-white/95 backdrop-blur-md text-brand-navy py-3 px-4 uppercase tracking-[0.2em] text-xs font-bold border border-brand-gold hover:bg-brand-navy hover:text-brand-gold transition-colors shadow-lg"
                    >
                        Add to Bag
                    </button>
                </div>

                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 text-brand-navy border border-gray-100">
                        {product.category || 'Luxury'}
                    </span>
                </div>
            </Link>

            {/* Product Details */}
            <div className="p-6 text-center bg-white relative z-10 transition-colors duration-300">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-lg font-serif font-medium text-brand-navy mb-3 group-hover:text-brand-gold transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                {/* Decorative Divider */}
                <div className="flex justify-center items-center gap-3 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="h-px w-6 bg-brand-gold/40"></span>
                    <span className="text-[10px] text-brand-gold uppercase tracking-widest">◇</span>
                    <span className="h-px w-6 bg-brand-gold/40"></span>
                </div>

                <p className="text-xl font-serif text-brand-charcoal group-hover:text-brand-navy transition-colors">
                    ₹{product.price.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
