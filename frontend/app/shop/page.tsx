'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

// Define Interface for Product (matching backend response)
interface Product {
    id: string;
    name: string;
    slug: string;
    images: string[];
    goldPurity: number;
    diamondClarity: string;
    price?: number; // fallback
    pricing?: {     // backend structure
        finalPrice: number;
    };
    category?: string;
    tags?: string[];
}

import { Suspense } from 'react';

function ShopContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile Filter State

    useEffect(() => {
        async function loadProducts() {
            try {
                console.log('🛒 Fetching products from:', process.env.NEXT_PUBLIC_API_URL);
                const data = await fetchAPI('/products');
                setProducts(data);
            } catch (err) {
                console.error("Failed to load products", err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    // Update selected categories if URL param changes (e.g. from Home page link)
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setSelectedCategories([cat]);
        }
    }, [searchParams]);

    const mapToCardProps = (p: Product) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        price: p.pricing?.finalPrice || p.price || 0,
        category: p.category || `${p.goldPurity}K Gold`,
        goldPurity: p.goldPurity,
        goldWeight: (p as any).goldWeight, // Backend field name might differ slightly, cast to be safe
        diamondCarat: (p as any).diamondCarat,
        diamondClarity: p.diamondClarity
    });

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Filter and Sort Logic combined
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Filter by Category
        if (selectedCategories.length > 0) {
            result = result.filter(p =>
                p.category && selectedCategories.some(cat =>
                    p.category?.toLowerCase().includes(cat.toLowerCase())
                )
            );
        }

        // Filter by Tag (from URL)
        const tagParam = searchParams.get('tag');
        if (tagParam) {
            result = result.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === tagParam.toLowerCase()));
        }

        // Filter by Price (from URL)
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;

        if (minPrice !== null || maxPrice !== null) {
            result = result.filter(p => {
                const price = p.pricing?.finalPrice || p.price || 0;
                if (minPrice !== null && price < minPrice) return false;
                if (maxPrice !== null && price > maxPrice) return false;
                return true;
            });
        }

        // Sort
        result.sort((a, b) => {
            const priceA = a.pricing?.finalPrice || a.price || 0;
            const priceB = b.pricing?.finalPrice || b.price || 0;

            if (sortBy === 'price-low') {
                return priceA - priceB;
            } else if (sortBy === 'price-high') {
                return priceB - priceA;
            }
            return 0; // Default: Featured (Original Order)
        });

        return result;
    }, [products, selectedCategories, sortBy, searchParams]);

    return (
        <div className="min-h-screen bg-brand-cream/50 pb-20 pt-20">

            {/* Premium Hero Section - Full Width */}
            <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-16 bg-brand-navy">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-gold/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-gold/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center max-w-2xl px-6">
                    <span className="block text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 animate-fade-in-up">
                        Discover Excellence
                    </span>
                    <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 leading-tight animate-fade-in-up delay-100">
                        The Collection
                    </h1>
                    <p className="text-brand-cream/80 font-light text-sm md:text-base tracking-wide leading-relaxed animate-fade-in-up delay-200">
                        Curated masterpieces featuring the finest diamonds and precious metals, designed to transcend time.
                    </p>
                </div>
            </div>

            {/* Mobile Category Scroll (Visible only on mobile/tablet) */}
            <div className="md:hidden mb-8 px-6 overflow-x-auto scrollbar-hide">
                <div className="flex space-x-3">
                    {['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Pendants'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${selectedCategories.includes(cat.toLowerCase())
                                ? 'bg-brand-navy border-brand-navy text-white'
                                : 'bg-white border-gray-200 text-gray-500'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12">

                {/* Sidebar Filters - Elegant & Sticky */}
                <div className="hidden md:block col-span-3">
                    <div className="sticky top-32 space-y-12 pr-8 border-r border-brand-charcoal/5">

                        {/* Filter Group */}
                        <div className="animate-fade-in delay-300">
                            <h3 className="font-serif text-lg text-brand-navy mb-6 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-brand-gold"></span>
                                Category
                            </h3>
                            <ul className="space-y-4">
                                {['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Pendants'].map(cat => (
                                    <li key={cat}>
                                        <label className="group flex items-center cursor-pointer">
                                            <div className={`w-4 h-4 border transition-all duration-300 mr-3 flex items-center justify-center ${selectedCategories.includes(cat.toLowerCase()) ? 'bg-brand-navy border-brand-navy' : 'border-gray-300 group-hover:border-brand-gold'}`}>
                                                {selectedCategories.includes(cat.toLowerCase()) && (
                                                    <svg className="w-2.5 h-2.5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-xs uppercase tracking-widest transition-colors duration-300 ${selectedCategories.includes(cat.toLowerCase()) ? 'text-brand-navy font-bold' : 'text-gray-500 group-hover:text-brand-navy'}`}>
                                                {cat}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="animate-fade-in delay-400">
                            <h3 className="font-serif text-lg text-brand-navy mb-6 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-brand-gold"></span>
                                Metal
                            </h3>
                            <ul className="space-y-4">
                                {['18K Gold', '22K Gold', 'Platinum'].map(metal => (
                                    <li key={metal}>
                                        <label className="group flex items-center cursor-pointer">
                                            <div className="w-4 h-4 border border-gray-300 mr-3 group-hover:border-brand-gold transition-colors"></div>
                                            <span className="text-xs uppercase tracking-widest text-gray-500 group-hover:text-brand-navy transition-colors">{metal}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="col-span-1 md:col-span-9">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-16 h-16 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
                            <p className="text-xs uppercase tracking-[0.2em] text-brand-navy animate-pulse">Loading Collections</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500 font-light">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-brand-charcoal/5">
                                <span className="text-xs font-serif italic text-gray-500 mb-4 sm:mb-0">
                                    Showing {filteredAndSortedProducts.length} masterpieces
                                </span>

                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] uppercase font-bold text-brand-navy tracking-widest">Sort By:</span>
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 text-xs uppercase tracking-wider text-gray-600 focus:outline-none focus:border-brand-gold cursor-pointer min-w-[150px]"
                                        >
                                            <option value="featured">Featured</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grid */}
                            {filteredAndSortedProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
                                    {filteredAndSortedProducts.map((product, index) => (
                                        <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                            <ProductCard product={mapToCardProps(product)} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="text-6xl mb-4 text-gray-200 font-serif">?</div>
                                    <h3 className="text-xl font-serif text-brand-navy mb-2">No collections found</h3>
                                    <p className="text-sm text-gray-500 font-light">Try adjusting your filters to see more results.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Filter & Sort Bar */}
                <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-brand-navy text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 border border-brand-gold/20">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                    >
                        <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Filters
                    </button>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none appearance-none pr-4"
                        >
                            <option value="featured" className="text-black">Sort: Featured</option>
                            <option value="price-low" className="text-black">Price: Low</option>
                            <option value="price-high" className="text-black">Price: High</option>
                        </select>
                    </div>
                </div>

                {/* Mobile Filter Drawer Overlay */}
                {isFilterOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="w-full sm:w-[400px] h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl p-6 overflow-y-auto animate-in slide-in-from-bottom-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                                <h3 className="text-xl font-serif text-brand-navy">Refine Selection</h3>
                                <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Reusing Component Logic for Category */}
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-brand-navy mb-4">Category</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Pendants'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className={`px-4 py-2 border rounded-sm text-xs uppercase tracking-wider ${selectedCategories.includes(cat.toLowerCase())
                                                        ? 'bg-brand-navy text-white border-brand-navy'
                                                        : 'bg-white text-gray-600 border-gray-200'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Metal Logic (Placeholder for now) */}
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-brand-navy mb-4">Metal</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['18K Gold', '22K Gold', 'Platinum'].map(metal => (
                                            <button key={metal} className="px-4 py-2 border border-gray-200 rounded-sm text-xs uppercase tracking-wider text-gray-600">
                                                {metal}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full bg-brand-navy text-white text-sm font-bold uppercase tracking-widest py-4 hover:bg-gold-gradient hover:text-brand-navy transition-all"
                                >
                                    Show {filteredAndSortedProducts.length} Results
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-cream flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
