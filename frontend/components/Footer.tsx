import Link from 'next/link';
import { PiInstagramLogo, PiFacebookLogo, PiWhatsappLogo, PiEnvelopeSimple, PiMapPin, PiGlobe, PiYoutubeLogo, PiPinterestLogo, PiEnvelope } from 'react-icons/pi';
import { useCurrency } from '@/context/CurrencyContext';

export default function Footer() {
    const { currency, setCurrency } = useCurrency();
    return (
        <footer className="bg-gradient-to-b from-[#0A1128] to-[#010309] text-gray-400 border-t border-brand-gold/5 font-sans relative overflow-hidden">
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-36 lg:pb-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">

                    {/* 1. Brand & Heritage */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <Link href="/" className="group inline-block mb-6">
                            <h2 className="text-2xl font-serif text-white tracking-widest uppercase transition-colors group-hover:text-brand-gold">
                                SPARK <span className="text-brand-gold">BLUE</span>
                            </h2>
                            <p className="text-[9px] tracking-[0.4em] text-brand-gold/60 uppercase font-black mt-1">Diamond Heritage</p>
                        </Link>
                        <p className="text-gray-400 text-xs leading-relaxed mb-6 max-w-sm font-light">
                            Crafting timeless elegance since 1995. IGI certified excellence in every piece.
                        </p>
                        <div className="flex gap-5">
                            {[PiInstagramLogo, PiFacebookLogo, PiYoutubeLogo, PiPinterestLogo].map((Icon, i) => (
                                <a key={i} href="#" className="text-white/30 hover:text-brand-gold transition-all duration-300">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 2. Quick Links */}
                    <div className="hidden sm:block">
                        <h3 className="text-white text-[9px] font-black uppercase tracking-[0.2em] mb-6 opacity-50">Collections</h3>
                        <ul className="space-y-3 text-[10px] tracking-widest uppercase font-bold">
                            {['Solitaire', 'Bridal', 'Bespoke', 'Heritage'].map(item => (
                                <li key={item}>
                                    <Link href="/shop" className="hover:text-brand-gold transition-colors opacity-70 hover:opacity-100">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Services */}
                    <div className="hidden sm:block">
                        <h3 className="text-white text-[9px] font-black uppercase tracking-[0.2em] mb-6 opacity-50">Contact</h3>
                        <ul className="space-y-3 text-[10px] tracking-widest uppercase font-bold">
                            {[
                                { label: 'Private Viewing', href: '/about#contact' },
                                { label: 'Care Guide', href: '/about#care' },
                                { label: 'Shipping', href: '/about#shipping' }
                            ].map(item => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-brand-gold transition-colors opacity-70 hover:opacity-100">{item.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. Newsletter */}
                    <div className="md:col-span-4 lg:col-span-1">
                        <h3 className="text-white text-[9px] font-black uppercase tracking-[0.2em] mb-6 opacity-50">Newsletter</h3>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Inner Circle Register"
                                className="bg-transparent w-full border-b border-white/5 py-2 text-[10px] text-white placeholder-gray-700 focus:border-brand-gold outline-none transition-colors"
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-gold">
                                <PiEnvelope className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] tracking-widest uppercase opacity-30 font-bold">
                    <p>&copy; {new Date().getFullYear()} Spark Blue Diamond. Handcrafted Brilliance.</p>

                    {/* Footer Currency Switcher */}
                    <div className="flex gap-4 items-center">
                        {(['INR', 'USD', 'AED', 'GBP', 'EUR'] as const).map((curr) => (
                            <button
                                key={curr}
                                onClick={() => setCurrency(curr)}
                                className={`hover:opacity-100 transition-opacity ${currency === curr ? 'text-brand-gold opacity-100' : ''}`}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:opacity-100">Privacy</Link>
                        <Link href="/terms" className="hover:opacity-100">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
