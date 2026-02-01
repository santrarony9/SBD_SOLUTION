'use client';

import AdminGuard from '@/components/AdminGuard';
import AdminProductList from '@/components/AdminProductList';
import AdminOrderList from '@/components/AdminOrderList';
import AdminAddProduct from '@/components/AdminAddProduct';
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';

import AdminDashboardOverview from '@/components/AdminDashboardOverview';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
                            className={`cursor-pointer hover:text-brand-gold ${activeTab === 'overview' ? 'text-brand-gold font-bold' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Dashboard Overview
                        </li>
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
                        <li
                            className={`cursor-pointer hover:text-brand-gold ${activeTab === 'orders' ? 'text-brand-gold font-bold' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Order Management
                        </li>
                        <hr className="border-brand-gold/20 my-4" />
                        <li className="cursor-pointer hover:text-brand-gold">
                            <a href="/admin/marketing" className="block w-full h-full">Affiliate Marketing</a>
                        </li>
                        <li className="cursor-pointer hover:text-brand-gold">
                            <a href="/admin/inventory" className="block w-full h-full">Inventory & Supply Chain</a>
                        </li>
                        <li className="cursor-pointer hover:text-brand-gold">
                            <a href="/admin/crm" className="block w-full h-full">CRM & Royal Circles</a>
                        </li>
                        <li className="cursor-pointer hover:text-brand-gold">
                            <a href="/admin/carts" className="block w-full h-full flex items-center">
                                Live Pulse <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <header className="mb-10 flex justify-between items-end">
                        <h1 className="text-4xl font-serif text-brand-navy">
                            {activeTab === 'overview' ? 'Dashboard Overview' :
                                activeTab === 'masters' ? 'Configuration' :
                                    activeTab === 'products' ? 'Product Management' : 'Order Management'}
                        </h1>
                        <span className="text-xs text-brand-gold tracking-[0.2em] uppercase font-bold border-b border-brand-gold pb-1">
                            Spark Blue Admin
                        </span>
                    </header>

                    {activeTab === 'overview' && <AdminDashboardOverview />}

                    {activeTab === 'masters' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Gold Master */}
                            <div className="bg-white p-8 rounded shadow-lg border border-brand-gold/10 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold"></div>
                                <h3 className="font-serif text-2xl text-brand-navy mb-6">Gold Rates</h3>
                                <div className="space-y-6">
                                    {isLoading ? <p className="text-gray-400 italic">Fetching live rates...</p> : goldRates.map((rate: any) => (
                                        <div key={rate.purity} className="flex items-center justify-between border-b border-gray-100 pb-4">
                                            <span className="font-bold text-brand-navy text-lg">{rate.purity}K</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-400 text-xs uppercase tracking-wider">Per 10g</span>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        className="pl-8 pr-4 py-2 border border-gray-200 rounded text-right font-mono text-brand-navy focus:border-brand-gold focus:outline-none transition-colors"
                                                        defaultValue={rate.pricePer10g}
                                                        onBlur={(e) => updateGoldRate(rate.purity, Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="max-w-5xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-2xl text-brand-navy">Product Management</h3>
                                <button className="text-sm text-brand-gold hover:underline" onClick={() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' })}>
                                    + Add New
                                </button>
                            </div>

                            <div id="product-form" className="mb-12">
                                <AdminAddProduct onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
                            </div>

                            <AdminProductList refreshTrigger={refreshTrigger} />
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="max-w-6xl">
                            <AdminOrderList refreshTrigger={refreshTrigger} />
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    );
}
