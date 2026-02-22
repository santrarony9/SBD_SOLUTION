'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiMagnifyingGlass, PiX, PiTrendUp, PiCaretRight } from 'react-icons/pi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MobileSearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const trending = ['Engagement Rings', 'Solitaire Pendants', 'Gold Bangles', 'Rose Gold'];

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/shop?q=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[10000] bg-white flex flex-col pb-20"
                >
                    {/* Header */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-brand-navy/5">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search our collections..."
                                className="w-full bg-brand-navy/5 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all"
                            />
                        </form>
                        <button onClick={onClose} className="p-2 text-brand-navy font-bold">
                            <PiX size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        {/* Trending Section */}
                        <div className="mb-10">
                            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold mb-6">Trending Now</h3>
                            <div className="flex flex-wrap gap-2">
                                {trending.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            router.push(`/shop?q=${encodeURIComponent(item)}`);
                                            onClose();
                                        }}
                                        className="flex items-center gap-2 bg-brand-navy/5 px-4 py-2 rounded-full text-xs font-bold text-brand-navy hover:bg-brand-gold hover:text-white transition-all"
                                    >
                                        <PiTrendUp className="text-brand-gold group-hover:text-white" />
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Collections */}
                        <div>
                            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold mb-6">Quick Discover</h3>
                            <div className="space-y-4">
                                {['Daily Wear', 'Wedding Special', 'Office Wear'].map(cat => (
                                    <Link
                                        key={cat}
                                        href={`/shop?category=${cat.toLowerCase().replace(' ', '-')}`}
                                        onClick={onClose}
                                        className="flex justify-between items-center group"
                                    >
                                        <span className="text-lg font-serif text-brand-navy group-hover:text-brand-gold transition-colors">{cat}</span>
                                        <PiCaretRight className="text-gray-300 group-hover:text-brand-gold transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Branding */}
                    <div className="p-8 text-center bg-brand-cream/50">
                        <p className="font-serif text-brand-navy/30 text-2xl tracking-[0.2em]">SPARK BLUE</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
