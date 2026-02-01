'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

// Sub-components can ideally be split, but for speed we'll keep them here or import if complex.
// We will tackle the features in groups.

export default function MarketingDashboard() {
    const [activeTab, setActiveTab] = useState('content'); // content | engagement | pricing

    // Store Settings State
    const [announcement, setAnnouncement] = useState({ text: '', isActive: false });
    const [flashSale, setFlashSale] = useState({ endTime: '', isActive: false });
    const [seo, setSeo] = useState({ title: '', description: '' });
    const [spotlight, setSpotlight] = useState({ category: 'Solitaire Rings', isActive: true });

    // Banners State
    const [banners, setBanners] = useState<any[]>([]);

    // Promo Codes State (Restored)
    const [promos, setPromos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [newPromo, setNewPromo] = useState({
        code: '',
        discountType: 'FLAT', // or PERCENTAGE
        discountValue: '',
        creatorName: ''
    });

    // Engagement State
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [exitIntent, setExitIntent] = useState({ isActive: false, title: '', message: '', discountCode: '' });

    useEffect(() => {
        loadSettings();
        loadBanners();
        loadPromos();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await fetchAPI('/store/settings');
            settings.forEach((s: any) => {
                if (s.key === 'announcement') setAnnouncement(s.value);
                if (s.key === 'flash_sale') setFlashSale(s.value);
                if (s.key === 'seo_metadata') setSeo(s.value);
                if (s.key === 'exit_intent') setExitIntent(s.value);
                if (s.key === 'spotlight') setSpotlight(s.value);
            });
        } catch (err) { console.error(err); }
    };

    const loadBanners = async () => {
        try {
            const data = await fetchAPI('/banners');
            setBanners(data);
        } catch (err) { console.error(err); }
    };

    const saveSetting = async (key: string, value: any) => {
        try {
            await fetchAPI('/store/settings', {
                method: 'POST',
                body: JSON.stringify({ key, value })
            });
            alert('Saved successfully!');
        } catch (err) { alert('Failed to save'); }
    };

    const loadPromos = async () => {
        try {
            const data = await fetchAPI('/promos');
            setPromos(data);
        } catch (error) {
            console.error("Failed to load promos", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePromo = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsCreating(true);
        try {
            await fetchAPI('/promos', {
                method: 'POST',
                body: JSON.stringify({
                    ...newPromo,
                    discountValue: Number(newPromo.discountValue)
                })
            });
            setNewPromo({ code: '', discountType: 'FLAT', discountValue: '', creatorName: '' });
            loadPromos(); // Refresh list
        } catch (error) {
            alert('Failed to create promo code');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeletePromo = async (id: string) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        try {
            await fetchAPI(`/promos/${id}`, { method: 'DELETE' });
            loadPromos();
        } catch (error) {
            alert('Failed to delete promo');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg) return alert('Enter message');
        try {
            await fetchAPI('/marketing/broadcast', {
                method: 'POST',
                body: JSON.stringify({ message: broadcastMsg, segment: 'ALL' })
            });
            alert('Broadcast initiated via AiSensy!');
            setBroadcastMsg('');
        } catch (err) {
            alert('Failed to send broadcast');
        }
    };

    // --- RENDER HELPERS ---

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-brand-navy">
            <header className="mb-8">
                <h1 className="text-3xl font-serif text-brand-navy">Marketing Control Center</h1>
                <p className="text-gray-500 text-sm">Manage global content, engagement tools, and pricing strategies.</p>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                {['content', 'engagement', 'pricing'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 text-sm font-bold uppercase tracking-wider ${activeTab === tab ? 'border-b-2 border-brand-gold text-brand-navy' : 'text-gray-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* CONTENT TAB */}
            {activeTab === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Feature 1: Announcement Bar */}
                    <div className="bg-white p-6 shadow rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">📢 Announcement Bar</h3>
                            <input
                                type="checkbox"
                                checked={announcement.isActive}
                                onChange={(e) => {
                                    const newVal = { ...announcement, isActive: e.target.checked };
                                    setAnnouncement(newVal);
                                    saveSetting('announcement', newVal);
                                }}
                                className="toggle-checkbox"
                            />
                        </div>
                        <textarea
                            className="w-full border p-3 rounded text-sm mb-4 bg-gray-50"
                            rows={3}
                            placeholder="e.g. Festival Sale is Live! Flat 10% Off."
                            value={announcement.text}
                            onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                        />
                        <button onClick={() => saveSetting('announcement', announcement)} className="text-brand-gold text-xs font-bold hover:underline">SAVE CHANGES</button>
                    </div>

                    {/* Feature 3: Hero Banner Manager */}
                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-4">🎨 Hero Banners</h3>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {banners.map((banner, idx) => (
                                <div key={banner.id} className="flex items-center gap-4 border p-2 rounded text-xs">
                                    <span className="font-mono text-gray-400">#{idx + 1}</span>
                                    <div className="w-10 h-6 bg-gray-200 rounded overflow-hidden relative">
                                        <img src={banner.imageUrl} className="object-cover w-full h-full" alt="banner" />
                                    </div>
                                    <span className="truncate flex-1">{banner.title || 'Untitled'}</span>
                                    <button onClick={async () => {
                                        if (!confirm('Delete?')) return;
                                        await fetchAPI(`/banners/${banner.id}`, { method: 'DELETE' });
                                        loadBanners();
                                    }} className="text-red-500">×</button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full border-2 border-dashed border-gray-300 py-2 text-gray-400 text-xs font-bold uppercase hover:border-brand-gold hover:text-brand-gold transition-colors">
                            + Add New Slide
                        </button>
                    </div>

                    {/* Feature 6: Featured Collection */}
                    <div className="bg-white p-6 shadow rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">🌟 Spotlight Collection</h3>
                            <input
                                type="checkbox"
                                checked={spotlight.isActive}
                                onChange={(e) => {
                                    const newVal = { ...spotlight, isActive: e.target.checked };
                                    setSpotlight(newVal);
                                    saveSetting('spotlight', newVal);
                                }}
                            />
                        </div>
                        <select
                            className="w-full border p-3 rounded text-sm bg-gray-50 mb-4"
                            value={spotlight.category}
                            onChange={(e) => setSpotlight({ ...spotlight, category: e.target.value })}
                        >
                            <option>Solitaire Rings</option>
                            <option>Gold Necklaces</option>
                            <option>Bridal Sets</option>
                            <option>Diamond Earrings</option>
                        </select>
                        <button onClick={() => saveSetting('spotlight', spotlight)} className="text-brand-gold text-xs font-bold hover:underline">UPDATE SPOTLIGHT</button>
                    </div>

                    {/* Feature 10: SEO Metadata */}
                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-4">🕸️ SEO Metadata</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Page Title</label>
                                <input
                                    className="w-full border p-2 rounded text-sm"
                                    value={seo.title}
                                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Meta Description</label>
                                <textarea
                                    className="w-full border p-2 rounded text-sm"
                                    rows={2}
                                    value={seo.description}
                                    onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                                />
                            </div>
                            <button onClick={() => saveSetting('seo_metadata', seo)} className="text-brand-gold text-xs font-bold hover:underline">UPDATE SEO</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ENGAGEMENT TAB */}
            {activeTab === 'engagement' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Feature 2: Flash Sale Timer */}
                    <div className="bg-white p-6 shadow rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">⏳ Flash Sale Timer</h3>
                            <input
                                type="checkbox"
                                checked={flashSale.isActive}
                                onChange={(e) => {
                                    const newVal = { ...flashSale, isActive: e.target.checked };
                                    setFlashSale(newVal);
                                    saveSetting('flash_sale', newVal);
                                }}
                            />
                        </div>
                        <input
                            type="datetime-local"
                            className="w-full border p-3 rounded text-sm mb-4"
                            value={flashSale.endTime || ''}
                            onChange={(e) => setFlashSale({ ...flashSale, endTime: e.target.value })}
                        />
                        <button onClick={() => saveSetting('flash_sale', flashSale)} className="text-brand-gold text-xs font-bold hover:underline">SET TIMER</button>
                    </div>

                    {/* Feature 4: WhatsApp Broadcast */}
                    <div className="bg-white p-6 shadow rounded-lg border-l-4 border-green-500">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-4">💬 WhatsApp Broadcast</h3>
                        <textarea
                            className="w-full border p-3 rounded text-sm mb-4"
                            rows={3}
                            placeholder="Type your message here..."
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                        ></textarea>
                        <div className="flex justify-between items-center">
                            <select className="border p-2 rounded text-xs">
                                <option>All Customers</option>
                                <option>VIP (Spent &gt; 50k)</option>
                            </select>
                            <button
                                onClick={handleBroadcast}
                                className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-green-700 uppercase"
                            >
                                Send Blast
                            </button>
                        </div>
                    </div>

                    {/* Feature 5: Exit Intent */}
                    <div className="bg-white p-6 shadow rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">🎁 Exit-Intent Popup</h3>
                            <input
                                type="checkbox"
                                checked={exitIntent.isActive}
                                onChange={(e) => {
                                    const newVal = { ...exitIntent, isActive: e.target.checked };
                                    setExitIntent(newVal);
                                    saveSetting('exit_intent', newVal);
                                }}
                            />
                        </div>
                        <div className="space-y-4">
                            <input
                                className="w-full border p-2 rounded text-sm"
                                placeholder="Headline e.g. Wait! Before you go..."
                                value={exitIntent.title}
                                onChange={(e) => setExitIntent({ ...exitIntent, title: e.target.value })}
                            />
                            <input
                                className="w-full border p-2 rounded text-sm"
                                placeholder="Coupon Code e.g. WELCOME10"
                                value={exitIntent.discountCode}
                                onChange={(e) => setExitIntent({ ...exitIntent, discountCode: e.target.value })}
                            />
                            <button onClick={() => saveSetting('exit_intent', exitIntent)} className="text-brand-gold text-xs font-bold hover:underline">SAVE POPUP</button>
                        </div>
                    </div>

                    {/* Feature 8: Review Spotlight */}
                    <div className="bg-white p-6 shadow rounded-lg">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-4">⭐ Review Spotlight</h3>
                        <p className="text-xs text-gray-500 italic">Select 5-star reviews to pin to homepage.</p>
                        {/* Placeholder for list */}
                    </div>
                </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feature 7 & 11: Promo Codes (Existing) */}
                    <div className="bg-white p-6 shadow rounded-lg h-fit">
                        <h3 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-xs">Create New Code</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Promo Code</label>
                                <input
                                    required
                                    value={newPromo.code}
                                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                                    className="w-full border p-2 rounded font-mono uppercase focus:border-brand-gold outline-none"
                                    placeholder="e.g. SUMMER50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Creator / Affiliate Name</label>
                                <input
                                    value={newPromo.creatorName}
                                    onChange={(e) => setNewPromo({ ...newPromo, creatorName: e.target.value })}
                                    className="w-full border p-2 rounded focus:border-brand-gold outline-none"
                                    placeholder="e.g. Priya Vlogs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                                    <select
                                        value={newPromo.discountType}
                                        onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                                        className="w-full border p-2 rounded"
                                    >
                                        <option value="FLAT">Flat (₹)</option>
                                        <option value="PERCENTAGE">% Off</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Value</label>
                                    <input
                                        required
                                        type="number"
                                        value={newPromo.discountValue}
                                        onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                                        className="w-full border p-2 rounded"
                                        placeholder="500"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleCreatePromo()}
                                disabled={isCreating}
                                className="w-full bg-brand-navy text-white text-xs font-bold uppercase py-3 rounded hover:bg-brand-gold hover:text-brand-navy transition-colors"
                            >
                                {isCreating ? 'Creating...' : 'Launch Code'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Stats Table */}
                    <div className="lg:col-span-2 bg-white p-6 shadow rounded-lg overflow-hidden">
                        <h3 className="font-bold text-gray-700 mb-4 uppercase tracking-wider text-xs">Active Codes & Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b">
                                        <th className="py-2">Creator</th>
                                        <th className="py-2">Code</th>
                                        <th className="py-2">Discount</th>
                                        <th className="py-2 text-center">Usage</th>
                                        <th className="py-2 text-right">Revenue</th>
                                        <th className="py-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="text-center py-8">Loading stats...</td></tr>
                                    ) : promos.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-400">No active codes found.</td></tr>
                                    ) : (
                                        promos.map((promo: any) => (
                                            <tr key={promo.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="py-3 font-bold text-brand-navy">{promo.creatorName || '-'}</td>
                                                <td className="py-3 font-mono text-xs">{promo.code}</td>
                                                <td className="py-3 text-gray-500">
                                                    {promo.discountType === 'FLAT' ? `₹${promo.discountValue}` : `${promo.discountValue}%`}
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{promo.usageCount}</span>
                                                </td>
                                                <td className="py-3 text-right font-mono font-bold text-green-600">
                                                    ₹{promo.totalSales.toLocaleString()}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button onClick={() => handleDeletePromo(promo.id)} className="text-red-400 hover:text-red-600 text-xs uppercase font-bold">Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Feature 7: Dynamic Pricing Rules */}
                    <div className="bg-white p-6 shadow rounded-lg border-l-4 border-purple-500">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-4">⚡ Dynamic Pricing Rules</h3>
                        <p className="text-sm text-gray-500 mb-4">Auto-apply discounts based on cart value.</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center border p-3 rounded bg-gray-50">
                                <span className="text-sm font-bold">Cart &gt; ₹50,000</span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">5% OFF</span>
                                <input type="checkbox" checked readOnly />
                            </div>
                        </div>
                        <button className="mt-4 text-purple-600 text-xs font-bold hover:underline">+ ADD NEW RULE</button>
                    </div>
                </div>
            )}
        </div>
    );
}

