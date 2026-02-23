'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useComparison } from '@/context/ComparisonContext';
import { motion } from 'framer-motion';
import { PiHouse, PiHandbag, PiHeart, PiShoppingBag, PiArrowsLeftRight } from 'react-icons/pi';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { items } = useCart();
    const { comparisonItems } = useComparison();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Hide bottom nav on admin and transactional pages to avoid blocking CTA buttons
    const isTransactional = pathname?.includes('/product/') || pathname === '/cart' || pathname === '/checkout' || pathname?.startsWith('/admin');
    if (!isMounted || isTransactional) return null;

    const navItems = [
        {
            label: 'Home', icon: PiHouse, href: '/', onClick: (e: React.MouseEvent) => {
                if (pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        },
        { label: 'Shop', icon: PiHandbag, href: '/shop' },
        { label: 'Compare', icon: PiArrowsLeftRight, href: '/compare', badge: comparisonItems.length },
        { label: 'Wishlist', icon: PiHeart, href: '/wishlist' },
        { label: 'Cart', icon: PiShoppingBag, href: '/cart', badge: items.length },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white/90 backdrop-blur-2xl border-t border-brand-gold/10 pb-[env(safe-area-inset-bottom,24px)] pt-3 px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={item.onClick}
                            className="group flex flex-col items-center justify-center relative py-1 flex-1"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9, y: 2 }}
                                className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors"
                            >
                                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-brand-gold' : 'text-gray-400 opacity-60'}`} />
                                <span className={`text-[8px] mt-1.5 uppercase tracking-[0.2em] font-black transition-all duration-300 ${isActive ? 'text-brand-gold' : 'text-gray-400 opacity-40'}`}>
                                    {item.label}
                                </span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute top-0 right-0 bg-brand-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                        {item.badge}
                                    </span>
                                )}
                            </motion.div>

                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-1 w-1 h-1 bg-brand-gold rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div >
    );
}
