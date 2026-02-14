'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { PiLink, PiCopy } from "react-icons/pi";

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
    slug?: string;
    stockCount?: number; // Added stockCount property
}

export default function AdminProductList({ refreshTrigger, onEdit }: { refreshTrigger: number, onEdit?: (product: any) => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const loadProducts = async () => {
        try {
            const data = await fetchAPI('/products');
            if (Array.isArray(data)) {
                setProducts(data);
                setFilteredProducts(data);
            }
        } catch (error) {
            console.error("Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [refreshTrigger]);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(lowerTerm) ||
            (p.sku && p.sku.toLowerCase().includes(lowerTerm))
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const deleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await fetchAPI(`/products/${id}`, { method: 'DELETE' });
            loadProducts(); // Refresh list
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const handleCopyLink = (slug: string) => {
        const link = `/product/${slug}`;
        navigator.clipboard.writeText(link);
        showFeedback(`copy-btn-${slug}`);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleGenerateBundleLink = () => {
        if (selectedIds.length === 0) return;
        const link = `/shop?ids=${selectedIds.join(',')}`;
        navigator.clipboard.writeText(link);
        alert(`Bundle Link Copied!\n${link}`);
        setSelectedIds([]);
    };

    const showFeedback = (id: string) => {
        const btn = document.getElementById(id);
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="text-green-600">Copied!</span>';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        }
    };

    if (isLoading) return <div className="text-brand-navy/60 text-sm font-medium animate-pulse">Loading inventory...</div>;

    return (
        <div className="mt-12 bg-white rounded-lg shadow-lg border border-brand-gold/10 overflow-hidden ring-1 ring-black/5">

            {/* Header / Selection Bar */}
            <div className={`p-6 flex justify-between items-center transition-colors ${selectedIds.length > 0 ? 'bg-brand-navy text-white' : 'bg-brand-navy text-white'}`}>
                {selectedIds.length > 0 ? (
                    <div className="flex items-center gap-6 w-full animate-fade-in">
                        <span className="text-sm font-bold uppercase tracking-widest">{selectedIds.length} Selected</span>
                        <div className="h-4 w-px bg-white/20"></div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGenerateBundleLink}
                                className="bg-brand-gold text-brand-navy px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center gap-2"
                            >
                                <PiLink size={14} /> Copy Bundle Link
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="text-white/70 text-[10px] font-bold uppercase hover:text-white underline decoration-white/30 underline-offset-4"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center w-full flex-wrap gap-4 animate-fade-in">
                        <div className="flex items-center gap-4">
                            <h3 className="font-serif text-xl">Current Inventory</h3>
                            <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full uppercase tracking-widest border border-brand-gold/30">
                                {filteredProducts.length} Items
                            </span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Name or SKU..."
                            className="px-4 py-2 rounded bg-brand-navy-light/50 border border-brand-gold/20 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </div>



            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-5 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-brand-navy focus:ring-brand-gold"
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedIds(filteredProducts.map(p => p.id));
                                        else setSelectedIds([]);
                                    }}
                                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                />
                            </th>
                            <th className="px-6 py-5 whitespace-nowrap">Product</th>
                            <th className="px-6 py-5 whitespace-nowrap">SKU / ID</th>
                            <th className="px-6 py-5 whitespace-nowrap">Price</th>
                            <th className="px-6 py-5 whitespace-nowrap">Stock</th>
                            <th className="px-6 py-5 whitespace-nowrap">Category</th>
                            <th className="px-6 py-5 whitespace-nowrap">Specs</th>
                            <th className="px-6 py-5 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className={`hover:bg-brand-cream/30 transition-colors group ${selectedIds.includes(product.id) ? 'bg-brand-gold/5' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-brand-navy focus:ring-brand-gold"
                                        checked={selectedIds.includes(product.id)}
                                        onChange={() => toggleSelect(product.id)}
                                    />
                                </td>
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
                                    ₹{formatPrice(product.pricing?.finalPrice) ?? 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${(product.stockCount || 0) === 0 ? 'bg-red-100 text-red-600' :
                                        (product.stockCount || 0) <= 3 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {(product.stockCount || 0) === 0 ? 'Out of Stock' : `${product.stockCount} Units`}
                                    </span>
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
                                        <button
                                            id={`copy-btn-${product.slug}`}
                                            onClick={() => handleCopyLink(product.slug || product.id)}
                                            className="text-brand-gold hover:bg-brand-gold/10 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border border-brand-gold/20"
                                            title="Copy Product Link"
                                        >
                                            <PiLink size={14} /> Link
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-400 font-serif italic">
                                    No products found in inventory.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
