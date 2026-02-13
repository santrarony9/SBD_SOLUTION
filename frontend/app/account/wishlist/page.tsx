'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const data = await fetchAPI('/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (productId: string) => {
        try {
            await fetchAPI('/wishlist/toggle', {
                method: 'POST',
                body: JSON.stringify({ productId })
            });
            loadWishlist();
        } catch (error) {
            console.error('Failed to update wishlist');
        }
    };

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-100 w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-100"></div>
            <div className="h-64 bg-gray-100"></div>
        </div>
    </div>;

    return (
        <div className="space-y-12">
            <header className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-serif text-brand-navy">Curated Wishlist</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mt-1">Your desired masterpieces in one place</p>
            </header>

            {wishlist.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-gray-100">
                    <p className="font-serif text-xl italic text-gray-400 mb-8">No pieces have been curated yet.</p>
                    <Link href="/shop" className="text-[10px] px-10 py-4 bg-brand-navy text-white font-bold uppercase tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-xl">
                        Explore Collection
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {wishlist.map((item: any) => (
                        <div key={item.id} className="group flex bg-white border border-gray-100 shadow-lg hover:border-brand-gold transition-all duration-500 overflow-hidden relative">
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={() => toggleItem(item.product.id)}
                                    className="w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-brand-gold hover:text-red-500 transition-colors shadow-sm"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="w-1/3 aspect-[4/5] bg-gray-50 overflow-hidden">
                                <img
                                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338'}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>

                            <div className="w-2/3 p-6 flex flex-col justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">{item.product.category}</p>
                                    <h3 className="font-serif text-lg text-brand-navy mb-2 line-clamp-1">{item.product.name}</h3>
                                    <p className="text-xs text-brand-gold font-bold uppercase tracking-widest">₹{formatPrice(item.product.price) || 'P.O.A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        href={`/product/${item.product.slug}`}
                                        className="block w-full text-center text-[10px] py-3 bg-brand-navy text-white font-bold uppercase tracking-widest hover:bg-gold-gradient hover:text-brand-navy transition-all"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
