'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from "@/context/CartContext";
import ProductReviews from "@/components/ProductReviews";
import { fetchAPI } from '@/lib/api';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    goldPurity: number;
    goldWeight: number;
    diamondCarat: number;
    diamondClarity: string;
    videoUrl?: string;
    certificatePdf?: string;
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

import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    // State
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBreakup, setShowBreakup] = useState(false);
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', src: string | undefined }>({ type: 'image', src: undefined });

    useEffect(() => {
        async function loadProduct() {
            if (!slug) return;

            try {
                const data = await fetchAPI(`/products/${slug}`);
                setProduct(data);
                // Prioritize video first
                if (data.videoUrl) {
                    setActiveMedia({ type: 'video', src: data.videoUrl });
                } else if (data.images && data.images.length > 0) {
                    setActiveMedia({ type: 'image', src: data.images[0] });
                }
            } catch (err) {
                console.error("Failed to load product", err);
                setError(`Failed to load product details. ${(err as Error).message}`);
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [slug]);

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
        <div className="bg-brand-cream min-h-screen pb-10 pt-20">

            {/* Breadcrumb - Minimalist */}
            <div className="max-w-[1400px] mx-auto px-6 py-3 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium border-b border-brand-gold/10 mb-6">
                <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
                <span className="mx-2 text-brand-gold">/</span>
                <Link href="/shop" className="hover:text-brand-navy transition-colors">Collections</Link>
                <span className="mx-2 text-brand-gold">/</span>
                <span className="text-brand-navy truncate max-w-[200px] inline-block align-bottom">{product.name}</span>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 h-[calc(100vh-140px)] min-h-[600px]">

                {/* Left Column: Media Gallery (Constrained Height) */}
                <div className="flex flex-col h-full">
                    {/* Main Viewer */}
                    <div className="flex-grow bg-white rounded-sm overflow-hidden shadow-sm relative group border border-gray-100/50 h-full max-h-[75vh]">
                        {activeMedia.type === 'video' ? (
                            <div className="w-full h-full bg-gray-900 relative">
                                <video
                                    src={activeMedia.src}
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-brand-navy text-[9px] font-bold uppercase px-2 py-1 tracking-[0.2em] shadow-sm">
                                    360° View
                                </div>
                            </div>
                        ) : activeMedia.src ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={activeMedia.src}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-brand-gold/20 font-serif text-4xl">
                                SBD
                            </div>
                        )}

                        {activeMedia.type === 'image' && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="bg-white/90 backdrop-blur-md text-[9px] uppercase font-bold px-3 py-1.5 tracking-[0.2em] shadow-sm text-brand-navy">
                                    Zoom
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails - Compact Row */}
                    <div className="flex gap-3 overflow-x-auto py-3 scrollbar-hide h-20 shrink-0">
                        {product.videoUrl && (
                            <button
                                onClick={() => setActiveMedia({ type: 'video', src: product.videoUrl })}
                                className={`relative flex-shrink-0 w-16 aspect-square rounded-sm overflow-hidden border transition-all duration-300 ${activeMedia.type === 'video' ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
                                    <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-brand-navy shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5">
                                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                {product.images?.[0] && (
                                    <img src={product.images[0]} alt="Video" className="w-full h-full object-cover opacity-80" />
                                )}
                            </button>
                        )}
                        {product.images?.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveMedia({ type: 'image', src: img })}
                                className={`relative flex-shrink-0 w-16 aspect-square rounded-sm overflow-hidden border transition-all duration-300 ${activeMedia.src === img ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Product Details (Scrollable if needed) */}
                <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">

                    {/* Header */}
                    <div className="mb-4 border-b border-brand-charcoal/5 pb-4">
                        <h1 className="text-3xl lg:text-4xl font-serif text-brand-navy mb-2 leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase font-medium">SKU: {slug.split('-')[0].toUpperCase()}</p>
                    </div>

                    {/* Price Block */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-serif text-brand-gold">
                                {product.pricing?.finalPrice ? `₹${product.pricing.finalPrice.toLocaleString()}` : 'Price on Request'}
                            </span>
                            <span className="text-[9px] text-brand-navy/60 uppercase tracking-widest font-bold">Inc. taxes</span>
                        </div>

                        {/* Trust Badges - Compact */}
                        <div className="flex gap-2">
                            {product.certificatePdf && (
                                <a href={product.certificatePdf} target="_blank" className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-navy/5 rounded-sm text-[9px] uppercase tracking-widest font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    IGI
                                </a>
                            )}
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-navy/5 rounded-sm text-[9px] uppercase tracking-widest font-bold text-brand-navy">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                BIS
                            </div>
                        </div>
                    </div>

                    {/* Specifications - Compact 4-Column Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Gold</p>
                            <p className="text-brand-navy font-serif text-sm">{product.goldPurity}K</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Clarity</p>
                            <p className="text-brand-navy font-serif text-sm">{product.diamondClarity}</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Carat</p>
                            <p className="text-brand-navy font-serif text-sm">{product.diamondCarat}</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Weight</p>
                            <p className="text-brand-navy font-serif text-sm">{product.goldWeight}g</p>
                        </div>
                    </div>

                    {/* Description - Truncated Concept */}
                    <div className="mb-8 flex-grow">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-navy mb-2 border-l-2 border-brand-gold pl-2">The Story</h3>
                        <p className="text-gray-600 font-light leading-relaxed text-sm selection:bg-brand-gold/20 line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                            {product.description}
                        </p>
                    </div>

                    {/* Actions - Sticky if needed within container */}
                    <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
                        <button className="w-full bg-gradient-to-r from-brand-gold to-[#D4B98C] text-brand-navy h-12 font-bold hover:shadow-lg hover:shadow-brand-gold/20 transition-all duration-300 uppercase tracking-[0.2em] text-xs relative overflow-hidden group">
                            <span className="relative z-10">Add to Cart</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowBreakup(!showBreakup)}
                                className="w-full h-10 border border-brand-navy/10 text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-all duration-300 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                {showBreakup ? 'Hide Breakup' : 'Price Breakup'}
                            </button>
                            <button className="w-full h-12 border border-brand-navy/10 text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-all duration-300 uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                                Wishlist
                            </button>
                        </div>

                        {/* Price Breakup Panel */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showBreakup ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-white p-5 rounded-sm border border-gray-100 text-sm space-y-3 shadow-inner bg-gray-50/50">
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Gold Value</span>
                                    <span>₹{product.pricing?.components?.goldValue?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Diamond Value</span>
                                    <span>₹{product.pricing?.components?.diamondValue?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Making Charges</span>
                                    <span>₹{product.pricing?.components?.makingCharges?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>GST (3%)</span>
                                    <span>₹{product.pricing?.components?.gst?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-brand-navy border-t border-gray-200 pt-3 mt-2">
                                    <span>Total</span>
                                    <span>₹{product.pricing?.finalPrice?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping / Returns Footer */}
                    <div className="mt-8 pt-6 border-t border-dashed border-gray-200 grid grid-cols-3 gap-2 text-[10px] text-gray-400 uppercase tracking-widest text-center">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xl">🚚</span>
                            <span>Insured Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xl">💎</span>
                            <span>100% Certified</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xl">↺</span>
                            <span>Lifetime Exchange</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Reviews Section - Kept Separate */}
            <div className="max-w-7xl mx-auto px-6 mt-24">
                <ProductReviews productId={product.id} />
            </div>
        </div>
    );
}

