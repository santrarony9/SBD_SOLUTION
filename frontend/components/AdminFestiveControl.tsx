'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { PiCheckCircle, PiXCircle, PiInfo, PiSparkle, PiCalendar, PiGift, PiPlayCircle } from 'react-icons/pi';
import { FestiveConfig } from '@/context/FestiveContext';

export default function AdminFestiveControl() {
    const [config, setConfig] = useState<FestiveConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await fetchAPI('/store/settings/festive_config');
                if (data?.value) {
                    setConfig(data.value);
                } else {
                    // Default config if none exists
                    setConfig({
                        active: false,
                        currentFestival: 'NONE',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                        theme: {
                            primaryColor: '#ff0080',
                            secondaryColor: '#7ed321',
                            accentColor: '#f5a623',
                            particleType: 'splash',
                            greeting: 'Happy Holi! Celebrate with Colors & Diamonds.',
                            couponCode: 'FESTIVE2026',
                            discountLabel: '₹500 OFF | ₹1000 OFF on ₹10k+',
                            tieredDiscount: {
                                flat: 500,
                                threshold: 10000,
                                aboveThreshold: 1000
                            }
                        },
                        features: {
                            welcomeModal: true,
                            fallingParticles: false,
                            siteReskin: true,
                            socialProof: true,
                            scratchCard: true,
                            startupAnimation: true,
                            animationUrl: ''
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to load festive config", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConfig();
    }, []);

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        setStatus(null);
        try {
            await fetchAPI('/store/settings', {
                method: 'POST',
                body: JSON.stringify({
                    key: 'festive_config',
                    value: config
                })
            });
            setStatus({ message: 'Festive settings updated successfully!', type: 'success' });
            // Refresh parent state if needed, but context handles it on next load
        } catch (error) {
            setStatus({ message: 'Failed to save settings.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleMasterToggle = async () => {
        if (!config) return;
        const newActive = !config.active;
        const newConfig = { ...config, active: newActive };
        setConfig(newConfig);

        // Auto-save immediately to provide a true 1-click experience
        setIsSaving(true);
        setStatus(null);
        try {
            await fetchAPI('/store/settings', {
                method: 'POST',
                body: JSON.stringify({
                    key: 'festive_config',
                    value: newConfig
                })
            });
            setStatus({ message: `Festive Experience turned ${newActive ? 'ON' : 'OFF'} successfully!`, type: 'success' });
        } catch (error) {
            setStatus({ message: 'Failed to toggle festive mode.', type: 'error' });
            setConfig(config); // revert UI on failure
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !config) return <div className="p-12 text-center text-gray-400">Loading Configuration...</div>;

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Master Toggle */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-serif text-brand-navy mb-1 flex items-center gap-2">
                        <PiSparkle className="text-brand-gold" />
                        Master Festive Mode
                    </h3>
                    <p className="text-gray-400 text-xs">Switch ON to instantly enable all festive features site-wide (Auto-saves).</p>
                </div>
                <button
                    onClick={handleMasterToggle}
                    disabled={isSaving}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${config.active ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${config.active ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                </button>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Festival Selection & Schedule */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-serif text-brand-navy flex items-center gap-2">
                        <PiCalendar className="text-brand-gold" />
                        Scheduling & Identity
                    </h3>

                    <div>
                        <label className="text-[10px] uppercase font-black text-gray-400 block mb-2">Active Festival</label>
                        <select
                            value={config.currentFestival}
                            onChange={(e) => setConfig({ ...config, currentFestival: e.target.value as any })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-gold/20"
                        >
                            <option value="NONE">None (Normal Mode)</option>
                            <option value="HOLI">Holi Festival</option>
                            <option value="RATH_YATRA">Rath Yatra</option>
                            <option value="INDEPENDENCE_DAY">Independence Day (15th Aug)</option>
                            <option value="DURGA_PUJA">Durga Puja</option>
                            <option value="DIWALI">Diwali Festival</option>
                            <option value="CHRISTMAS">Christmas Spirit</option>
                            <option value="NEW_YEAR">New Year Kickoff</option>
                            <option value="VALENTINES">Valentine's Day</option>
                            <option value="EID">Eid al-Fitr</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-black text-gray-400 block mb-2">Start Date</label>
                            <input
                                type="date"
                                value={config.startDate}
                                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-gold/20"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black text-gray-400 block mb-2">End Date</label>
                            <input
                                type="date"
                                value={config.endDate}
                                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-gold/20"
                            />
                        </div>
                    </div>
                </section>

                {/* Theme & Greeting */}
                <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-serif text-brand-navy flex items-center gap-2">
                        <PiGift className="text-brand-gold" />
                        Theme & Greeting
                    </h3>

                    <div>
                        <label className="text-[10px] uppercase font-black text-gray-400 block mb-2">Announcement Bar Greeting</label>
                        <input
                            type="text"
                            value={config.theme.greeting}
                            onChange={(e) => setConfig({ ...config, theme: { ...config.theme, greeting: e.target.value } })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-brand-gold/20"
                            placeholder="Happy Holi! Celebrate with Colors."
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-black text-gray-400 block mb-2">Festive Coupon Code</label>
                        <input
                            type="text"
                            value={config.theme.couponCode}
                            onChange={(e) => setConfig({ ...config, theme: { ...config.theme, couponCode: e.target.value.toUpperCase() } })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-black tracking-widest focus:ring-2 focus:ring-brand-gold/20"
                            placeholder="HOLI2026"
                        />
                    </div>
                </section>
            </div>

            {/* Animation & Feature Toggles */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                <h3 className="text-lg font-serif text-brand-navy flex items-center gap-2">
                    <PiPlayCircle className="text-brand-gold" />
                    Interactive Features & Startup Animation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                            <div>
                                <h4 className="text-sm font-bold text-brand-navy group-hover:text-brand-gold transition-colors">Startup Animation</h4>
                                <p className="text-[10px] text-gray-400">Show a high-impact intro when users arrive.</p>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, features: { ...config.features, startupAnimation: !config.features.startupAnimation } })}
                                className={`h-6 w-11 rounded-full p-1 transition-colors ${config.features.startupAnimation ? 'bg-brand-gold' : 'bg-gray-200'}`}
                            >
                                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${config.features.startupAnimation ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {config.features.startupAnimation && (
                            <div className="pt-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 block mb-2">Animation/Video URL (Optional)</label>
                                <input
                                    type="text"
                                    value={config.features.animationUrl || ''}
                                    onChange={(e) => setConfig({ ...config, features: { ...config.features, animationUrl: e.target.value } })}
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-medium focus:ring-2 focus:ring-brand-gold/20"
                                    placeholder="https://example.com/festive-intro.mp4"
                                />
                                <p className="mt-2 text-[9px] text-gray-400 italic">Leave blank to use the default festival-specific animation.</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { key: 'siteReskin', label: 'Color Re-skinning', desc: 'Auto-apply festival color palette' },
                            { key: 'fallingParticles', label: 'Falling Particles', desc: 'Show splashes/stars floating around' },
                            { key: 'scratchCard', label: 'Scratch Card Gift', desc: 'Reveal coupon with "scratch" interaction' },
                            { key: 'socialProof', label: 'Festive Social Proof', desc: 'Show recent purchases in festive box' }
                        ].map((feat) => (
                            <div key={feat.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-700">{feat.label}</h4>
                                    <p className="text-[9px] text-gray-400">{feat.desc}</p>
                                </div>
                                <button
                                    onClick={() => setConfig({ ...config, features: { ...config.features, [feat.key]: !config.features[feat.key as keyof typeof config.features] } })}
                                    className={`h-5 w-10 rounded-full p-0.5 transition-colors ${config.features[feat.key as keyof typeof config.features] ? 'bg-brand-navy' : 'bg-gray-200'}`}
                                >
                                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${config.features[feat.key as keyof typeof config.features] ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Status Messages */}
            {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {status.type === 'success' ? <PiCheckCircle className="w-5 h-5" /> : <PiXCircle className="w-5 h-5" />}
                    <span className="text-sm font-bold">{status.message}</span>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-brand-navy text-white px-12 py-4 rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-brand-gold transition-all shadow-xl hover:shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4"
                >
                    {isSaving ? 'Synchronizing Site...' : 'Update Festive Experience'}
                </button>
            </div>
        </div>
    );
}
