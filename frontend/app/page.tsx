import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { fetchAPI, normalizeImageUrl } from '@/lib/api';
import FlashSale from '@/components/FlashSale';
import InstagramFeed from '@/components/InstagramFeed';
import HeroSlider from '@/components/HeroSlider';
import CategoryCarousel from '@/components/CategoryCarousel';
import MotionGallery from '@/components/MotionGallery';
import ShopByCategory from '@/components/ShopByCategory';
import RecentlyViewed from '@/components/RecentlyViewed';
import ShopByPrice from '@/components/ShopByPrice';
import SparkbluePromise from '@/components/SparkbluePromise';
import SmartPlaceholder from '@/components/SmartPlaceholder';
import CreatorPromoWidget from '@/components/CreatorPromoWidget';
import InfluencerSpotlight from '@/components/InfluencerSpotlight';
import VideoShowcase from '@/components/VideoShowcase';
// Removed motion import to fix Server Component render error

export const revalidate = 60; // Revalidate every 60 seconds for fast CMS updates


// Fetch Featured Products
async function getFeaturedProducts() {
  try {
    return await fetchAPI('/products', { next: { revalidate: 60 } });
  } catch (error) {
    console.error("Failed to fetch products", error);
    return [];
  }
}

// Fetch Offers
async function getOffers() {
  try {
    return await fetchAPI('/offers', { next: { revalidate: 60 } });
  } catch (error) {
    console.error("Failed to fetch offers", error);
    return [];
  }
}

async function getBanners() {
  try {
    return await fetchAPI('/banners', { next: { revalidate: 60 } });
  } catch (e) {
    return [];
  }
}

async function getVideoReels() {
  try {
    return await fetchAPI('/video-showcase?bust=1', { next: { revalidate: 60 } });
  } catch (e) {
    return [];
  }
}

