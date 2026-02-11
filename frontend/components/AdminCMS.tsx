'use client';

import { useState, useEffect } from 'react';
import { PiImage, PiTag, PiTextT, PiTrash, PiPlus, PiCheck, PiX, PiSparkle } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';

export default function AdminCMS() {
    const [activeSection, setActiveSection] = useState<'banners' | 'offers' | 'text' | 'spotlight'>('banners');
    const [banners, setBanners] = useState<any[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [heroText, setHeroText] = useState<{ title: string, subtitle: string, spotlightId?: string, showSpotlight?: boolean }>({ title: '', subtitle: '', spotlightId: '', showSpotlight: false });
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Form States
    const [newBanner, setNewBanner] = useState({ imageUrl: '', title: '', link: '' });
    const [newOffer, setNewOffer] = useState({ title: '', description: '', tag: '', code: '' });

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
            const [fetchedBanners, fetchedOffers, fetchedHeroText] = await Promise.all([
                fetchAPI('/banners'),
                fetchAPI('/offers'),
                fetchAPI('/store/settings/homepage_hero_text')
            ]);
            setBanners(fetchedBanners || []);
            setOffers(fetchedOffers || []);
            setHeroText(fetchedHeroText?.value ? JSON.parse(fetchedHeroText.value) : { title: 'Elegance is Eternal', subtitle: 'Discover jewellery that transcends time.' });
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

    // --- Text Actions ---
    const handleUpdateText = async () => {
        try {
            await fetchAPI('/store/settings', {
                method: 'POST',
                body: JSON.stringify({ key: 'homepage_hero_text', value: JSON.stringify(heroText) })
            });
            showStatus('Hero Text Updated', 'success');
        } catch (e) { showStatus('Failed to update text', 'error'); }
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

            <div className="flex gap-4 border-b border-gray-200 pb-1">
                <button onClick={() => setActiveSection('banners')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeSection === 'banners' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiImage className="inline-block mb-1 mr-2" /> Banners
                </button>
                <button onClick={() => setActiveSection('offers')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeSection === 'offers' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiTag className="inline-block mb-1 mr-2" /> Offers
                </button>
                <button onClick={() => setActiveSection('text')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeSection === 'text' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiTextT className="inline-block mb-1 mr-2" /> Hero Text
                </button>
                <button onClick={() => setActiveSection('spotlight')} className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeSection === 'spotlight' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}>
                    <PiSparkle className="inline-block mb-1 mr-2" /> Spotlight
                </button>
            </div>

            {/* BANNERS SECTION */}
            {activeSection === 'banners' && (
                <div className="space-y-8">
                    {/* Add Banner */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-serif text-brand-navy mb-4">Add New Banner</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Image URL (e.g., /hero1.jpg)"
                                value={newBanner.imageUrl}
                                onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <input
                                type="text"
                                placeholder="Title (Optional)"
                                value={newBanner.title}
                                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                                className="border p-2 rounded text-sm outline-none focus:border-brand-gold"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Link (e.g. /shop)"
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

                        <button onClick={handleUpdateText} className="bg-brand-navy text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold transition-colors w-full">
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
