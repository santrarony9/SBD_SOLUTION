import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { fetchAPI } from '@/lib/api';
import FlashSale from '@/components/FlashSale';
import InstagramFeed from '@/components/InstagramFeed';
import HeroSlider from '@/components/HeroSlider';
import CategoryCarousel from '@/components/CategoryCarousel';
import MotionGallery from '@/components/MotionGallery';
import ShopByCategory from '@/components/ShopByCategory';
import RecentlyViewed from '@/components/RecentlyViewed';
import GiftFinder from '@/components/GiftFinder';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

// Fetch Featured Products
async function getFeaturedProducts() {
  try {
    return await fetchAPI('/products');
  } catch (error) {
    console.error("Failed to fetch products", error);
    return [];
  }
}

// Fetch Offers
async function getOffers() {
  try {
    return await fetchAPI('/offers');
  } catch (error) {
    console.error("Failed to fetch offers", error);
    return [];
  }
}

async function getBanners() {
  try {
    return await fetchAPI('/banners');
  } catch (e) {
    return [];
  }
}

async function getHeroText() {
  try {
    const setting = await fetchAPI('/store/settings/homepage_hero_text');
    if (!setting?.value) return null;
    try {
      return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch (parseError) {
      console.error("Failed to parse hero text setting", parseError);
      return null;
    }
  } catch (e) {
    return null;
  }
}

async function getFeaturedReviews() {
  try {
    return await fetchAPI('/reviews/featured');
  } catch (e) {
    return [];
  }
}

async function getSpotlight() {
  try {
    return await fetchAPI('/store/settings/spotlight');
  } catch (e) {
    return null;
  }
}

async function getCategories() {
  try {
    return await fetchAPI('/categories');
  } catch (e) { return []; }
}

async function getPriceRanges() {
  try {
    return await fetchAPI('/marketing/price-ranges');
  } catch (e) { return []; }
}

async function getTags() {
  try {
    return await fetchAPI('/marketing/tags');
  } catch (e) { return []; }
}

export default async function Home() {
  const allProducts = await getFeaturedProducts();
  const offers = await getOffers();
  const banners = await getBanners();
  const featuredReviews = await getFeaturedReviews();
  const spotlightSetting = await getSpotlight();
  const heroText = await getHeroText();

  // Dynamic Data
  const categories = await getCategories();
  const priceRanges = await getPriceRanges();
  const tags = await getTags();

  // Defensive Guards
  const featuredProducts = Array.isArray(allProducts) ? allProducts.slice(0, 12) : [];
  const spotlight = spotlightSetting?.value?.isActive ? spotlightSetting.value : null;
  const heroTitle = heroText?.title ?? "Elegance is Eternal";
  const heroSubtitle = heroText?.subtitle ?? "Discover jewellery that transcends time. Certified purity, bespoke craftsmanship, and a legacy of trust since 1995.";

  return (
    <div className="bg-brand-cream font-sans overflow-x-hidden">

      {/* 1. Hero Section (Slider) */}
      <HeroSlider banners={banners} heroText={{ title: heroTitle, subtitle: heroSubtitle }} />

      {/* 1.5 Shop By Category (Palmanos Style) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <ShopByCategory categories={categories} />
      </motion.div>

      {/* 2. Flash Sale Component (Dynamic) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <FlashSale />
      </motion.div>

      {/* 3. Royal Standards - The Science of Luxury */}
      <section className="py-20 bg-brand-navy border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block">Our Promise</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-4">The Royal Standard</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            {[
              { id: "01.", title: "Certified Purity", desc: "Every nanogram of gold is BIS Hallmarked. Our diamonds come with IGI certification." },
              { id: "02.", title: "Skin-Safe Alchemy", desc: "Crafted with hypoallergenic alloys and free from nickel. 18K and 22K blends." },
              { id: "03.", title: "Conflict-Free Legacy", desc: "We source ethically. Conflict-free diamonds and responsibly mined gold." }
            ].map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm"
              >
                <span className="text-4xl text-brand-gold mb-6 block font-serif">{item.id}</span>
                <h3 className="text-xl text-white font-serif mb-4">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5. Motion Gallery (3D Cover Flow) */}
      <MotionGallery />

      {/* 4. Category Discovery Carousels (Horizontal) */}
      {Array.isArray(categories) && categories.length > 0 && categories.map((cat: any) => {
        const catProducts = Array.isArray(allProducts)
          ? allProducts.filter((p: any) => p.category === cat.slug || p.category?.slug === cat.slug)
          : [];
        if (catProducts.length === 0) return null;
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <CategoryCarousel
              category={cat}
              products={catProducts.slice(0, 8)}
            />
          </motion.div>
        );
      })}

      {/* 5. Shop by Price (New - Premium Redesign) */}
      <section className="py-20 bg-brand-cream/30 border-t border-brand-gold/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">Curated Collections</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy">Shop by Price</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.isArray(priceRanges) && priceRanges.map((range: any, idx: number) => (
              <motion.div
                key={range.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/shop?minPrice=${range.minPrice}&maxPrice=${range.maxPrice || ''}`} className="group relative bg-white p-6 rounded-none border border-brand-gold/20 hover:border-brand-gold transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_4px_20px_-5px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
                  {/* Hover Background */}
                  <div className="absolute inset-0 bg-brand-navy opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out-expo z-0"></div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center transition-transform duration-500 group-hover:scale-105">
                    <span className="block text-xl md:text-2xl font-serif text-brand-navy group-hover:text-white transition-colors duration-500 mb-1 leading-tight">
                      {range.label.replace(' - ', ' \u2014 ')}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-100">View Collection</span>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trending Tags */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Trending Now</span>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {Array.isArray(tags) && tags.map((tag: any, idx: number) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/shop?tag=${tag.slug}`} className="px-6 py-2 rounded-full border border-gray-200 text-brand-navy hover:bg-brand-navy hover:text-white transition-all text-sm uppercase tracking-widest">
                  #{tag.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 5.5. AI Gift Finder - Personalization */}
      <section id="gift-finder" className="py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-gold rounded-full blur-[120px] -ml-64 -mb-64"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block mb-4">Personalized Discovery</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white">Find the Perfect Gift</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto font-light">Answer 4 quick questions and let our AI Stylist curate a selection tailored to your needs.</p>
          </motion.div>

          <GiftFinder />
        </div>
      </section>

      {/* 5. New Arrivals */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block">Latest Drops</span>
              <h2 className="text-4xl font-serif text-brand-navy mt-4">New Arrivals</h2>
            </motion.div>
            <Link href="/shop" className="text-brand-navy border-b border-brand-navy pb-1 text-sm font-bold uppercase tracking-widest transition-all hover:tracking-[0.2em]">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.isArray(featuredProducts) && featuredProducts.map((p: any, idx: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard product={{ ...p, slug: p.slug || p.id, image: p.images?.[0] || p.imageUrl }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Royal Privileges (Dynamic Offers) */}
      <section className="py-20 bg-brand-navy relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block">Exclusive Benefits</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white mt-4">Royal Privileges</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.isArray(offers) && offers.length > 0 ? offers.map((offer: any, idx: number) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative group overflow-hidden border border-brand-gold/30 p-8 md:p-12 flex flex-col justify-center items-start bg-white/5 backdrop-blur-sm min-h-[300px]"
              >
                {/* Background Image Layer */}
                {offer.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={offer.imageUrl}
                      alt={offer.title}
                      fill
                      className="object-cover opacity-30 group-hover:opacity-50 transition-all duration-700 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/30 mix-blend-multiply" />
                  </div>
                )}

                <div className="relative z-10 w-full text-balance">
                  <span className="bg-brand-gold text-brand-navy text-[10px] font-bold uppercase px-3 py-1 tracking-widest mb-6 inline-block">{offer.tag || "Special"}</span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 drop-shadow-md">{offer.title}</h3>
                  <p className="text-gray-200 font-light mb-8 max-w-sm drop-shadow">{offer.description}</p>
                  {offer.code && (
                    <div className="border border-dashed border-gray-400 px-4 py-2 text-gray-300 font-mono text-xs tracking-widest bg-brand-navy/40 backdrop-blur-md inline-block">
                      CODE: <span className="text-white font-bold">{offer.code}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )) : (
              <p className="text-white text-center col-span-2 opacity-50">No exclusive privileges active today.</p>
            )}
          </div>
        </div>
      </section>

      {/* 7. Voices of Royalty (Featured Reviews) */}
      <section className="py-24 bg-brand-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand-navy/60 text-xs font-bold uppercase tracking-[0.3em] inline-block">Social Proof</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy mt-4">Voices of Royalty</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.isArray(featuredReviews) && featuredReviews.length > 0 ? featuredReviews.map((review: any, idx: number) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 shadow-sm relative group"
              >
                <span className="absolute top-4 right-6 text-6xl text-brand-gold/20 font-serif">”</span>
                <p className="text-brand-charcoal text-sm leading-loose font-light mb-6 italic">{review.comment}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center text-brand-gold font-serif">
                    {review.user?.name[0]}
                  </div>
                  <div>
                    <h4 className="text-brand-navy font-bold text-xs uppercase">{review.user?.name}</h4>
                    <span className="text-brand-gold text-[10px] uppercase">{review.product?.name}</span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-brand-navy text-center col-span-3 opacity-50">Our patrons' words are being curated...</p>
            )}
          </div>
        </div>
      </section>

      {/* 8. Recently Viewed */}
      <RecentlyViewed />

      {/* 8.5 Instagram Feed */}
      <InstagramFeed />

      {/* 8. Brand Story */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 bg-brand-navy text-white text-center"
      >
        <h2 className="text-3xl md:text-5xl font-serif mb-8">We believe that a diamond is more than a stone.</h2>
        <Link href="/about" className="inline-block border border-brand-gold text-brand-gold px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold hover:text-brand-navy transition-all duration-500 rounded-none btn-gold-glow">
          Read Our Legacy
        </Link>
      </motion.section>

    </div>
  );
}
