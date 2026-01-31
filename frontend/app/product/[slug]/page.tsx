'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
            <div className="min-h-screen bg-brand-cream flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-brand-cream flex items-center justify-center text-red-500 font-light">
                {error || 'Product not found'}
            </div>
        );
    }

    return (
        <div className="bg-brand-cream min-h-screen pb-20 pt-24">

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-gray-400 uppercase tracking-widest">
                <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link> / <Link href="/shop" className="hover:text-brand-gold transition-colors">Shop</Link> / <span className="text-brand-charcoal font-medium">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 mt-4">

                {/* Media Section */}
                <div className="space-y-6">
                    <div className="aspect-[4/5] bg-white rounded-sm flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm relative group">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        ) : (
                            <span className="text-gray-300 font-serif text-2xl uppercase tracking-widest">Spark Blue</span>
                        )}

                        {/* Zoom Hint */}
                        <div className="absolute top-4 right-4">
                            <span className="bg-white/80 backdrop-blur text-[10px] uppercase font-bold px-2 py-1 tracking-widest">Zoom</span>
                        </div>
                    </div>

                    {/* Thumbnails (Mock for layout) */}
                    <div className="grid grid-cols-4 gap-4">
                        {[product.images?.[0], null, null, null].map((img, i) => (
                            <div key={i} className={`aspect-square bg-white rounded-sm cursor-pointer border ${i === 0 ? 'border-brand-gold' : 'border-gray-200'} hover:border-brand-gold transition-colors flex items-center justify-center overflow-hidden`}>
                                {img ? <img src={img} alt="Thumbnail" className="object-cover w-full h-full" /> : <div className="w-full h-full bg-gray-50"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif text-brand-navy mb-4 leading-tight">{product.name}</h1>

                    <div className="flex items-center space-x-6 mb-8 text-xs font-semibold tracking-widest uppercase text-gray-500">
                        <span className="flex items-center"><span className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2"></span>IGI Certified</span>
                        <span className="flex items-center"><span className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2"></span>BIS Hallmarked</span>
                    </div>

                    <p className="text-gray-600 font-light leading-relaxed mb-10 border-b border-brand-charcoal/10 pb-10 text-sm md:text-base">
                        {product.description}
                    </p>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm text-brand-charcoal mb-10">
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                            <span className="font-light text-gray-500">Gold Purity</span>
                            <span className="font-semibold">{product.goldPurity}K</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                            <span className="font-light text-gray-500">Diamond Clarity</span>
                            <span className="font-semibold">{product.diamondClarity}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                            <span className="font-light text-gray-500">Gold Weight</span>
                            <span className="font-semibold">3.5g (Approx)</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                            <span className="font-light text-gray-500">Diamond Carat</span>
                            <span className="font-semibold">0.40ct</span>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                        <div className="flex items-baseline justify-between mb-4">
                            <span className="text-sm text-gray-500 font-light uppercase tracking-wider">Total Price</span>
                            <span className="text-4xl font-serif font-bold text-brand-navy">
                                {product.pricing?.finalPrice ? `₹${product.pricing.finalPrice.toLocaleString()}` : 'Price on Request'}
                            </span>
                        </div>

                        <p className="text-xs text-green-700 mb-6 flex items-center bg-green-50 w-full py-2 px-3 rounded-sm border border-green-100">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Live Price: Updated based on real-time gold & diamond rates
                        </p>

                        <button
                            onClick={() => setShowBreakup(!showBreakup)}
                            className="text-xs text-brand-navy font-bold uppercase tracking-widest border-b border-brand-navy pb-0.5 hover:text-brand-gold hover:border-brand-gold transition-colors mb-6 block"
                        >
                            {showBreakup ? 'Hide Price Breakdown' : 'View Price Breakdown'}
                        </button>

                        {showBreakup && product.pricing?.components && (
                            <div className="bg-brand-cream/50 p-5 rounded-sm border border-gray-200 text-sm space-y-3 mb-6 animate-fade-in">
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
                                    <span>GST (3%)</span>
                                    <span>₹{product.pricing.components.gst.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-brand-navy border-t border-gray-300 pt-3 mt-2">
                                    <span>Final Amount</span>
                                    <span>₹{product.pricing.finalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button className="w-full bg-brand-navy text-white h-14 font-bold hover:bg-brand-gold hover:text-brand-navy transition-all duration-300 uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Add to Cart
                            </button>
                            <button className="w-full border border-brand-navy text-brand-navy h-14 font-bold hover:bg-brand-navy hover:text-white transition-all duration-300 uppercase tracking-widest text-sm">
                                Wishlist
                            </button>
                        </div>
                    </div>

                    {/* Additional Info Toggles or Shipping info could go here */}
                    <div className="mt-8 flex space-x-8 text-xs text-gray-500 uppercase tracking-widest border-t border-gray-200 pt-6">
                        <span className="flex items-center"><span className="text-lg mr-2">🚚</span> Free Insured Shipping</span>
                        <span className="flex items-center"><span className="text-lg mr-2">🔄</span> 30-Day Returns</span>
                    </div>

                </div>
            </div>
        </div>
    );
}

