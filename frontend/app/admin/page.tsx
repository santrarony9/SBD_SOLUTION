'use client';

import AdminGuard from '@/components/AdminGuard';
import ProductForm from '@/components/ProductForm';
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('masters');

    // Masters State
    const [goldRates, setGoldRates] = useState<any[]>([]);
    const [diamondRates, setDiamondRates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadMasters = async () => {
        try {
            const [gold, diamond] = await Promise.all([
                fetchAPI('/masters/gold'),
                fetchAPI('/masters/diamond')
            ]);
            setGoldRates(gold || []);
            setDiamondRates(diamond || []);
        } catch (error) {
            console.error("Failed to load masters", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMasters();
    }, []);

    const updateGoldRate = async (purity: number, price: number) => {
        try {
            await fetchAPI(`/masters/gold/${purity}`, {
                method: 'PUT',
                body: JSON.stringify({ price })
            });
            alert('Gold Rate Updated!');
            loadMasters();
        } catch (error) {
            alert('Failed to update rate');
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-100 flex pb-20">
                {/* Sidebar */}
                <div className="w-64 bg-brand-navy text-white min-h-screen p-4 hidden md:block">
                    <h2 className="text-xl font-bold font-serif mb-8 text-brand-gold">Admin Panel</h2>
                    <ul className="space-y-4 text-sm">
                        <li
                            className={`cursor-pointer hover:text-brand-gold ${activeTab === 'masters' ? 'text-brand-gold font-bold' : ''}`}
                            onClick={() => setActiveTab('masters')}
                        >
                            Master Configuration
                        </li>
                        <li
                            className={`cursor-pointer hover:text-brand-gold ${activeTab === 'products' ? 'text-brand-gold font-bold' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Product Management
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <h1 className="text-2xl font-serif text-brand-navy mb-8">
                        {activeTab === 'masters' ? 'Master Configuration' : 'Product Management'}
                    </h1>

                    {activeTab === 'masters' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Gold Master */}
                            <div className="bg-white p-6 rounded shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Gold Prices (Per 10g)</h3>
                                <div className="space-y-4">
                                    {isLoading ? <p>Loading...</p> : goldRates.map((rate: any) => (
                                        <div key={rate.purity} className="flex items-center justify-between">
                                            <label className="text-sm">{rate.purity}K Gold</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    className="border p-2 rounded w-32"
                                                    defaultValue={rate.pricePer10g}
                                                    onBlur={(e) => updateGoldRate(rate.purity, Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-xs text-gray-500 mt-2">* Click outside input to save</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Add New Product</h3>
                                <ProductForm onSuccess={() => alert('Product Added!')} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    );
}
