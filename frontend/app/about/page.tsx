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
                    <div className="flex justify-center gap-6 mt-10">
                        <Link href="#values" className="text-xs uppercase tracking-widest border-b border-white/30 hover:border-brand-gold pb-1 transition-all">Values</Link>
                        <Link href="#shipping" className="text-xs uppercase tracking-widest border-b border-white/30 hover:border-brand-gold pb-1 transition-all">Support</Link>
                        <Link href="#contact" className="text-xs uppercase tracking-widest border-b border-white/30 hover:border-brand-gold pb-1 transition-all">Contact</Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section id="vision" className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
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
                    <div id="values" className="text-center mb-16">
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

            {/* Support & Shipping */}
            <section id="shipping" className="bg-brand-navy py-24 text-white">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-serif text-brand-gold mb-6">Concierge & Logistics</h2>
                            <p className="text-gray-400 font-light leading-relaxed">We ensure your treasures reach you with the same care they were crafted with.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <span className="text-brand-gold font-bold">01.</span>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2">Insured Shipping</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Complimentary insured shipping on all orders over ₹50,000. Every package is sealed with a tamper-proof security code.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-brand-gold font-bold">02.</span>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2">Purity Guarantee</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Our diamonds come with IGI certification and gold items are BIS Hallmarked. Documentation is included in the premium packaging.</p>
                                </div>
                            </div>
                            <div className="flex gap-4" id="care">
                                <span className="text-brand-gold font-bold">03.</span>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2">Lifetime Care</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">We offer professional cleaning and stone-tightening checks annually at our flagship store.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="contact" className="bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10">
                        <h3 className="text-2xl font-serif mb-8 text-brand-gold">Get in Touch</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold italic font-serif">A</div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Our Flagship Store</p>
                                    <p className="text-sm">Jeweller Street, Diamond Hub, Mumbai - 400001</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold italic font-serif">T</div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Concierge Line</p>
                                    <p className="text-sm">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold italic font-serif">E</div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Official Inquiry</p>
                                    <p className="text-sm">concierge@sparkbluediamond.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/10">
                            <p className="text-xs text-gray-400 italic">"Luxury is personal. We are here to ensure your experience is as unique as your jem."</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
