'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/data/mock';
import { useParams } from 'next/navigation';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    // Mock finding product
    // In real app we fetch from backend
    const product = MOCK_PRODUCTS.find(p => p.slug === params.slug) || MOCK_PRODUCTS[0];

    // State for pricing breakdown
    const [showBreakup, setShowBreakup] = useState(false);

    return (
        <div className="bg-white min-h-screen pb-20">

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400">
                <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span className="text-gray-600">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">

                {/* Media Section */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="text-gray-400">Main Image</span>
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
                            <span className="text-3xl font-serif font-bold text-brand-navy">₹{product.price.toLocaleString()}</span>
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

                        {showBreakup && (
                            <div className="bg-white p-4 rounded border border-gray-200 text-sm space-y-2 mb-4 animate-fade-in">
                                <div className="flex justify-between text-gray-600">
                                    <span>Gold Value (22K)</span>
                                    <span>₹22,000</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Diamond Value ({product.diamondClarity})</span>
                                    <span>₹18,000</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Making Charges</span>
                                    <span>₹3,500</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>GST (3%)</span>
                                    <span>₹1,500</span>
                                </div>
                                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                    <span>Final Amount</span>
                                    <span>₹45,000</span>
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
