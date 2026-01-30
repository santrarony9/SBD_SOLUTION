import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">

            {/* Header */}
            <section className="bg-brand-navy text-white py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-gold mb-4">Our Story</h1>
                <p className="text-gray-300 max-w-2xl mx-auto px-4">
                    Redefining luxury with transparency, integrity, and timeless craftsmanship.
                </p>
            </section>

            {/* Main Content */}
            <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-serif text-brand-navy mb-6">The Spark of Excellence</h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        Spark Blue Diamond was founded with a singular vision: to bring trust back into the jewellery buying process.
                        For too long, customers have navigated opaque pricing and uncertain quality. We are here to change that.
                    </p>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        By integrating <strong>live automated pricing</strong> directly linked to daily gold and diamond market rates,
                        we ensure that you pay exactly what the metal and stones are worth—plus a fair making charge. No hidden costs, no manual markups.
                    </p>
                    <div className="mt-8">
                        <Link href="/shop" className="text-brand-navy font-bold border-b border-brand-navy pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors">
                            View Our Collection
                        </Link>
                    </div>
                </div>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    {/* Placeholder Image */}
                    <span className="text-gray-400">Brand Story Image</span>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 bg-white shadow-sm rounded-lg">
                            <div className="text-4xl mb-4">📜</div>
                            <h3 className="text-xl font-serif text-brand-navy mb-2">Certified Authenticity</h3>
                            <p className="text-sm text-gray-500">Every diamond is IGI certified, and every gram of gold is BIS Hallmarked.</p>
                        </div>
                        <div className="p-6 bg-white shadow-sm rounded-lg">
                            <div className="text-4xl mb-4">👁️</div>
                            <h3 className="text-xl font-serif text-brand-navy mb-2">Total Transparency</h3>
                            <p className="text-sm text-gray-500">See the exact breakup of Gold, Diamond, Making Charges, and GST.</p>
                        </div>
                        <div className="p-6 bg-white shadow-sm rounded-lg">
                            <div className="text-4xl mb-4">🖐️</div>
                            <h3 className="text-xl font-serif text-brand-navy mb-2">Master Craftsmanship</h3>
                            <p className="text-sm text-gray-500">Designed by artisans who blend modern aesthetics with traditional techniques.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
