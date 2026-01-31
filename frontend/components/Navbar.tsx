"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

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
    // If scrolled or NOT on home page -> Solid Navy
    // If on home page and NOT scrolled -> Transparent
    const navBackground = (scrolled || !isHome) ? 'bg-brand-navy shadow-md py-4' : 'bg-transparent py-6';
    const textColor = (scrolled || !isHome) ? 'text-white' : 'text-white'; // Keep white for contrast on hero

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${navBackground}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Left: Mobile Menu Toggle & Search (Placeholder) */}
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
                    <div className="flex-shrink-0 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" className="font-serif text-2xl md:text-3xl tracking-[0.2em] text-white font-bold hover:text-brand-gold transition-colors duration-300">
                            SPARK BLUE
                        </Link>
                    </div>

                    {/* Right: Actions (Cart, Account, Contact) */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <NavLink href="/contact" label="Contact" textColor={textColor} />
                        <div className="flex items-center space-x-4 ml-4 border-l border-gray-600 pl-6">
                            <button className={`${textColor} hover:text-brand-gold transition-colors`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>
                            <button className={`${textColor} hover:text-brand-gold transition-colors relative`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-navy text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Right: Cart */}
                    <div className="flex items-center md:hidden">
                        <button className={`${textColor} hover:text-brand-gold`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-brand-navy absolute w-full left-0 top-full shadow-xl border-t border-gray-800">
                    <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
                        <MobileNavLink href="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileNavLink href="/shop" label="Collections" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileNavLink href="/about" label="Our Story" onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileNavLink href="/contact" label="Contact" onClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                </div>
            )}
        </nav>
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
        <Link href={href} onClick={onClick} className="block w-full text-center px-3 py-3 text-white hover:text-brand-gold hover:bg-white/5 text-sm tracking-widest uppercase transition-colors">
            {label}
        </Link>
    );
}
