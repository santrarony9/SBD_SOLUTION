'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { PiPackage, PiVault, PiGraph, PiWarning, PiPlus, PiArrowsLeftRight, PiPencilSimple } from 'react-icons/pi';
import AdminAddProduct from '@/components/AdminAddProduct';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function InventoryDashboard() {
    const [products, setProducts] = useState<any[]>([]);
    const [valuation, setValuation] = useState<any>(null);
    const [vaults, setVaults] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const [activeTab, setActiveTab] = useState('stock'); // stock | materials | vaults

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [prodData, valData, vaultData] = await Promise.all([
                fetchAPI('/products'),
                fetchAPI('/inventory/valuation'),
                fetchAPI('/inventory/vaults')
            ]);
            setProducts(prodData);
            setValuation(valData);
            setVaults(vaultData);
        } catch (err) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdjustStock = async (productId: string, quantity: number, action: string) => {
        try {
            await fetchAPI('/inventory/adjust', {
                method: 'POST',
                body: JSON.stringify({ productId, quantity, action, reason: 'Manual Adjustment' })
            });
            loadData();
            showToast('Stock Adjusted', 'success');
        } catch (err) {
            showToast('Stock adjustment failed', 'error');
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-brand-navy">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif text-brand-navy">Inventory & Supply Chain</h1>
                    <p className="text-gray-500 text-sm">Real-time tracking of precious materials, vaults, and finished pieces.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleAddProduct}
                        className="bg-brand-navy text-white px-6 py-3 rounded-lg shadow-lg hover:bg-brand-gold hover:text-brand-navy transition-all flex items-center gap-2 font-bold uppercase text-xs tracking-widest"
                    >
                        <PiPlus className="text-lg" />
                        Add Product
                    </button>
                    <div className="bg-white px-6 py-3 rounded-lg shadow-sm border-l-4 border-brand-gold">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Portfolio Value</span>
                        <span className="text-xl font-serif text-brand-navy">
                            ₹{formatPrice(valuation?.totalValue) || '0'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                {[
                    { id: 'stock', label: 'Stock Overview', icon: PiPackage },
                    { id: 'materials', label: 'Raw Materials', icon: PiGraph },
                    { id: 'vaults', label: 'Vault Manager', icon: PiVault },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'border-b-2 border-brand-gold text-brand-navy bg-white/50' : 'text-gray-400 hover:text-brand-navy'}`}
                    >
                        <tab.icon className="text-lg" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'stock' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                                <th className="px-6 py-4">Product / SKU</th>
                                <th className="px-6 py-4">Material DNA</th>
                                <th className="px-6 py-4">Vault</th>
                                <th className="px-6 py-4 text-center">In Stock</th>
                                <th className="px-6 py-4 text-right">Piece Value</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden relative border border-gray-200">
                                                <img src={product.imageUrl} className="object-cover w-full h-full" alt="" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-brand-navy">{product.name}</div>
                                                <div className="text-[10px] font-mono text-gray-400">{product.sku || 'NO-SKU'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600">
                                            <span className="font-bold">{product.goldWeight}g</span> {product.goldPurity}K Gold<br />
                                            <span className="font-bold">{product.diamondCarat}ct</span> {product.diamondClarity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">
                                            {product.vault?.name || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono font-bold">
                                        <div className={`inline-flex items-center gap-2 ${product.stockCount <= 2 ? 'text-red-500 animate-pulse' : 'text-brand-navy'}`}>
                                            {product.stockCount}
                                            {product.stockCount <= 2 && <PiWarning className="text-sm" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-brand-navy">
                                        <div className="flex flex-col items-end">
                                            <span>₹{formatPrice(((valuation?.breakdown?.find((b: any) => b.sku === product.sku)?.value) || 0))}</span>
                                            <div className="group relative">
                                                <span className="text-[10px] text-brand-gold font-bold cursor-help border-b border-dotted border-brand-gold">View Breakup</span>
                                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 bg-white shadow-xl border border-brand-gold/20 rounded-lg p-4 w-56 animate-fade-in text-left">
                                                    <div className="space-y-2 text-[11px]">
                                                        <div className="flex justify-between border-b border-gray-100 pb-1 gap-4">
                                                            <span className="text-gray-500">Gold Value:</span>
                                                            <span className="font-bold text-brand-navy">₹{Math.round(product.pricing?.components?.goldValue || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-gray-100 pb-1 gap-4">
                                                            <span className="text-gray-500">Diamond:</span>
                                                            <span className="font-bold text-brand-navy">₹{Math.round(product.pricing?.components?.diamondValue || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-gray-100 pb-1 gap-4">
                                                            <span className="text-gray-500">Making:</span>
                                                            <span className="font-bold text-brand-navy">₹{Math.round(product.pricing?.components?.makingCharges || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between pt-1 text-brand-navy font-bold gap-4">
                                                            <span>GST (3%):</span>
                                                            <span>₹{Math.round(product.pricing?.components?.gst || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-brand-gold hover:text-brand-gold transition-colors"
                                            >
                                                <PiPencilSimple />
                                            </button>
                                            <div className="w-px h-8 bg-gray-200 mx-1"></div>
                                            <button
                                                onClick={() => handleAdjustStock(product.id, -1, 'STOCK_REMOVE')}
                                                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => handleAdjustStock(product.id, 1, 'STOCK_ADD')}
                                                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'materials' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Placeholder for Raw Material Cards */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center opacity-50">
                        <PiGraph className="text-4xl text-gray-300 mb-4" />
                        <h3 className="font-bold text-gray-400 text-sm italic uppercase tracking-widest">Connect Raw Stock</h3>
                        <p className="text-xs text-gray-400 px-8">Track your Mother Stock of Gold and Diamonds here.</p>
                    </div>
                    <button className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-brand-gold hover:text-brand-gold transition-all text-xs font-bold uppercase tracking-widest gap-2">
                        <PiPlus /> Add New Material
                    </button>
                </div>
            )}

            {activeTab === 'vaults' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {vaults.map(vault => (
                        <div key={vault.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group overflow-hidden">
                            <div className="relative z-10">
                                <PiVault className="text-3xl text-brand-gold mb-3" />
                                <h3 className="font-bold text-brand-navy text-lg">{vault.name}</h3>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">{vault.location || 'Inside Store'}</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Stock Level</span>
                                        <span className="text-2xl font-serif text-brand-navy">{vault._count?.products || 0}</span>
                                    </div>
                                    <button className="text-brand-gold hover:underline text-[10px] font-bold uppercase tracking-widest">Transfer Items</button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <PiArrowsLeftRight className="text-gray-300" />
                            </div>
                        </div>
                    ))}
                    <button className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-gold hover:text-brand-gold transition-all min-h-[160px]">
                        <PiPlus className="text-2xl mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">New Vault</span>
                    </button>
                </div>
            )}

            {/* Product Modal */}
            <AdminAddProduct
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSuccess={() => {
                    setIsProductModalOpen(false);
                    loadData();
                }}
                initialData={editingProduct}
            />
        </div>
    );
}
