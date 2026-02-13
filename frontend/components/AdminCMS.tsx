'use client';

import { useState, useEffect } from 'react';
import { PiImage, PiTag, PiTextT, PiTrash, PiPlus, PiCheck, PiX, PiSparkle, PiLayout } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminCMS() {
    const [activeSection, setActiveSection] = useState<'banners' | 'offers' | 'text' | 'spotlight' | 'categories' | 'price' | 'tags' | 'social'>('banners');
    const [banners, setBanners] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [heroText, setHeroText] = useState<{ title: string, subtitle: string, spotlightId?: string, showSpotlight?: boolean }>({ title: '', subtitle: '', spotlightId: '', showSpotlight: false });
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Dynamic Data States
    const [categories, setCategories] = useState<any[]>([]);
    const [priceRanges, setPriceRanges] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [socialPosts, setSocialPosts] = useState<any[]>([]);

    // Form States
    const [newBanner, setNewBanner] = useState({ imageUrl: '', title: '', link: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [newOffer, setNewOffer] = useState({ title: '', description: '', tag: '', code: '' });
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', imageUrl: '' });
    const [newPriceRange, setNewPriceRange] = useState({ label: '', minPrice: 0, maxPrice: 0, imageUrl: '' });
    const [newTag, setNewTag] = useState({ name: '', slug: '' });
    const [newSocialPost, setNewSocialPost] = useState({ imageUrl: '', caption: '', link: '' });

    useEffect(() => {
        loadContent();
    }, []);

    const showStatus = (message: string, type: 'success' | 'error') => {
        setStatus({ message, type });
        setTimeout(() => setStatus(null), 3000);
    };

    const loadContent = async () => {
        setIsLoading(true);
        try {
            const [fetchedBanners, fetchedOffers, fetchedHeroText, fetchedCategories, fetchedPriceRanges, fetchedTags, fetchedSocialPosts] = await Promise.all([
                fetchAPI('/banners'),
                fetchAPI('/offers'),
                fetchAPI('/store/settings/homepage_hero_text'),
                fetchAPI('/categories'),
                fetchAPI('/marketing/price-ranges'),
                fetchAPI('/marketing/tags'),
                fetchAPI('/marketing/social-posts')
            ]);
            setBanners(fetchedBanners || []);
            setOffers(fetchedOffers || []);
            setCategories(fetchedCategories || []);
            setPriceRanges(fetchedPriceRanges || []);
            setTags(fetchedTags || []);
            setSocialPosts(fetchedSocialPosts || []);
            setHeroText(fetchedHeroText?.value ? JSON.parse(fetchedHeroText.value) : { title: 'Elegance is Eternal', subtitle: 'Discover jewellery that transcends time.' });

            // Fetch Spotlight separately
            const spotlightSetting = await fetchAPI('/store/settings/spotlight');
            if (spotlightSetting?.value) {
                const spotlight = spotlightSetting.value; // It's already parsed object from API if verified above
                setHeroText(prev => ({
                    ...prev,
                    spotlightId: spotlight.productId || '',
                    showSpotlight: spotlight.isActive || false
                }));
            }
        } catch (error) {
            console.error("Failed to load content", error);
            showStatus('Failed to load content', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Banner Actions ---
    const handleAddBanner = async () => {
        if (!newBanner.imageUrl) return showStatus('Image URL is required', 'error');
        try {
            await fetchAPI('/banners', { method: 'POST', body: JSON.stringify(newBanner) });
            showStatus('Banner Added', 'success');
            setNewBanner({ imageUrl: '', title: '', link: '' });
            loadContent();
        } catch (e) { showStatus('Failed to add banner', 'error'); }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
        try {
            await fetchAPI(`/banners/${id}`, { method: 'DELETE' });
            showStatus('Banner Deleted', 'success');
            loadContent();
        } catch (e) { showStatus('Failed to delete banner', 'error'); }
    };

    // --- Offer Actions ---
    const handleAddOffer = async () => {
        if (!newOffer.title) return showStatus('Title is required', 'error');
        try {
            await fetchAPI('/offers', { method: 'POST', body: JSON.stringify(newOffer) });
            showStatus('Offer Added', 'success');
            setNewOffer({ title: '', description: '', tag: '', code: '' });
            loadContent();
        } catch (e) { showStatus('Failed to add offer', 'error'); }
    };

    const handleDeleteOffer = async (id: string) => {
        if (!confirm('Delete this offer?')) return;
        try {
            await fetchAPI(`/offers/${id}`, { method: 'DELETE' });
            showStatus('Offer Deleted', 'success');
            loadContent();
        } catch (e) { showStatus('Failed to delete offer', 'error'); }
    };

    // --- Category Actions ---
    const handleAddCategory = async () => {
        if (!newCategory.name) return showStatus('Name is required', 'error');
        try {
            await fetchAPI('/categories', { method: 'POST', body: JSON.stringify(newCategory) });
            showStatus('Category Added', 'success');
            setNewCategory({ name: '', slug: '', imageUrl: '' });
            loadContent();
        } catch (e) { showStatus('Failed to add category', 'error'); }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
            showStatus('Category Deleted', 'success');
            loadContent();
        } catch (e) { showStatus('Failed to delete category', 'error'); }
    };

    // --- Price Range Actions ---
    const handleAddPriceRange = async () => {
        if (!newPriceRange.label) return showStatus('Label is required', 'error');
        try {
            await fetchAPI('/marketing/price-ranges', { method: 'POST', body: JSON.stringify(newPriceRange) });
            showStatus('Price Range Added', 'success');
            setNewPriceRange({ label: '', minPrice: 0, maxPrice: 0, imageUrl: '' });
            loadContent();
        } catch (e) { showStatus('Failed to add price range', 'error'); }
    };

    const handleDeletePriceRange = async (id: string) => {
        if (!confirm('Delete this price range?')) return;
        try {
            await fetchAPI(`/marketing/price-ranges/${id}`, { method: 'DELETE' });
            showStatus('Price Range Deleted', 'success');
            loadContent();
        } catch (e) { showStatus('Failed to delete price range', 'error'); }
    };

    // --- Tag Actions ---
    const handleAddTag = async () => {
        if (!newTag.name) return showStatus('Name is required', 'error');
        try {
            await fetchAPI('/marketing/tags', { method: 'POST', body: JSON.stringify(newTag) });
            showStatus('Tag Added', 'success');
            setNewTag({ name: '', slug: '' });
            loadContent();
        } catch (e) { showStatus('Failed to add tag', 'error'); }
    };

    const handleDeleteTag = async (id: string) => {
        if (!confirm('Delete this tag?')) return;
        try {
            await fetchAPI(`/marketing/tags/${id}`, { method: 'DELETE' });
            showStatus('Tag Deleted', 'success');
            loadContent();
        } catch (e) { showStatus('Failed to delete tag', 'error'); }
    };

    // --- Social Post Actions ---
    const handleAddSocialPost = async () => {
        if (!newSocialPost.imageUrl) return showStatus('Image URL is required', 'error');
        try {
            await fetchAPI('/marketing/social-posts', { method: 'POST', body: JSON.stringify(newSocialPost) });
            showStatus('Post Added', 'success');
            setNewSocialPost({ imageUrl: '', caption: '', link: '' });
            loadContent();
        } catch (e) { showStatus('Failed to add post', 'error'); }
    };

    const handleDeleteSocialPost = async (id: string) => {
        if (!confirm('Delete this post?')) return;
        try {
            await fetchAPI(`/marketing/social-posts/${id}`, { method: 'DELETE' });
            showStatus('Post Deleted', 'success');
            loadContent();
        } catch (e) { showStatus('Failed to delete post', 'error'); }
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
            showStatus('Hero Text Updated', 'success');
        } catch (e) { showStatus('Failed to update text', 'error'); }
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
            showStatus('Spotlight Config Updated', 'success');
        } catch (e) { showStatus('Failed to update spotlight', 'error'); }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start animate-fade-in min-h-[600px]">
            {/* Status Notification */}
            {status && (
                <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded shadow-2xl border flex items-center gap-3 transition-all transform animate-slide-up ${status.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-sm font-bold tracking-wide">{status.message}</span>
                </div>
            )}

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-8">
                <div className="px-4 py-4 mb-2 border-b border-gray-50">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-gold">Home UI Sections</h3>
                </div>

                {/* Group 1: Billboard */}
                <div className="px-4 py-2 mt-2">
                    <span className="text-[9px] uppercase font-black text-gray-400 tracking-widest">01 Billboard</span>
                </div>
                {[
                    { id: 'banners', label: 'Slider Banners', icon: PiImage },
                    { id: 'text', label: 'Brand Narratives', icon: PiTextT },
                    { id: 'spotlight', label: 'Master Spotlight', icon: PiSparkle },
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

                    {/* BANNERS SECTION */}
                    {activeSection === 'banners' && (
                        <div className="space-y-10">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Add New Banner
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Image Source</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        alert('File is too large! Max 5MB allowed.');
                                                        return;
                                                    }
                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    // Show uploading state
                                                    const statusId = showStatus('Uploading...', 'success'); // Hacky but works for now to show feedback

                                                    fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                        .then(res => {
                                                            if (res.url) {
                                                                setNewBanner(prev => ({ ...prev, imageUrl: res.url }));
                                                                showStatus('Image Uploaded!', 'success');
                                                            } else {
                                                                showStatus('Upload failed: No URL returned', 'error');
                                                            }
                                                        })
                                                        .catch(() => showStatus('Upload Failed', 'error'));
                                                }
                                            }}
                                            className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-navy file:text-white hover:file:bg-brand-gold transition-all cursor-pointer"
                                        />
                                        {newBanner.imageUrl && (
                                            <div className="mt-2 relative group w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={newBanner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-[10px] font-bold">Change Image</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Banner Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Royal Wedding Collection"
                                            value={newBanner.title}
                                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                            className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] uppercase font-black text-gray-600 tracking-wider">Destination URL</label>
                                        <input
                                            type="text"
                                            placeholder="/shop/weddings"
                                            value={newBanner.link}
                                            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                                            className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-brand-gold bg-transparent transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleAddBanner}
                                        className="bg-brand-navy text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg shadow-brand-navy/10"
                                    >
                                        Add Banner
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {banners.map(banner => (
                                    <div key={banner.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand-navy/5 transition-all duration-500 aspect-[16/9]">
                                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-white font-serif text-lg leading-tight">{banner.title}</p>
                                                    <p className="text-brand-gold text-[10px] uppercase tracking-widest mt-1">{banner.targetUrl}</p>
                                                </div>
                                                <button onClick={() => handleDeleteBanner(banner.id)} className="bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-500 transition-colors border border-white/20">
                                                    <PiTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {banners.length === 0 && <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">No banners active</div>}
                            </div>
                        </div>
                    )}

                    {/* OFFERS SECTION */}
                    {activeSection === 'offers' && (
                        <div className="space-y-10">
                            {/* ... Content remains same but fixing the double if ... */}
                            {/* (I will just replace the whole section to be safe and clean) */}
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <PiPlus className="text-brand-gold" /> Create New Offer
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                    <div key={offer.id} className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-gold/30 transition-all flex justify-between items-center group">
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
                                                        alert('File is too large! Max 5MB allowed.');
                                                        return;
                                                    }
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    fetchAPI('/media/upload', { method: 'POST', body: formData })
                                                        .then(res => setNewCategory({ ...newCategory, imageUrl: res.url }))
                                                        .catch(() => showStatus('Upload Failed', 'error'));
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
                </div>
            </main>
        </div>
    );
}
