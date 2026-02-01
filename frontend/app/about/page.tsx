import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="bg-brand-cream min-h-screen">

            {/* Header */}
            <section className="relative py-32 text-center text-white overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center fixed-background"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1626015099787-8c5029bc4803?q=80&w=2670&auto=format&fit=crop")' }}
                >
                    <div className="absolute inset-0 bg-brand-navy/80 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gold-gradient mb-6 animate-slide-up">Our Story</h1>
                    <p className="text-gray-200 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto animate-fade-in delay-300">
                        Redefining luxury with transparency, integrity, and timeless craftsmanship.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <div className="inline-block border-b border-brand-gold pb-1 mb-2">
                        <span className="text-brand-gold text-xs font-bold tracking-[0.3em] uppercase">The Vision</span>
                    </div>
                    <h2 className="text-4xl font-serif text-brand-navy leading-tight">The Spark of <span className="italic text-brand-gold">Excellence</span></h2>
                    <p className="text-brand-charcoal font-light leading-relaxed text-lg">
                        Spark Blue Diamond was founded with a singular vision: to bring trust back into the jewellery buying process.
                        For too long, customers have navigated opaque pricing and uncertain quality. We are here to change that.
                    </p>
                    <p className="text-brand-charcoal font-light leading-relaxed text-lg">
                        By integrating <strong>live automated pricing</strong> directly linked to daily gold and diamond market rates,
                        we ensure that you pay exactly what the metal and stones are worth—plus a fair making charge. No hidden costs, no manual markups.
                    </p>
                    <div className="pt-6">
                        <Link href="/shop" className="inline-block px-8 py-4 bg-brand-navy text-white font-bold tracking-widest uppercase text-xs hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 shadow-lg">
                            View Our Collection
                        </Link>
                    </div>
                </div>
                <div className="relative h-[500px] w-full group overflow-hidden shadow-2xl">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1531995811006-35cb42e1a022?q=80&w=2670&auto=format&fit=crop")' }}
                    ></div>
                    <div className="absolute inset-0 bg-brand-navy/20 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-white py-24 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif text-brand-navy">Why Choose Spark Blue?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="p-10 bg-brand-cream border border-brand-gold/20 hover:border-brand-gold hover:shadow-xl transition-all duration-300 text-center group">
                            <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">📜</div>
                            <h3 className="text-xl font-serif text-brand-navy mb-4 group-hover:text-brand-gold transition-colors">Certified Authenticity</h3>
                            <p className="text-brand-charcoal font-light leading-relaxed">Every diamond is IGI certified, and every gram of gold is BIS Hallmarked for your peace of mind.</p>
                        </div>
                        <div className="p-10 bg-brand-cream border border-brand-gold/20 hover:border-brand-gold hover:shadow-xl transition-all duration-300 text-center group">
                            <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">👁️</div>
                            <h3 className="text-xl font-serif text-brand-navy mb-4 group-hover:text-brand-gold transition-colors">Total Transparency</h3>
                            <p className="text-brand-charcoal font-light leading-relaxed">See the exact breakup of Gold, Diamond, Making Charges, and GST. Nothing hidden.</p>
                        </div>
                        <div className="p-10 bg-brand-cream border border-brand-gold/20 hover:border-brand-gold hover:shadow-xl transition-all duration-300 text-center group">
                            <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">🖐️</div>
                            <h3 className="text-xl font-serif text-brand-navy mb-4 group-hover:text-brand-gold transition-colors">Master Craftsmanship</h3>
                            <p className="text-brand-charcoal font-light leading-relaxed">Designed by artisans who blend modern aesthetics with traditional techniques.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
