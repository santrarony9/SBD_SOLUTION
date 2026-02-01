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
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const textColor = scrolled || !isHome ? 'text-brand-navy' : 'text-white';
    const logoColor = scrolled || !isHome ? 'text-brand-navy' : 'text-white';
    const bgColor = scrolled ? 'bg-white shadow-lg' : 'bg-transparent';

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${bgColor} py-4`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center relative h-12">

                    {/* Left: Mobile Menu Toggle */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`${textColor} hover:text-brand-gold focus:outline-none`}
                        >
                            {isMobileMenuOpen ? <PiX className="h-6 w-6" /> : <PiList className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Desktop Left Links */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <NavLink href="/" label="Home" textColor={textColor} />
                        <NavLink href="/shop" label="Collections" textColor={textColor} />
                        <NavLink href="/about" label="Our Legacy" textColor={textColor} />
                    </div>

                    {/* Center: Logo */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" className={`font-serif text-2xl md:text-3xl tracking-[0.25em] ${logoColor} font-bold transition-all duration-500 hover:text-brand-gold`}>
                            SPARK BLUE
                        </Link>
                        <span className="text-[0.5rem] md:text-[0.6rem] uppercase tracking-[0.4em] text-brand-gold">
                            Diamond
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <div className={`flex items-center space-x-4 border-l ${scrolled || !isHome ? 'border-gray-200' : 'border-white/30'} pl-6`}>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/account" className={`text-xs ${textColor} uppercase tracking-wider hover:text-brand-gold`} title="Account Dashboard">
                                        Hi, {user?.name?.split(' ')[0]}
                                    </Link>
                                    {user?.role === 'ADMIN' && (
                                        <Link href="/admin" className={`${textColor} hover:text-brand-gold transition-colors`} title="Admin Panel">
                                            <PiShieldCheck className="h-5 w-5" />
                                        </Link>
                                    )}
                                    <button onClick={logout} className={`${textColor} hover:text-brand-gold transition-colors`} title="Logout">
                                        <PiSignOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className={`${textColor} text-xs tracking-[0.15em] uppercase font-medium hover:text-brand-gold transition-colors`}>
                                    Login
                                </Link>
                            )}

                            <Link href="/wishlist" className={`${textColor} hover:text-brand-gold transition-colors`} title="Wishlist">
                                <PiHeart className="h-5 w-5" />
                            </Link>

                            <Link href="/cart" className={`${textColor} hover:text-brand-gold transition-colors relative ml-2`}>
                                <PiShoppingBag className="h-5 w-5" />
                                {items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {items.length}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Right: Cart */}
                    <div className="flex items-center md:hidden">
                        <Link href="/cart" className={`${textColor} hover:text-brand-gold relative`}>
                            <PiShoppingBag className="h-6 w-6" />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white absolute w-full left-0 top-full shadow-xl border-t border-gray-100 p-6 flex flex-col items-center space-y-4">
                    <MobileNavLink href="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink href="/shop" label="Collections" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink href="/about" label="Our Story" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink href="/wishlist" label="Wishlist" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="w-full border-t border-gray-100 my-2"></div>
                    {isAuthenticated ? (
                        <>
                            <MobileNavLink href="/account" label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                            <button onClick={logout} className="text-brand-navy uppercase text-xs tracking-widest font-bold pt-2">Logout</button>
                        </>
                    ) : (
                        <MobileNavLink href="/login" label="Login" onClick={() => setIsMobileMenuOpen(false)} />
                    )}
                </div>
            )}
        </nav>
    );
}

function NavLink({ href, label, textColor }: { href: string, label: string, textColor: string }) {
    return (
        <Link href={href} className={`${textColor} group relative text-xs tracking-[0.15em] uppercase font-bold hover:text-brand-gold transition-colors duration-300`}>
            {label}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );
}

function MobileNavLink({ href, label, onClick }: { href: string, label: string, onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="block w-full text-center py-3 text-brand-navy hover:text-brand-gold text-xs tracking-widest uppercase font-bold">
            {label}
        </Link>
    );
}
