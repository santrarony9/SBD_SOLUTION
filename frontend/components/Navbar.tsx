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
            ? 'bg-transparent py-4 md:py-6'
            : 'bg-brand-navy py-3 md:py-4 shadow-xl shadow-brand-navy/10';

    const textColor = scrolled ? 'text-brand-navy' : 'text-white';
    const accentColor = 'text-brand-gold';

    return (
        <nav className={`fixed w-full ${isSearchOpen || isMobileMenuOpen ? 'z-[1100]' : 'z-[100]'} transition-all duration-500 ease-in-out ${navClasses}`}>
            {/* Safe Area Top Padding - ensures content is below status bars/notches */}
            <div className="h-[env(safe-area-inset-top,0px)] w-full" />

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center relative h-10 md:h-12">

                    {/* Mobile Left: Search & Menu */}
                    <div className="flex items-center md:hidden gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`${textColor} hover:text-brand-gold focus:outline-none transition-colors duration-300`}
                        >
                            {isMobileMenuOpen ? <PiX className="h-6 w-6" /> : <PiList className="h-6 w-6" />}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsSearchOpen(true)}
                            className={`${textColor} hover:text-brand-gold focus:outline-none transition-colors duration-300`}
                        >
                            <PiMagnifyingGlass className="h-5 w-5" />
                        </motion.button>
                    </div>

                    {/* Desktop Left Links */}
                    <div className="hidden md:flex space-x-10 items-center">
                        <NavLink href="/" label="Home" textColor={textColor} />
                        <NavLink href="/shop" label="Collections" textColor={textColor} />
                        <NavLink href="/about" label="Heritage" textColor={textColor} />
                    </div>

                    {/* Center: Logo */}
                    <div className={`flex-shrink-0 flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 transition-all duration-700 ${scrolled ? 'scale-90' : 'scale-100'}`}>
                        <Link href="/" className={`font-serif text-2xl md:text-4xl tracking-[0.3em] ${textColor} font-bold transition-all duration-500 hover:tracking-[0.4em]`}>
                            SPARK <span className="text-brand-gold">BLUE</span>
                        </Link>
                        {!scrolled && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[0.5rem] md:text-[0.6rem] uppercase tracking-[0.6em] text-brand-gold font-black mt-1"
                            >
                                Diamond
                            </motion.span>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <div className={`flex items-center space-x-5 border-l ${scrolled || !isHome ? 'border-brand-navy/10' : 'border-white/20'} pl-8 transition-colors duration-300`}>
                            {/* Currency Switcher */}
                            <div className="relative group mr-2">
                                <button className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black ${textColor} hover:text-brand-gold transition-all`}>
                                    <PiGlobe className="w-4 h-4" />
                                    <span>{currency}</span>
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
                                    {user?.role === 'ADMIN' && (
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

                            <Link href="/compare" className={`${textColor} hover:text-brand-gold transition-colors duration-300 relative ml-2`} title="Compare">
                                <PiArrowsLeftRight className="h-5 w-5" />
                                {comparisonItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-navy text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-brand-gold/30">
                                        {comparisonItems.length}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={openCart}
                                className={`${textColor} hover:text-brand-gold transition-colors duration-300 relative ml-2 group`}
                            >
                                <PiShoppingBag className="h-5 w-5" />
                                {items.length > 0 && (
                                    <motion.span
                                        key={items.length}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 bg-brand-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(198,168,124,0.5)]"
                                    >
                                        {items.length}
                                    </motion.span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Right: Cart */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={openCart}
                            className={`${textColor} hover:text-brand-gold relative transition-colors`}
                        >
                            <motion.div whileTap={{ scale: 0.9 }}>
                                <PiShoppingBag className="h-6 w-6" />
                                {items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {items.length}
                                    </span>
                                )}
                            </motion.div>
                        </button>
                    </div>
                </div>
            </div>

            <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Mobile Menu Overlay */}
            <div className={`md:hidden fixed inset-0 bg-white/98 backdrop-blur-2xl z-50 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full justify-center items-center space-y-8 p-8 relative">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-brand-navy p-2 hover:bg-brand-gold/10 rounded-full transition-colors">
                        <PiX className="h-8 w-8" />
                    </button>

                    <motion.div
                        initial="closed"
                        animate={isMobileMenuOpen ? "open" : "closed"}
                        variants={{
                            open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                            closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                        }}
                        className="flex flex-col items-center space-y-6"
                    >
                        {[
                            { href: "/", label: "Home" },
                            { href: "/shop", label: "Collections" },
                            { href: "/about", label: "Heritage" },
                            { href: "/wishlist", label: "Wishlist" },
                            { href: "/compare", label: `Compare (${comparisonItems.length})` }
                        ].map((link) => (
                            <motion.div
                                key={link.label}
                                variants={{
                                    open: { opacity: 1, y: 0 },
                                    closed: { opacity: 0, y: 20 }
                                }}
                            >
                                <MobileNavLink href={link.href} label={link.label} onClick={() => setIsMobileMenuOpen(false)} />
                            </motion.div>
                        ))}

                        <motion.div
                            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
                            className="w-16 h-px bg-brand-gold/20 my-4"
                        />

                        {isAuthenticated ? (
                            <motion.div
                                variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}
                                className="flex flex-col items-center space-y-6"
                            >
                                <MobileNavLink href="/account" label="My Account" onClick={() => setIsMobileMenuOpen(false)} />
                                <button onClick={logout} className="text-red-400 uppercase text-[10px] tracking-[0.3em] font-black pt-4 hover:text-red-500 transition-colors">Logout</button>
                            </motion.div>
                        ) : (
                            <motion.div variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}>
                                <MobileNavLink href="/login" label="Login" onClick={() => setIsMobileMenuOpen(false)} />
                            </motion.div>
                        )}

                        <motion.div
                            variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 20 } }}
                            className="flex flex-wrap justify-center gap-4 pt-8"
                        >
                            {(['INR', 'USD', 'AED', 'GBP', 'EUR'] as const).map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    className={`px-3 py-1.5 border rounded-none text-[9px] uppercase tracking-widest font-black transition-all ${currency === curr ? 'bg-brand-navy border-brand-navy text-brand-gold' : 'bg-transparent border-gray-100 text-gray-400'}`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </motion.div>
                    </motion.div>
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
    return (
        <Link href={href} onClick={onClick} className="text-2xl font-serif text-brand-navy hover:text-brand-gold transition-colors duration-300">
            <motion.div whileTap={{ scale: 0.9 }}>
                {label}
            </motion.div>
        </Link>
    );
}
