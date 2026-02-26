'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from "@/context/CartContext";
import ProductReviews from "@/components/ProductReviews";
import { fetchAPI } from '@/lib/api';
import TrustBadges from '@/components/TrustBadges';
import DropHintModal from '@/components/DropHintModal';
import ConciergeModal from '@/components/ConciergeModal';
import { formatPrice } from '@/lib/utils';
import { PiShoppingBag } from 'react-icons/pi';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PiCaretRight, PiArrowRight, PiPhoneCall, PiCalendarCheck, PiSealCheck, PiHeart } from 'react-icons/pi';
import JsonLd from "@/components/JsonLd";
import RecentlyViewed from "@/components/RecentlyViewed";
import SimilarPriceRange from "@/components/SimilarPriceRange";
import { FESTIVE_CONFIG, isFestiveModeActive } from '@/config/festive-config';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    goldPurity: number;
    goldWeight: number;
    realWeight?: number; // Added Gross Weight
    diamondCarat: number;
    diamondClarity: string;
    diamondColor?: string; // Added Diamond Color
    videoUrl?: string;
    certificatePdf?: string;
    pricing: {
        finalPrice: number;
        goldRate: number;
        diamondRate: number;
        components: {
            goldValue: number;
            diamondValue: number;
            makingCharges: number;
            otherCharges: number;
            gst: number;
        };
    };
}

