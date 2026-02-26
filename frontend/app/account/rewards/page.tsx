'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PiTrophy, PiStar, PiGift, PiCrown } from 'react-icons/pi';

export default function RewardsPage() {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchAPI('/crm/portfolio');
                setPortfolio(data);
                if (data?.loyaltyLogs) {
                    setHistory(data.loyaltyLogs);
                }
            } catch (err) {
                console.error("Failed to load rewards data", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const tiers = [
        { name: 'BRONZE', min: 0, icon: <PiStar />, perks: ['1x Points Multiplier', 'Birthday Gift', 'Standard Support'] },
        { name: 'SILVER', min: 100000, icon: <PiTrophy />, perks: ['1.2x Points Multiplier', 'Early Access', 'Annual Maintenance'] },
        { name: 'GOLD', min: 500000, icon: <PiCrown />, perks: ['1.5x Points Multiplier', 'Bespoke Design Fee Waiver', 'Private Concierge'] },
    ];

    const currentTierIndex = tiers.findIndex(t => t.name === (portfolio?.tier || 'BRONZE'));

    return (
        <div className="space-y-12">
            {/* Header */}
            <section className="relative py-12 bg-brand-navy text-white -mx-4 md:-mx-10 px-10 overflow-hidden rounded-none md:rounded-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <span className="text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">Boutique Rewards</span>
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">The Royal Privilege</h1>
                        <p className="text-gray-400 text-sm font-light max-w-md">Your investment in excellence is rewarded with exclusive benefits and timeless privileges.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 text-center min-w-[200px]">
                        <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-1">Available Points</p>
                        <h2 className="text-4xl font-sans font-extralight text-white">{formatPrice(portfolio?.loyaltyPoints || 0)}</h2>
                    </div>
                </div>
            </section>

            {/* Tier Progress */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 border border-brand-charcoal/5 shadow-sm">
                        <h3 className="font-serif text-2xl text-brand-navy mb-8">Tier Progressions</h3>
                        <div className="relative pt-12">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-100 mt-1.5"></div>
                            <div className="flex justify-between relative">
                                {tiers.map((t, idx) => (
                                    <div key={t.name} className="flex flex-col items-center relative z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 mb-4 ${idx <= currentTierIndex ? 'bg-brand-gold border-brand-gold text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
                                            {t.icon}
                                        </div>
                                        <p className={`text-[10px] font-black tracking-widest uppercase ${idx <= currentTierIndex ? 'text-brand-navy' : 'text-gray-300'}`}>{t.name}</p>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="absolute top-0 left-0 h-[2px] bg-brand-gold transition-all duration-1000 ease-out"
                                style={{
                                    width: currentTierIndex === 0 ? '0%' : currentTierIndex === 1 ? '50%' : '100%',
                                    marginTop: '5px'
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Tier Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tiers.map((t, idx) => (
                            <div key={t.name} className={`p-6 border transition-all duration-500 ${idx === currentTierIndex ? 'bg-brand-cream border-brand-gold shadow-md' : 'bg-white border-brand-charcoal/5 opacity-60'}`}>
                                <h4 className="text-brand-navy font-serif text-lg mb-4 flex items-center gap-2">
                                    <span className="text-brand-gold">{t.icon}</span> {t.name}
                                </h4>
                                <ul className="space-y-3">
                                    {t.perks.map(perk => (
                                        <li key={perk} className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/80 flex items-center gap-2">
                                            <PiGift className="text-brand-gold" /> {perk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Point History */}
                <div className="bg-brand-navy/5 p-8 border border-brand-navy/5">
                    <h3 className="font-serif text-2xl text-brand-navy mb-8">History</h3>
                    <div className="space-y-6">
                        {history.length > 0 ? history.map((log: any, idx) => (
                            <div key={idx} className="flex justify-between items-start border-b border-brand-navy/5 pb-4 last:border-0">
                                <div>
                                    <p className="text-xs font-bold text-brand-navy uppercase tracking-widest mb-1">{log.reason}</p>
                                    <p className="text-[9px] text-gray-400 font-sans">{new Date(log.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-sm font-bold ${log.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {log.points > 0 ? '+' : ''}{log.points}
                                </span>
                            </div>
                        )) : (
                            <p className="text-xs text-center text-gray-400 py-10 italic">No point history yet.</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
