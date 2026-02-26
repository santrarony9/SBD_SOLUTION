import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="bg-brand-cream min-h-screen py-20 px-4 md:py-32">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <span className="text-brand-gold text-xs font-black uppercase tracking-[0.5em] mb-4 inline-block">Engagement Rules</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-brand-navy mb-6">Terms of Service</h1>
                    <div className="w-24 h-[1px] bg-brand-gold mx-auto opacity-30"></div>
                </header>

                <div className="bg-white p-8 md:p-16 shadow-2xl shadow-brand-navy/5 border border-brand-charcoal/5 prose prose-slate max-w-none">
                    <p className="text-brand-navy/60 italic mb-8">Last Updated: February 2026</p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">1. Acceptance of Terms</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">2. Product Authenticity & Pricing</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            Spark Blue Diamond guarantees that all items sold are authentic. Gold is BIS Hallmarked and Diamonds are IGI certified. Our pricing is dynamic and linked to international market rates. We reserve the right to cancel orders if a technical error occurs in the automated pricing engine.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">3. Shipping & Returns</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            Orders are processed within 2-5 business days. We provide complimentary insured shipping. Returns are accepted within 48 hours for a full refund (minus shipping), provided the item is in its original condition with all tags intact.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">4. Intellectual Property</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            The Site and its original content, features, and functionality are owned by Spark Blue Diamond and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                        </p>
                    </section>

                    <div className="mt-16 pt-8 border-t border-brand-gold/10 text-center">
                        <Link href="/" className="text-brand-gold text-xs font-black uppercase tracking-widest hover:text-brand-navy transition-colors">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