import { useParams, useRouter } from 'next/navigation';

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { formatPrice, currency } = useCurrency();

    // State
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBreakup, setShowBreakup] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [showVideo, setShowVideo] = useState(false);
    const [quantity, setQuantity] = useState(1); // Added Quantity State

    // PDP Enhancements State
    const [pincode, setPincode] = useState('');
    const [isCheckingPincode, setIsCheckingPincode] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showDropHint, setShowDropHint] = useState(false);
    const [showConcierge, setShowConcierge] = useState(false);


    // Share State
    const [showShareMenu, setShowShareMenu] = useState(false);

    const router = useRouter(); // Ensure this is imported from 'next/navigation'

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

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleBuyNow = async () => {
        if (!product) return;
        await addToCart(product.id, quantity);
        router.push('/checkout');
    };

    const handleShare = async () => {
        if (!product) return;
        const shareData = {
            title: product.name,
            text: `Check out this amazing ${product.name} on Spark Blue Diamond!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
            }
        } else {
            setShowShareMenu(!showShareMenu);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard', 'success');
        setShowShareMenu(false);
    };

    const shareToWhatsapp = () => {
        if (!product) return;
        const text = `Check out this amazing ${product.name} on Spark Blue Diamond! ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareMenu(false);
    };

    const shareToFacebook = () => {
        if (!product) return;
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
        setShowShareMenu(false);
    };

    const shareToPinterest = () => {
        if (!product) return;
        const url = encodeURIComponent(window.location.href);
        const description = encodeURIComponent(`Discover the exquisite ${product.name} at Spark Blue Diamond.`);
        // Note: Pinterest requires an image URL, we pass the first product image if available, otherwise just URL.
        const imageUrl = product.images?.[0] ? encodeURIComponent(product.images[0]) : '';
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${imageUrl}&description=${description}`, '_blank', 'width=600,height=400');
        setShowShareMenu(false);
    };

    const shareToX = () => {
        if (!product) return;
        const text = encodeURIComponent(`Check out this amazing ${product.name} on Spark Blue Diamond!`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
        setShowShareMenu(false);
    };

    useEffect(() => {
        async function loadProduct() {
            if (!slug) return;

            try {
                const apiPath = `/products/${slug}`;
                console.log(`[PDP] Fetching product: ${apiPath}`);
                const data = await fetchAPI(apiPath);

                if (!data || Object.keys(data).length === 0) {
                    throw new Error("Product data is empty or invalid.");
                }

                setProduct(data);

                // Set initial image
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0]);
                }

                if (data.videoUrl) {
                    setShowVideo(true);
                }
            } catch (err: any) {
                console.error("[PDP] Load Error:", err);
                setError(err.message || `Failed to load product details.`);
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [slug]);

    // Track View
    useEffect(() => {
        if (product && product.id) {
            fetchAPI('/marketing/activity', {
                method: 'POST',
                body: JSON.stringify({
                    productId: product.id,
                    activity: 'PRODUCT_VIEW'
                })
            }).catch(err => console.error("Tracking Error:", err));
        }
    }, [product?.id]);

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

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://sparkbluediamond.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Collections",
                "item": "https://sparkbluediamond.com/shop"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": `https://sparkbluediamond.com/product/${slug}`
            }
        ]
    };

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [],
        "description": product.description,
        "sku": slug.split('-')[0].toUpperCase(),
        "brand": {
            "@type": "Brand",
            "name": "Spark Blue Diamond"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://sparkbluediamond.com/product/${slug}`,
            "priceCurrency": currency || "INR",
            "price": product.pricing?.finalPrice || 0,
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        },
        "material": `${product.goldPurity}K Gold`,
        "additionalProperty": [
            {
                "@type": "PropertyValue",
                "name": "Diamond Clarity",
                "value": product.diamondClarity
            },
            {
                "@type": "PropertyValue",
                "name": "Diamond Carat",
                "value": product.diamondCarat
            },
            {
                "@type": "PropertyValue",
                "name": "Gold Weight",
                "value": `${product.goldWeight}g`
            }
        ]
    };

    return (
        <div className="bg-brand-cream min-h-screen pb-24 lg:pb-10">
            <JsonLd data={breadcrumbSchema} />
            <JsonLd data={productSchema} />

            {/* Breadcrumb - Minimalist */}
            <div className="max-w-[1400px] mx-auto px-6 py-3 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium border-b border-brand-gold/10 mb-6">
                <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
                <span className="mx-2 text-brand-gold">/</span>
                <Link href="/shop" className="hover:text-brand-navy transition-colors">Collections</Link>
                <span className="mx-2 text-brand-gold">/</span>
                <span className="text-brand-navy truncate max-w-[200px] inline-block align-bottom">{product.name}</span>
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 lg:gap-16 relative">

                {/* Left Column: Media Gallery (Sticky on Desktop) */}
                <div className="lg:sticky lg:top-32 lg:h-[calc(100vh-160px)] flex flex-col">
                    {/* Main Viewer */}
                    <div className="flex-grow bg-[#FDFDFD] md:rounded-sm overflow-hidden md:shadow-sm relative group md:border border-gray-100/50 h-auto aspect-square lg:h-full lg:max-h-[75vh]">
                        <AnimatePresence mode="wait">
                            {showVideo && product.videoUrl ? (
                                <motion.div
                                    key="video"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full bg-gray-900 relative"
                                >
                                    <video
                                        src={product.videoUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        poster={product.images?.[0] || ''}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-brand-navy text-[9px] font-bold uppercase px-2 py-1 tracking-[0.2em] shadow-sm">
                                        360° View
                                    </div>
                                </motion.div>
                            ) : activeImage ? (
                                <motion.div
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative w-full h-full cursor-zoom-in zoom-image-container zoom-hover"
                                >
                                    <Image
                                        src={activeImage}
                                        alt={product.name}
                                        fill
                                        className="object-contain transition-all duration-700 ease-out"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </motion.div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-brand-gold/20 font-serif text-4xl">
                                    SBD
                                </div>
                            )}
                        </AnimatePresence>

                        {!showVideo && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="bg-white/90 backdrop-blur-md text-[9px] uppercase font-bold px-3 py-1.5 tracking-[0.2em] shadow-sm text-brand-navy">
                                    Tap to Zoom
                                </span>
                            </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                            onClick={(e) => { e.preventDefault(); }}
                            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                            title="Add to Wishlist"
                        >
                            <PiHeart className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Thumbnails - Enhanced Row */}
                    <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide h-24 shrink-0 px-1">
                        {product.videoUrl && (
                            <button
                                onClick={() => setShowVideo(true)}
                                className={`relative flex-shrink-0 w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-sm ${showVideo ? 'border-brand-gold scale-105 shadow-brand-gold/20' : 'border-white hover:border-brand-gold/30'}`}
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
                                className={`relative flex-shrink-0 w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-sm ${!showVideo && activeImage === img ? 'border-brand-gold scale-105 shadow-brand-gold/20' : 'border-white hover:border-brand-gold/30'}`}
                            >
                                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Product Details */}
                <div className="flex flex-col py-4 px-6 lg:px-0">

                    {/* Header */}
                    <div className="mb-4 border-b border-brand-charcoal/5 pb-4">
                        <h1 className="text-3xl lg:text-4xl font-serif text-brand-navy mb-2 leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-[10px] tracking-[0.3em] text-gray-400 uppercase font-medium">SKU: {slug.split('-')[0].toUpperCase()}</p>
                    </div>

                    {/* Price Block */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-baseline gap-4 mb-2">
                            <span className="text-4xl lg:text-5xl font-sans font-extralight text-brand-gold">
                                {product.pricing?.finalPrice ? formatPrice(product.pricing.finalPrice) : 'Price on Request'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-brand-navy/40 uppercase tracking-[0.3em] font-black">Including all taxes</span>
                            <div className="h-px w-8 bg-brand-gold/20"></div>
                        </div>

                        {/* Trust Badges - Clickable for Certificate */}
                        <div className="flex flex-col gap-3">
                            {isFestiveModeActive() && (
                                <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-sm border border-green-100 animate-pulse">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{FESTIVE_CONFIG.theme.discountLabel}</span>
                                    <span className="text-[8px] uppercase tracking-tighter opacity-70">(Holi Special)</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                {product.certificatePdf && (
                                    <button onClick={() => setShowCertificate(true)} className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-navy/5 rounded-sm text-[9px] uppercase tracking-widest font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                        IGI
                                    </button>
                                )}
                                <button className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-navy/5 rounded-sm text-[9px] uppercase tracking-widest font-bold text-brand-navy cursor-default">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    BIS
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Specifications - Compact 4-Column Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Purity</p>
                            <p className="text-brand-navy font-sans text-sm">{product.goldPurity}K</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Clarity & Color</p>
                            <span className="text-xs font-serif text-brand-navy">{product.diamondClarity} / {product.diamondColor || 'EF'}</span>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Net Wt</p>
                            <p className="text-brand-navy font-sans text-sm">{product.goldWeight}g</p>
                        </div>
                        <div className="p-2 bg-white border border-brand-gold/10 rounded-sm text-center">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Gross Wt</p>
                            <p className="text-brand-navy font-sans text-sm">{product.realWeight || product.goldWeight}g</p>
                        </div>
                    </div>

                    {/* Description - Conceptual */}
                    <div className="mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-navy mb-2 border-l-2 border-brand-gold pl-2">The Story</h3>
                        <p className="text-gray-600 font-light leading-relaxed text-sm selection:bg-brand-gold/20 line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                            {product.description}
                        </p>
                    </div>

                    {/* VIP Concierge Button */}
                    <div className="mb-8 p-6 bg-brand-navy border border-brand-gold/20 rounded-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-700"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <span className="text-brand-gold text-[9px] font-black uppercase tracking-[0.3em] block mb-1">Elite Services</span>
                                <h4 className="text-white font-serif text-lg mb-1 italic">VIP Concierge Consultation</h4>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">In-person viewing or Virtual 1-on-1</p>
                            </div>
                            <button
                                onClick={() => setShowConcierge(true)}
                                className="px-6 py-3 bg-brand-gold text-brand-navy text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center gap-3 group/btn"
                            >
                                <PiCalendarCheck className="w-4 h-4" />
                                <span>Book Inquiry</span>
                                <PiArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Actions - Sticky Bottom on Mobile */}
                    {/* Actions Area */}
                    <div className="mt-auto pt-8">
                        {/* Desktop Only: Quantity & Primary Actions */}
                        <div className="hidden lg:block space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-navy">Quantity</span>
                                <div className="flex items-center border border-gray-200 rounded-sm h-12">
                                    <button onClick={handleDecrement} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-50 transition-colors" disabled={quantity <= 1}>-</button>
                                    <span className="w-16 h-full flex items-center justify-center text-sm font-sans font-medium text-brand-navy border-x border-gray-200">{quantity}</span>
                                    <button onClick={handleIncrement} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-50 transition-colors">+</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => product && addToCart(product.id, quantity)}
                                    className="w-full bg-white border border-brand-gold text-brand-navy h-14 font-bold hover:bg-brand-gold/5 transition-all duration-300 uppercase tracking-[0.2em] text-xs shadow-sm"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full bg-brand-navy text-white h-14 font-bold hover:bg-brand-navy/90 transition-all duration-300 uppercase tracking-[0.2em] text-xs shadow-xl"
                                >
                                    Buy Now
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setShowBreakup(!showBreakup)} className="h-10 border border-gray-100 text-brand-navy text-[9px] font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                                    Breakup
                                </button>
                                <button onClick={() => setShowDropHint(true)} className="h-10 border border-gray-100 text-brand-gold text-[9px] font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                                    Hint
                                </button>
                                <button onClick={handleShare} className="h-10 border border-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Mobile Only: Floating Compact Action Bar */}
                        <div className="lg:hidden fixed bottom-1 left-1 right-1 z-[100] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 p-3 flex items-center gap-2">
                            <button
                                onClick={() => product && addToCart(product.id, quantity)}
                                className="w-12 h-12 bg-gray-50 text-brand-navy flex items-center justify-center rounded-xl shrink-0"
                                aria-label="Add to Cart"
                            >
                                <PiShoppingBag className="text-xl" />
                            </button>

                            <button
                                onClick={handleBuyNow}
                                className="flex-grow h-12 bg-brand-navy text-white rounded-xl font-black uppercase tracking-[0.15em] text-[11px] shadow-lg active:scale-95 transition-transform"
                            >
                                Buy Now
                            </button>

                            <button
                                onClick={() => setShowBreakup(!showBreakup)}
                                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${showBreakup ? 'bg-brand-gold text-white' : 'bg-gray-50 text-gray-500'}`}
                            >
                                <span className="text-[8px] font-bold uppercase leading-none mb-0.5">Price</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Price Breakup Panel */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showBreakup ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 text-sm space-y-3 shadow-inner bg-gray-50/50 pr-4 relative">
                            <div className="flex justify-between text-gray-400 text-[10px] items-center pb-2 border-b border-gray-100/50 mb-2">
                                <span className="uppercase tracking-widest font-bold">Calculation Rates</span>
                                <span className="font-mono bg-white px-2 py-0.5 rounded text-[9px] shadow-sm">Updated Live</span>
                            </div>

                            <div className="flex justify-between text-brand-navy/60 text-[11px] uppercase tracking-wider italic mb-2">
                                <span>Gold Rate (10g)</span>
                                <span className="font-bold">{formatPrice(product.pricing?.goldRate || 0)}</span>
                            </div>
                            <div className="flex justify-between text-brand-navy/60 text-[11px] uppercase tracking-wider italic mb-4">
                                <span>Diamond Rate (ct)</span>
                                <span className="font-bold">{formatPrice(product.pricing?.diamondRate || 0)}</span>
                            </div>

                            <div className="flex justify-between text-gray-500 text-[11px] uppercase tracking-wider">
                                <span>Gold Value ({product.goldWeight}g)</span>
                                <span>{formatPrice(product.pricing?.components?.goldValue || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-[11px] uppercase tracking-wider">
                                <span>Diamond ({product.diamondCarat}ct)</span>
                                <span>{formatPrice(product.pricing?.components?.diamondValue || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-[11px] uppercase tracking-wider">
                                <span>Making Charges</span>
                                <span>{formatPrice(product.pricing?.components?.makingCharges || 0)}</span>
                            </div>
                            <div className="flex justify-between text-brand-navy font-bold text-[12px] uppercase tracking-widest pt-2 border-t border-gray-100/50">
                                <span>GST (3%)</span>
                                <span>{formatPrice(product.pricing?.components?.gst || 0)}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-2 italic">* Values are subject to market fluctuations.</p>
                        </div>
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

            {/* Footer Content & Modals */}
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
                                {product?.certificatePdf ? (
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

            <ConciergeModal
                isOpen={showConcierge}
                onClose={() => setShowConcierge(false)}
                productName={product?.name || ''}
            />

            <DropHintModal
                isOpen={showDropHint}
                onClose={() => setShowDropHint(false)}
                productName={product?.name || ''}
                productId={product?.id || ''}
            />

            <div className="max-w-7xl mx-auto px-6 mt-24 pb-16">
                <ProductReviews productId={product?.id || ''} />
            </div>

            <div className="bg-white">
                <SimilarPriceRange currentPrice={product?.pricing?.finalPrice || 0} currentProductId={product?.id || ''} />
                <RecentlyViewed />
            </div>
        </div>
    );
}
