import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center bg-brand-navy overflow-hidden">
        {/* Background Overlay/Image would go here. Using gradient for now */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy to-brand-dark opacity-90 z-10"></div>
        {/* Decorative Circle */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-gold opacity-10 rounded-full blur-3xl z-0"></div>

        <div className="relative z-20 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 tracking-wide animate-fade-in text-transparent bg-clip-text bg-gradient-to-r from-brand-goldLight to-brand-gold">
            Elegance in Every Facet
          </h1>
          <p className="text-lg md:text-2xl mb-8 font-light text-gray-300 max-w-2xl mx-auto animate-slide-up">
            IGI Certified Diamonds & BIS Hallmarked Gold. <br />
            Experience the transparency of automated live pricing.
          </p>
          <div className="animate-slide-up">
            <Link href="/shop" className="inline-block border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy px-8 py-3 uppercase tracking-widest font-semibold transition-all duration-300">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-center text-gray-600">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">💎</span>
            <span className="font-bold uppercase text-xs tracking-wider">IGI Certified</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">⚖️</span>
            <span className="font-bold uppercase text-xs tracking-wider">BIS Hallmarked</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🛡️</span>
            <span className="font-bold uppercase text-xs tracking-wider">Lifetime Exchange</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">✨</span>
            <span className="font-bold uppercase text-xs tracking-wider">Transparent Pricing</span>
          </div>
        </div>
      </section>

      {/* COLLECTIONS PREVIEW */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-brand-navy mb-12">Featured Collections</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group relative overflow-hidden shadow-lg cursor-pointer bg-white">
              <div className="h-80 bg-gray-200 flex items-center justify-center relative">
                {/* Placeholder for Product Image */}
                <span className="text-gray-400">Solitaire Rings</span>
              </div>
              <div className="absolute inset-0 bg-brand-navy bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500"></div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <h3 className="text-xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors font-bold bg-white/80 py-2 inline-block px-6 backdrop-blur-sm">Rings</h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden shadow-lg cursor-pointer bg-white">
              <div className="h-80 bg-gray-200 flex items-center justify-center relative">
                <span className="text-gray-400">Diamond Necklaces</span>
              </div>
              <div className="absolute inset-0 bg-brand-navy bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500"></div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <h3 className="text-xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors font-bold bg-white/80 py-2 inline-block px-6 backdrop-blur-sm">Necklaces</h3>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden shadow-lg cursor-pointer bg-white">
              <div className="h-80 bg-gray-200 flex items-center justify-center relative">
                <span className="text-gray-400">Elegant Earrings</span>
              </div>
              <div className="absolute inset-0 bg-brand-navy bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500"></div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <h3 className="text-xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors font-bold bg-white/80 py-2 inline-block px-6 backdrop-blur-sm">Earrings</h3>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/shop" className="text-brand-navy border-b border-brand-navy hover:text-brand-gold hover:border-brand-gold transition-colors pb-1 uppercase tracking-wider text-sm">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* SEO / CONTENT SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif text-brand-navy mb-6">Why Choose Spark Blue Diamond?</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            At Spark Blue Diamond, we believe that luxury should be transparent. Unlike traditional jewellers who hide price breakdowns, we offer a revolutionary
            <strong> Live Pricing Model</strong>. Our prices are automatically updated daily based on the current market rates of Gold (22K, 18K, 14K) and Diamonds.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Every piece of jewellery you buy from us comes with an <strong>IGI Certificate</strong> for diamonds and <strong>BIS Hallmark</strong> for gold, ensuring
            absolute purity and peace of mind. Experience the future of online jewellery shopping with insured delivery and lifetime exchange policies.
          </p>
        </div>
      </section>

    </div>
  );
}