async function getHeroText() {
  try {
    const setting = await fetchAPI('/store/settings/homepage_hero_text', { next: { revalidate: 60 } });
    if (!setting?.value) return null;
    try {
      const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      return parsed && typeof parsed === 'object' ? parsed : null;
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
    return await fetchAPI('/reviews/featured', { next: { revalidate: 60 } });
  } catch (e) {
    return [];
  }
}

async function getSpotlight() {
  try {
    const res = await fetchAPI('/store/settings/spotlight', { next: { revalidate: 60 } });
    return res;
  } catch (e) {
    return null;
  }
}

async function getCategories() {
  try {
    return await fetchAPI('/categories', { next: { revalidate: 60 } });
  } catch (e) { return []; }
}

async function getPriceRanges() {
  try {
    return await fetchAPI('/marketing/price-ranges', { next: { revalidate: 60 } });
  } catch (e) { return []; }
}

async function getTags() {
  try {
    return await fetchAPI('/marketing/tags', { next: { revalidate: 60 } });
  } catch (e) { return []; }
}

async function getPromiseCards() {
  try {
    const setting = await fetchAPI('/store/settings/sparkblue_promise_cards', { next: { revalidate: 60 } });
    if (!setting?.value) return null;
    try {
      const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      return Array.isArray(parsed) ? parsed : null;
    } catch (parseError) {
      console.error("Failed to parse promise cards setting", parseError);
      return null;
    }
  } catch (e) {
    return null;
  }
}

async function getRoyalStandard() {
  try {
    const setting = await fetchAPI('/store/settings/home_royal_standard', { next: { revalidate: 60 } });
    if (!setting?.value) return null;
    try {
      return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch (e) { return null; }
  } catch (e) { return null; }
}

async function getBrandStory() {
  try {
    const setting = await fetchAPI('/store/settings/home_brand_story', { next: { revalidate: 60 } });
    if (!setting?.value) return null;
    try {
      return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch (e) { return null; }
  } catch (e) { return null; }
}

async function getAuraConfig() {
  try {
    const setting = await fetchAPI('/store/settings/aura_collection_config', { next: { revalidate: 60 } });
    if (!setting?.value) return null;
    try {
      return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    } catch (e) { return null; }
  } catch (e) { return null; }
}

export default async function Home() {
  // Concurrent Data Fetching for Performance
  const [
    allProducts,
    offers,
    banners,
    featuredReviews,
    spotlightSetting,
    heroText,
    categories,
    priceRanges,
    tags,
    promiseCards,
    royalStandardData,
    brandStoryData,
    videoReels,
    auraConfigData
  ] = await Promise.all([
    getFeaturedProducts(),
    getOffers(),
    getBanners(),
    getFeaturedReviews(),
    getSpotlight(),
    getHeroText(),
    getCategories(),
    getPriceRanges(),
    getTags(),
    getPromiseCards(),
    getRoyalStandard(),
    getBrandStory(),
    getVideoReels(),
    getAuraConfig()
  ]);

  // Defensive Guards
  const featuredProducts = Array.isArray(allProducts) ? allProducts.slice(0, 12) : [];
  const spotlight = spotlightSetting?.value?.isActive ? spotlightSetting.value : null;
  const heroTitle = heroText?.title ?? "Elegance is Eternal";
  const heroSubtitle = heroText?.subtitle ?? "Discover jewellery that transcends time. Certified purity, bespoke craftsmanship, and a legacy of trust since 2020.";
  
  const auraConfig = auraConfigData || {
    title: "SBD AURA: The Everyday Luxury",
    subtitle: "Discover delicate 9K gold masterpieces designed for the modern era.",
    isActive: true
  };
  const auraProducts = Array.isArray(allProducts) ? allProducts.filter((p: any) => p.isYouthTarget).slice(0, 4) : [];

  // Default CMS values
  const royalStandard = royalStandardData || {
    cards: [
      { title: "Certified Purity", desc: "Every nanogram of gold is BIS Hallmarked. Our diamonds come with IGI certification." },
      { title: "Skin-Safe Alchemy", desc: "Crafted with hypoallergenic alloys and free from nickel. 18K and 22K blends." },
      { title: "Conflict-Free Legacy", desc: "We source ethically. Conflict-free diamonds and responsibly mined gold." }
    ]
  };

  const brandStory = brandStoryData || {
    heading: "We believe that a diamond is more than a stone.",
    buttonText: "Read Our Legacy",
    buttonLink: "/about"
  };

  return (
    <div className="bg-brand-cream font-sans overflow-x-hidden">

      {/* 0. Floating Overlay Widgets */}
      <CreatorPromoWidget />

      {/* 1. Hero Section (Slider) */}
      <div className="relative">
        <div
          className="transition-all duration-700"
        >
          <HeroSlider banners={banners} heroText={{ title: heroTitle, subtitle: heroSubtitle, showText: heroText?.showText !== undefined ? heroText.showText : false }} />
        </div>
      </div>

      {/* 2. Flash Sale Component (Dynamic) */}
      <div
      >
        <FlashSale />
      </div>

      {/* 3. Royal Standards - The Science of Luxury */}
      <section className="py-20 md:py-32 bg-brand-navy border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="text-center mb-16"
          >
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block">Our Promise</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-4">The Royal Standard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            {(royalStandard.cards || []).map((item: any, idx: number) => (
              <div
                key={idx}
                className="group p-6 border border-white/5 hover:border-brand-gold/30 transition-colors duration-500 bg-white/5 backdrop-blur-sm"
              >
                <span className="text-4xl text-brand-gold mb-6 block font-serif">0{idx + 1}.</span>
                <h3 className="text-xl text-white font-serif mb-4">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5. Motion Gallery (3D Cover Flow) */}
      <MotionGallery />

      {/* 4. Category Discovery Carousels (Horizontal) */}
      {Array.isArray(categories) && categories.length > 0 && categories.map((cat: any) => {
        const catProducts = Array.isArray(allProducts)
          ? allProducts.filter((p: any) => {
              const pCat = (typeof p.category === 'string' ? p.category : p.category?.slug || '').toLowerCase();
              return pCat === cat.slug?.toLowerCase() || pCat === cat.name?.toLowerCase();
            })
          : [];
        if (catProducts.length === 0) return null;
        return (
          <div
            key={cat.id || cat.slug}
            className="mb-20 overflow-hidden"
          >
            <CategoryCarousel
              category={cat}
              products={catProducts.slice(0, 8)}
            />
          </div>
        );
      })}

      {/* 4.5 Shop By Category (Bento Box Style) */}
      <div className="mb-20">
        <ShopByCategory categories={categories} />
      </div>

      {/* 5. Shop by Price (New - Premium Redesign) */}
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div
            className="text-center mb-16"
          >
            <span className="text-brand-gold text-xs font-black uppercase tracking-[0.5em] mb-4 inline-block">Refined Budgeting</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy mt-4">Shop by Price</h2>
          </div>

          <div className="grid grid-cols-1">
            {Array.isArray(priceRanges) && priceRanges.length > 0 ? (
              <ShopByPrice priceRanges={priceRanges} />
            ) : (
              <div className="col-span-full">
                <SmartPlaceholder
                  label="Price Range Categories"
                  description="Define price segments (e.g., Under 25k, 50k - 1Lac) in the Marketing panel to categorize your collections."
                  width={1200}
                  height={300}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5.5. Video Showcase Carousel */}
      <VideoShowcase videos={videoReels || []} />

      {/* 6. Trending Tags */}
      <section
        className="py-12 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em]">Trending Now</span>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {Array.isArray(tags) && tags.map((tag: any, idx: number) => (
              <div
                key={tag.id || idx}
                className="group"
              >
                <Link href={`/shop?tag=${tag.slug}`} className="px-6 py-2 rounded-full border border-gray-200 text-brand-navy hover:bg-brand-navy hover:text-white transition-all text-sm uppercase tracking-widest">
                  #{tag.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SparkbluePromise cards={promiseCards as any} />

      {/* 5. New Arrivals */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div
            >
              <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block">Latest Drops</span>
              <h2 className="text-4xl font-serif text-brand-navy mt-4">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-brand-navy border-b border-brand-navy pb-1 text-sm font-bold uppercase tracking-widest transition-all hover:tracking-[0.2em]">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {Array.isArray(featuredProducts) && featuredProducts.map((p: any, idx: number) => (
              <div
                key={p.id || idx}
                className="h-full"
              >
                <ProductCard product={{ ...p, slug: p.slug || p.id, image: p.images?.[0] || '/placeholder.jpg' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.2 SBD AURA COLLECTION (YOUTH) SECTION */}
      {auraConfig.isActive && auraProducts.length > 0 && (
        <section className="py-24 bg-brand-gold/5 relative overflow-hidden">
          {/* Background Banners */}
          <div className="absolute inset-0 z-0">
            {auraConfig.bannerUrl && (
              <img 
                src={normalizeImageUrl(auraConfig.bannerUrl)} 
                alt="Aura Desktop Banner" 
                className="hidden md:block w-full h-full object-cover opacity-20"
              />
            )}
            {auraConfig.mobileBannerUrl && (
              <img 
                src={normalizeImageUrl(auraConfig.mobileBannerUrl)} 
                alt="Aura Mobile Banner" 
                className="md:hidden w-full h-full object-cover opacity-30"
              />
            )}
            {!auraConfig.bannerUrl && !auraConfig.mobileBannerUrl && (
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            )}
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <span className="text-brand-gold text-xs font-black uppercase tracking-[0.5em] mb-4 inline-block">Youth Series</span>
                <h2 className="text-4xl font-serif text-brand-navy mt-4">{auraConfig.title}</h2>
                <p className="text-gray-500 mt-4 leading-relaxed">{auraConfig.subtitle}</p>
              </div>
              <Link href="/aura" className="px-10 py-4 bg-brand-navy text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-gold hover:text-brand-navy transition-all duration-500 shadow-xl shadow-brand-navy/10">
                Explore The New Era
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {auraProducts.map((p: any) => (
                <div key={p.id} className="group h-full bg-white p-2 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-700">
                  <ProductCard product={{ ...p, slug: p.slug || p.id, image: p.images?.[0] || '/placeholder.jpg' }} />
                  <div className="mt-4 px-2 pb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-gold">Aura Series</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Royal Privileges (Dynamic Offers) */}
      <section className="py-20 bg-brand-navy relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div
            className="text-center mb-12"
          >
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] inline-block">Exclusive Benefits</span>
            <h2 className="text-3xl md:text-5xl font-serif text-white mt-4">Royal Privileges</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.isArray(offers) && offers.length > 0 ? offers.map((offer: any, idx: number) => (
              <div
                key={offer.id || idx}
              >
                <Link href={offer.link || '/shop'} className="block h-full group relative overflow-hidden border border-brand-gold/30 p-6 md:p-12 flex flex-col justify-center items-start bg-white/5 backdrop-blur-sm min-h-[220px] md:min-h-[300px]">
                  {/* Background Image Layer */}
                  {offer.imageUrl ? (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={normalizeImageUrl(offer.imageUrl)}
                        alt={offer.title}
                        fill
                        className="object-cover opacity-30 group-hover:opacity-50 transition-all duration-700 grayscale group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/30 mix-blend-multiply" />
                    </div>
                  ) : (
                    <SmartPlaceholder
                      label="Offer Banner"
                      width={800}
                      height={400}
                      description="Luxury aesthetics, jewelry lifestyle shot."
                      className="absolute inset-0 opacity-10"
                    />
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
                </Link>
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
            <span className="text-brand-navy/60 text-xs font-bold uppercase tracking-[0.3em] inline-block">Social Proof</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-navy mt-4">Voices of Royalty</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.isArray(featuredReviews) && featuredReviews.length > 0 ? featuredReviews.map((review: any, idx: number) => (
              <div
                key={review.id || idx}
                className="bg-brand-cream/30 p-8 rounded-2xl border border-brand-gold/5 relative group hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl"
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
              </div>
            )) : (
              <p className="text-brand-navy text-center col-span-3 opacity-50">Our patrons' words are being curated...</p>
            )}
          </div>
        </div>
      </section>

      {/* 8. Recently Viewed */}
      <RecentlyViewed />

      {/* 8.2 Influencer Spotlight (Option B) */}
      <InfluencerSpotlight />

      {/* 8.5 Instagram Feed */}
      <InstagramFeed />

      {/* 8. Brand Story */}
      <section
        className="py-24 md:py-32 bg-brand-navy text-white text-center"
      >
        <h2 className="text-3xl md:text-5xl font-serif mb-8 max-w-4xl mx-auto leading-tight">{brandStory.heading}</h2>
        <Link href={brandStory.buttonLink || "/about"} className="inline-block border border-brand-gold text-brand-gold px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold hover:text-brand-navy transition-all duration-500 rounded-none btn-gold-glow">
          {brandStory.buttonText || "Read Our Legacy"}
        </Link>
      </section>

    </div>
  );
}
