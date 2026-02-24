'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiList, PiX, PiShieldCheck, PiSignOut, PiHeart, PiShoppingBag, PiMagnifyingGlass } from "react-icons/pi";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import MobileSearchOverlay from './MobileSearchOverlay';
import { motion } from 'framer-motion';
import { useComparison } from '@/context/ComparisonContext';
import { useCurrency } from '@/context/CurrencyContext';
import { PiArrowsLeftRight, PiGlobe } from 'react-icons/pi';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();
    const { items, isCartOpen, openCart } = useCart();
    const { comparisonItems } = useComparison();
    const { currency, setCurrency } = useCurrency();

    const isHome = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Dynamic styles based on scroll & page
    const navClasses = scrolled
        ? 'bg-white/80 backdrop-blur-2xl shadow-[0_2px_40px_-15px_rgba(0,0,0,0.1)] py-2 md:py-3 border-b border-brand-gold/10'
        : isHome
            ? 'bg-gradient-to-b from-black/20 to-transparent py-4 md:py-6'
            : 'bg-brand-navy py-3 md:py-4 shadow-xl shadow-brand-navy/10';

    const textColor = scrolled ? 'text-brand-navy' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]';
    const accentColor = 'text-brand-gold';

    return (
        <nav className={`w-full transition-all duration-500 ease-in-out ${navClasses}`}>

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-3 items-center relative h-12 md:h-16">

                    {/* Left: Desktop Links / Mobile Menu Toggle */}
                    <div className="flex items-center justify-start gap-4">
                        {/* Mobile Toggle */}
                        <div className="flex items-center md:hidden">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`${textColor} hover:text-brand-gold focus:outline-none transition-colors duration-300`}
                            >
                                {isMobileMenuOpen ? <PiX className="h-6 w-6" /> : <PiList className="h-6 w-6" />}
                            </motion.button>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex space-x-8 items-center">
                            <NavLink href="/" label="Home" textColor={textColor} />
                            <NavLink href="/shop" label="Collections" textColor={textColor} />
                            <NavLink href="/about" label="Heritage" textColor={textColor} />
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className={`flex flex-col items-center justify-center transition-all duration-700 ${scrolled ? 'scale-90' : 'scale-100'}`}>
                        <Link href="/" className={`font-serif text-xl md:text-3xl tracking-[0.2em] md:tracking-[0.3em] ${textColor} font-bold transition-all duration-500 hover:tracking-[0.4em]`}>
                            SPARK <span className="text-brand-gold">BLUE</span>
                        </Link>
                        {!scrolled && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[0.4rem] md:text-[0.6rem] uppercase tracking-[0.4em] md:tracking-[0.6em] text-brand-gold font-black mt-0.5"
                            >
                                Diamond
                            </motion.span>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex justify-end items-center gap-3 md:gap-6">
                        {/* Desktop Only Actions */}
                        <div className={`hidden md:flex items-center gap-3 md:gap-5 border-l ${scrolled || !isHome ? 'border-brand-navy/10' : 'border-white/20'} pl-4 md:pl-8 transition-colors duration-300`}>
                            {/* Currency Switcher (Desktop) */}
                            <div className="relative group">
                                <button className={`flex items-center gap-1 text-[8px] md:text-[10px] uppercase tracking-widest font-black ${textColor} hover:text-brand-gold transition-all`}>
                                    <PiGlobe className="w-4 h-4" />
                                    <span className="hidden sm:inline">{currency}</span>
                                </button>
                                <div className="absolute top-full right-0 mt-4 bg-brand-navy border border-brand-gold/20 shadow-2xl py-3 px-4 w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1000] backdrop-blur-xl">
                                    <div className="flex flex-col gap-2">
                                        {(['INR', 'USD', 'AED', 'GBP', 'EUR'] as const).map((curr) => (
                                            <button
                                                key={curr}
                                                onClick={() => setCurrency(curr)}
                                                className={`text-[9px] uppercase tracking-widest font-bold text-left hover:text-brand-gold transition-colors ${currency === curr ? 'text-brand-gold' : 'text-white/60'}`}
                                            >
                                                {curr}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className={`${textColor} hover:text-brand-gold transition-colors duration-300`}
                                title="Search"
                            >
                                <PiMagnifyingGlass className="h-5 w-5" />
                            </button>

                            {isAuthenticated ? (
                                <>
                                    <Link href="/account" className={`text-xs ${textColor} uppercase tracking-widest font-bold hover:text-brand-gold transition-colors duration-300`} title="Account">
                                        {user?.name?.split(' ')[0]}
                                    </Link>
                                    {['ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRICE_MANAGER'].includes(user?.role || '') && (
                                        <Link href="/admin" className={`${textColor} hover:text-brand-gold transition-colors duration-300`} title="Admin Panel">
                                            <PiShieldCheck className="h-5 w-5" />
                                        </Link>
                                    )}
                                    <button onClick={logout} className={`${textColor} hover:text-red-400 transition-colors duration-300`} title="Logout">
                                        <PiSignOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className={`${textColor} text-xs tracking-[0.2em] uppercase font-bold hover:text-brand-gold transition-colors duration-300`}>
                                    Login
                                </Link>
                            )}

                            <Link href="/wishlist" className={`${textColor} hover:text-brand-gold transition-colors duration-300`} title="Wishlist">
                                <PiHeart className="h-5 w-5" />
                            </Link>

                            <Link href="/compare" className={`hidden lg:flex ${textColor} hover:text-brand-gold transition-colors duration-300 relative ml-1 md:ml-2`} title="Compare">
                                <PiArrowsLeftRight className="h-5 w-5" />
                                {comparisonItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-brand-gold/30">
                                        {comparisonItems.length}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Mobile & Desktop Shared Actions (Cart & Mobile Search) */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className={`md:hidden ${textColor} hover:text-brand-gold transition-colors duration-300`}
                                title="Search"
                            >
                                <PiMagnifyingGlass className="h-5 w-5" />
                            </button>

                            <button
                                onClick={openCart}
                                className={`${textColor} hover:text-brand-gold transition-colors duration-300 relative group`}
                            >
                                <PiShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                                {items.length > 0 && (
                                    <motion.span
                                        key={items.length}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-brand-gold text-white text-[8px] md:text-[9px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(198,168,124,0.5)]"
                                    >
                                        {items.length}
                                    </motion.span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Mobile Menu Overlay */}
            <div className={`md:hidden fixed inset-0 bg-brand-navy z-[1001] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Abstract Background for Menu */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="flex flex-col h-full items-center p-8 relative overflow-y-auto">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-white/50 p-2 hover:text-brand-gold transition-colors">
                        <PiX className="h-8 w-8" />
                    </button>

                    <div className="mt-16 flex flex-col items-center w-full space-y-10">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl tracking-[0.2em] text-white font-bold">
                            SPARK <span className="text-brand-gold">BLUE</span>
                        </Link>

                        <motion.div
                            initial="closed"
                            animate={isMobileMenuOpen ? "open" : "closed"}
                            variants={{
                                open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                            }}
                            className="flex flex-col items-center space-y-8 w-full"
                        >
                            {[
                                { href: "/", label: "Home" },
                                { href: "/shop", label: "Collections" },
                                { href: "/about", label: "Heritage" },
                                { href: "/wishlist", label: "My Wishlist" },
                                { href: "/compare", label: `Jewellery Compare (${comparisonItems.length})` }
                            ].map((link) => (
                                <motion.div
                                    key={link.label}
                                    variants={{
                                        open: { opacity: 1, y: 0 },
                                        closed: { opacity: 0, y: 20 }
                                    }}
                                    className="w-full text-center"
                                >
                                    <MobileNavLink href={link.href} label={link.label} onClick={() => setIsMobileMenuOpen(false)} />
                                </motion.div>
                            ))}

                            <motion.div
                                variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
                                className="w-12 h-[1px] bg-brand-gold/30 my-2"
                            />

                            {isAuthenticated ? (
                                <motion.div
                                    variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}
                                    className="flex flex-col items-center space-y-8 w-full"
                                >
                                    <MobileNavLink href="/account" label="Account Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                                    {['ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRICE_MANAGER'].includes(user?.role || '') && (
                                        <MobileNavLink href="/admin" label="Admin Master" onClick={() => setIsMobileMenuOpen(false)} />
                                    )}
                                    <button onClick={logout} className="text-red-400 uppercase text-[10px] tracking-[0.4em] font-black pt-4 hover:text-red-500 transition-colors">Sign Out</button>
                                </motion.div>
                            ) : (
                                <motion.div variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}>
                                    <MobileNavLink href="/login" label="Client Login" onClick={() => setIsMobileMenuOpen(false)} />
                                </motion.div>
                            )}

                            {/* Currency Selection in Menu */}
                            <motion.div
                                variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}
                                className="pt-10 w-full"
                            >
                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold mb-4">Select Currency</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {(['INR', 'USD', 'AED', 'GBP', 'EUR'] as const).map((curr) => (
                                        <button
                                            key={curr}
                                            onClick={() => setCurrency(curr)}
                                            className={`px-4 py-2 border rounded-none text-[10px] uppercase tracking-widest font-black transition-all ${currency === curr ? 'bg-brand-gold border-brand-gold text-brand-navy' : 'bg-white/5 border-white/10 text-white/60 hover:border-brand-gold/50'}`}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="mt-auto pt-16 text-center">
                        <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-bold">Standard of Excellence since 1995</p>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, label, textColor }: { href: string, label: string, textColor: string }) {
    return (
        <Link href={href} className={`${textColor} group relative text-[11px] tracking-[0.2em] uppercase font-bold hover:text-brand-gold transition-colors duration-300`}>
            <motion.span whileTap={{ scale: 0.95 }} className="block">
                {label}
            </motion.span>
            <span className="absolute -bottom-2 left-1/2 w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
        </Link>
    );
}

function MobileNavLink({ href, label, onClick }: { href: string, label: string, onClick: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`text-3xl font-serif transition-all duration-300 py-2 block ${isActive ? 'text-brand-gold font-bold translate-x-2' : 'text-white'}`}
        >
            <motion.div whileTap={{ scale: 0.9 }}>
                {label}
            </motion.div>
        </Link>
    );
}
