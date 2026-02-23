import Link from 'next/link';
import { PiInstagramLogo, PiFacebookLogo, PiYoutubeLogo, PiPinterestLogo, PiEnvelope } from "react-icons/pi";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-[#0A1128] to-[#010309] text-gray-400 border-t border-brand-gold/5 font-sans relative overflow-hidden">
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-20">

                    {/* 1. Brand & Heritage */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <Link href="/" className="group inline-block mb-8">
                            <h2 className="text-3xl font-serif text-white tracking-widest uppercase transition-colors group-hover:text-brand-gold">
                                SPARK <span className="text-brand-gold">BLUE</span>
                            </h2>
                            <p className="text-[10px] tracking-[0.5em] text-brand-gold/60 uppercase font-black mt-2">Diamond Heritage</p>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm font-light">
                            Crafting timeless elegance since 1995. Our commitment to IGI certified excellence ensures every piece tells a story of unmatched brilliance and ethical sourcing.
                        </p>
                        <div className="flex gap-6">
                            {[PiInstagramLogo, PiFacebookLogo, PiYoutubeLogo, PiPinterestLogo].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="text-white/40 hover:text-brand-gold transition-all duration-300 hover:-translate-y-1"
                                >
                                    <Icon className="w-6 h-6" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-l-2 border-brand-gold pl-4">Exquisite Collections</h3>
                        <ul className="space-y-4 text-xs tracking-widest uppercase">
                            {['Solitaire Rings', 'Bridal Galore', 'Bespoke Design', 'Gold Heritage'].map(item => (
                                <li key={item}>
                                    <Link href="/shop" className="hover:text-brand-gold transition-colors block opacity-70 hover:opacity-100">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Services */}
                    <div>
                        <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-l-2 border-brand-gold pl-4">The Concierge</h3>
                        <ul className="space-y-4 text-xs tracking-widest uppercase">
                            {[
                                { label: 'Book Private Viewing', href: '/about#contact' },
                                { label: 'Care & Maintenance', href: '/about#care' },
                                { label: 'Certification Hub', href: '/about#shipping' },
                                { label: 'Our Story', href: '/about#heritage' }
                            ].map(item => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-brand-gold transition-colors block opacity-70 hover:opacity-100">{item.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. Newsletter */}
                    <div className="md:col-span-4 lg:col-span-1">
                        <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-l-2 border-brand-gold pl-4">The Register</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-6">Join our inner circle for exclusive previews.</p>
                        <form className="relative group">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-transparent w-full border-b border-white/10 py-3 text-xs text-white placeholder-gray-700 focus:placeholder-gray-500 focus:border-brand-gold outline-none transition-colors"
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-gold hover:text-white transition-colors">
                                <PiEnvelope className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-40">
                        &copy; {new Date().getFullYear()} Spark Blue Diamond. Handcrafted Brilliance.
                    </p>
                    <div className="flex gap-8 text-[9px] uppercase tracking-[0.2em] font-black opacity-30">
                        <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
                        <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
                        <Link href="/sitemap" className="hover:opacity-100 transition-opacity">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
