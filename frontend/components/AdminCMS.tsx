'use client';

import { useState, useEffect } from 'react';
import { PiImage, PiTag, PiTextT, PiTrash, PiPlus, PiCheck, PiX, PiSparkle, PiLayout, PiCards, PiGlobe } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function AdminCMS() {
    const [activeSection, setActiveSection] = useState<'banners' | 'offers' | 'text' | 'spotlight' | 'categories' | 'price' | 'tags' | 'social' | 'gallery' | 'royal-standard' | 'brand-story' | 'promise-cards' | 'footer-config'>('banners');
    const [banners, setBanners] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [heroText, setHeroText] = useState<{ title: string, subtitle: string, spotlightId?: string, showSpotlight?: boolean }>({ title: '', subtitle: '', spotlightId: '', showSpotlight: false });

    // Headless CMS States
    const [royalStandard, setRoyalStandard] = useState({
        cards: [
            { title: "Certified Purity", desc: "Every nanogram of gold is BIS Hallmarked." },
            { title: "Skin-Safe Alchemy", desc: "Crafted with hypoallergenic alloys." },
            { title: "Conflict-Free Legacy", desc: "We source ethically." }
        ]
    });
    const [brandStory, setBrandStory] = useState({
        heading: "We believe that a diamond is more than a stone.",
        buttonText: "Read Our Legacy",
        buttonLink: "/about"
    });
    const [promiseCards, setPromiseCards] = useState([
        { title: "FOR YOUR LOVE", image: "", link: "/shop?category=engagement-rings" },
        { title: "FOR HER", image: "", link: "/shop?category=necklaces" },
        { title: "FOR MOM", image: "", link: "/shop?category=earrings" },
        { title: "FOR ME", image: "", link: "/shop?category=bracelets" }
    ]);
    const [footerConfig, setFooterConfig] = useState({
        description: "Crafting timeless elegance since 2020. IGI certified excellence in every piece.",
        social: { instagram: "#", facebook: "#", youtube: "#", pinterest: "#" }
    });

    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Dynamic Data States
    const [categories, setCategories] = useState<any[]>([]);
    const [priceRanges, setPriceRanges] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [socialPosts, setSocialPosts] = useState<any[]>([]);
    const [galleryItems, setGalleryItems] = useState<any[]>([]);

    // Form States
    const [newBanner, setNewBanner] = useState({ imageUrl: '', mobileImageUrl: '', title: '', link: '' });
    const [isEditingBanner, setIsEditingBanner] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [newOffer, setNewOffer] = useState({ title: '', description: '', tag: '', code: '', imageUrl: '' });
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', imageUrl: '' });
    const [newPriceRange, setNewPriceRange] = useState({ label: '', minPrice: 0, maxPrice: 0, imageUrl: '' });
    const [newTag, setNewTag] = useState({ name: '', slug: '' });
    const [newSocialPost, setNewSocialPost] = useState({ imageUrl: '', caption: '', link: '' });
    const [newGalleryItem, setNewGalleryItem] = useState({ title: '', subtitle: '', imageUrl: '', link: '' });

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setIsLoading(true);
        try {
            const results = await Promise.allSettled([
                fetchAPI('/banners'),
                fetchAPI('/offers'),
                fetchAPI('/store/settings/homepage_hero_text'),
                fetchAPI('/categories'),
                fetchAPI('/marketing/price-ranges'),
                fetchAPI('/marketing/tags'),
                fetchAPI('/marketing/tags'), // Duplicate? Removing one of these isn't crucial right now but noting it.
                fetchAPI('/marketing/social-posts'),
                fetchAPI('/gallery'),
                fetchAPI('/store/settings/home_royal_standard'),
                fetchAPI('/store/settings/home_brand_story'),
                fetchAPI('/store/settings/sparkblue_promise_cards'),
                fetchAPI('/store/settings/footer_config')
            ]);

            const [bannersRes, offersRes, heroTextRes, categoriesRes, priceRangesRes, tagsRes, _dupTagsRes, socialPostsRes, galleryRes, royalStdRes, brandStoryRes, promiseCardsRes, footerConfigRes] = results;

            if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value || []);
            else showToast('Failed to load banners', 'error');

            if (offersRes.status === 'fulfilled') setOffers(offersRes.value || []);
            else showToast('Failed to load offers', 'error');

            if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value || []);
            else showToast('Failed to load categories', 'error');

            if (priceRangesRes.status === 'fulfilled') setPriceRanges(priceRangesRes.value || []);
            else showToast('Failed to load price ranges', 'error');

            if (tagsRes.status === 'fulfilled') setTags(tagsRes.value || []);
            else showToast('Failed to load tags', 'error');

            if (socialPostsRes.status === 'fulfilled') setSocialPosts(socialPostsRes.value || []);
            else showToast('Failed to load social posts', 'error');

            if (galleryRes.status === 'fulfilled') setGalleryItems(galleryRes.value || []);
            else showToast('Failed to load gallery items', 'error');

            if (heroTextRes.status === 'fulfilled') {
                const fetchedHeroText = heroTextRes.value;
                setHeroText(fetchedHeroText?.value ? (typeof fetchedHeroText.value === 'string' ? JSON.parse(fetchedHeroText.value) : fetchedHeroText.value) : { title: 'Elegance is Eternal', subtitle: 'Discover jewellery that transcends time.' });
            }

            // Parse Headless CMS Settings
            const parseSetting = (res: any, setter: React.Dispatch<React.SetStateAction<any>>, defaultVal: any) => {
                if (res.status === 'fulfilled' && res.value?.value) {
                    try {
                        const parsed = typeof res.value.value === 'string' ? JSON.parse(res.value.value) : res.value.value;
                        setter(parsed);
                    } catch (e) {
                        console.error("Failed to parse setting", e);
                    }
                }
            };
            parseSetting(royalStdRes, setRoyalStandard, royalStandard);
            parseSetting(brandStoryRes, setBrandStory, brandStory);
            parseSetting(promiseCardsRes, setPromiseCards, promiseCards);
            parseSetting(footerConfigRes, setFooterConfig, footerConfig);

            // Fetch Spotlight separately (fail silently if missing)
            try {
                const spotlightSetting = await fetchAPI('/store/settings/spotlight');
                if (spotlightSetting?.value) {
                    const spotlight = spotlightSetting.value;
                    setHeroText(prev => ({
                        ...prev,
                        spotlightId: spotlight.productId || '',
                        showSpotlight: spotlight.isActive || false
                    }));
                }
            } catch (err) {
                console.warn('Spotlight settings not found or failed to load');
            }

        } catch (error) {
            console.error("Critical failure in loadContent", error);
            showToast('Partial content load failure - check console', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Banner Actions ---
    const handleAddBanner = async () => {
        if (!newBanner.imageUrl) return showToast('Image URL is required', 'error');
        try {
            if (isEditingBanner && editingBannerId) {
                await fetchAPI(`/banners/${editingBannerId}`, { method: 'PUT', body: JSON.stringify(newBanner) });
                showToast('Banner Updated', 'success');
            } else {
                await fetchAPI('/banners', { method: 'POST', body: JSON.stringify(newBanner) });
                showToast('Banner Added', 'success');
            }
            setNewBanner({ imageUrl: '', mobileImageUrl: '', title: '', link: '' });
            setIsEditingBanner(false);
            setEditingBannerId(null);
            loadContent();
        } catch (e) { showToast(isEditingBanner ? 'Failed to update banner' : 'Failed to add banner', 'error'); }
    };

    const handleEditBanner = (banner: any) => {
        setNewBanner({
            imageUrl: banner.imageUrl || '',
            mobileImageUrl: banner.mobileImageUrl || '',
            title: banner.title || '',
            link: banner.link || ''
        });
        setEditingBannerId(banner.id);
        setIsEditingBanner(true);
        setActiveSection('banners');
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewBanner({ imageUrl: '', mobileImageUrl: '', title: '', link: '' });
        setIsEditingBanner(false);
        setEditingBannerId(null);
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        try {
            await fetchAPI(`/banners/${id}`, { method: 'DELETE' });
            showToast('Banner Deleted', 'success');
            loadContent();
        } catch (e) { showToast('Failed to delete banner', 'error'); }
    };

    // --- Offer Actions ---
    const handleAddOffer = async () => {
        if (!newOffer.title) return showToast('Title is required', 'error');
        try {
            await fetchAPI('/offers', { method: 'POST', body: JSON.stringify(newOffer) });
            showToast('Offer Added', 'success');
            setNewOffer({ title: '', description: '', tag: '', code: '', imageUrl: '' });
            loadContent();
        } catch (e) { showToast('Failed to add offer', 'error'); }
    };

    const handleDeleteOffer = async (id: string) => {
        if (!confirm('Delete this offer?')) return;
        try {
            await fetchAPI(`/offers/${id}`, { method: 'DELETE' });
            showToast('Offer Deleted', 'success');
            loadContent();
        } catch (e) { showToast('Failed to delete offer', 'error'); }
    };

    // --- Category Actions ---
    const handleAddCategory = async () => {
        if (!newCategory.name) return showToast('Name is required', 'error');
        try {
            await fetchAPI('/categories', { method: 'POST', body: JSON.stringify(newCategory) });
            showToast('Category Added', 'success');
            setNewCategory({ name: '', slug: '', imageUrl: '' });
            loadContent();
        } catch (e) { showToast('Failed to add category', 'error'); }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
            showToast('Category Deleted', 'success');
            loadContent();
        } catch (e) { showToast('Failed to delete category', 'error'); }
    };

    // --- Price Range Actions ---
    const handleAddPriceRange = async () => {
        if (!newPriceRange.label) return showToast('Label is required', 'error');
        try {
            await fetchAPI('/marketing/price-ranges', { method: 'POST', body: JSON.stringify(newPriceRange) });
            showToast('Price Range Added', 'success');
            setNewPriceRange({ label: '', minPrice: 0, maxPrice: 0, imageUrl: '' });
            loadContent();
        } catch (e) { showToast('Failed to add price range', 'error'); }
    };

    const handleDeletePriceRange = async (id: string) => {
        if (!confirm('Delete this price range?')) return;
        try {
            await fetchAPI(`/marketing/price-ranges/${id}`, { method: 'DELETE' });
            showToast('Price Range Deleted', 'success');
            loadContent();
        } catch (e) { showToast('Failed to delete price range', 'error'); }
    };

    // --- Tag Actions ---
    const handleAddTag = async () => {
        if (!newTag.name) return showToast('Name is required', 'error');
        try {
            await fetchAPI('/marketing/tags', { method: 'POST', body: JSON.stringify(newTag) });
            showToast('Tag Added', 'success');
            setNewTag({ name: '', slug: '' });
            loadContent();
        } catch (e) { showToast('Failed to add tag', 'error'); }
    };

    const handleDeleteTag = async (id: string) => {
        if (!confirm('Delete this tag?')) return;
        try {
            await fetchAPI(`/marketing/tags/${id}`, { method: 'DELETE' });
            showToast('Tag Deleted', 'success');
            loadContent();
        } catch (e) { showToast('Failed to delete tag', 'error'); }
    };

    // --- Social Post Actions ---
    const handleAddSocialPost = async () => {
        if (!newSocialPost.imageUrl) return showToast('Image URL is required', 'error');
        try {
            await fetchAPI('/marketing/social-posts', { method: 'POST', body: JSON.stringify(newSocialPost) });
            showToast('Post Added', 'success');
            setNewSocialPost({ imageUrl: '', caption: '', link: '' });
            loadContent();
        } catch (e) { showToast('Failed to add post', 'error'); }
    };

    const handleDeleteSocialPost = async (id: string) => {
        if (!confirm('Delete this post?')) return;
        try {
            await fetchAPI(`/marketing/social-posts/${id}`, { method: 'DELETE' });
            showToast('Post Deleted', 'success');
            loadContent();
        } catch (e) { showToast('Failed to delete post', 'error'); }
    };

    // --- Gallery Actions ---
    const handleAddGalleryItem = async () => {
        if (!newGalleryItem.imageUrl) return showToast('Image URL is required', 'error');
        try {
            await fetchAPI('/gallery', { method: 'POST', body: JSON.stringify(newGalleryItem) });
            showToast('Gallery Item Added', 'success');
            setNewGalleryItem({ title: '', subtitle: '', imageUrl: '', link: '' });
            loadContent();
        } catch (e) { showToast('Failed to add gallery item', 'error'); }
    };

    const handleDeleteGalleryItem = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        try {
            await fetchAPI(`/gallery/${id}`, { method: 'DELETE' });
            showToast('Item Deleted', 'success');
            loadContent();
        } catch (e) { showToast('Failed to delete item', 'error'); }
    };

    // --- Text Actions ---
    const handleUpdateText = async () => {
        try {
            // Only save title and subtitle for hero text
            const textData = { title: heroText.title, subtitle: heroText.subtitle };
            await fetchAPI('/store/settings', {
                method: 'POST',
                body: JSON.stringify({ key: 'homepage_hero_text', value: JSON.stringify(textData) })
            });
            showToast('Hero Text Updated', 'success');
        } catch (e) { showToast('Failed to update text', 'error'); }
    };

    const handleUpdateSpotlight = async () => {
        try {
            const spotlightData = {
                isActive: heroText.showSpotlight,
                productId: heroText.spotlightId,
                // Add title/subtitle if needed by frontend, but page.tsx doesn't seem to use them for spotlight yet
            };

            await fetchAPI('/store/settings', {
                method: 'POST',
                body: JSON.stringify({ key: 'spotlight', value: spotlightData })
            });
            showToast('Spotlight Config Updated', 'success');
        } catch (e) { showToast('Failed to update spotlight', 'error'); }
    };

    // --- Headless CMS Updates ---
    const handleUpdateCMS = async (key: string, value: any, successMsg: string) => {
        try {
            await fetchAPI('/store/settings', {
                method: 'POST',
                body: JSON.stringify({ key, value: JSON.stringify(value) })
            });
            showToast(successMsg, 'success');
        } catch (e) {
            showToast('Failed to update settings', 'error');
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start animate-fade-in min-h-[600px]">

            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="md:hidden fixed bottom-6 right-6 z-50 bg-brand-navy text-white p-4 rounded-full shadow-2xl border border-brand-gold/20 flex items-center gap-2"
            >
                <PiLayout className="text-xl" />
                <span className="text-[10px] uppercase font-black tracking-widest">UI MENU</span>
            </button>

            {/* Sidebar Navigation */}
            <aside className={`w-full md:w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1 md:sticky md:top-8 transition-all duration-300 ${isMobileNavOpen ? 'block' : 'hidden md:block'}`}>
                <div className="flex justify-between items-center px-4 py-4 mb-2 border-b border-gray-50">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-gold">Home UI Sections</h3>
                    <button onClick={() => setIsMobileNavOpen(false)} className="md:hidden text-gray-400 hover:text-brand-navy">
                        <PiX size={16} />
                    </button>
                </div>

                {/* Group 1: Billboard */}
                <div className="px-4 py-2 mt-2">
                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">01 Billboard</span>
                </div>
                {[
                    { id: 'banners', label: 'Slider Banners', icon: PiImage },
                    { id: 'gallery', label: 'Motion Gallery', icon: PiImage },
                    { id: 'text', label: 'Brand Narratives', icon: PiTextT },
                    { id: 'spotlight', label: 'Master Spotlight', icon: PiSparkle },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveSection(item.id as any);
                            setIsMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSection === item.id
                            ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-brand-navy'
                            }`}
                    >
                        <item.icon className={`text-base ${activeSection === item.id ? 'text-brand-gold' : ''}`} />
                        {item.label}
                    </button>
                ))}

                {/* Group 2: Highlights */}
                <div className="px-4 py-2 mt-4">
                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">02 Highlights</span>
                </div>
                {[
                    { id: 'offers', label: 'Royal Privileges', icon: PiTag },
                    { id: 'categories', label: 'Product Discovery', icon: PiTag },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSection === item.id
                            ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-brand-navy'
                            }`}
                    >
                        <item.icon className={`text-base ${activeSection === item.id ? 'text-brand-gold' : ''}`} />
                        {item.label}
                    </button>
                ))}

                {/* Group 3: Engagement */}
                <div className="px-4 py-2 mt-4">
                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">03 Engagement</span>
                </div>
                {[
                    { id: 'social', label: 'Social Moments', icon: PiImage },
                    { id: 'price', label: 'Price Curations', icon: PiTag },
                    { id: 'tags', label: 'Trend Tags', icon: PiTag },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveSection(item.id as any);
                            setIsMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSection === item.id
                            ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-brand-navy'
                            }`}
                    >
                        <item.icon className={`text-base ${activeSection === item.id ? 'text-brand-gold' : ''}`} />
                        {item.label}
                    </button>
                ))}

                {/* Group 4: Static Features */}
                <div className="px-4 py-2 mt-4">
                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">04 Static Features</span>
                </div>
                {[
                    { id: 'royal-standard', label: 'Royal Standard', icon: PiCards },
                    { id: 'brand-story', label: 'Brand Story', icon: PiTextT },
                    { id: 'promise-cards', label: 'Promise Cards', icon: PiCards },
                    { id: 'footer-config', label: 'Footer Info', icon: PiGlobe },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveSection(item.id as any);
                            setIsMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSection === item.id
                            ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-brand-navy'
                            }`}
                    >
                        <item.icon className={`text-base ${activeSection === item.id ? 'text-brand-gold' : ''}`} />
                        {item.label}
                    </button>
                ))}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
                        <h2 className="text-2xl font-serif text-brand-navy flex items-center gap-3">
                            <span className="p-2 bg-brand-gold/10 rounded-xl"><PiLayout className="text-brand-gold text-xl" /></span>
                            {activeSection.replace('-', ' ')}
                        </h2>
                        {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-gold" />}
                    </div>

                    {/* CATEGORIES SECTION */}
                    {activeSection === 'categories' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Add New Category
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Category Image</label>
                                            <span className="text-[9px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                                                Rec: 600x600px
                                            </span>
                                        </div>

                                        {!newCategory.imageUrl ? (
                                            <label className="relative block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-gold hover:bg-gray-50 transition-all">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            showToast('Uploading...', 'success');
                                                            fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                                .then(res => {
                                                                    setNewCategory(prev => ({ ...prev, imageUrl: res.url }));
                                                                    showToast('Image Uploaded', 'success');
                                                                })
                                                                .catch(() => showToast('Upload Failed', 'error'));
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <PiImage className="text-2xl mb-1" />
                                                    <span className="text-[9px] font-bold">CLICK TO UPLOAD</span>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="relative group w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                <img src={newCategory.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setNewCategory(prev => ({ ...prev, imageUrl: '' }))}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <PiX />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4 md:col-span-2">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Category Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Diamond Rings"
                                                value={newCategory.name}
                                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Slug (Auto-generated)</label>
                                            <input
                                                type="text"
                                                value={newCategory.slug}
                                                readOnly
                                                className="w-full border-b border-gray-200 py-2 text-sm text-gray-400 outline-none bg-transparent font-mono"
                                            />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={handleAddCategory}
                                                className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                            >
                                                Add Category
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                {categories.map(cat => (
                                    <div key={cat.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                            <p className="text-white text-sm font-serif font-bold">{cat.name}</p>
                                            <p className="text-brand-gold text-[9px] font-mono tracking-widest mb-3">{cat.slug}</p>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="bg-white/10 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-colors border border-white/20 self-end">
                                                <PiTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">No categories defined</div>}
                            </div>
                        </div>
                    )}

                    {/* BANNERS SECTION */}
                    {activeSection === 'banners' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {isEditingBanner ? <PiLayout className="text-brand-gold" /> : <PiPlus className="text-brand-gold" />}
                                        {isEditingBanner ? 'Edit Banner' : 'Add New Banner'}
                                    </div>
                                    {isEditingBanner && (
                                        <button onClick={handleCancelEdit} className="text-[10px] text-gray-500 hover:text-red-500 font-bold uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm transition-all">
                                            Cancel Editing
                                        </button>
                                    )}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Desktop Image */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Desktop Banner</label>
                                            <span className="text-[9px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                                                Rec: 1920x1080px
                                            </span>
                                        </div>

                                        {!newBanner.imageUrl ? (
                                            <label className={`relative block w-full h-40 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${isUploading ? 'border-brand-gold bg-brand-gold/5 animate-pulse' : 'border-gray-200 hover:border-brand-navy hover:bg-white'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 7 * 1024 * 1024) {
                                                                showToast('File is too large! Max 7MB allowed.', 'error');
                                                                return;
                                                            }
                                                            setIsUploading(true);
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            showToast('Uploading Desktop...', 'success');
                                                            fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                                .then(res => setNewBanner(prev => ({ ...prev, imageUrl: res.url })))
                                                                .catch(() => showToast('Failed to upload', 'error'))
                                                                .finally(() => setIsUploading(false));
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <PiImage className="text-2xl mb-1" />
                                                    <span className="text-[10px] font-bold">SELECT DESKTOP IMAGE</span>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="relative group h-40 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                                                <img src={newBanner.imageUrl} alt="Desktop Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => setNewBanner(prev => ({ ...prev, imageUrl: '' }))} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"><PiTrash /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Image */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Mobile Banner</label>
                                            <span className="text-[9px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                                                Rec: 1080x1350px (Portrait)
                                            </span>
                                        </div>

                                        {!newBanner.mobileImageUrl ? (
                                            <label className={`relative block w-full h-40 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${isUploading ? 'border-brand-gold bg-brand-gold/5 animate-pulse' : 'border-gray-200 hover:border-brand-navy hover:bg-white'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 7 * 1024 * 1024) {
                                                                showToast('File is too large! Max 7MB allowed.', 'error');
                                                                return;
                                                            }
                                                            setIsUploading(true);
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            showToast('Uploading Mobile...', 'success');
                                                            fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                                .then(res => setNewBanner(prev => ({ ...prev, mobileImageUrl: res.url })))
                                                                .catch(() => showToast('Failed to upload', 'error'))
                                                                .finally(() => setIsUploading(false));
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <PiImage className="text-2xl mb-1" />
                                                    <span className="text-[10px] font-bold">SELECT MOBILE IMAGE</span>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="relative group h-40 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                                                <img src={newBanner.mobileImageUrl} alt="Mobile Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => setNewBanner(prev => ({ ...prev, mobileImageUrl: '' }))} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"><PiTrash /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Banner Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Royal Wedding Collection"
                                            value={newBanner.title}
                                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                            className="w-full border-b border-gray-100 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors font-serif italic"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Destination URL</label>
                                        <input
                                            type="text"
                                            placeholder="/shop/weddings"
                                            value={newBanner.link}
                                            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                                            className="w-full border-b border-gray-100 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-4">
                                    {isEditingBanner && (
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] text-gray-500 hover:bg-gray-100 transition-all border border-gray-100"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleAddBanner}
                                        className="bg-brand-navy text-white px-10 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-xl shadow-brand-navy/20 flex items-center gap-2"
                                    >
                                        <PiCheck className="text-brand-gold text-lg" />
                                        {isEditingBanner ? 'Update Master Banner' : 'Publish New Banner'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {banners.map(banner => (
                                    <div key={banner.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-brand-navy/10 transition-all duration-700">
                                        <div className="relative aspect-[16/9] overflow-hidden">
                                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            {banner.mobileImageUrl && (
                                                <div className="absolute top-4 right-4 bg-brand-gold text-brand-navy px-3 py-1 rounded-full text-[9px] font-black tracking-widest shadow-lg flex items-center gap-1.5">
                                                    <PiLayout size={12} /> DUAL SIZE READY
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex justify-between items-center bg-white border-t border-gray-50">
                                            <div className="space-y-1">
                                                <p className="text-brand-navy font-serif font-bold text-lg leading-tight">{banner.title || 'Untitled Banner'}</p>
                                                <p className="text-gray-400 text-[10px] uppercase tracking-widest">{banner.link || 'No destination link'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditBanner(banner)}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-brand-navy hover:text-white transition-all border border-gray-100"
                                                    title="Edit Banner"
                                                >
                                                    <PiLayout size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBanner(banner.id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-red-50 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/10"
                                                    title="Delete Banner"
                                                >
                                                    <PiTrash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {banners.length === 0 && (
                                    <div className="md:col-span-2 py-32 text-center border-3 border-dashed border-gray-100 rounded-[3rem]">
                                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <PiImage className="text-4xl text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 font-serif italic text-lg">Your billboard is currently empty.</p>
                                        <p className="text-gray-300 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Publish your first collection banner above</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* GALLERY SECTION */}
                    {activeSection === 'gallery' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Add Motion Gallery Item
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Image / Video Source</label>
                                            <span className="text-[9px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                                                Rec: 1080x1350px (Portrait)
                                            </span>
                                        </div>

                                        {!newGalleryItem.imageUrl ? (
                                            <label className="relative block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-gold hover:bg-gray-50 transition-all">
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 10 * 1024 * 1024) {
                                                                showToast('File is too large! Max 10MB allowed.', 'error');
                                                                return;
                                                            }
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            showToast('Uploading...', 'success');
                                                            fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                                .then(res => {
                                                                    setNewGalleryItem(prev => ({ ...prev, imageUrl: res.url }));
                                                                    showToast('Media Uploaded', 'success');
                                                                })
                                                                .catch(() => showToast('Upload Failed', 'error'));
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <PiImage className="text-2xl mb-1" />
                                                    <span className="text-[9px] font-bold">CLICK TO UPLOAD</span>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="relative group w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                {newGalleryItem.imageUrl.match(/\.(mp4|webm)$/i) ? (
                                                    <video src={newGalleryItem.imageUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                                ) : (
                                                    <img src={newGalleryItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                )}
                                                <button
                                                    onClick={() => setNewGalleryItem(prev => ({ ...prev, imageUrl: '' }))}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <PiX />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Title / Heading</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Summer Vibes"
                                                value={newGalleryItem.title}
                                                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Subtitle</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. New Collection"
                                                value={newGalleryItem.subtitle}
                                                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, subtitle: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Link URL</label>
                                            <input
                                                type="text"
                                                placeholder="/shop/summer"
                                                value={newGalleryItem.link}
                                                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, link: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleAddGalleryItem}
                                                className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10 w-full"
                                            >
                                                Add Item
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {galleryItems.map(item => (
                                    <div key={item.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                        {item.imageUrl?.match(/\.(mp4|webm)$/i) ? (
                                            <video src={item.imageUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                                        ) : (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                            <p className="text-white text-sm font-serif">{item.title}</p>
                                            <p className="text-brand-gold text-[9px] uppercase tracking-widest mb-3">{item.subtitle}</p>
                                            <button onClick={() => handleDeleteGalleryItem(item.id)} className="bg-white/10 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-colors border border-white/20 self-end">
                                                <PiTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {galleryItems.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">No gallery items (Motion Gallery is hidden)</div>}
                            </div>
                        </div>
                    )}

                    {/* OFFERS SECTION */}
                    {activeSection === 'offers' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Create New Offer
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Offer Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Valentine Special"
                                                value={newOffer.title}
                                                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Short Description</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Get 20% off on all rings"
                                                value={newOffer.description}
                                                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Tag / Badge</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. LIMITED TIME"
                                                value={newOffer.tag}
                                                onChange={(e) => setNewOffer({ ...newOffer, tag: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Coupon Code (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. LOVE20"
                                                value={newOffer.code}
                                                onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                                                className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                    </div>
                                    {/* Image Upload for Offer */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Offer Background (Optional)</label>
                                            <span className="text-[9px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                                                Rec: 800x600px
                                            </span>
                                        </div>
                                        {!newOffer.imageUrl ? (
                                            <label className="relative block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-gold hover:bg-gray-50 transition-all">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 5 * 1024 * 1024) {
                                                                showToast('File is too large! Max 5MB allowed.', 'error');
                                                                return;
                                                            }
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            showToast('Uploading...', 'success');
                                                            fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                                .then(res => {
                                                                    setNewOffer(prev => ({ ...prev, imageUrl: res.url }));
                                                                    showToast('Image Uploaded', 'success');
                                                                })
                                                                .catch(() => showToast('Upload Failed', 'error'));
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <PiImage className="text-2xl mb-1" />
                                                    <span className="text-[9px] font-bold">CLICK TO UPLOAD</span>
                                                </div>
                                            </label>
                                        ) : (
                                            <div className="relative group w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                <img src={newOffer.imageUrl} alt="Offer Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setNewOffer(prev => ({ ...prev, imageUrl: '' }))}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <PiX />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleAddOffer}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Add Offer
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {offers.map(offer => (
                                    <div key={offer.id} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-gold/30 transition-all overflow-hidden group">

                                        {offer.imageUrl && (
                                            <div className="absolute inset-0 z-0">
                                                <img src={offer.imageUrl} alt="" className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
                                            </div>
                                        )}

                                        <div className="relative z-10 p-6 flex justify-between items-center">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-brand-gold/10 p-3 rounded-full text-brand-gold mt-1 group-hover:scale-110 transition-transform">
                                                    <PiTag />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-serif text-brand-navy text-lg">{offer.title}</h4>
                                                        <span className="bg-brand-gold text-[8px] text-white px-2 py-0.5 rounded-full font-black tracking-widest uppercase">{offer.tag}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm max-w-md">{offer.description}</p>
                                                    {offer.code && <div className="mt-2 text-[10px] font-mono text-brand-gold ring-1 ring-brand-gold/30 inline-block px-2 py-0.5 rounded bg-brand-gold/5 uppercase tracking-tighter">Code: {offer.code}</div>}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteOffer(offer.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                                                <PiTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {offers.length === 0 && <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">No active offers</div>}
                            </div>
                        </div>
                    )}

                    {/* CATEGORIES SECTION */}
                    {activeSection === 'categories' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Add Category
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Category Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Diamond Necklaces"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">URL Slug</label>
                                        <input
                                            type="text"
                                            placeholder="necklaces"
                                            value={newCategory.slug}
                                            onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Discovery Cover</label>
                                            <span className="text-[8px] text-brand-gold font-bold">RECOM: 800x1200px</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        showToast('File is too large! Max 5MB allowed.', 'error');
                                                        return;
                                                    }
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                        .then(res => setNewCategory({ ...newCategory, imageUrl: res.url }))
                                                        .catch(() => showToast('Upload Failed', 'error'));
                                                }
                                            }}
                                            className="w-full text-[10px] text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-gray-100 file:text-brand-navy hover:file:bg-brand-gold hover:file:text-white transition-all cursor-pointer"
                                        />
                                        {newCategory.imageUrl && <p className="text-[8px] text-green-600 font-bold truncate tracking-tighter">✓ Image Linked: {newCategory.imageUrl.split('/').pop()}</p>}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleAddCategory}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Add Category
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map(cat => (
                                    <div key={cat.id} className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-50">
                                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-serif text-brand-navy truncate leading-tight">{cat.name}</h4>
                                            <p className="text-[10px] text-gray-600 font-mono tracking-tighter truncate">{cat.slug}</p>
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2">
                                            <PiTrash />
                                        </button>
                                    </div>
                                ))}
                                {categories.length === 0 && <div className="md:col-span-2 lg:col-span-3 py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 text-sm italic">No categories found</div>}
                            </div>
                        </div>
                    )}

                    {/* PRICE RANGES SECTION */}
                    {activeSection === 'price' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Add Price Filter
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Label</label>
                                        <input
                                            type="text"
                                            placeholder="Under 50k"
                                            value={newPriceRange.label}
                                            onChange={(e) => setNewPriceRange({ ...newPriceRange, label: e.target.value })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Min Price (₹)</label>
                                        <input
                                            type="number"
                                            value={newPriceRange.minPrice || ''}
                                            onChange={(e) => setNewPriceRange({ ...newPriceRange, minPrice: Number(e.target.value) })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Max Price (₹)</label>
                                        <input
                                            type="number"
                                            value={newPriceRange.maxPrice || ''}
                                            onChange={(e) => setNewPriceRange({ ...newPriceRange, maxPrice: Number(e.target.value) })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Category Image URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={newPriceRange.imageUrl}
                                            onChange={(e) => setNewPriceRange({ ...newPriceRange, imageUrl: e.target.value })}
                                            className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleAddPriceRange}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Add Range
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {priceRanges.map(range => (
                                    <div key={range.id} className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-lg transition-all">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                            <img src={range.imageUrl} alt={range.label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-serif text-brand-navy text-lg leading-tight mb-1">{range.label}</h4>
                                            <div className="text-brand-gold font-mono text-xs flex items-center gap-2">
                                                <span>₹{formatPrice(range.minPrice)}</span>
                                                <span className="text-gray-300">→</span>
                                                <span>{range.maxPrice ? `₹${formatPrice(range.maxPrice)}` : 'Unlimited'}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeletePriceRange(range.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2">
                                            <PiTrash />
                                        </button>
                                    </div>
                                ))}
                                {priceRanges.length === 0 && <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">No price ranges defined</div>}
                            </div>
                        </div>
                    )}

                    {/* TAGS SECTION */}
                    {activeSection === 'tags' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 max-w-xl">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Define New Tag
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Tag Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Best Seller"
                                            value={newTag.name}
                                            onChange={(e) => setNewTag({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                            className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end items-center gap-4">
                                    <p className="text-[10px] text-gray-600 font-mono italic">Slug: {newTag.slug}</p>
                                    <button
                                        onClick={handleAddTag}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Add Tag
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {tags.map(tag => (
                                    <div key={tag.id} className="group bg-white pl-4 pr-2 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-3 hover:border-brand-gold/30 hover:shadow-md transition-all">
                                        <span className="text-sm font-medium text-brand-navy">{tag.name}</span>
                                        <button onClick={() => handleDeleteTag(tag.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                                            <PiX />
                                        </button>
                                    </div>
                                ))}
                                {tags.length === 0 && <div className="w-full py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">No tags defined</div>}
                            </div>
                        </div>
                    )}

                    {/* SOCIAL WALL SECTION */}
                    {activeSection === 'social' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Add Social Moment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Post Image URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://instagram.com/p/..."
                                            value={newSocialPost.imageUrl}
                                            onChange={(e) => setNewSocialPost({ ...newSocialPost, imageUrl: e.target.value })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Reference Link</label>
                                        <input
                                            type="text"
                                            placeholder="Optional Link"
                                            value={newSocialPost.link}
                                            onChange={(e) => setNewSocialPost({ ...newSocialPost, link: e.target.value })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Caption / User</label>
                                        <input
                                            type="text"
                                            placeholder="@sparkblue"
                                            value={newSocialPost.caption}
                                            onChange={(e) => setNewSocialPost({ ...newSocialPost, caption: e.target.value })}
                                            className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleAddSocialPost}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Add Post
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {socialPosts.map(post => (
                                    <div key={post.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                        <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                            <p className="text-white text-[10px] font-bold mb-3 truncate">{post.caption}</p>
                                            <button onClick={() => handleDeleteSocialPost(post.id)} className="bg-white/10 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-colors border border-white/20 self-end">
                                                <PiTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {socialPosts.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">No social posts curated</div>}
                            </div>
                        </div>
                    )}

                    {/* TEXT SECTION */}
                    {activeSection === 'text' && (
                        <div className="space-y-10 max-w-3xl">
                            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <PiTextT className="text-brand-gold" /> Brand Messaging
                                </h3>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Main Billboard Heading</label>
                                        <input
                                            type="text"
                                            value={heroText.title}
                                            onChange={(e) => setHeroText({ ...heroText, title: e.target.value })}
                                            className="w-full border-b border-gray-200 py-3 text-2xl font-serif text-brand-navy outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            placeholder="e.g. Elegance in Every Facet"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Supporting Narrative</label>
                                        <textarea
                                            value={heroText.subtitle}
                                            onChange={(e) => setHeroText({ ...heroText, subtitle: e.target.value })}
                                            className="w-full border-b border-gray-200 py-3 text-sm text-gray-600 outline-none focus:border-brand-gold bg-transparent transition-colors h-32 resize-none"
                                            placeholder="A few sentences about your brand story..."
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleUpdateText}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Update Hero Narrative
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SPOTLIGHT SECTION */}
                    {activeSection === 'spotlight' && (
                        <div className="space-y-10 max-w-2xl">
                            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <PiSparkle className="text-brand-gold" /> Featured Product Spotlight
                                </h3>
                                <p className="text-xs text-gray-600 mb-8 leading-relaxed">Choose one masterpiece to showcase in the high-visibility spotlight section on your homepage.</p>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Product SKU / ID</label>
                                        <input
                                            type="text"
                                            value={heroText.spotlightId || ''}
                                            onChange={(e) => setHeroText({ ...heroText, spotlightId: e.target.value })}
                                            placeholder="e.g. DIA-RING-001"
                                            className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors font-mono tracking-wider"
                                        />
                                        <p className="text-[9px] text-gray-600 font-bold">Use the ID found in your Product Collection list.</p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-gray-100">
                                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                                            <input
                                                type="checkbox"
                                                id="toggle"
                                                checked={heroText.showSpotlight || false}
                                                onChange={(e) => setHeroText({ ...heroText, showSpotlight: e.target.checked })}
                                                className="opacity-0 w-0 h-0 peer"
                                            />
                                            <label
                                                htmlFor="toggle"
                                                className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-200 transition duration-400 rounded-full peer-checked:bg-brand-gold"
                                            ></label>
                                            <span className="absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition duration-400 peer-checked:translate-x-6"></span>
                                        </div>
                                        <label htmlFor="toggle" className="text-sm font-bold text-brand-navy cursor-pointer">Activate Spotlight on Homepage</label>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleUpdateSpotlight}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Update Spotlight
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ROYAL STANDARD SECTION */}
                    {activeSection === 'royal-standard' && (
                        <div className="space-y-10 max-w-4xl">
                            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <PiCards className="text-brand-gold" /> The Royal Standard
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {royalStandard.cards.map((card, idx) => (
                                        <div key={idx} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="text-brand-gold font-serif text-2xl">0{idx + 1}.</div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Title</label>
                                                <input
                                                    type="text"
                                                    value={card.title}
                                                    onChange={(e) => {
                                                        const newCards = [...royalStandard.cards];
                                                        newCards[idx].title = e.target.value;
                                                        setRoyalStandard({ cards: newCards });
                                                    }}
                                                    className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors font-bold text-brand-navy"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Description</label>
                                                <textarea
                                                    value={card.desc}
                                                    onChange={(e) => {
                                                        const newCards = [...royalStandard.cards];
                                                        newCards[idx].desc = e.target.value;
                                                        setRoyalStandard({ cards: newCards });
                                                    }}
                                                    className="w-full border-b border-gray-200 py-2 text-sm text-gray-600 outline-none focus:border-brand-gold bg-transparent transition-colors resize-none h-24"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => handleUpdateCMS('home_royal_standard', royalStandard, 'Royal Standard Updated')}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BRAND STORY SECTION */}
                    {activeSection === 'brand-story' && (
                        <div className="space-y-10 max-w-3xl">
                            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <PiTextT className="text-brand-gold" /> Brand Story Settings
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Main Heading</label>
                                        <textarea
                                            value={brandStory.heading}
                                            onChange={(e) => setBrandStory({ ...brandStory, heading: e.target.value })}
                                            className="w-full border-b border-gray-200 py-3 text-2xl font-serif text-brand-navy outline-none focus:border-brand-gold bg-transparent transition-colors resize-none h-24"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Button Text</label>
                                            <input
                                                type="text"
                                                value={brandStory.buttonText}
                                                onChange={(e) => setBrandStory({ ...brandStory, buttonText: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Button Link</label>
                                            <input
                                                type="text"
                                                value={brandStory.buttonLink}
                                                onChange={(e) => setBrandStory({ ...brandStory, buttonLink: e.target.value })}
                                                className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => handleUpdateCMS('home_brand_story', brandStory, 'Brand Story Updated')}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROMISE CARDS SECTION */}
                    {activeSection === 'promise-cards' && (
                        <div className="space-y-10 max-w-5xl">
                            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <PiCards className="text-brand-gold" /> Sparkblue Promise Cards
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {promiseCards.map((card, idx) => (
                                        <div key={idx} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Card Title</label>
                                                <input
                                                    type="text"
                                                    value={card.title}
                                                    onChange={(e) => {
                                                        const newCards = [...promiseCards];
                                                        newCards[idx].title = e.target.value;
                                                        setPromiseCards(newCards);
                                                    }}
                                                    className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors font-bold text-brand-navy uppercase text-center"
                                                    placeholder={`Card ${idx + 1}`}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Image / Video URL</label>
                                                <input
                                                    type="text"
                                                    value={card.image}
                                                    onChange={(e) => {
                                                        const newCards = [...promiseCards];
                                                        newCards[idx].image = e.target.value;
                                                        setPromiseCards(newCards);
                                                    }}
                                                    className="w-full border-b border-gray-200 py-2 text-[10px] outline-none focus:border-brand-gold bg-transparent transition-colors"
                                                    placeholder="/path/to/image.png"
                                                />
                                                <div className="mt-2 text-center">
                                                    <span className="text-[9px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">
                                                        Rec: 800x1200px (Portrait)
                                                    </span>
                                                </div>
                                                <label className="mt-2 block w-full border border-dashed border-gray-300 rounded p-2 text-center cursor-pointer hover:border-brand-gold transition-all text-[9px] font-bold text-gray-500 uppercase">
                                                    <input
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                showToast(`Uploading Card ${idx + 1}...`, 'success');
                                                                fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                                    .then(res => {
                                                                        const newCards = [...promiseCards];
                                                                        newCards[idx].image = res.url;
                                                                        setPromiseCards(newCards);
                                                                        showToast(`Card ${idx + 1} Uploaded`, 'success');
                                                                    })
                                                                    .catch(() => showToast('Upload Failed', 'error'));
                                                            }
                                                        }}
                                                    />
                                                    Quick Upload
                                                </label>
                                                {card.image && (
                                                    <div className="mt-2 aspect-[3/4.5] w-full bg-gray-50 rounded border border-gray-200 overflow-hidden relative group">
                                                        {card.image.match(/\.(mp4|webm)$/i) ? (
                                                            <video src={card.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                        ) : (
                                                            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                const newCards = [...promiseCards];
                                                                newCards[idx].image = '';
                                                                setPromiseCards(newCards);
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <PiX size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Link</label>
                                                <input
                                                    type="text"
                                                    value={card.link}
                                                    onChange={(e) => {
                                                        const newCards = [...promiseCards];
                                                        newCards[idx].link = e.target.value;
                                                        setPromiseCards(newCards);
                                                    }}
                                                    className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors text-center"
                                                    placeholder="/shop?category=..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => handleUpdateCMS('sparkblue_promise_cards', promiseCards, 'Promise Cards Updated')}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FOOTER CONFIG SECTION */}
                    {activeSection === 'footer-config' && (
                        <div className="space-y-10 max-w-3xl">
                            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <PiGlobe className="text-brand-gold" /> Footer Settings
                                </h3>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Footer Brand Description</label>
                                        <textarea
                                            value={footerConfig.description}
                                            onChange={(e) => setFooterConfig({ ...footerConfig, description: e.target.value })}
                                            className="w-full border-b border-gray-200 py-3 text-sm text-gray-600 outline-none focus:border-brand-gold bg-transparent transition-colors resize-none h-20"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="text-[10px] uppercase font-black text-brand-navy tracking-widest mb-4">Social Media Links</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {['instagram', 'facebook', 'youtube', 'pinterest'].map((platform) => (
                                                <div key={platform} className="space-y-2">
                                                    <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider capitalize">{platform} URL</label>
                                                    <input
                                                        type="text"
                                                        value={(footerConfig.social as any)[platform]}
                                                        onChange={(e) => setFooterConfig({
                                                            ...footerConfig,
                                                            social: { ...footerConfig.social, [platform]: e.target.value }
                                                        })}
                                                        className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => handleUpdateCMS('footer_config', footerConfig, 'Footer Updated')}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
