'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function DashboardOverview() {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPortfolio = async () => {
            try {
                const data = await fetchAPI('/crm/portfolio');
                setPortfolio(data);
            } catch (err) {
                console.error("Failed to load portfolio", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadPortfolio();
    }, []);

    const getTierNextLimit = (tier: string) => {
        if (tier === 'BRONZE') return 100000;
        if (tier === 'SILVER') return 500000;
        if (tier === 'GOLD') return 1500000;
        return 0;
    };

    const nextLimit = getTierNextLimit(portfolio?.tier || 'BRONZE');
    const progress = nextLimit > 0 ? (portfolio?.lifetimeSpend / nextLimit) * 100 : 100;

    return (
        <div className="space-y-12">
            <section>
                <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-serif text-brand-navy">Elite Membership Status</h2>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">Member since {user?.createdAt ? new Date(user.createdAt as string).getFullYear() : '2024'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-brand-navy text-white p-8 border border-brand-gold/20 shadow-xl group hover:border-brand-gold transition-all duration-500 rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-2">Royal Circle Member</p>
                        <h3 className="text-3xl font-serif mb-4 flex items-baseline gap-2">
                            {portfolio?.tier || 'BRONZE'}
                        </h3>
                        <div className="h-1 bg-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gold-gradient transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] mt-4 opacity-70 uppercase tracking-widest">
                            {nextLimit > 0 ? `₹${(nextLimit - portfolio?.lifetimeSpend).toLocaleString()} more to reach next tier` : 'You have reached the pinnacle'}
                        </p>
                    </div>

                    <div className="bg-white p-8 border border-gray-100 shadow-lg text-center flex flex-col justify-center rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Spark Rewards</p>
                        <h3 className="text-4xl font-serif text-brand-navy">{portfolio?.loyaltyPoints?.toLocaleString() || '0'}</h3>
                        <p className="text-[10px] mt-2 text-brand-gold font-bold uppercase tracking-widest cursor-pointer hover:underline">View History</p>
                    </div>

                    <div className="bg-white p-8 border border-gray-100 shadow-lg text-center flex flex-col justify-center rounded-sm">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Total Collections</p>
                        <h3 className="text-4xl font-serif text-brand-navy">₹{portfolio?.lifetimeSpend?.toLocaleString() || '0'}</h3>
                        <p className="text-[10px] mt-2 text-brand-gold font-bold uppercase tracking-widest">Lifetime Value</p>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl text-brand-navy">Personal Concierge</h3>
                        <Link href="/account/settings" className="text-[10px] uppercase font-bold text-brand-gold hover:underline">Edit</Link>
                    </div>
                    <div className="space-y-4 text-sm bg-gray-50 p-6 border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-gray-400 uppercase text-[10px] font-bold">Full Name</span>
                            <span className="text-brand-navy font-medium">{user?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400 uppercase text-[10px] font-bold">Email</span>
                            <span className="text-brand-navy font-medium">{user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400 uppercase text-[10px] font-bold">Mobile</span>
                            <span className="text-brand-navy font-medium">{user?.mobile || 'Not linked'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl text-brand-navy">Primary Residency</h3>
                        <Link href="/account/addresses" className="text-[10px] uppercase font-bold text-brand-gold hover:underline">Manage Book</Link>
                    </div>
                    <div className="text-sm bg-gray-50 p-6 border border-gray-100 min-h-[140px] flex flex-col justify-center">
                        {user?.addresses && user.addresses.length > 0 ? (
                            <div className="space-y-1">
                                <p className="font-bold text-brand-navy">{user?.addresses?.[0]?.fullName}</p>
                                <p className="text-gray-500">{user?.addresses?.[0]?.street}</p>
                                <p className="text-gray-500">{user?.addresses?.[0]?.city}, {user?.addresses?.[0]?.state} {user?.addresses?.[0]?.zip}</p>
                                <p className="text-gray-500 font-bold">{user?.addresses?.[0]?.country}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-400 italic mb-4">No exclusive residency on file.</p>
                                <Link href="/account/addresses" className="text-[10px] px-4 py-2 border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all uppercase font-bold tracking-widest">Add Address</Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
