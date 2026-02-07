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
        <div className="bg-brand-cream min-h-screen pb-20 pt-24">

            {/* Breadcrumb - Minimalist */}
            <div className="max-w-7xl mx-auto px-6 py-4 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium border-b border-brand-gold/10 mb-8">
                <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
                <span className="mx-2 text-brand-gold">/</span>
                <Link href="/shop" className="hover:text-brand-navy transition-colors">Collections</Link>
                <span className="mx-2 text-brand-gold">/</span>
                <span className="text-brand-navy">{product.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                {/* Left Column: Sticky Media Gallery */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Main Viewer */}
                        <div className="aspect-[4/5] bg-white rounded-sm overflow-hidden shadow-sm relative group border border-gray-100/50">
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
                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur text-brand-navy text-[10px] font-bold uppercase px-3 py-1.5 tracking-[0.2em] shadow-sm">
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
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="bg-white/90 backdrop-blur-md text-[9px] uppercase font-bold px-3 py-1.5 tracking-[0.2em] shadow-sm text-brand-navy">
                                        Zoom In
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails - Elegant Row */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {product.videoUrl && (
                                <button
                                    onClick={() => setActiveMedia({ type: 'video', src: product.videoUrl })}
                                    className={`relative flex-shrink-0 w-20 aspect-square rounded-sm overflow-hidden border transition-all duration-300 ${activeMedia.type === 'video' ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
                                        <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-brand-navy shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    {product.images?.[0] && (
                                        <img src={product.images[0]} alt="Video Thumbnail" className="w-full h-full object-cover opacity-80" />
                                    )}
                                </button>
                            )}
                            {product.images?.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveMedia({ type: 'image', src: img })}
                                    className={`relative flex-shrink-0 w-20 aspect-square rounded-sm overflow-hidden border transition-all duration-300 ${activeMedia.src === img ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Product Details */}
                <div className="lg:col-span-5 flex flex-col pt-2">

                    {/* Header */}
                    <div className="mb-8 border-b border-brand-charcoal/5 pb-8">
                        <h1 className="text-4xl md:text-5xl lg:text-5xl font-serif text-brand-navy mb-3 leading-tight tracking-tight">
                            {product.name}
                        </h1>
                        <p className="text-xs tracking-[0.3em] text-gray-400 uppercase font-medium">SKU: {slug.split('-')[0].toUpperCase()}</p>
                    </div>

                    {/* Price Block */}
                    <div className="mb-10">
                        <div className="flex items-baseline gap-4 mb-3">
                            <span className="text-4xl font-serif text-brand-gold">
                                {product.pricing?.finalPrice ? `₹${product.pricing.finalPrice.toLocaleString()}` : 'Price on Request'}
                            </span>
                            <span className="text-xs text-brand-navy/60 uppercase tracking-widest font-bold">Inclusive of all taxes</span>
                        </div>

                        {/* Trust Badges - Row */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            {product.certificatePdf && (
                                <a href={product.certificatePdf} target="_blank" className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-navy/5 rounded-sm text-[10px] uppercase tracking-widest font-bold text-brand-navy border border-brand-navy/5 hover:bg-brand-navy hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                    IGI Certificate
                                </a>
                            )}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-navy/5 rounded-sm text-[10px] uppercase tracking-widest font-bold text-brand-navy border border-brand-navy/5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                </svg>
                                BIS Hallmarked
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-10">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-navy mb-4 border-l-2 border-brand-gold pl-3">Story</h3>
                        <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base selection:bg-brand-gold/20">
                            {product.description}
                        </p>
                    </div>

                    {/* Specifications - Icon Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="p-4 bg-white border border-brand-gold/10 rounded-sm hover:border-brand-gold/30 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="text-brand-gold mt-1 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Gold Purity</p>
                                    <p className="text-brand-navy font-serif text-lg">{product.goldPurity}K Hallmarked</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white border border-brand-gold/10 rounded-sm hover:border-brand-gold/30 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="text-brand-gold mt-1 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Clarity</p>
                                    <p className="text-brand-navy font-serif text-lg">{product.diamondClarity} VVS</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white border border-brand-gold/10 rounded-sm hover:border-brand-gold/30 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="text-brand-gold mt-1 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M5.507 4.048A3 3 0 0 1 7.785 3h8.43a3 3 0 0 1 2.278 1.048l1.722 2.008A4.533 4.533 0 0 0 19.5 6h-15c-.243 0-.482.02-.715.056l1.722-2.008Z" />
                                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Carat Weight</p>
                                    <p className="text-brand-navy font-serif text-lg">{product.diamondCarat} ct</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white border border-brand-gold/10 rounded-sm hover:border-brand-gold/30 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="text-brand-gold mt-1 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Gold Weight</p>
                                    <p className="text-brand-navy font-serif text-lg">{product.goldWeight}g <span className="text-xs text-brand-navy/50 font-sans">(Approx)</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <button className="w-full bg-gradient-to-r from-brand-gold to-[#D4B98C] text-brand-navy h-14 font-bold hover:shadow-lg hover:shadow-brand-gold/20 transition-all duration-300 uppercase tracking-[0.2em] text-sm relative overflow-hidden group">
                            <span className="relative z-10">Add to Cart</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowBreakup(!showBreakup)}
                                className="w-full h-12 border border-brand-navy/10 text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-all duration-300 uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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

