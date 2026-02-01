import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#0A1128] text-gray-300 border-t border-brand-gold/20 relative overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

                    {/* Brand Column (4 cols) */}
                    <div className="md:col-span-4 space-y-8">
                        <div>
                            <h2 className="font-serif text-3xl text-white tracking-widest mb-4">SPARK BLUE</h2>
                            <p className="text-brand-gold text-xs uppercase tracking-[0.3em]">Diamond Architecture</p>
                        </div>
                        <p className="text-sm text-gray-400 leading-loose font-light">
                            Crafting eternity in every facet. Our pieces are more than jewellery; they are heirlooms of the future, certified for purity and designed for distinction.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders with Gold Hover */}
                            {['IG', 'FB', 'YT', 'PI'].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xs text-white hover:border-brand-gold hover:text-brand-gold transition-all duration-300 hover:scale-110">
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 1 (2 cols) */}
                    <div className="md:col-span-2 md:col-start-6">
                        <h3 className="text-white font-serif text-lg mb-8 relative inline-block">
                            Collections
                            <span className="absolute -bottom-2 left-0 w-1/2 h-px bg-brand-gold"></span>
                        </h3>
                        <ul className="space-y-4 text-sm font-light tracking-wide">
                            {['High Jewellery', 'Engagement', 'Watches', 'Gifting'].map((item) => (
                                <li key={item}>
                                    <Link href="/shop" className="hover:text-brand-gold hover:pl-2 transition-all duration-300 block">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Column 2 (2 cols) */}
                    <div className="md:col-span-2">
                        <h3 className="text-white font-serif text-lg mb-8 relative inline-block">
                            Concierge
                            <span className="absolute -bottom-2 left-0 w-1/2 h-px bg-brand-gold"></span>
                        </h3>
                        <ul className="space-y-4 text-sm font-light tracking-wide">
                            {[
                                { label: 'Contact Us', href: '/about#vision' },
                                { label: 'Shipping & Returns', href: '/about#values' },
                                { label: 'Care Guide', href: '/about#values' },
                                { label: 'Book Appointment', href: '/about#vision' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-brand-gold hover:pl-2 transition-all duration-300 block">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter (4 cols) */}
                    <div className="md:col-span-4">
                        <h3 className="text-white font-serif text-lg mb-6">The Royal Register</h3>
                        <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider">Join for exclusive previews</p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-white/5 border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-brand-gold transition-colors placeholder-gray-600"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-6 bg-brand-gold text-brand-navy text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 tracking-wider">
                    <p>&copy; {new Date().getFullYear()} Spark Blue Diamond. All rights reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <Link href="/about#values" className="hover:text-brand-gold transition-colors">Privacy Policy</Link>
                        <Link href="/about#values" className="hover:text-brand-gold transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
