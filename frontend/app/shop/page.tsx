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
    }, [products, selectedCategories, sortBy]);

    return (
        <div className="min-h-screen bg-brand-cream pb-20 pt-24">

            {/* Header */}
            <div className="glass border-b border-brand-gold/20 py-12 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40"></div> {/* Tint */}
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-brand-navy mb-4">The Collection</h1>
                    <p className="text-sm font-light text-gray-500 uppercase tracking-widest">
                        Exquisite Jewellery for Every Occasion
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Sidebar Filters */}
                <div className="hidden md:block col-span-1">
                    <div className="sticky top-28 space-y-8">
                        <div>
                            <h3 className="font-serif text-lg text-brand-navy mb-4 border-b border-brand-charcoal/20 pb-2">Category</h3>
                            <ul className="space-y-3 text-sm font-light text-brand-charcoal">
                                {['Rings', 'Earrings', 'Necklaces', 'Bracelets'].map(cat => (
                                    <li key={cat}>
                                        <label className="flex items-center cursor-pointer hover:text-brand-gold transition-colors">
                                            <input
                                                type="checkbox"
                                                className="mr-3 accent-brand-navy"
                                                checked={selectedCategories.includes(cat.toLowerCase())}
                                                onChange={() => toggleCategory(cat.toLowerCase())}
                                            />
                                            {cat}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-serif text-lg text-brand-navy mb-4 border-b border-brand-charcoal/20 pb-2">Metal</h3>
                            <ul className="space-y-3 text-sm font-light text-brand-charcoal">
                                <li><label className="flex items-center cursor-pointer hover:text-brand-gold transition-colors"><input type="checkbox" className="mr-3 accent-brand-navy" /> 18K Gold</label></li>
                                <li><label className="flex items-center cursor-pointer hover:text-brand-gold transition-colors"><input type="checkbox" className="mr-3 accent-brand-navy" /> 22K Gold</label></li>
                                <li><label className="flex items-center cursor-pointer hover:text-brand-gold transition-colors"><input type="checkbox" className="mr-3 accent-brand-navy" /> Platinum</label></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-serif text-lg text-brand-navy mb-4 border-b border-brand-charcoal/20 pb-2">Diamond</h3>
                            <ul className="space-y-3 text-sm font-light text-brand-charcoal">
                                <li><label className="flex items-center cursor-pointer hover:text-brand-gold transition-colors"><input type="checkbox" className="mr-3 accent-brand-navy" /> VVS1 / VVS2</label></li>
                                <li><label className="flex items-center cursor-pointer hover:text-brand-gold transition-colors"><input type="checkbox" className="mr-3 accent-brand-navy" /> VS1 / VS2</label></li>
                                <li><label className="flex items-center cursor-pointer hover:text-brand-gold transition-colors"><input type="checkbox" className="mr-3 accent-brand-navy" /> SI1 / SI2</label></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="col-span-1 md:col-span-3">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500 font-light">
                            {error}
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs text-gray-500 uppercase tracking-widest">{filteredAndSortedProducts.length} Products</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent border-b border-gray-300 text-sm py-1 focus:outline-none focus:border-brand-navy text-gray-600 cursor-pointer"
                                >
                                    <option value="featured">Sort by: Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>

                            {filteredAndSortedProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredAndSortedProducts.map((product) => (
                                        <ProductCard key={product.id} product={mapToCardProps(product)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500 font-light italic">
                                    No products found matching your selection.
                                </div>
                            )}
                        </>
                    )}
                </div>

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
