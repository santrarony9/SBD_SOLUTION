'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from "@/context/CartContext";
import ProductReviews from "@/components/ProductReviews";
import { fetchAPI } from '@/lib/api';
import TrustBadges from '@/components/TrustBadges';
import DropHintModal from '@/components/DropHintModal';
import { formatPrice } from '@/lib/utils';

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
    const { addToCart } = useCart();

    // State
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBreakup, setShowBreakup] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [showVideo, setShowVideo] = useState(false);

    // PDP Enhancements State
    const [pincode, setPincode] = useState('');
    const [isCheckingPincode, setIsCheckingPincode] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showDropHint, setShowDropHint] = useState(false);

    const checkDelivery = () => {
        setIsCheckingPincode(true);
        // Simulate API call
        setTimeout(() => {
            const date = new Date();
            date.setDate(date.getDate() + 4); // 4 days from now
            setDeliveryDate(date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
            setIsCheckingPincode(false);
        }, 1500);
    };

    useEffect(() => {
        async function loadProduct() {
            if (!slug) return;

            try {
                const data = await fetchAPI(`/products/${slug}`);
                setProduct(data);

                // Set initial image
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0]);
                }

                // Prioritize video ONLY if explicitly desired, but standard UX is usually image first. 
                // However, user logic was "Prioritize video first".
                // We will set showVideo=true if video exists.
                if (data.videoUrl) {
                    setShowVideo(true);
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
                    {/* Main Viewer */}
                    <div className="flex-grow bg-white rounded-sm overflow-hidden shadow-sm relative group border border-gray-100/50 h-full max-h-[75vh]">
                        {showVideo && product.videoUrl ? (
                            <div className="w-full h-full bg-gray-900 relative">
                                <video
                                    src={product.videoUrl}
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
                        ) : activeImage ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={activeImage}
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

                        {!showVideo && (
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
                                onClick={() => setShowVideo(true)}
                                className={`relative flex-shrink-0 w-16 aspect-square rounded-sm overflow-hidden border transition-all duration-300 ${showVideo ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-transparent hover:border-gray-300'}`}
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
                                onClick={() => {
                                    setShowVideo(false);
                                    setActiveImage(img);
                                }}
                                className={`relative flex-shrink-0 w-16 aspect-square rounded-sm overflow-hidden border transition-all duration-300 ${!showVideo && activeImage === img ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-transparent hover:border-gray-300'}`}
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
                            <span className="text-3xl font-sans font-light text-brand-gold">
                                {product.pricing?.finalPrice ? `₹${formatPrice(product.pricing.finalPrice)}` : 'Price on Request'}
                            </span>
                            <span className="text-[9px] text-brand-navy/60 uppercase tracking-widest font-bold">Inc. taxes</span>
                        </div>

                        {/* Trust Badges - Clickable for Certificate */}
                        <div className="flex gap-2">
                            {product.certificatePdf && (
                                <button onClick={() => setShowCertificate(true)} className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-navy/5 rounded-sm text-[9px] uppercase tracking-widest font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    IGI
                                </button>
                            )}
                            <button onClick={() => setShowCertificate(true)} className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-navy/5 rounded-sm text-[9px] uppercase tracking-widest font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                BIS
                            </button>
                        </div>
                    </div>

                    {/* Specifications - Compact 4-Column Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Gold</p>
                            <p className="text-brand-navy font-sans text-sm">{product.goldPurity}K</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Clarity</p>
                            <p className="text-brand-navy font-sans text-sm">{product.diamondClarity}</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Carat</p>
                            <p className="text-brand-navy font-sans text-sm">{product.diamondCarat}</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Weight</p>
                            <p className="text-brand-navy font-sans text-sm">{product.goldWeight}g</p>
                        </div>
                    </div>

                    {/* Description - Truncated Concept */}
                    <div className="mb-8 flex-grow">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-navy mb-2 border-l-2 border-brand-gold pl-2">The Story</h3>
                        <p className="text-gray-600 font-light leading-relaxed text-sm selection:bg-brand-gold/20 line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                            {product.description}
                        </p>
                    </div>

                    {/* Actions - Sticky Bottom on Mobile */}
                    <div className="bg-white/95 backdrop-blur-lg border-t border-gray-100 p-4 lg:p-0 lg:bg-transparent lg:border-none fixed bottom-0 left-0 right-0 z-50 lg:static lg:z-auto shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] lg:shadow-none space-y-3 mt-auto pt-4">
                        <button
                            onClick={() => product && addToCart(product.id, 1)}
                            className="w-full bg-gradient-to-r from-brand-gold to-[#D4B98C] text-brand-navy h-14 lg:h-12 font-bold hover:shadow-lg hover:shadow-brand-gold/20 transition-all duration-300 uppercase tracking-[0.2em] text-xs relative overflow-hidden group">
                            <span className="relative z-10">Add to Cart</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                        </button>

                        <div className="grid grid-cols-2 gap-3 pb-safe lg:pb-0">
                            <button
                                onClick={() => setShowBreakup(!showBreakup)}
                                className="w-full h-10 border border-brand-navy/10 text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-all duration-300 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                {showBreakup ? 'Hide' : 'Breakup'}
                            </button>
                            <button
                                onClick={() => setShowDropHint(true)}
                                className="w-full h-10 border border-dashed border-brand-gold/50 text-brand-gold font-bold hover:bg-brand-gold/10 transition-all duration-300 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                Drop Hint
                            </button>
                        </div>

                        {/* Price Breakup Panel */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showBreakup ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-white p-5 rounded-sm border border-gray-100 text-sm space-y-3 shadow-inner bg-gray-50/50">
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Gold Value</span>
                                    <span>₹{formatPrice(product.pricing?.components?.goldValue)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Diamond Value</span>
                                    <span>₹{formatPrice(product.pricing?.components?.diamondValue)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Making Charges</span>
                                    <span>₹{formatPrice(product.pricing?.components?.makingCharges)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>GST (3%)</span>
                                    <span>₹{formatPrice(product.pricing?.components?.gst)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-brand-navy border-t border-gray-200 pt-3 mt-2">
                                    <span>Total</span>
                                    <span>₹{formatPrice(product.pricing?.finalPrice)}</span>
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
                            <span className="text-xl">↩️</span>
                            <span>15 Day Returns</span>
                        </div>
                    </div>

                    <TrustBadges />

                    {/* Delivery Estimator */}
                    <div className="mt-8 bg-brand-cream/20 p-5 rounded-sm border border-brand-gold/10">
                        <p className="text-[10px] uppercase tracking-widest text-brand-navy font-bold mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-brand-gold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-2.25 4.5v3.375m-9-3.375v3.375m9-3.375v3.375m-9-3.375v3.375m0-13.5v3.375m9-3.375v3.375M9 7.5h6" />
                            </svg>
                            Delivery Estimator
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                maxLength={6}
                                className="w-full bg-white border border-gray-200 px-3 py-2 text-xs focus:border-brand-gold outline-none tracking-widest font-mono text-brand-navy"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                            />
                            <button
                                onClick={checkDelivery}
                                disabled={pincode.length !== 6 || isCheckingPincode}
                                className="px-4 bg-brand-navy text-white text-[10px] uppercase font-bold tracking-widest hover:bg-gold-gradient hover:text-brand-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCheckingPincode ? 'Checking...' : 'Check'}
                            </button>
                        </div>
                        {deliveryDate && (
                            <div className="mt-3 text-xs text-brand-navy flex items-start gap-2 animate-fade-in-up">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-600 shrink-0 mt-0.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span>
                                    Order within <span className="font-bold text-red-400">4 hrs 12 mins</span> to get it by <span className="font-bold border-b border-brand-gold">{deliveryDate}</span>.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Certificate Modal */}
            {showCertificate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-sm relative shadow-2xl">
                        <button
                            onClick={() => setShowCertificate(false)}
                            className="absolute top-4 right-4 z-10 bg-white/50 backdrop-blur rounded-full p-2 hover:bg-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-navy">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-serif text-brand-navy mb-2">Certificate of Authenticity</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Guaranteed by IGI / GIA</p>

                            <div className="relative aspect-[1/1.4] w-full bg-gray-50 border-8 border-double border-brand-gold/20 mx-auto shadow-inner flex items-center justify-center overflow-hidden">
                                {product.certificatePdf ? (
                                    <iframe src={product.certificatePdf} className="w-full h-full" title="Certificate"></iframe>
                                ) : (
                                    <div className="text-center p-10 opacity-50">
                                        <div className="w-24 h-24 border-4 border-brand-navy/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="font-serif text-4xl text-brand-navy/20">IGI</span>
                                        </div>
                                        <p className="font-serif text-brand-navy text-lg">Official Certificate Preview</p>
                                        <p className="text-xs text-gray-400 mt-2">A digital copy of the authentic certificate will be emailed to you upon purchase.</p>
                                    </div>
                                )}
                                {/* Watermark overlay */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 -rotate-45">
                                    <span className="text-9xl font-serif font-bold text-black uppercase">Specimen</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCertificate(false)}
                                className="mt-8 px-8 py-3 bg-brand-navy text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all"
                            >
                                Close Viewer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DropHintModal
                isOpen={showDropHint}
                onClose={() => setShowDropHint(false)}
                productName={product.name}
                productId={product.id}
            />

            {/* Reviews Section - Kept Separate */}
            <div className="max-w-7xl mx-auto px-6 mt-24">
                <ProductReviews productId={product.id} />
            </div>
        </div>
    );
}
