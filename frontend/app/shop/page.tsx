'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { fetchAPI } from '@/lib/api';

// Define Interface for Product (matching backend response)
interface Product {
    id: string;
    name: string;
    slug: string;
    images: string[];
    goldPurity: number;
    diamondClarity: string;
    pricing: {
        finalPrice: number;
    };
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadProducts() {
            try {
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* Header */}
            <div className="bg-white shadow-sm py-8 mb-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-serif text-brand-navy">All Collections</h1>
                    <p className="text-sm text-gray-400 mt-2">Home / Shop</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Sidebar Filters (Static for now) */}
                <div className="hidden md:block col-span-1">
                    <div className="bg-white p-6 rounded shadow-sm sticky top-24">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Filters</h3>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold mb-2">Category</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> Rings</label></li>
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> Earrings</label></li>
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> Necklaces</label></li>
                            </ul>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold mb-2">Gold Purity</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> 18K</label></li>
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> 22K</label></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-2">Diamond</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> VVS1</label></li>
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> VS1</label></li>
                                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> SI1</label></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="col-span-1 md:col-span-3">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <Link href={`/product/${product.slug}`} key={product.id} className="group bg-white rounded shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="h-64 bg-gray-200 w-full relative overflow-hidden flex items-center justify-center">
                                        {/* Fallback image logic or real image */}
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-sm">No Image</span>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-brand-navy text-white text-xs py-1 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            View Details
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h2 className="text-lg font-serif text-brand-navy mb-1 group-hover:text-brand-gold transition-colors">{product.name}</h2>
                                        <p className="text-sm text-gray-500 mb-2">{product.goldPurity}K Gold · {product.diamondClarity} Diamond</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-800">
                                                {product.pricing?.finalPrice ? `₹${product.pricing.finalPrice.toLocaleString()}` : 'Price on Request'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
