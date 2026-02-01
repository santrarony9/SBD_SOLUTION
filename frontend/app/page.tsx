import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { fetchAPI } from '@/lib/api';

// Fetch Featured Products
async function getFeaturedProducts() {
  try {
    return await fetchAPI('/products');
  } catch (error) {
    console.error("Failed to fetch products", error);
    return [];
  }
}

export default async function Home() {
  const products = await getFeaturedProducts();
  const featuredProducts = products.slice(0, 4); // Limit to 4 for the "Featured" section

  return (
    <div className="bg-brand-cream font-sans">
      {/* 1. Hero Section - Parallax Effect */}
      <section className="relative min-h-[100dvh] w-full overflow-hidden bg-brand-navy flex flex-col justify-center">
        {/* Background Image with Slow Parallax */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/hero-jewellery.png" // Ensure this image exists!
            alt="Royal Diamond Collection"
            fill
            priority
            className="object-cover animate-scale-in" // Add a subtle scale animation in globals
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/20 to-brand-navy/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 w-full max-w-5xl mx-auto">
          <h2 className="text-brand-gold font-serif italic text-lg md:text-2xl mb-4 tracking-widest animate-fade-in delay-100">
            Est. 1995
          </h2>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight animate-fade-in delay-200">
            Elegance is <br /> <span className="text-brand-gold italic">Eternal</span>
          </h1>
          <p className="text-gray-200 max-w-xl text-lg mb-12 font-light tracking-wide animate-fade-in delay-300">
            Discover jewellery that transcends time. Certified purity, bespoke craftsmanship, and a legacy of trust.
          </p>

          <div className="flex flex-col md:flex-row gap-6 animate-slide-up delay-500">
            <Link
              href="/shop"
              className="bg-brand-gold text-brand-navy px-10 py-4 uppercase tracking-[0.2em] font-bold text-xs hover:bg-white transition-colors duration-300 border border-brand-gold"
            >
              Shop Collection
            </Link>
            <Link
              href="/about"
              className="bg-transparent text-white px-10 py-4 uppercase tracking-[0.2em] font-bold text-xs hover:bg-white hover:text-brand-navy transition-colors duration-300 border border-white"
            >
              Our Legacy
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-white text-xs tracking-widest uppercase opacity-70">Scroll</span>
        </div>
      </section>

      {/* 2. Royal Standards - The Science of Luxury */}
      <section className="py-20 bg-brand-navy border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Our Promise</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-4">The Royal Standard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            {/* Standard 1 */}
            <div className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm">
              <span className="text-4xl text-brand-gold mb-6 block font-serif">01.</span>
              <h3 className="text-xl text-white font-serif mb-4">Certified Purity</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Every nanogram of gold is BIS Hallmarked. Our diamonds come with IGI certification, ensuring you own not just jewellery, but a verifiable asset of global standard.
              </p>
            </div>

            {/* Standard 2 */}
            <div className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm">
              <span className="text-4xl text-brand-gold mb-6 block font-serif">02.</span>
              <h3 className="text-xl text-white font-serif mb-4">Skin-Safe Alchemy</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Crafted with hypoallergenic alloys and free from nickel. Our 18K and 22K blends are scientifically balanced to respect even the most sensitive skin, allowing daily wear without compromise.
              </p>
            </div>

            {/* Standard 3 */}
            <div className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm">
              <span className="text-4xl text-brand-gold mb-6 block font-serif">03.</span>
              <h3 className="text-xl text-white font-serif mb-4">Conflict-Free Legacy</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                We source ethically. Our diamonds are conflict-free, and our gold is responsibly mined. Your luxury supports a sustainable future for the artisans and the earth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories - Grid Zoom */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">The Collection</span>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-navy mt-4">Curated Excellence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 lg:gap-8 auto-rows-[400px]">
          {/* Ring Category - Large */}
          <Link href="/shop?category=rings" className="group relative overflow-hidden md:col-span-2 bg-gray-100">
            <div className="absolute inset-0 bg-[url('/featured-1.png')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-serif italic mb-2">Solitaire Rings</h3>
              <span className="text-xs font-bold uppercase tracking-widest border-b border-brand-gold pb-1 group-hover:pl-2 transition-all">Explore</span>
            </div>
          </Link>

          {/* Necklace Category */}
          <Link href="/shop?category=necklaces" className="group relative overflow-hidden bg-gray-100">
            <div className="absolute inset-0 bg-[url('/featured-1.png')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" /> {/* Placeholder Image reuse */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-serif italic mb-2">Necklaces</h3>
              <span className="text-xs font-bold uppercase tracking-widest border-b border-brand-gold pb-1 group-hover:pl-2 transition-all">Explore</span>
            </div>
          </Link>

          {/* Earrings Category */}
          <Link href="/shop?category=earrings" className="group relative overflow-hidden bg-gray-100">
            <div className="absolute inset-0 bg-[url('/featured-1.png')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" /> {/* Placeholder Image reuse */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-serif italic mb-2">Earrings</h3>
              <span className="text-xs font-bold uppercase tracking-widest border-b border-brand-gold pb-1 group-hover:pl-2 transition-all">Explore</span>
            </div>
          </Link>

          {/* Bangles Category - Large */}
          <Link href="/shop?category=bangles" className="group relative overflow-hidden md:col-span-2 bg-gray-100">
            <div className="absolute inset-0 bg-[url('/featured-1.png')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" /> {/* Placeholder Image reuse */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-serif italic mb-2">Royal Bangles</h3>
              <span className="text-xs font-bold uppercase tracking-widest border-b border-brand-gold pb-1 group-hover:pl-2 transition-all">Explore</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. New Arrivals via ProductCard */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Latest Drops</span>
              <h2 className="text-4xl font-serif text-brand-navy mt-4">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-brand-navy border-b border-brand-navy pb-1 text-sm font-bold uppercase tracking-widest hover:text-brand-gold hover:border-brand-gold transition-colors">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.imageUrl,
                  slug: product.id, // Using ID as slug for now if slug missing
                  category: product.category,
                  images: product.images
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Voices of Royalty (Testimonials) */}
      <section className="py-24 bg-brand-cream border-t border-brand-charcoal/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand-navy/60 text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-brand-navy/20"></span>
              Social Proof
              <span className="h-px w-8 bg-brand-navy/20"></span>
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy mt-4">Voices of Royalty</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Priya S.", role: "Mumbai", text: "I always wished for such designs in real gold. Spark Blue made it possible. The finish is indistinguishable from my heritage pieces." },
              { name: "Anjali K.", role: "Bangalore", text: "The unboxing experience felt like receiving a royal decree. The heavy gold plating is exactly what I needed for daily office wear." },
              { name: "Meera R.", role: "Delhi", text: "Customer service treated me like a queen. They customized the ring size perfectly. My go-to for wedding season gifting now." }
            ].map((review, idx) => (
              <div key={idx} className="bg-white p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 relative group">
                <span className="absolute top-4 right-6 text-6xl text-brand-gold/20 font-serif leading-none group-hover:text-brand-gold/40 transition-colors">”</span>
                <p className="text-brand-charcoal text-sm leading-loose font-light mb-6 relative z-10 italic">
                  {review.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center text-brand-gold font-serif text-lg">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="text-brand-navy font-bold text-xs uppercase tracking-wider">{review.name}</h4>
                    <span className="text-brand-gold text-[10px] uppercase tracking-widest">{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Brand Story / Heritage Block */}
      <section className="py-24 bg-brand-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="block text-6xl text-brand-gold mb-6 font-serif">“</span>
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8">
            We believe that a diamond is not just a stone. It is a <span className="text-brand-gold italic">promise</span> kept forever.
          </h2>
          <p className="text-gray-400 font-light tracking-wide mb-10">
            — The Spark Blue Family
          </p>
          <Link
            href="/about"
            className="inline-block border border-brand-gold text-brand-gold px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold hover:text-brand-navy transition-colors"
          >
            Read Our Story
          </Link>
        </div>
      </section>
    </div>
  );
}
