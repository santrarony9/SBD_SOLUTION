import Hero from "@/components/Hero";
import FeaturedCollections from "@/components/FeaturedCollections";
import ProductCard from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/data/mock";

export default function Home() {
  return (
    <div className="bg-brand-cream">
      <Hero />

      <FeaturedCollections />

      {/* Trending Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h4 className="text-brand-gold text-xs tracking-[0.3em] uppercase mb-2">Selected for You</h4>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-navy">Trending Now</h2>
          </div>
          <a href="/shop" className="hidden md:block text-xs font-bold tracking-widest uppercase border-b border-brand-charcoal pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors">
            View All Products
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <a href="/shop" className="text-xs font-bold tracking-widest uppercase border-b border-brand-charcoal pb-1">
            View All Products
          </a>
        </div>
      </section>

      {/* Brand Promise / Trust Section */}
      <section className="py-20 bg-brand-navy text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="font-serif text-3xl md:text-5xl">The Spark Blue Promise</h2>
          <p className="font-light text-gray-300 leading-relaxed text-lg">
            Every diamond is hand-selected for its brilliance. Every piece is crafted with integrity.
            We promise 100% transparency with IGI certification and hallmark purity.
          </p>
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-brand-gold font-serif text-xl">100% Certified</div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Diamonds & Gold</p>
            </div>
            <div className="space-y-2">
              <div className="text-brand-gold font-serif text-xl">Lifetime Exchange</div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">On all jewellery</p>
            </div>
            <div className="space-y-2">
              <div className="text-brand-gold font-serif text-xl">Insured Shipping</div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Secure Delivery</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
