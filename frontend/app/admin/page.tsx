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
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => setStatus(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

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
            setStatus({ message: `Gold ${purity}K Updated!`, type: 'success' });
            loadMasters();
        } catch (error) {
            setStatus({ message: 'Update Failed', type: 'error' });
        }
    };

    const updateDiamondPrice = async (clarity: string, price: number) => {
        try {
            await fetchAPI(`/masters/diamond/${clarity}`, {
                method: 'PUT',
                body: JSON.stringify({ price })
            });
            setStatus({ message: `Diamond ${clarity} Updated!`, type: 'success' });
            loadMasters();
        } catch (error) {
            setStatus({ message: 'Update Failed', type: 'error' });
        }
    };

    const updateCharge = async (name: string, data: any) => {
        try {
            await fetchAPI(`/masters/charges/${name}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            setStatus({ message: `${name} Updated!`, type: 'success' });
            loadMasters();
        } catch (error) {
            setStatus({ message: 'Update Failed', type: 'error' });
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
                        <div className="space-y-12 max-w-6xl animate-fade-in relative">
                            {/* Status Notification */}
                            {status && (
                                <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded shadow-2xl border flex items-center gap-3 transition-all transform animate-slide-up ${status.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                    <span className="text-sm font-bold tracking-wide">{status.message}</span>
                                </div>
                            )}

                            {/* Precious Metals & Stones Masters */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="font-serif text-xl text-brand-navy">Precious Metal & Stone Value</h3>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Live Inventory Rates</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-gray-100">
                                    {/* Gold Sub-table */}
                                    <div className="p-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-bold border-b border-gray-50">
                                                    <th className="pb-2">Gold Purity</th>
                                                    <th className="pb-2 text-right">Price per 10g</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {[14, 16, 18, 22, 24].map((purity) => {
                                                    const rate = goldRates.find(r => r.purity === purity);
                                                    return (
                                                        <tr key={purity} className="group hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 font-bold text-brand-navy">{purity}K Gold</td>
                                                            <td className="py-3 items-center justify-end flex gap-2">
                                                                <span className="text-gray-400 text-xs">₹</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-32 bg-transparent border-b border-transparent group-hover:border-brand-gold/30 focus:border-brand-gold text-right outline-none transition-all font-mono"
                                                                    defaultValue={rate?.pricePer10g || 0}
                                                                    onBlur={(e) => updateGoldRate(purity, Number(e.target.value))}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Diamond Sub-table */}
                                    <div className="p-4">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-bold border-b border-gray-50">
                                                    <th className="pb-2">Diamond Clarity</th>
                                                    <th className="pb-2 text-right">Price per Carat</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1'].map((clarity) => {
                                                    const rate = diamondRates.find(r => r.clarity === clarity);
                                                    return (
                                                        <tr key={clarity} className="group hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 font-bold text-brand-navy">{clarity}</td>
                                                            <td className="py-3 items-center justify-end flex gap-2">
                                                                <span className="text-gray-400 text-xs">₹</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-32 bg-transparent border-b border-transparent group-hover:border-brand-gold/30 focus:border-brand-gold text-right outline-none transition-all font-mono"
                                                                    defaultValue={rate?.pricePerCarat || 0}
                                                                    onBlur={(e) => updateDiamondPrice(clarity, Number(e.target.value))}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Charges Master */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="font-serif text-xl text-brand-navy">Operational Master</h3>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Business Calculations</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/30 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                                <th className="px-6 py-4 text-left">Charge Component</th>
                                                <th className="px-6 py-4 text-left">Type</th>
                                                <th className="px-6 py-4 text-left">Frequency / Application</th>
                                                <th className="px-6 py-4 text-right">Value (₹/%)</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {['Making Charge', 'Other Charge'].map((chargeName) => {
                                                const charge = charges.find(c => c.name === chargeName);
                                                return (
                                                    <tr key={chargeName} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-brand-navy">{chargeName}</span>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{chargeName === 'Other Charge' ? 'Hidden from public breakdown' : 'Visible in public invoice'}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-mono uppercase text-brand-gold">
                                                            {charge?.type || 'PER_GRAM'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                className="bg-transparent border-b border-transparent hover:border-brand-gold focus:border-brand-gold outline-none text-xs py-1 transition-all"
                                                                defaultValue={charge?.type || 'PER_GRAM'}
                                                                onChange={(e) => updateCharge(chargeName, { type: e.target.value })}
                                                            >
                                                                <option value="FLAT">Flat Amount</option>
                                                                <option value="PER_GRAM">Per Gram (Gold)</option>
                                                                <option value="PERCENTAGE">Percentage (%)</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="inline-flex items-center gap-1 border-b border-transparent hover:border-brand-gold transition-all">
                                                                <input
                                                                    type="number"
                                                                    className="w-24 bg-transparent text-right outline-none font-mono"
                                                                    defaultValue={charge?.amount || 0}
                                                                    onBlur={(e) => updateCharge(chargeName, { amount: Number(e.target.value) })}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => updateCharge(chargeName, { isActive: !charge?.isActive })}
                                                                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter transition-all ${charge?.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                            >
                                                                {charge?.isActive ? 'ENABLED' : 'DISABLED'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
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

