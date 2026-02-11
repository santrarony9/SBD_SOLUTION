import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { fetchAPI } from '@/lib/api';
import FlashSale from '@/components/FlashSale';
import InstagramFeed from '@/components/InstagramFeed';

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
    return setting?.value ? JSON.parse(setting.value) : null;
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

  const featuredProducts = allProducts.slice(0, 4);
  const spotlight = spotlightSetting?.value?.isActive ? spotlightSetting.value : null;
  const activeBanner = banners.find((b: any) => b.isActive) || banners[0] || {
    imageUrl: '/hero-jewellery.png',
    title: 'Est. 1995',
    link: '/shop'
  };

  const heroTitle = heroText?.title || "Elegance is Eternal";
  const heroSubtitle = heroText?.subtitle || "Discover jewellery that transcends time. Certified purity, bespoke craftsmanship, and a legacy of trust since 1995.";

  return (
    <div className="bg-brand-cream font-sans overflow-x-hidden">

      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Slow Parallax */}
        <div className="absolute inset-0 z-0 h-full w-full select-none">
          <Image
            src={activeBanner.imageUrl}
            alt={activeBanner.title || "Royal Diamond Collection"}
            fill
            priority
            className="object-cover animate-scale-slow"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Sophisticated Gradient - Darker at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/10 to-brand-navy/80 mix-blend-multiply" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 w-full max-w-6xl mx-auto">

          <h2 className="text-brand-gold/90 font-serif italic text-lg md:text-2xl mb-6 tracking-[0.3em] animate-fade-in-up delay-200 uppercase font-medium">
            {activeBanner.title}
          </h2>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight tracking-tight animate-fade-in-up delay-300 drop-shadow-lg">
            {heroTitle.includes('Eternal') ? (
              <>
                {heroTitle.split('Eternal')[0]}
                <span className="text-brand-gold italic pr-2">Eternal</span>
                {heroTitle.split('Eternal')[1]}
              </>
            ) : (
              heroTitle
            )}
          </h1>

          <p className="text-gray-200 max-w-2xl text-lg md:text-xl mb-12 font-light tracking-wide leading-relaxed animate-fade-in-up delay-500 drop-shadow-md">
            {heroSubtitle}
          </p>

          <div className="flex flex-col md:flex-row gap-8 animate-fade-in-up delay-700">
            <Link
              href={activeBanner.link || "/shop"}
              className="bg-white text-brand-navy px-12 py-4 uppercase tracking-[0.25em] font-bold text-xs hover:bg-brand-gold hover:text-white transition-all duration-500 ease-out shadow-lg hover:shadow-brand-gold/20"
            >
              Shop Collection
            </Link>
            <Link
              href="/about"
              className="bg-transparent text-white px-12 py-4 uppercase tracking-[0.25em] font-bold text-xs hover:bg-white/10 transition-colors duration-500 border border-white/30 hover:border-white"
            >
              Our Heritage
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce-slow opacity-0 animate-fade-in delay-1000">
          <span className="text-white/60 text-[10px] tracking-[0.4em] uppercase">Explore</span>
        </div>
      </section>

      {/* 2. Flash Sale Component (Dynamic) */}
      <FlashSale />

      {/* 3. Royal Standards - The Science of Luxury */}
      <section className="py-20 bg-brand-navy border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Our Promise</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-4">The Royal Standard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm">
              <span className="text-4xl text-brand-gold mb-6 block font-serif">01.</span>
              <h3 className="text-xl text-white font-serif mb-4">Certified Purity</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Every nanogram of gold is BIS Hallmarked. Our diamonds come with IGI certification.
              </p>
            </div>
            <div className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm">
              <span className="text-4xl text-brand-gold mb-6 block font-serif">02.</span>
              <h3 className="text-xl text-white font-serif mb-4">Skin-Safe Alchemy</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Crafted with hypoallergenic alloys and free from nickel. 18K and 22K blends.
              </p>
            </div>
            <div className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm">
              <span className="text-4xl text-brand-gold mb-6 block font-serif">03.</span>
              <h3 className="text-xl text-white font-serif mb-4">Conflict-Free Legacy</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                We source ethically. Conflict-free diamonds and responsibly mined gold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dynamic Categories */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">The Collection</span>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-navy mt-4">Curated Excellence</h2>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="group relative overflow-hidden bg-gray-100 aspect-square md:aspect-auto md:h-[400px]">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url(${cat.imageUrl || '/featured-1.png'})` }} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-serif italic mb-2">{cat.name}</h3>
                  <span className="text-xs font-bold uppercase tracking-widest border-b border-brand-gold pb-1">Explore</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">Categories not configured.</div>
        )}
      </section>

      {/* 5. Shop by Price (New) */}
      <section className="py-16 bg-brand-cream border-t border-b border-brand-gold/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-serif text-brand-navy mb-8 text-center">Shop by Price</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {priceRanges && priceRanges.map((range: any) => (
              <Link key={range.id} href={`/shop?minPrice=${range.minPrice}&maxPrice=${range.maxPrice || ''}`} className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-brand-gold min-w-[200px] text-center">
                <span className="block text-2xl font-serif text-brand-navy mb-2 group-hover:text-brand-gold transition-colors">{range.label}</span>
                {range.imageUrl && <img src={range.imageUrl} alt={range.label} className="w-12 h-12 object-contain mx-auto opacity-50 group-hover:opacity-100 transition-opacity" />}
              </Link>
            ))}
            {(!priceRanges || priceRanges.length === 0) && <p className="text-gray-400">Price ranges not configured.</p>}
          </div>
        </div>
      </section>

      {/* 5. Trending Tags (New) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Trending Now</span>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {tags && tags.map((tag: any) => (
              <Link key={tag.id} href={`/shop?tag=${tag.slug}`} className="px-6 py-2 rounded-full border border-gray-200 text-brand-navy hover:bg-brand-navy hover:text-white transition-all text-sm uppercase tracking-widest">
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. New Arrivals */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Latest Drops</span>
              <h2 className="text-4xl font-serif text-brand-navy mt-4">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-brand-navy border-b border-brand-navy pb-1 text-sm font-bold uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p: any) => (
              <ProductCard key={p.id} product={{ ...p, slug: p.slug || p.id, image: p.imageUrl }} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Royal Privileges (Dynamic Offers) */}
      <section className="py-20 bg-brand-navy relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Exclusive Benefits</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white mt-4">Royal Privileges</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.length > 0 ? offers.map((offer: any, idx: number) => (
              <div key={offer.id} className="relative group overflow-hidden border border-brand-gold/30 p-8 md:p-12 flex flex-col justify-center items-start bg-white/5 backdrop-blur-sm">
                <span className="bg-brand-gold text-brand-navy text-[10px] font-bold uppercase px-3 py-1 tracking-widest mb-6">{offer.tag || "Special"}</span>
                <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">{offer.title}</h3>
                <p className="text-gray-300 font-light mb-8 max-w-sm">{offer.description}</p>
                {offer.code && (
                  <div className="border border-dashed border-gray-500 px-4 py-2 text-gray-400 font-mono text-xs tracking-widest">
                    CODE: <span className="text-white font-bold">{offer.code}</span>
                  </div>
                )}
              </div>
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
            <span className="text-brand-navy/60 text-xs font-bold uppercase tracking-[0.3em]">Social Proof</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy mt-4">Voices of Royalty</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredReviews.length > 0 ? featuredReviews.map((review: any) => (
              <div key={review.id} className="bg-white p-8 shadow-sm relative group">
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
              </div>
            )) : (
              <p className="text-brand-navy text-center col-span-3 opacity-50">Our patrons' words are being curated...</p>
            )}
          </div>
        </div>
      </section>

      {/* 8. Instagram Feed */}
      <InstagramFeed />

      {/* 8. Brand Story */}
      <section className="py-24 bg-brand-navy text-white text-center">
        <h2 className="text-3xl md:text-5xl font-serif mb-8">We believe that a diamond is more than a stone.</h2>
        <Link href="/about" className="inline-block border border-brand-gold text-brand-gold px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold hover:text-brand-navy transition-colors">
          Read Our Legacy
        </Link>
      </section>

    </div>
  );
}
