import Link from 'next/link';
import { PiInstagramLogo, PiFacebookLogo, PiYoutubeLogo, PiPinterestLogo } from "react-icons/pi";

export default function Footer() {
    return (
        <footer className="bg-[#0A1128] text-gray-400 border-t border-brand-gold/10 font-sans text-xs">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* 1. Brand & Ethos */}
                <div className="space-y-4">
                    <h2 className="font-serif text-2xl text-white tracking-widest">SPARK BLUE</h2>
                    <p className="leading-relaxed opacity-80">
                        Certified purity, bespoke craftsmanship, and a legacy of trust since 1995.
                    </p>
                    <div className="flex gap-4 pt-2">
                        {[PiInstagramLogo, PiFacebookLogo, PiYoutubeLogo, PiPinterestLogo].map((Icon, i) => (
                            <a key={i} href="#" className="text-white hover:text-brand-gold transition-colors">
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* 2. Collections */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-4">Collections</h3>
                    <ul className="space-y-2">
                        {['Solitaire Rings', 'Necklaces', 'Bridal Sets', 'Everyday Luxury'].map(item => (
                            <li key={item}>
                                <Link href="/shop" className="hover:text-brand-gold transition-colors block py-0.5">{item}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. Concierge */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-4">Concierge</h3>
                    <ul className="space-y-2">
                        {[
                            { label: 'Book Appointment', href: '/about#contact' },
                            { label: 'Shipping & Returns', href: '/about#shipping' },
                            { label: 'Care Guide', href: '/about#care' },
                            { label: 'Contact Us', href: '/about#contact' }
                        ].map(item => (
                            <li key={item.label}>
                                <Link href={item.href} className="hover:text-brand-gold transition-colors block py-0.5">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 4. Newsletter - Compact */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-4">The Register</h3>
                    <p className="mb-4 opacity-80">Join for exclusive previews.</p>
                    <form className="flex border-b border-white/20 pb-2">
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="bg-transparent w-full outline-none text-white placeholder-gray-600 focus:placeholder-gray-400"
                        />
                        <button className="text-brand-gold uppercase font-bold text-[10px] tracking-widest hover:text-white transition-colors">
                            Join
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 py-6 text-center opacity-60">
                <p>&copy; {new Date().getFullYear()} Spark Blue Diamond. All rights reserved.</p>
            </div>
        </footer>
    );
}
