'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface WishlistItem {
    id: string;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        images: string[];
    };
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();

    const loadWishlist = async () => {
        try {
            const data = await fetchAPI('/wishlist');
            if (data) setItems(data);
        } catch (error) {
            console.error('Failed to load wishlist');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWishlist();
    }, []);

    const removeFromWishlist = async (productId: string) => {
        try {
            await fetchAPI('/wishlist/toggle', {
                method: 'POST',
                body: JSON.stringify({ productId }),
            });
            loadWishlist(); // Refresh
        } catch (error) {
            console.error('Failed to remove item');
        }
    };

    if (isLoading) return <div className="p-12 text-center">Loading your favorites...</div>;

    if (items.length === 0) {
        return (
            <div className="bg-white p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
                <div className="text-4xl text-gray-300 mb-4">❤️</div>
                <h2 className="text-2xl font-serif text-brand-navy mb-2"> Your Wishlist is Empty</h2>
                <p className="text-gray-500 mb-6">Save items you love to review later.</p>
                <Link href="/shop" className="px-8 py-3 bg-brand-navy text-white text-sm font-bold uppercase tracking-widest hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300">
                    Explore Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-serif text-brand-navy mb-8 text-center">My Wishlist</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map(({ product }) => (
                    <div key={product.id} className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative aspect-[3/4] overflow-hidden">
                            {product.images[0] && (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            )}
                            <button
                                onClick={() => removeFromWishlist(product.id)}
                                className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white text-red-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 text-center">
                            <h3 className="font-serif text-lg text-brand-navy mb-1">{product.name}</h3>
                            <p className="text-brand-gold font-bold mb-4">₹{product.price.toLocaleString()}</p>
                            <button
                                onClick={() => addToCart(product.id, 1)}
                                className="w-full py-2 border border-brand-navy text-brand-navy text-xs font-bold uppercase hover:bg-brand-navy hover:text-white transition-colors"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
