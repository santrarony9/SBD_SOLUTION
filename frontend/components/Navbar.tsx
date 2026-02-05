'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiList, PiX, PiShieldCheck, PiSignOut, PiHeart, PiShoppingBag } from "react-icons/pi";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();
    const { items } = useCart();

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
        ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-brand-gold/10'
        : isHome
            ? 'bg-transparent py-6'
            : 'bg-brand-navy py-4 shadow-md';

    const textColor = scrolled || !isHome ? 'text-brand-navy' : 'text-white';

    // Logo should be gold on dark backgrounds (unscrolled home or mobile menu), navy otherwise
    const logoColor = scrolled ? 'text-brand-navy' : 'text-white';

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${navClasses}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center relative h-12">

                    {/* Left: Mobile Menu Toggle */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`${textColor} hover:text-brand-gold focus:outline-none transition-colors duration-300`}
                        >
                            {isMobileMenuOpen ? <PiX className="h-6 w-6" /> : <PiList className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Desktop Left Links */}
                    <div className="hidden md:flex space-x-10 items-center">
                        <NavLink href="/" label="Home" textColor={textColor} />
                        <NavLink href="/shop" label="Collections" textColor={textColor} />
                        <NavLink href="/about" label="Heritage" textColor={textColor} />
                    </div>

                    {/* Center: Logo */}
                    <div className={`flex-shrink-0 flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 transition-all duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
                        <Link href="/" className={`font-serif text-2xl md:text-3xl tracking-[0.25em] ${logoColor} font-bold transition-colors duration-500 hover:text-brand-gold`}>
                            SPARK BLUE
                        </Link>
                        <span className={`text-[0.5rem] md:text-[0.6rem] uppercase tracking-[0.4em] text-brand-gold transition-opacity duration-300 ${scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                            Diamond
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <div className={`flex items-center space-x-5 border-l ${scrolled || !isHome ? 'border-brand-navy/10' : 'border-white/20'} pl-8 transition-colors duration-300`}>
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

                            <Link href="/cart" className={`${textColor} hover:text-brand-gold transition-colors duration-300 relative ml-2`}>
                                <PiShoppingBag className="h-5 w-5" />
                                {items.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse-slow">
                                        {items.length}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Right: Cart */}
                    <div className="flex items-center md:hidden">
                        <Link href="/cart" className={`${textColor} hover:text-brand-gold relative transition-colors`}>
                            <PiShoppingBag className="h-6 w-6" />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`md:hidden fixed inset-0 bg-white/95 backdrop-blur-xl z-40 transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full justify-center items-center space-y-8 p-8">
                    <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-brand-navy p-2">
                        <PiX className="h-8 w-8" />
                    </button>

                    <MobileNavLink href="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink href="/shop" label="Collections" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink href="/about" label="Heritage" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink href="/wishlist" label="Wishlist" onClick={() => setIsMobileMenuOpen(false)} />

                    <div className="w-12 h-px bg-brand-gold/30 my-4"></div>

                    {isAuthenticated ? (
                        <>
                            <MobileNavLink href="/account" label="My Account" onClick={() => setIsMobileMenuOpen(false)} />
                            <button onClick={logout} className="text-red-400 uppercase text-xs tracking-[0.2em] font-bold pt-4">Logout</button>
                        </>
                    ) : (
                        <MobileNavLink href="/login" label="Login" onClick={() => setIsMobileMenuOpen(false)} />
                    )}
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, label, textColor }: { href: string, label: string, textColor: string }) {
    return (
        <Link href={href} className={`${textColor} group relative text-[11px] tracking-[0.2em] uppercase font-bold hover:text-brand-gold transition-colors duration-300`}>
            {label}
            <span className="absolute -bottom-2 left-1/2 w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
        </Link>
    );
}

function MobileNavLink({ href, label, onClick }: { href: string, label: string, onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="text-2xl font-serif text-brand-navy hover:text-brand-gold transition-colors duration-300">
            {label}
        </Link>
    );
}
