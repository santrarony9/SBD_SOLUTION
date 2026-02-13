'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

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
        <div className="space-y-16">
            {/* Header */}
            <section className="text-center relative py-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-4">Member Dashboard</p>
                <h1 className="text-4xl md:text-5xl font-serif text-brand-navy mb-2">Welcome, {user?.name?.split(' ')[0]}</h1>
                <div className="w-24 h-[1px] bg-brand-gold mx-auto mt-6"></div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tier Card - Dark */}
                <div className="bg-brand-navy text-white p-8 md:p-10 relative overflow-hidden group shadow-2xl shadow-brand-navy/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -mr-16 -mt-16 blur-xl transition-all duration-700 group-hover:scale-150"></div>

                    <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-4">Membership Tier</p>
                    <h3 className="text-3xl font-serif mb-6 flex items-baseline gap-2">
                        {portfolio?.tier || 'BRONZE'}
                    </h3>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] uppercase tracking-wider opacity-60">
                            <span>Progress</span>
                            <span className="font-sans">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-[2px] bg-white/10 w-full overflow-hidden">
                            <div className="h-full bg-gold-gradient transition-all duration-1000 ease-out" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] mt-3 opacity-50 uppercase tracking-widest font-sans">
                            {nextLimit > 0 ? `₹${formatPrice(nextLimit - (portfolio?.lifetimeSpend || 0))} to next tier` : 'Highest Tier Reached'}
                        </p>
                    </div>
                </div>

                {/* Points Card - Light */}
                <div className="bg-white p-8 md:p-10 border border-brand-charcoal/5 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-cream/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 group-hover:text-brand-navy transition-colors">Spark Points</p>
                        <h3 className="text-4xl font-sans font-light text-brand-navy mb-2">{formatPrice(portfolio?.loyaltyPoints) || '0'}</h3>
                        <Link href="/account/rewards" className="inline-flex items-center gap-2 text-[10px] mt-4 text-brand-gold font-bold uppercase tracking-widest hover:text-brand-navy transition-colors">
                            Redeem Rewards <span className="text-xs">→</span>
                        </Link>
                    </div>
                </div>

                {/* Spend Card - Light */}
                <div className="bg-white p-8 md:p-10 border border-brand-charcoal/5 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-cream/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 group-hover:text-brand-navy transition-colors">Total Investment</p>
                        <h3 className="text-4xl font-sans font-light text-brand-navy mb-2">₹{formatPrice(portfolio?.lifetimeSpend) || '0'}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-brand-gold mt-4 font-bold">Lifetime Value</p>
                    </div>
                </div>
            </section>

            {/* Details Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-brand-charcoal/5">
                {/* Personal Details */}
                <div>
                    <div className="flex justify-between items-baseline mb-8">
                        <h3 className="font-serif text-2xl text-brand-navy">Personal Concierge</h3>
                        <Link href="/account/settings" className="text-[10px] uppercase font-bold text-gray-400 hover:text-brand-navy transition-colors">Edit Details</Link>
                    </div>
                    <div className="bg-white p-8 border border-brand-charcoal/5 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Name</span>
                            <span className="font-serif text-brand-navy">{user?.name}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Email</span>
                            <span className="font-sans text-brand-navy">{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Phone</span>
                            <span className="font-sans text-brand-navy">{user?.mobile || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Address Book Link */}
                <div>
                    <div className="flex justify-between items-baseline mb-8">
                        <h3 className="font-serif text-2xl text-brand-navy">Addresses</h3>
                        <Link href="/account/addresses" className="text-[10px] uppercase font-bold text-gray-400 hover:text-brand-navy transition-colors">Manage</Link>
                    </div>
                    <Link href="/account/addresses" className="block bg-brand-cream/50 p-8 border border-brand-charcoal/5 border-dashed hover:border-brand-gold hover:bg-white transition-all duration-300 group cursor-pointer text-center py-12">
                        <div className="w-12 h-12 rounded-full bg-brand-navy/5 mx-auto mb-4 flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-colors">
                            <svg className="w-5 h-5 text-brand-navy group-hover:text-brand-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="text-xs font-serif text-brand-navy">Manage your shipping & billing addresses</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
