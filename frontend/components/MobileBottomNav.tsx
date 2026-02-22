'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiHouse, PiHandbag, PiHeart, PiShoppingBag } from 'react-icons/pi';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { items } = useCart();

    // Hide bottom nav on admin and transactional pages to avoid blocking CTA buttons
    const isTransactional = pathname?.includes('/product/') || pathname === '/cart' || pathname === '/checkout' || pathname?.startsWith('/admin');
    if (isTransactional) return null;

    const navItems = [
        { label: 'Home', icon: PiHouse, href: '/' },
        { label: 'Shop', icon: PiHandbag, href: '/shop' },
        { label: 'Wishlist', icon: PiHeart, href: '/wishlist' },
        { label: 'Cart', icon: PiShoppingBag, href: '/cart', badge: items.length },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white/80 backdrop-blur-xl border-t border-brand-gold/10 pb-6 pt-3 px-6 safe-area-bottom">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center gap-1 group flex-1"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`
                                    p-2 rounded-2xl transition-all duration-300
                                    ${isActive ? 'bg-brand-navy text-brand-gold' : 'text-brand-navy/60'}
                                `}
                            >
                                <Icon className="w-6 h-6" />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute top-1 right-1 bg-brand-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                        {item.badge}
                                    </span>
                                )}
                            </motion.div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-brand-navy' : 'text-brand-navy/40'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavDot"
                                    className="absolute -bottom-1 w-1 h-1 bg-brand-gold rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
