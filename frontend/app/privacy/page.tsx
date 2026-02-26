import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="bg-brand-cream min-h-screen py-20 px-4 md:py-32">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <span className="text-brand-gold text-xs font-black uppercase tracking-[0.5em] mb-4 inline-block">Legal Integrity</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-brand-navy mb-6">Privacy Policy</h1>
                    <div className="w-24 h-[1px] bg-brand-gold mx-auto opacity-30"></div>
                </header>

                <div className="bg-white p-8 md:p-16 shadow-2xl shadow-brand-navy/5 border border-brand-charcoal/5 prose prose-slate max-w-none">
                    <p className="text-brand-navy/60 italic mb-8">Last Updated: February 2026</p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">1. Introduction</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            At Spark Blue Diamond, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">2. The Data We Collect</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-brand-charcoal font-light">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> includes bank account and payment card details (processed securely via our payment partners).</li>
                            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">3. How Your Data Is Used</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            We use your data to process orders, manage your account, and if you agree, to email you about other products and services we think may be of interest to you. Your data is also used to calibrate our live pricing engines and loyalty rewards program.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-serif text-brand-navy mb-4">4. Data Security</h2>
                        <p className="text-brand-charcoal font-light leading-relaxed mb-4">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
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
