"use client";

import Link from "next/link";
import Image from "next/image";

interface ProductProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category?: string;
    images?: string[]; // Handle both image and images for compatibility
}

export default function ProductCard({ product }: { product: ProductProps }) {
    // Normalize image source
    const displayImage = product.image || (product.images && product.images[0]) || null;
    const addToWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        alert('Added to Wishlist! (Feature live soon)');
    };

    return (
        <div className="group relative bg-white border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
                {/* Wishlist Button */}
                <button
                    onClick={addToWishlist}
                    className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                    title="Add to Wishlist"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Image */}
                <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-700 ease-in-out">
                    {displayImage ? (
                        <Image src={displayImage} alt={product.name} fill className="object-cover" />
                    ) : (
                        <span className="font-serif text-sm tracking-widest uppercase">No Image</span>
                    )}
                </div>

                {/* Badge (Optional) */}
                <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="bg-white/90 text-[10px] font-bold tracking-widest uppercase px-3 py-1">New</span>
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <Link href={`/product/${product.slug}`} className="block w-full text-center bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold text-xs uppercase tracking-[0.2em] py-3 hover:bg-brand-gold hover:border-brand-gold hover:text-brand-navy transition-all duration-300">
                        Quick View
                    </Link>
                </div>
            </div>

            <div className="p-4 text-center space-y-2">
                <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em]">{product.category || 'Fine Jewellery'}</p>
                <h3 className="text-brand-navy font-serif text-lg group-hover:text-brand-gold transition-colors duration-300 line-clamp-1">
                    <Link href={`/product/${product.slug}`}>
                        {product.name}
                    </Link>
                </h3>
                <p className="text-gray-900 font-light tracking-wide">
                    ₹{product.price.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
