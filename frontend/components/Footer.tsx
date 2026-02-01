import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-brand-navy text-gray-300 pt-20 pb-10 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand & Newsletter */}
                <div className="col-span-1 md:col-span-1 space-y-6">
                    <div>
                        <h2 className="font-serif text-2xl text-white tracking-widest mb-2">SPARK BLUE</h2>
                        <div className="h-0.5 w-12 bg-brand-gold"></div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Setting the standard for luxury and transparency. IGI Certified Diamonds and BIS Hallmarked Gold, crafted for eternity.
                    </p>

                    {/* Newsletter */}
                    <div className="pt-4">
                        <h4 className="text-xs uppercase tracking-widest text-brand-gold mb-3">Subscribe to our Newsletter</h4>
                        <div className="flex border-b border-gray-600 pb-1">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500 focus:ring-0"
                            />
                            <button className="text-xs uppercase tracking-widest text-white hover:text-brand-gold transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                {/* Explore */}
                <div className="md:pl-10">
                    <h3 className="text-white font-serif text-lg mb-6">Explore</h3>
                    <ul className="space-y-3 text-sm font-light">
                        <li><Link href="/shop" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">High Jewellery</Link></li>
                        <li><Link href="/shop" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">Engagement</Link></li>
                        <li><Link href="/shop" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">Watches</Link></li>
                        <li><Link href="/shop" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">Collections</Link></li>
                    </ul>
                </div>

                {/* Customer Care */}
                <div>
                    <h3 className="text-white font-serif text-lg mb-6">Customer Care</h3>
                    <ul className="space-y-3 text-sm font-light">
                        <li><Link href="/contact" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">Contact Us</Link></li>
                        <li><Link href="/about" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">Shipping & Returns</Link></li>
                        <li><Link href="/about" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">Warranty</Link></li>
                        <li><Link href="/about" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">FAQ</Link></li>
                    </ul>
                </div>

                {/* Certifications & Social */}
                <div>
                    <h3 className="text-white font-serif text-lg mb-6">Certifications</h3>
                    <div className="flex space-x-4 mb-8">
                        <div className="border border-white/20 px-4 py-3 text-center min-w-[80px]">
                            <span className="block text-brand-gold font-bold text-lg font-serif">IGI</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Certified</span>
                        </div>
                        <div className="border border-white/20 px-4 py-3 text-center min-w-[80px]">
                            <span className="block text-brand-gold font-bold text-lg font-serif">BIS</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Hallmarked</span>
                        </div>
                    </div>
                    <h3 className="text-white font-serif text-lg mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        {/* Social Icons would go here */}
                        <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-gold hover:text-brand-navy flex items-center justify-center transition-all cursor-pointer">
                            <span className="text-xs">IG</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-gold hover:text-brand-navy flex items-center justify-center transition-all cursor-pointer">
                            <span className="text-xs">FB</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-500 tracking-wider uppercase">
                &copy; {new Date().getFullYear()} Spark Blue Diamond. All rights reserved.
            </div>
        </footer>
    );
}
