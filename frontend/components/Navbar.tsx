import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-brand-navy text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="font-serif text-2xl tracking-widest text-brand-gold font-bold hover:text-white transition-colors duration-300">
                            SPARK BLUE
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/" className="hover:text-brand-gold transition-colors duration-200 text-sm tracking-wide uppercase">
                            Home
                        </Link>
                        <Link href="/shop" className="hover:text-brand-gold transition-colors duration-200 text-sm tracking-wide uppercase">
                            Collections
                        </Link>
                        <Link href="/about" className="hover:text-brand-gold transition-colors duration-200 text-sm tracking-wide uppercase">
                            Our Story
                        </Link>
                        <Link href="/contact" className="hover:text-brand-gold transition-colors duration-200 text-sm tracking-wide uppercase">
                            Contact
                        </Link>

                        {/* CTA Button */}
                        <Link href="/shop" className="bg-brand-gold text-brand-navy px-6 py-2 rounded-none hover:bg-white hover:text-brand-navy transition-all duration-300 font-semibold text-sm">
                            SHOP NOW
                        </Link>
                    </div>

                    {/* Mobile Menu Icon (Placeholder) */}
                    <div className="md:hidden flex items-center">
                        <button className="text-white hover:text-brand-gold">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
