'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PiLayout, PiGear, PiCube, PiScroll, PiSignOut, PiArrowLeft, PiPresentationChart, PiChartLineUp, PiAddressBook, PiShoppingCart } from "react-icons/pi";
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import AdminGuard from '@/components/AdminGuard';
import AdminProductList from '@/components/AdminProductList';
import AdminOrderList from '@/components/AdminOrderList';
import AdminAddProduct from '@/components/AdminAddProduct';
import AdminDashboardOverview from '@/components/AdminDashboardOverview';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { logout } = useAuth();

    // Masters State
    const [goldRates, setGoldRates] = useState<any[]>([]);
    const [diamondRates, setDiamondRates] = useState<any[]>([]);
    const [charges, setCharges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadMasters = async () => {
        try {
            const [gold, diamond, allCharges] = await Promise.all([
                fetchAPI('/masters/gold'),
                fetchAPI('/masters/diamond'),
                fetchAPI('/masters/charges')
            ]);
            setGoldRates(gold || []);
            setDiamondRates(diamond || []);
            setCharges(allCharges || []);
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

    const updateCharge = async (name: string, data: any) => {
        try {
            await fetchAPI(`/masters/charges/${name}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            alert(`${name} Updated!`);
            loadMasters();
        } catch (error) {
            alert(`Failed to update ${name}`);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-72 bg-brand-navy text-white h-screen sticky top-0 left-0 p-8 hidden md:flex flex-col border-r border-brand-gold/10">
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold font-serif tracking-widest text-white">SPARK BLUE</h2>
                        <span className="text-[0.6rem] uppercase tracking-[0.4em] text-brand-gold ml-1">Administration</span>
                    </div>

                    <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <ul className="space-y-2 text-sm">
                            <SidebarLink
                                active={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                                icon={<PiPresentationChart className="w-5 h-5" />}
                                label="Pulse Overview"
                            />
                            <SidebarLink
                                active={activeTab === 'masters'}
                                onClick={() => setActiveTab('masters')}
                                icon={<PiGear className="w-5 h-5" />}
                                label="Rates & Masters"
                            />
                            <SidebarLink
                                active={activeTab === 'products'}
                                onClick={() => setActiveTab('products')}
                                icon={<PiCube className="w-5 h-5" />}
                                label="Inventory"
                            />
                            <SidebarLink
                                active={activeTab === 'orders'}
                                onClick={() => setActiveTab('orders')}
                                icon={<PiScroll className="w-5 h-5" />}
                                label="Order Console"
                            />

                            <div className="pt-6 pb-2">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Extended Modules</span>
                            </div>

                            <SidebarLink icon={<PiArrowLeft className="w-5 h-5" />} label="Affiliate Center" href="/admin/marketing" />
                            <SidebarLink icon={<PiChartLineUp className="w-5 h-5" />} label="Supply Chain" href="/admin/inventory" />
                            <SidebarLink icon={<PiAddressBook className="w-5 h-5" />} label="CRM Circles" href="/admin/crm" />
                            <SidebarLink
                                icon={<PiShoppingCart className="w-5 h-5" />}
                                label="Live Pulse"
                                href="/admin/carts"
                                suffix={<span className="ml-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                            />
                        </ul>
                    </nav>

                    {/* Bottom Actions */}
                    <div className="pt-8 border-t border-white/5 space-y-4">
                        <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-brand-gold transition-colors text-xs font-bold uppercase tracking-widest">
                            <PiArrowLeft className="w-4 h-4" />
                            Return to Site
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-widest w-full text-left"
                        >
                            <PiSignOut className="w-4 h-4" />
                            Logout Security
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 md:p-16 overflow-y-auto">
                    <header className="mb-12 flex justify-between items-start">
                        <div>
                            <span className="text-[10px] text-brand-gold tracking-[0.3em] uppercase font-bold mb-2 block">Control Center</span>
                            <h1 className="text-5xl font-serif text-brand-navy">
                                {activeTab === 'overview' ? 'Business Pulse' :
                                    activeTab === 'masters' ? 'Master Config' :
                                        activeTab === 'products' ? 'Collection' : 'Order Console'}
                            </h1>
                        </div>
                    </header>

                    {activeTab === 'overview' && <AdminDashboardOverview />}

                    {activeTab === 'masters' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Gold Master */}
                            <div className="bg-white p-8 rounded shadow-lg border border-brand-gold/10 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold"></div>
                                <h3 className="font-serif text-2xl text-brand-navy mb-6">Gold Rates</h3>
                                <div className="space-y-6">
                                    {isLoading ? <p className="text-gray-400 italic">Fetching live rates...</p> : [14, 16, 18, 22, 24].map((purity) => {
                                        const rate = goldRates.find((r: any) => r.purity === purity);
                                        return (
                                            <div key={purity} className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                <span className="font-bold text-brand-navy text-lg">{purity}K</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-gray-400 text-xs uppercase tracking-wider">Per 10g</span>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                                        <input
                                                            type="number"
                                                            className="pl-8 pr-4 py-2 border border-gray-200 rounded text-right font-mono text-brand-navy focus:border-brand-gold focus:outline-none transition-colors"
                                                            defaultValue={rate?.pricePer10g || 0}
                                                            onBlur={(e) => updateGoldRate(purity, Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Diamond Master */}
                            <div className="bg-white p-8 rounded shadow-lg border border-brand-gold/10 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold"></div>
                                <h3 className="font-serif text-2xl text-brand-navy mb-6">Diamond Clarities</h3>
                                <div className="space-y-6">
                                    {isLoading ? <p className="text-gray-400 italic">Fetching live rates...</p> :
                                        ['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1'].map((clarity) => {
                                            const rate = diamondRates.find(r => r.clarity === clarity);
                                            return (
                                                <div key={clarity} className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                    <span className="font-bold text-brand-navy text-lg">{clarity}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-gray-400 text-xs uppercase tracking-wider">Per Carat</span>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                                            <input
                                                                type="number"
                                                                className="pl-8 pr-4 py-2 border border-gray-200 rounded text-right font-mono text-brand-navy focus:border-brand-gold focus:outline-none transition-colors"
                                                                defaultValue={rate?.pricePerCarat || 0}
                                                                onBlur={(e) => updateDiamondPrice(clarity, Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Operational Charges */}
                            <div className="bg-white p-8 rounded shadow-lg border border-brand-gold/10 relative overflow-hidden group lg:col-span-2">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold"></div>
                                <h3 className="font-serif text-2xl text-brand-navy mb-6">Operational Charges</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {['Making Charge', 'Other Charge'].map((chargeName) => {
                                        const charge = charges.find(c => c.name === chargeName);
                                        return (
                                            <div key={chargeName} className="space-y-4 p-4 bg-gray-50 rounded border border-gray-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-brand-navy">{chargeName}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${charge?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {charge?.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Type</label>
                                                        <select
                                                            className="w-full border p-2 text-xs"
                                                            defaultValue={charge?.type || 'PER_GRAM'}
                                                            onChange={(e) => updateCharge(chargeName, { type: e.target.value })}
                                                        >
                                                            <option value="FLAT">Flat Amount</option>
                                                            <option value="PER_GRAM">Per Gram (Gold)</option>
                                                            <option value="PERCENTAGE">Percentage (%)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Value (₹/%)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full border p-2 text-xs font-mono"
                                                            defaultValue={charge?.amount || 0}
                                                            onBlur={(e) => updateCharge(chargeName, { amount: Number(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={charge?.isActive !== false}
                                                        onChange={(e) => updateCharge(chargeName, { isActive: e.target.checked })}
                                                    />
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Enabled in Calculation</span>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                </main>
            </div>
        </AdminGuard>
    );
}

function SidebarLink({ active, onClick, icon, label, href, suffix }: { active?: boolean, onClick?: () => void, icon: React.ReactNode, label: string, href?: string, suffix?: React.ReactNode }) {
    const content = (
        <>
            <span className={`${active ? 'text-brand-navy bg-brand-gold p-1 rounded-sm' : 'text-brand-gold'}`}>
                {icon}
            </span>
            <span className="flex-1">{label}</span>
            {suffix}
        </>
    );

    const baseClass = `flex items-center gap-3 px-4 py-3 rounded transition-all duration-300 cursor-pointer ${active ? 'bg-white/10 text-brand-gold font-bold border-l-2 border-brand-gold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`;

    if (href) {
        return (
            <li>
                <Link href={href} className={baseClass}>
                    {content}
                </Link>
            </li>
        );
    }

    return (
        <li onClick={onClick} className={baseClass}>
            {content}
        </li>
    );
}

