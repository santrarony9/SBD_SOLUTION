import Link from 'next/link';
import { PiInstagramLogo, PiFacebookLogo, PiYoutubeLogo, PiPinterestLogo } from "react-icons/pi";

export default function Footer() {
    return (
        <footer className="bg-[#0A1128] text-gray-400 border-t border-brand-gold/10 font-sans text-xs">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* 1. Brand & Ethos */}
                <div className="md:col-span-1">
                    <Link href="/" className="group">
                        <h2 className="text-xl font-serif text-white mb-1 transition-colors group-hover:text-brand-gold">Spark Blue Diamond</h2>
                    </Link>
                    <p className="text-brand-gold text-[10px] uppercase tracking-[0.2em] mb-4 font-bold">Established 2020</p>
                    <p className="text-gray-400 text-xs leading-relaxed mb-6">
                        Curating the world's most exquisite lab-grown diamonds and hallmarked gold jewellery since 2020.
                    </p>
                    <div className="flex gap-4">
                        {[PiInstagramLogo, PiFacebookLogo, PiYoutubeLogo, PiPinterestLogo].map((Icon, i) => (
                            <a
                                key={i}
                                href={[
                                    "https://instagram.com/sparkbluediamond",
                                    "https://facebook.com/sparkbluediamond",
                                    "https://youtube.com/@sparkbluediamond",
                                    "https://pinterest.com/sparkbluediamond"
                                ][i]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-brand-gold transition-colors"
                            >
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

                {/* 4. Newsletter */}
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
