'use client';

import { useState, useEffect } from 'react';
import { PiImage, PiTag, PiTextT, PiTrash, PiPlus, PiCheck, PiX, PiSparkle } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';

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
        <div className="space-y-8 max-w-5xl animate-fade-in">
            {/* Status Notification */}
            {status && (
                <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded shadow-2xl border flex items-center gap-3 transition-all transform animate-slide-up ${status.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-sm font-bold tracking-wide">{status.message}</span>
                </div>
            )}

            <div className="flex gap-4 border-b border-gray-200 pb-1 overflow-x-auto">
                <button onClick={() => setActiveSection('banners')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'banners' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiImage className="inline-block mb-1 mr-2" /> Banners
                </button>
                <button onClick={() => setActiveSection('offers')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'offers' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiTag className="inline-block mb-1 mr-2" /> Offers
                </button>
                <button onClick={() => setActiveSection('text')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'text' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiTextT className="inline-block mb-1 mr-2" /> Hero Text
                </button>
                <button onClick={() => setActiveSection('spotlight')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'spotlight' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiSparkle className="inline-block mb-1 mr-2" /> Spotlight
                </button>
                <button onClick={() => setActiveSection('categories')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'categories' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiTag className="inline-block mb-1 mr-2" /> Categories
                </button>
                <button onClick={() => setActiveSection('price')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'price' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiTag className="inline-block mb-1 mr-2" /> Price Ranges
                </button>
                <button onClick={() => setActiveSection('tags')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'tags' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiTag className="inline-block mb-1 mr-2" /> Tags
                </button>
                <button onClick={() => setActiveSection('social')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSection === 'social' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiImage className="inline-block mb-1 mr-2" /> Social Wall
                </button>
            </div>

            {/* BANNERS SECTION */}
            {activeSection === 'banners' && (
                <div className="space-y-8">
                    {/* Add Banner */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-serif text-brand-navy mb-4">Add New Banner</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative group">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                                    Banner Image
                                    <span className="ml-2 text-[9px] text-brand-gold bg-brand-navy/5 px-2 py-0.5 rounded">
                                        Size: 1920x1080px | Max: 5MB
                                    </span>
                                </label>
                                <div className="flex gap-2">
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
                                                // Reuse the same upload logic as products
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                fetchAPI('/media/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                })
                                                    .then(res => setNewBanner({ ...newBanner, imageUrl: res.url }))
                                                    .catch(() => showStatus('Upload Failed', 'error'));
                                            }
                                        }}
                                        className="border p-2 rounded text-sm outline-none focus:border-brand-gold w-full text-xs"
                                    />
                                </div>
                                {newBanner.imageUrl && <p className="text-[10px] text-green-600 mt-1 truncate">Uploaded: {newBanner.imageUrl}</p>}
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Kicker / Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Est. 1995"
                                    value={newBanner.title}
                                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                    className="border p-2 rounded text-sm outline-none focus:border-brand-gold w-full"
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Link URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="/shop"
                                        value={newBanner.link}
                                        onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                                        className="border p-2 rounded text-sm outline-none focus:border-brand-gold flex-1"
                                    />
                                    <button onClick={handleAddBanner} className="bg-brand-navy text-white px-4 rounded hover:bg-brand-gold/80 transition-colors">
                                        <PiPlus />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Banners */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {banners.map(banner => (
                            <div key={banner.id} className="relative group bg-gray-100 rounded-xl overflow-hidden aspect-video">
                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <div className="text-white text-center">
                                        <p className="font-bold">{banner.title}</p>
                                        <p className="text-xs">{banner.link}</p>
                                    </div>
                                    <button onClick={() => handleDeleteBanner(banner.id)} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50">
                                        <PiTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* OFFERS SECTION */}
            {activeSection === 'offers' && (
                <div className="space-y-8">
                    {/* Add Offer */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-serif text-brand-navy mb-4">Add New Offer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="offer Title"
                                value={newOffer.title}
                                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <input
                                type="text"
                                placeholder="Tag (e.g. Limited Time)"
                                value={newOffer.tag}
                                onChange={(e) => setNewOffer({ ...newOffer, tag: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Description"
                                value={newOffer.description}
                                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    value={newOffer.code}
                                    onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                                    className="border p-2 rounded text-sm outline-none focus:border-brand-gold flex-1"
                                />
                                <button onClick={handleAddOffer} className="bg-brand-navy text-white px-4 rounded hover:bg-brand-gold/80 transition-colors">
                                    <PiPlus />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* List Offers */}
                    <div className="space-y-4">
                        {offers.map(offer => (
                            <div key={offer.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-brand-gold/20 text-brand-navy text-[10px] uppercase px-2 py-0.5 rounded font-bold">{offer.tag}</span>
                                        <h4 className="font-serif text-brand-navy">{offer.title}</h4>
                                    </div>
                                    <p className="text-gray-500 text-sm">{offer.description}</p>
                                    <p className="text-xs font-mono text-gray-400 mt-1">Code: {offer.code}</p>
                                </div>
                                <button onClick={() => handleDeleteOffer(offer.id)} className="text-gray-400 hover:text-red-500 p-2">
                                    <PiTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CATEGORIES SECTION */}
            {activeSection === 'categories' && (
                <div className="space-y-8">
                    {/* Add Category */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-serif text-brand-navy mb-4">Add New Category</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <input
                                type="text"
                                placeholder="Slug"
                                value={newCategory.slug}
                                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Image URL"
                                    value={newCategory.imageUrl}
                                    onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                                    className="border p-2 rounded text-sm outline-none focus:border-brand-gold flex-1"
                                />
                                <button onClick={handleAddCategory} className="bg-brand-navy text-white px-4 rounded hover:bg-brand-gold/80 transition-colors">
                                    <PiPlus />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* List Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                                <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-cover rounded" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-brand-navy">{cat.name}</h4>
                                    <p className="text-xs text-gray-400">{cat.slug}</p>
                                </div>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500 p-2">
                                    <PiTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PRICE RANGES SECTION */}
            {activeSection === 'price' && (
                <div className="space-y-8">
                    {/* Add Price Range */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-serif text-brand-navy mb-4">Add Price Range</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Label (e.g. Under 10k)"
                                value={newPriceRange.label}
                                onChange={(e) => setNewPriceRange({ ...newPriceRange, label: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <input
                                type="text"
                                placeholder="Image URL"
                                value={newPriceRange.imageUrl}
                                onChange={(e) => setNewPriceRange({ ...newPriceRange, imageUrl: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="number"
                                placeholder="Min Price"
                                value={newPriceRange.minPrice || ''}
                                onChange={(e) => setNewPriceRange({ ...newPriceRange, minPrice: Number(e.target.value) })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <input
                                type="number"
                                placeholder="Max Price (Optional)"
                                value={newPriceRange.maxPrice || ''}
                                onChange={(e) => setNewPriceRange({ ...newPriceRange, maxPrice: Number(e.target.value) })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <button onClick={handleAddPriceRange} className="bg-brand-navy text-white px-4 rounded hover:bg-brand-gold/80 transition-colors">
                                <PiPlus /> Add Range
                            </button>
                        </div>
                    </div>

                    {/* List Price Ranges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {priceRanges.map(range => (
                            <div key={range.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                                {range.imageUrl && <img src={range.imageUrl} alt={range.label} className="w-16 h-16 object-cover rounded" />}
                                <div className="flex-1">
                                    <h4 className="font-bold text-brand-navy">{range.label}</h4>
                                    <p className="text-xs text-brand-gold font-mono">
                                        ₹{range.minPrice.toLocaleString()}
                                        {range.maxPrice ? ` - ₹${range.maxPrice.toLocaleString()}` : '+'}
                                    </p>
                                </div>
                                <button onClick={() => handleDeletePriceRange(range.id)} className="text-gray-400 hover:text-red-500 p-2">
                                    <PiTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAGS SECTION */}
            {activeSection === 'tags' && (
                <div className="space-y-8">
                    {/* Add Tag */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-lg">
                        <h3 className="text-lg font-serif text-brand-navy mb-4">Add New Tag</h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Tag Name"
                                value={newTag.name}
                                onChange={(e) => setNewTag({ ...newTag, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold flex-1"
                            />
                            <button onClick={handleAddTag} className="bg-brand-navy text-white px-4 rounded hover:bg-brand-gold/80 transition-colors">
                                <PiPlus />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Slug: {newTag.slug}</p>
                    </div>

                    {/* List Tags */}
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <div key={tag.id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm text-brand-navy">
                                <span>{tag.name}</span>
                                <button onClick={() => handleDeleteTag(tag.id)} className="text-gray-400 hover:text-red-500">
                                    <PiX />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SOCIAL WALL SECTION */}
            {activeSection === 'social' && (
                <div className="space-y-8">
                    {/* Add Social Post */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-serif text-brand-navy mb-4">Add Social Post</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Image URL (e.g. Instagram photo)"
                                value={newSocialPost.imageUrl}
                                onChange={(e) => setNewSocialPost({ ...newSocialPost, imageUrl: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <input
                                type="text"
                                placeholder="Link (Optional, e.g. Instagram Post URL)"
                                value={newSocialPost.link}
                                onChange={(e) => setNewSocialPost({ ...newSocialPost, link: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Caption / Handle"
                                value={newSocialPost.caption}
                                onChange={(e) => setNewSocialPost({ ...newSocialPost, caption: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold flex-1"
                            />
                            <button onClick={handleAddSocialPost} className="bg-brand-navy text-white px-4 rounded hover:bg-brand-gold/80 transition-colors">
                                <PiPlus /> Add Post
                            </button>
                        </div>
                    </div>

                    {/* List Social Posts */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {socialPosts.map(post => (
                            <div key={post.id} className="relative aspect-square group rounded-lg overflow-hidden bg-gray-100">
                                <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => handleDeleteSocialPost(post.id)} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50">
                                        <PiTrash />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] truncate">
                                    {post.caption}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TEXT SECTION */}
            {activeSection === 'text' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                    <h3 className="text-lg font-serif text-brand-navy mb-6">Homepage Main Content</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Hero Main Heading</label>
                            <input
                                type="text"
                                value={heroText.title}
                                onChange={(e) => setHeroText({ ...heroText, title: e.target.value })}
                                className="w-full border p-3 rounded text-lg font-serif text-brand-navy outline-none focus:border-brand-gold bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Hero Subtitle</label>
                            <textarea
                                value={heroText.subtitle}
                                onChange={(e) => setHeroText({ ...heroText, subtitle: e.target.value })}
                                className="w-full border p-3 rounded text-sm text-gray-600 outline-none focus:border-brand-gold bg-gray-50 h-32"
                            />
                        </div>

                        <button onClick={handleUpdateText} className="bg-brand-navy text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold transition-colors w-full">
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* SPOTLIGHT SECTION */}
            {activeSection === 'spotlight' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                    <h3 className="text-lg font-serif text-brand-navy mb-6">Product Spotlight Configuration</h3>
                    <p className="text-sm text-gray-400 mb-6">Select a product to feature prominently on the homepage.</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Spotlight Product ID / SKU</label>
                            <input
                                type="text"
                                value={heroText.spotlightId || ''}
                                onChange={(e) => setHeroText({ ...heroText, spotlightId: e.target.value })}
                                placeholder="e.g. RING-001"
                                className="w-full border p-3 rounded text-sm outline-none focus:border-brand-gold bg-gray-50"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Found in the Product Collection list.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={heroText.showSpotlight || false}
                                onChange={(e) => setHeroText({ ...heroText, showSpotlight: e.target.checked })}
                                className="w-5 h-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                            />
                            <label className="text-sm font-medium text-brand-navy">Show Spotlight Section on Homepage</label>
                        </div>

                        <button onClick={handleUpdateSpotlight} className="bg-brand-navy text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold transition-colors w-full">
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
