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

    if (isLoading) return <div className="text-gray-500 text-sm">Loading inventory...</div>;

    return (
        <div className="mt-12 bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <h3 className="font-serif text-xl text-brand-navy p-6 border-b border-gray-100 bg-gray-50/50">Current Inventory</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Specs</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                            {product.images[0] && (
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <span className="font-medium text-brand-navy">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-brand-gold">
                                    ₹{product.pricing?.finalPrice?.toLocaleString() ?? 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                                    {product.category || '-'}
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    <span className="block">{product.goldPurity}K Gold ({product.goldWeight}g)</span>
                                    <span className="block text-gray-400">{product.diamondCarat}ct Diamonds</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => onEdit && onEdit(product)}
                                            className="text-brand-gold hover:text-brand-navy text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
