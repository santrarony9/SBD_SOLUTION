'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, logout, user } = useAuth();
    const { items } = useCart();

    // Check if we are on the homepage to apply specific transparency rules
    const isHome = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine navbar background
    // If scrolled or NOT on home page -> Glass Dark (Premium)
    // If on home page and NOT scrolled -> Transparent
    const navBackground = (scrolled || !isHome) ? 'bg-white shadow-lg py-2' : 'bg-transparent py-6';
    const textColor = (scrolled || !isHome) ? 'text-brand-navy' : 'text-white';
    const logoColor = (scrolled || !isHome) ? 'text-brand-navy' : 'text-white';

    return (
        <div className="fixed w-full z-50 transition-all duration-300">
            {/* Gold Rate Ticker */}
            <div className="bg-brand-navy text-white text-[10px] md:text-xs py-1 overflow-hidden relative border-b border-brand-gold/20">
                <div className="animate-marquee whitespace-nowrap flex space-x-12">
                    <span>TODAY'S GOLD RATE (22K): <span className="text-brand-gold font-bold">₹7,250/g</span></span>
                    <span>TODAY'S GOLD RATE (24K): <span className="text-brand-gold font-bold">₹7,850/g</span></span>
                    <span>SILVER RATE: <span className="text-brand-gold font-bold">₹92/g</span></span>
                    <span>TODAY'S GOLD RATE (22K): <span className="text-brand-gold font-bold">₹7,250/g</span></span>
                    <span>TODAY'S GOLD RATE (24K): <span className="text-brand-gold font-bold">₹7,850/g</span></span>
                </div>
            </div>

            <nav className={`w-full transition-all duration-300 ${navBackground}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">

                        {/* Left: Mobile Menu Toggle */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`${textColor} hover:text-brand-gold focus:outline-none`}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>

                        {/* Desktop Left Links */}
                        <div className="hidden md:flex space-x-8 items-center">
                            <NavLink href="/" label="Home" textColor={textColor} />
                            <NavLink href="/shop" label="Collections" textColor={textColor} />
                            <NavLink href="/about" label="Our Story" textColor={textColor} />
                        </div>

                        {/* Center: Logo */}
                        <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 mt-2">
                            <Link href="/" className={`font-serif text-2xl md:text-3xl tracking-[0.25em] ${logoColor} font-bold transition-all duration-500 hover:text-brand-gold hover:scale-105`}>
                                SPARK BLUE
                            </Link>
                        </div>

                        {/* Right: Actions */}
                        <div className="hidden md:flex space-x-6 items-center">
                            <NavLink href="/contact" label="Contact" textColor={textColor} />

                            <div className={`flex items-center space-x-4 ml-4 border-l ${scrolled || !isHome ? 'border-gray-200' : 'border-gray-600'} pl-6`}>
                                {isAuthenticated ? (
                                    <>
                                        <span className={`text-xs ${textColor} uppercase tracking-wider`}>
                                            Hi, {user?.name?.split(' ')[0]}
                                        </span>
                                        {user?.role === 'ADMIN' && (
                                            <Link href="/admin" className={`${textColor} hover:text-brand-gold transition-colors`} title="Admin Panel">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </Link>
                                        )}
                                        <button onClick={logout} className={`${textColor} hover:text-brand-gold transition-colors`} title="Logout">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/login" className={`${textColor} group relative text-xs tracking-[0.15em] uppercase font-medium hover:text-brand-gold transition-colors duration-300`}>
                                        Login
                                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                )}

                                {/* Wishlist Icon */}
                                <Link href="/wishlist" className={`${textColor} hover:text-brand-gold transition-colors`} title="Wishlist">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </Link>

                                {/* Cart Icon */}
                                <Link href="/cart" className={`${textColor} hover:text-brand-gold transition-colors relative ml-2`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {items.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Right: Cart */}
                        <div className="flex items-center md:hidden space-x-4">
                            <Link href="/cart" className={`${textColor} hover:text-brand-gold relative`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
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
                    <div className="md:hidden bg-white absolute w-full left-0 top-full shadow-xl border-t border-gray-100">
                        <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
                            <MobileNavLink href="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink href="/shop" label="Collections" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink href="/about" label="Our Story" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink href="/contact" label="Contact" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink href="/wishlist" label="Wishlist" onClick={() => setIsMobileMenuOpen(false)} />

                            <div className="w-full border-t border-gray-100 my-2"></div>

                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'ADMIN' && (
                                        <MobileNavLink href="/admin" label="Admin Panel" onClick={() => setIsMobileMenuOpen(false)} />
                                    )}
                                    <button
                                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                        className="block w-full text-center px-3 py-3 text-brand-navy hover:text-brand-gold text-sm tracking-widest uppercase transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileNavLink href="/login" label="Login" onClick={() => setIsMobileMenuOpen(false)} />
                                    <MobileNavLink href="/register" label="Register" onClick={() => setIsMobileMenuOpen(false)} />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}

function NavLink({ href, label, textColor }: { href: string, label: string, textColor: string }) {
    return (
        <Link href={href} className={`${textColor} group relative text-xs tracking-[0.15em] uppercase font-medium hover:text-brand-gold transition-colors duration-300`}>
            {label}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );
}

function MobileNavLink({ href, label, onClick }: { href: string, label: string, onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="block w-full text-center px-3 py-3 text-brand-navy hover:text-brand-gold hover:bg-gray-50 text-sm tracking-widest uppercase transition-colors">
            {label}
        </Link>
    );
}
