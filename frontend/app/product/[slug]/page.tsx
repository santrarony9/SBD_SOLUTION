'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    goldPurity: number;
    diamondClarity: string;
    pricing: {
        finalPrice: number;
        components: {
            goldValue: number;
            diamondValue: number;
            makingCharges: number;
            gst: number;
        };
    };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBreakup, setShowBreakup] = useState(false);

    // Note: in Next.js 15+ params are async, but checking current file it seems to be treated as sync props or we assume older nextjs/handling. 
    // However, to be safe and strictly follow "use client", we can use useParams() which handles dynamic segments on client side 
    // OR just use the prop. The current file uses `params` prop but also imports `useParams`. 
    // Let's stick to the prop if it works, or fallback to useParams.

    // Actually, `params` in page props is the standard way.

    useEffect(() => {
        async function loadProduct() {
            try {
                const data = await fetchAPI(`/products/${params.slug}`);
                setProduct(data);
            } catch (err) {
                console.error("Failed to load product", err);
                setError('Failed to load product details.');
            } finally {
                setLoading(false);
            }
        }

        if (params.slug) {
            loadProduct();
        }
    }, [params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
                {error || 'Product not found'}
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400">
                <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span className="text-gray-600">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">

                {/* Media Section */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-gray-400">Main Image</span>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-gray-50 rounded cursor-pointer border border-gray-200 hover:border-brand-gold"></div>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif text-brand-navy mb-2">{product.name}</h1>
                    <div className="flex items-center space-x-4 mb-6 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 border border-gray-200">IGI Certified</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 border border-gray-200">BIS Hallmarked</span>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8 border-b border-gray-100 pb-8">
                        {product.description}
                    </p>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-700 mb-8">
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                            <span>Gold Purity</span>
                            <span className="font-semibold">{product.goldPurity}K</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                            <span>Diamond Clarity</span>
                            <span className="font-semibold">{product.diamondClarity}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                            <span>Gold Weight</span>
                            <span className="font-semibold">3.5g (Approx)</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                            <span>Diamond Carat</span>
                            <span className="font-semibold">0.40ct</span>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="bg-brand-navy/5 p-6 rounded-lg border border-brand-navy/10">
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-sm text-gray-500">Total Price</span>
                            <span className="text-3xl font-serif font-bold text-brand-navy">
                                {product.pricing?.finalPrice ? `₹${product.pricing.finalPrice.toLocaleString()}` : 'Price on Request'}
                            </span>
                        </div>
                        <p className="text-xs text-green-600 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Price calculated as per today’s gold & diamond rate
                        </p>

                        <button
                            onClick={() => setShowBreakup(!showBreakup)}
                            className="text-xs text-brand-gold underline hover:text-brand-navy transition-colors mb-4 block"
                        >
                            {showBreakup ? 'Hide Price Breakup' : 'View Transparent Price Breakup'}
                        </button>

                        {showBreakup && product.pricing?.components && (
                            <div className="bg-white p-4 rounded border border-gray-200 text-sm space-y-2 mb-4 animate-fade-in">
                                <div className="flex justify-between text-gray-600">
                                    <span>Gold Value</span>
                                    <span>₹{product.pricing.components.goldValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Diamond Value ({product.diamondClarity})</span>
                                    <span>₹{product.pricing.components.diamondValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Making Charges</span>
                                    <span>₹{product.pricing.components.makingCharges.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>GST</span>
                                    <span>₹{product.pricing.components.gst.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                    <span>Final Amount</span>
                                    <span>₹{product.pricing.finalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <button className="w-full bg-brand-navy text-white h-12 rounded font-semibold hover:bg-brand-gold hover:text-brand-navy transition-all duration-300 uppercase tracking-widest text-sm">
                            Add to Cart
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

