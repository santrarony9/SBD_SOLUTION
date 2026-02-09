'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    goldPurity: number;
    goldWeight: number;
    diamondCarat: number;
    pricing?: {
        finalPrice: number;
    };
    category?: string;
    sku?: string;
}

export default function AdminProductList({ refreshTrigger, onEdit }: { refreshTrigger: number, onEdit?: (product: any) => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProducts = async () => {
        try {
            const data = await fetchAPI('/products');
            if (Array.isArray(data)) setProducts(data);
        } catch (error) {
            console.error("Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [refreshTrigger]);

    const deleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await fetchAPI(`/products/${id}`, { method: 'DELETE' });
            loadProducts(); // Refresh list
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    if (isLoading) return <div className="text-brand-navy/60 text-sm font-medium animate-pulse">Loading inventory...</div>;

    return (
        <div className="mt-12 bg-white rounded-lg shadow-lg border border-brand-gold/10 overflow-hidden ring-1 ring-black/5">
            <h3 className="font-serif text-xl text-white bg-brand-navy p-6 flex justify-between items-center">
                <span>Current Inventory</span>
                <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full uppercase tracking-widest border border-brand-gold/30">
                    {products.length} Items
                </span>
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-5 whitespace-nowrap">Product</th>
                            <th className="px-6 py-5 whitespace-nowrap">SKU / ID</th>
                            <th className="px-6 py-5 whitespace-nowrap">Price</th>
                            <th className="px-6 py-5 whitespace-nowrap">Category</th>
                            <th className="px-6 py-5 whitespace-nowrap">Specs</th>
                            <th className="px-6 py-5 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-brand-cream/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 group-hover:border-brand-gold/50 transition-colors">
                                            {product.images[0] ? (
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-[8px] uppercase text-gray-300 font-bold">No IMG</div>
                                            )}
                                        </div>
                                        <span className="font-medium text-brand-navy line-clamp-2 max-w-[200px]">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                                    {product.sku || '-'}
                                </td>
                                <td className="px-6 py-4 font-serif text-brand-navy whitespace-nowrap">
                                    ₹{product.pricing?.finalPrice?.toLocaleString() ?? 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    {product.category || '-'}
                                </td>
                                <td className="px-6 py-4 text-xs whitespace-nowrap text-gray-500">
                                    <span className="block">{product.goldPurity}K Gold <span className="text-gray-300">|</span> {product.goldWeight}g</span>
                                    <span className="block text-brand-gold">{product.diamondCarat}ct <span className="text-gray-300">|</span> {(product as any).diamondClarity}</span>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit && onEdit(product)}
                                            className="text-brand-navy hover:bg-brand-navy hover:text-white border border-brand-navy/20 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-400 font-serif italic">
                                    No products found in inventory.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
