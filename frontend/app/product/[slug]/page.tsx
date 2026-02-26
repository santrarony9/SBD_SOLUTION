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
        <div className="bg-brand-cream min-h-screen pb-24 lg:pb-10 pt-20">
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

                {/* Right Column: Product Details (Scrollable) */}
                <div className="flex flex-col h-full py-4 px-6 lg:px-0">

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
                    <div className="mb-6 flex-grow">
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
                    <div className="bg-white/95 backdrop-blur-lg border-t border-gray-100 p-4 lg:p-0 lg:bg-transparent lg:border-none fixed bottom-0 left-0 right-0 z-50 lg:static lg:z-auto shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] lg:shadow-none space-y-3 mt-auto pt-4">

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-2">
                            <div className="ml-auto flex items-center border border-gray-200 rounded-sm h-10">
                                <button
                                    onClick={handleDecrement}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-50 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="w-12 h-full flex items-center justify-center text-sm font-sans font-medium text-brand-navy border-x border-gray-200">
                                    {quantity}
                                </span>
                                <button
                                    onClick={handleIncrement}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-50 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Desktop Actions (Hidden on Mobile) */}
                        <div className="hidden lg:grid grid-cols-2 gap-3">
                            <button
                                onClick={() => product && addToCart(product.id, quantity)}
                                className="w-full bg-white border border-brand-gold text-brand-navy h-12 font-bold hover:bg-brand-gold/10 transition-all duration-300 uppercase tracking-[0.2em] text-xs relative overflow-hidden group btn-gold-glow">
                                <span>Add to Cart</span>
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-gradient-to-r from-brand-gold to-[#D4B98C] text-brand-navy h-12 font-bold hover:shadow-lg hover:shadow-brand-gold/20 transition-all duration-300 uppercase tracking-[0.2em] text-xs relative overflow-hidden group btn-gold-glow">
                                <span className="relative z-10">Buy Now</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                            </button>
                        </div>

                        {/* Mobile Sticky Actions */}
                        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-brand-gold/10 p-4 flex gap-3 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)]">
                            <button
                                onClick={() => product && addToCart(product.id, quantity)}
                                className="w-14 h-14 bg-brand-navy text-white flex items-center justify-center rounded-sm shrink-0"
                            >
                                <PiShoppingBag className="text-2xl" />
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-grow bg-brand-navy text-white h-14 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl"
                            >
                                Buy Now
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pb-safe lg:pb-0 relative">
                            <button
                                onClick={() => setShowBreakup(!showBreakup)}
                                className="w-full h-10 border border-brand-navy/10 text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-all duration-300 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                Details
                            </button>

                            <button
                                onClick={() => setShowDropHint(true)}
                                className="w-full h-10 border border-dashed border-brand-gold/50 text-brand-gold font-bold hover:bg-brand-gold/10 transition-all duration-300 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                Hint
                            </button>

                            <div className="relative">
                                <button
                                    onClick={handleShare}
                                    className="w-full h-10 border border-brand-navy/10 text-gray-500 font-bold hover:bg-brand-navy hover:text-white transition-all duration-300 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                    </svg>
                                    Share
                                </button>
                                {showShareMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-100 shadow-xl rounded-sm p-1 z-20 animate-fade-in-up">

                                        <button onClick={shareToWhatsapp} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-sans text-brand-navy flex items-center gap-3 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.001 4.908A9.817 9.817 0 0 0 11.992 2C6.534 2 2.085 6.448 2.08 11.908c0 1.748.458 3.45 1.321 4.956L2 22l5.255-1.377a9.916 9.916 0 0 0 4.737 1.206h.005c5.46 0 9.908-4.448 9.913-9.913A9.872 9.872 0 0 0 19.001 4.908Zm-7.008 15.361h-.004a8.212 8.212 0 0 1-4.188-1.143l-.3-.178-3.111.816.834-3.033-.195-.311a8.136 8.136 0 0 1-1.258-4.385C3.774 7.373 7.514 3.63 11.998 3.63c2.204 0 4.276.858 5.835 2.418a8.228 8.228 0 0 1 2.414 5.836c-.004 4.542-3.744 8.283-8.24 8.384L12 20.269Zm4.524-6.182c-.248-.124-1.467-.724-1.693-.807-.226-.083-.391-.124-.555.124-.165.248-.638.807-.783.972-.144.165-.29.186-.538.062-.248-.124-1.047-.386-1.993-1.232-.736-.659-1.233-1.474-1.378-1.722-.144-.248-.016-.381.108-.505.112-.112.248-.289.371-.434.124-.144.165-.248.248-.413.083-.165.041-.31-.02-.434-.062-.124-.555-1.343-.76-1.839-.2-.485-.403-.42-.555-.427-.144-.007-.31-.007-.474-.007a.91.91 0 0 0-.66.31c-.226.248-.865.847-.865 2.065s.885 2.396 1.01 2.56C7.5 13.06 8.652 14.898 10.42 15.66c.42.18.748.288 1.006.368.423.133.808.114 1.114.069.344-.05.147-.434 1.187-.853.124-.419.124-.778.086-.853-.037-.074-.144-.116-.392-.24Z" /></svg>
                                            </div>
                                            WhatsApp
                                        </button>

                                        <button onClick={shareToFacebook} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-sans text-brand-navy flex items-center gap-3 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" /></svg>
                                            </div>
                                            Facebook
                                        </button>

                                        <button onClick={shareToPinterest} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-sans text-brand-navy flex items-center gap-3 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.608 0 12.017 0z" /></svg>
                                            </div>
                                            Pinterest
                                        </button>

                                        <button onClick={shareToX} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-sans text-brand-navy flex items-center gap-3 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 text-black flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                            </div>
                                            X (Twitter)
                                        </button>

                                        <div className="h-px w-full bg-gray-100 my-1"></div>

                                        <button onClick={copyToClipboard} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-sans text-brand-navy flex items-center gap-3 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
                                            </div>
                                            Copy Link
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Price Breakup Panel */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showBreakup ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-white p-5 rounded-sm border border-gray-100 text-sm space-y-3 shadow-inner bg-gray-50/50 pr-4 relative">
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Gold Value</span>
                                    <span>{formatPrice(product.pricing?.components?.goldValue || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Diamond Value</span>
                                    <span>{formatPrice(product.pricing?.components?.diamondValue || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>Making Charges</span>
                                    <span>{formatPrice(product.pricing?.components?.makingCharges || 0)}</span>
                                </div>
                                {product.pricing?.components?.otherCharges > 0 && (
                                    <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                        <span>Other Charges</span>
                                        <span>{formatPrice(product.pricing?.components?.otherCharges)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-500 text-xs uppercase tracking-wider">
                                    <span>GST (3%)</span>
                                    <span>{formatPrice(product.pricing?.components?.gst || 0)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-brand-navy border-t border-gray-200 pt-3 mt-2">
                                    <span>Total Value</span>
                                    <span>{formatPrice(product.pricing?.finalPrice || 0)}</span>
                                </div>
                                <p className="text-[8px] text-gray-400 mt-2 italic">* Prices are based on current market rates and may vary slightly.</p>
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

            <ConciergeModal
                isOpen={showConcierge}
                onClose={() => setShowConcierge(false)}
                productName={product.name}
            />

            <DropHintModal
                isOpen={showDropHint}
                onClose={() => setShowDropHint(false)}
                productName={product.name}
                productId={product.id}
            />

            {/* Reviews Section - Kept Separate */}
            <div className="max-w-7xl mx-auto px-6 mt-24 pb-16">
                <ProductReviews productId={product.id} />
            </div>

            {/* Recommendation Sections */}
            <div className="bg-white">
                <SimilarPriceRange currentPrice={product.pricing?.finalPrice || 0} currentProductId={product.id} />
                <RecentlyViewed />
            </div>
        </div>
    );
}
