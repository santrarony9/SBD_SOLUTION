'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useComparison } from '@/context/ComparisonContext';
import { fetchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PiX, PiShoppingBag } from 'react-icons/pi';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    slug: string;
    images: string[];
    goldPurity: number;
    goldWeight: number;
    diamondCarat: number;
    diamondClarity: string;
    pricing: {
        finalPrice: number;
    };
    category: string;
}

export default function ComparePage() {
    const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        async function loadProducts() {
            if (comparisonItems.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                // Fetch each product details
                const data = await Promise.all(
                    comparisonItems.map(id => fetchAPI(`/products/${id}`))
                );
                setProducts(data.filter(Boolean));
            } catch (error) {
                console.error("Failed to load compare products", error);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, [comparisonItems]);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-brand-gold">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                    </svg>
                </div>
                <h1 className="text-3xl font-serif text-brand-navy mb-4">Your comparison list is empty</h1>
                <p className="text-gray-500 mb-8 max-w-sm">Add up to 3 products to compare their specifications and find your perfect match.</p>
                <Link href="/shop" className="bg-brand-navy text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gold-gradient hover:text-brand-navy transition-all">
                    Start Exploring
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-brand-cream min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-serif text-brand-navy mb-2">Compare Products</h1>
                        <p className="text-gray-500 text-sm">Compare technical details and find the right piece for you.</p>
                    </div>
                    <button
                        onClick={clearComparison}
                        className="text-xs uppercase tracking-widest font-bold text-red-500 border-b border-red-500/20 pb-1"
                    >
                        Clear All
                    </button>
                </div>

                <div className="grid grid-cols-[180px_1fr] border border-brand-gold/10 bg-white shadow-sm overflow-hidden">
                    {/* Labels Column */}
                    <div className="bg-gray-50/50 border-r border-brand-gold/10">
                        <div className="h-64 border-b border-brand-gold/10"></div> {/* Image Spacer */}
                        <div className="p-4 border-b border-brand-gold/10 text-[10px] uppercase tracking-widest font-black text-gray-400">Price</div>
                        <div className="p-4 border-b border-brand-gold/10 text-[10px] uppercase tracking-widest font-black text-gray-400">Gold Purity</div>
                        <div className="p-4 border-b border-brand-gold/10 text-[10px] uppercase tracking-widest font-black text-gray-400">Gold Weight</div>
                        <div className="p-4 border-b border-brand-gold/10 text-[10px] uppercase tracking-widest font-black text-gray-400">Diamond Carat</div>
                        <div className="p-4 border-b border-brand-gold/10 text-[10px] uppercase tracking-widest font-black text-gray-400">Diamond Clarity</div>
                        <div className="p-4 border-b border-brand-gold/10 text-[10px] uppercase tracking-widest font-black text-gray-400">Category</div>
                        <div className="p-4 border-b border-brand-gold/10 text-[10px] uppercase tracking-widest font-black text-gray-400">Actions</div>
                    </div>

                    {/* Products Grid */}
                    <div className={`grid grid-cols-${products.length}`}>
                        {products.map((p) => (
                            <div key={p.id} className="border-r border-brand-gold/10 last:border-r-0 relative group">
                                <button
                                    onClick={() => removeFromComparison(p.id)}
                                    className="absolute top-2 right-2 z-10 p-1.5 bg-white shadow-md border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <PiX className="w-3.5 h-3.5" />
                                </button>

                                <div className="h-64 p-6 border-b border-brand-gold/10 flex flex-col items-center">
                                    <div className="relative w-full h-40 mb-4">
                                        <Image
                                            src={p.images[0] || '/placeholder.jpg'}
                                            alt={p.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <Link href={`/product/${p.slug}`}>
                                        <h3 className="text-sm font-serif text-brand-navy text-center line-clamp-2 hover:text-brand-gold transition-colors">
                                            {p.name}
                                        </h3>
                                    </Link>
                                </div>

                                <div className="p-4 border-b border-brand-gold/10 text-sm font-sans font-bold text-center text-brand-gold">
                                    ₹{formatPrice(p.pricing?.finalPrice || 0)}
                                </div>
                                <div className="p-4 border-b border-brand-gold/10 text-sm text-center text-brand-navy">
                                    {p.goldPurity}K
                                </div>
                                <div className="p-4 border-b border-brand-gold/10 text-sm text-center text-brand-navy">
                                    {p.goldWeight}g
                                </div>
                                <div className="p-4 border-b border-brand-gold/10 text-sm text-center text-brand-navy">
                                    {p.diamondCarat} ct
                                </div>
                                <div className="p-4 border-b border-brand-gold/10 text-sm text-center text-brand-navy uppercase tracking-widest">
                                    {p.diamondClarity}
                                </div>
                                <div className="p-4 border-b border-brand-gold/10 text-sm text-center text-brand-navy capitalize">
                                    {p.category}
                                </div>
                                <div className="p-4 border-b border-brand-gold/10 flex justify-center">
                                    <button
                                        onClick={() => addToCart(p.id, 1)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-[10px] uppercase font-bold tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-all"
                                    >
                                        <PiShoppingBag className="w-3.5 h-3.5" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
