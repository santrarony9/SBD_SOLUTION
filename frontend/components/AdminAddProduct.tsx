'use client';

import { useState, useEffect } from 'react';
import { fetchAPI, API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PiDownloadSimple } from 'react-icons/pi';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'; // Removed local definition

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function AdminAddProduct({ isOpen, onClose, onSuccess, initialData }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Rings',
        sku: '', // Internal use
        price: '', // Not used in backend but kept for UI if needed or removed
        images: '',
        goldPurity: '18',
        goldWeight: '',
        realWeight: '', // Added Gross Weight
        diamondCarat: '',
        diamondClarity: 'SI1',
        diamondColor: 'EF', // Added Diamond Color w/ default
        description: '',
        videoUrl: '',
        certificatePdf: '',

        coverImage: '',
        stockCount: '' // Added for Inventory Management
    });
    const [tempImages, setTempImages] = useState<string[]>([]);
    const { showToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [rates, setRates] = useState<any>(null);
    const [calculatedPricing, setCalculatedPricing] = useState<any>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                category: initialData.category || 'Rings',
                sku: initialData.sku || '', // Hydrate SKU
                price: '',
                images: '',
                goldPurity: initialData.goldPurity?.toString() || '18',
                goldWeight: initialData.goldWeight?.toString() || '',
                realWeight: initialData.realWeight?.toString() || '', // Hydrate Gross Weight
                diamondCarat: initialData.diamondCarat?.toString() || '',
                diamondClarity: initialData.diamondClarity || 'SI1',
                diamondColor: initialData.diamondColor || 'EF', // Hydrate Edit
                description: initialData.description || '',
                videoUrl: initialData.videoUrl || '',
                certificatePdf: initialData.certificatePdf || '',

                coverImage: initialData.coverImage || '',
                stockCount: initialData.stockCount?.toString() || '' // Hydrate Stock
            });
            setTempImages(initialData.images || []);
        } else {
            // Reset if opening in Add mode
            setFormData({
                name: '', category: 'Rings', price: '', images: '',
                sku: '', // Reset SKU
                goldPurity: '18', goldWeight: '', realWeight: '', diamondCarat: '', diamondClarity: 'SI1', diamondColor: 'EF', // Reset
                description: '',
                videoUrl: '',
                certificatePdf: '',

                coverImage: '',
                stockCount: '' // Reset Stock
            });
            setTempImages([]);
        }
    }, [initialData, isOpen]);

    // Fetch Rates
    useEffect(() => {
        if (isOpen) {
            fetchAPI('/pricing/rates')
                .then(data => setRates(data))
                .catch(err => console.error('Failed to fetch rates', err));
        }
    }, [isOpen]);

    // Live Calculation
    useEffect(() => {
        if (!rates) return;

        const goldRate = rates.goldRates.find((r: any) => r.purity === parseInt(formData.goldPurity))?.pricePer10g || 0;
        const diamondRate = rates.diamondRates.find((r: any) => r.clarity === formData.diamondClarity)?.pricePerCarat || 0;

        const goldValue = (goldRate / 10) * (parseFloat(formData.goldWeight) || 0);
        const diamondValue = diamondRate * (parseFloat(formData.diamondCarat) || 0);
        const subTotal = goldValue + diamondValue;

        // Making Charges
        let makingCharges = 0;
        const tiers = rates.makingChargeTiers || [];
        const weight = parseFloat(formData.goldWeight) || 0;
        let activeTier = tiers.find((t: any) => t.id === '3g_plus');
        if (weight >= 0 && weight < 1) activeTier = tiers.find((t: any) => t.id === '0_1g');
        else if (weight >= 1 && weight < 2) activeTier = tiers.find((t: any) => t.id === '1_2g');
        else if (weight >= 2 && weight < 3) activeTier = tiers.find((t: any) => t.id === '2_3g');

        if (activeTier) {
            if (activeTier.type === 'FLAT') makingCharges = Number(activeTier.amount);
            else if (activeTier.type === 'PER_GRAM') makingCharges = Number(activeTier.amount) * weight;
            else if (activeTier.type === 'PERCENTAGE') makingCharges = (goldValue * Number(activeTier.amount)) / 100;
        } else {
            const legacyMaking = rates.charges?.find((c: any) => c.name.toLowerCase().includes('making'));
            if (legacyMaking) {
                if (legacyMaking.type === 'PERCENTAGE') makingCharges = (goldValue * legacyMaking.amount) / 100;
                else if (legacyMaking.type === 'FLAT') makingCharges = legacyMaking.amount;
            }
        }

        // Other Charges
        let otherCharges = 0;
        rates.charges?.forEach((charge: any) => {
            if (charge.name.toUpperCase().includes('GST') || charge.name.toLowerCase().includes('making')) return;
            let amt = 0;
            if (charge.type === 'PERCENTAGE') {
                if (charge.applyOn === 'GOLD_VALUE') amt = (goldValue * charge.amount) / 100;
                else if (charge.applyOn === 'DIAMOND_VALUE') amt = (diamondValue * charge.amount) / 100;
                else if (charge.applyOn === 'SUBTOTAL') amt = (subTotal * charge.amount) / 100;
            } else if (charge.type === 'PER_GRAM' && charge.applyOn === 'GOLD_VALUE') {
                amt = charge.amount * weight;
            } else if (charge.type === 'PER_CARAT' && charge.applyOn === 'DIAMOND_VALUE') {
                amt = charge.amount * (parseFloat(formData.diamondCarat) || 0);
            } else if (charge.type === 'FLAT') {
                amt = charge.amount;
            }
            otherCharges += amt;
        });

        // GST
        const gstCharge = rates.charges?.find((c: any) => c.name.toUpperCase().includes('GST'));
        const taxable = subTotal + makingCharges + otherCharges;
        const gst = gstCharge ? (taxable * gstCharge.amount) / 100 : (taxable * 3) / 100;

        setCalculatedPricing({
            goldValue,
            diamondValue,
            makingCharges,
            otherCharges,
            gst,
            finalPrice: taxable + gst,
            rates: { goldRate, diamondRate }
        });
    }, [formData, rates]);

    if (!isOpen) return null;

    const handleMediaUpload = async (file: File | undefined, type: string) => {
        if (!file) return;
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('file', file);

            const response = await fetch(`${API_URL}/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Upload Failed (${response.status})`);
            }

            const result = await response.json();

            if (!result.url) {
                throw new Error('Server returned success but no URL. Check Cloudinary config.');
            }

            if (type === 'video') setFormData({ ...formData, videoUrl: result.url });
            else if (type === 'certificate') setFormData({ ...formData, certificatePdf: result.url });
            else if (type === 'cover') setFormData({ ...formData, coverImage: result.url });
            else if (type.startsWith('image')) {
                const index = parseInt(type.split('-')[1]);
                const newImages = [...tempImages];
                newImages[index] = result.url;
                setTempImages(newImages);
            }
        } catch (error) {
            showToast('Upload failed', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!formData.name || !formData.goldWeight) {
            showToast('Enter Name, Category and Weight first', 'info');
            return;
        }
        setIsGeneratingAI(true);
        try {
            const response = await fetchAPI('/products/ai-description', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (response.description) {
                setFormData(prev => ({ ...prev, description: response.description }));
                showToast('Description generated', 'success');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to generate description', 'error');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validation: Min 3 Images
        const validImages = tempImages.filter(img => img);
        if (validImages.length < 3) {
            showToast('Please upload at least 3 product images', 'info');
            setLoading(false);
            return;
        }

        // Validation: Stock Quantity
        if (!formData.stockCount || parseInt(formData.stockCount) < 0) {
            showToast('Please enter a valid Stock Quantity', 'error');
            setLoading(false);
            return;
        }

        // Validation: IGI Certificate - REMOVED as per user request
        // if (!formData.certificatePdf) {
        //     alert('Please upload the IGI Certificate.');
        //     setLoading(false);
        //     return;
        // }

        try {
            const payload = {
                name: formData.name,
                slug: initialData ? initialData.slug : (formData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()),
                category: formData.category,
                sku: formData.sku, // Pass SKU to backend
                description: formData.description,
                goldPurity: parseInt(formData.goldPurity) || 0,
                goldWeight: parseFloat(formData.goldWeight) || 0,
                realWeight: parseFloat(formData.realWeight) || 0, // Pass Gross Weight
                diamondCarat: parseFloat(formData.diamondCarat) || 0,
                diamondClarity: formData.diamondClarity,
                diamondColor: formData.diamondColor,
                images: validImages,
                videoUrl: formData.videoUrl,
                certificatePdf: formData.certificatePdf,

                coverImage: formData.coverImage,
                stockCount: parseInt(formData.stockCount) || 0 // Include stock count in payload
            };

            const url = initialData
                ? `/products/${initialData.id}`
                : '/products';

            const method = initialData ? 'PUT' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify(payload)
            });

            showToast(`Product ${initialData ? 'Updated' : 'Added'} Successfully! 💎`, 'success');
            onClose();
            onSuccess();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to save product', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper to download full-resolution image
    const handleDownload = async (url: string, index: number | string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `product-image-${index}-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback for cross-origin issues: open in new tab
            window.open(url, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/80 backdrop-blur-md p-2 md:p-10 animate-fade-in">
            <div className="bg-white max-w-[1240px] w-full shadow-2xl overflow-hidden rounded-2xl border border-white/20 h-full max-h-[90vh] flex flex-col">
                <div className="bg-brand-navy p-4 px-8 flex justify-between items-center shrink-0 border-b border-white/5">
                    <h2 className="text-xl font-serif text-white tracking-wide flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold text-sm">💎</span>
                        {initialData ? 'Edit Product' : 'Add New Product'}
                        <span className="text-[10px] text-brand-gold font-sans uppercase tracking-[0.2em] ml-4 bg-brand-gold/10 px-3 py-1 rounded-full">Inventory Control</span>
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-all p-2 hover:bg-white/10 rounded-full">✕</button>
                </div>

                <div className="flex-grow flex overflow-hidden">
                    {/* Left Pane: Form (Scrollable) */}
                    <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
                        <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
                            {/* Basic Info Cluster */}
                            <div className="col-span-12 space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-1">
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black">Product Title</label>
                                        <input
                                            required
                                            className="w-full border border-gray-200 bg-white p-3 text-sm text-brand-navy focus:border-brand-gold outline-none rounded-lg transition-all shadow-sm"
                                            value={formData.name}
                                            placeholder="e.g. Royal Sapphire Ring"
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black">Category</label>
                                        <select
                                            className="w-full border border-gray-200 bg-white p-3 text-sm text-brand-navy focus:border-brand-gold outline-none rounded-lg appearance-none shadow-sm"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Rings">Rings</option>
                                            <option value="Necklaces">Necklaces</option>
                                            <option value="Earrings">Earrings</option>
                                            <option value="Bangles">Bangles</option>
                                            <option value="Pendants">Pendants</option>
                                            <option value="Nosepin">Nosepin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">SKU ID</label>
                                        <input
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded font-mono"
                                            value={formData.sku || ''}
                                            placeholder="ID-001"
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Purity</label>
                                        <select
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded"
                                            value={formData.goldPurity}
                                            onChange={e => setFormData({ ...formData, goldPurity: e.target.value })}
                                        >
                                            {[14, 16, 18, 22, 24].map(p => <option key={p} value={p}>{p}K Gold</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Stock</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded"
                                            value={formData.stockCount}
                                            onChange={e => setFormData({ ...formData, stockCount: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Net Gold (g)</label>
                                        <input
                                            type="number" step="0.01" required
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded"
                                            value={formData.goldWeight}
                                            onChange={e => setFormData({ ...formData, goldWeight: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Gross Wt (g)</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded"
                                            value={formData.realWeight}
                                            onChange={e => setFormData({ ...formData, realWeight: e.target.value })}
                                            placeholder="Total"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Diamond (ct)</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded"
                                            value={formData.diamondCarat}
                                            onChange={e => setFormData({ ...formData, diamondCarat: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Clarity</label>
                                        <select
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded"
                                            value={formData.diamondClarity}
                                            onChange={e => setFormData({ ...formData, diamondClarity: e.target.value })}
                                        >
                                            {['VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Color</label>
                                        <select
                                            className="w-full border border-gray-100 bg-gray-50 p-2.5 text-[11px] text-brand-navy focus:border-brand-gold outline-none rounded"
                                            value={formData.diamondColor}
                                            onChange={e => setFormData({ ...formData, diamondColor: e.target.value })}
                                        >
                                            {['EF', 'FG', 'GH', 'HI', 'IJ'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="col-span-12">
                                <h3 className="text-[10px] uppercase font-black text-brand-navy tracking-[0.2em] mb-4 border-b pb-2 flex justify-between">
                                    Product Assets
                                    <span className="text-gray-400 font-bold">Min 3 Images Req.</span>
                                </h3>
                                <div className="grid grid-cols-6 gap-3">
                                    {[0, 1, 2, 3, 4].map((index) => (
                                        <div key={index} className="aspect-square relative group bg-white border border-gray-100 p-1 rounded-lg shadow-sm">
                                            {tempImages[index] ? (
                                                <>
                                                    <img src={tempImages[index]} className="w-full h-full object-cover rounded" alt="" />
                                                    <button type="button" onClick={() => { const n = [...tempImages]; n[index] = ''; setTempImages(n); }} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-200 rounded text-gray-300 relative">
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleMediaUpload(e.target.files?.[0], `image-${index}`)} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="aspect-square relative group bg-brand-gold/5 border border-brand-gold/20 p-1 rounded-lg flex flex-col items-center justify-center text-center">
                                        {formData.coverImage ? (
                                            <div className="relative w-full h-full">
                                                <img src={formData.coverImage} className="w-full h-full object-cover rounded" alt="" />
                                                <button type="button" onClick={() => setFormData({ ...formData, coverImage: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-[8px] uppercase font-bold text-brand-navy">Cover</span>
                                                <span className="text-[8px] uppercase font-bold text-brand-gold mt-1 underline">Upload</span>
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleMediaUpload(e.target.files?.[0], 'cover')} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Storyteller (Description)</label>
                                        <button type="button" onClick={handleAIGenerate} disabled={isGeneratingAI} className="text-[9px] font-bold text-brand-gold bg-brand-navy px-3 py-1 rounded-full">{isGeneratingAI ? 'Writing...' : '✨ Magic'}</button>
                                    </div>
                                    <textarea
                                        className="w-full border border-gray-100 bg-white p-3 text-sm text-brand-navy outline-none rounded-xl min-h-[100px] resize-none shadow-sm"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Product Video</p>
                                            <p className="text-[9px] text-brand-navy max-w-[150px] truncate">{formData.videoUrl ? 'Video Attached' : 'No video uploaded'}</p>
                                        </div>
                                        <div className="relative w-10 h-10 rounded bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                                            {formData.videoUrl ? '✅' : '▶'}
                                            <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleMediaUpload(e.target.files?.[0], 'video')} />
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">IGI Certificate</p>
                                            <p className="text-[9px] text-brand-navy truncate">{formData.certificatePdf ? 'Valid Linked' : 'Not Provided'}</p>
                                        </div>
                                        <div className="relative w-10 h-10 rounded bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                                            {formData.certificatePdf ? '✅' : '📄'}
                                            <input type="file" accept=".pdf,image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleMediaUpload(e.target.files?.[0], 'certificate')} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Pane: Price Calculator (Fixed) */}
                    <div className="w-[400px] bg-brand-navy/5 border-l border-gray-100 p-8 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden border-brand-gold/5 bg-gradient-to-b from-brand-cream/10 via-transparent to-brand-cream/10">
                        <div className="flex-grow space-y-8">
                            <div>
                                <h3 className="text-[10px] uppercase font-black text-brand-navy tracking-[0.3em] mb-6 border-b border-brand-navy/10 pb-2">Price Breakdown</h3>
                                <div className="space-y-4">
                                    {/* Gold Calculation */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-1 h-full bg-brand-gold opacity-30" />
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Gold Value</span>
                                            <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded">Rate: ₹{(calculatedPricing?.rates?.goldRate || 0).toLocaleString()}/10g</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[11px] text-brand-navy font-bold uppercase opacity-60 italic tracking-widest">Market Calculation</span>
                                            <span className="text-sm font-bold text-brand-navy">₹{Math.round(calculatedPricing?.goldValue || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Diamond Calculation */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-1 h-full bg-blue-400 opacity-20" />
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Diamond Value</span>
                                            <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded">Rate: ₹{(calculatedPricing?.rates?.diamondRate || 0).toLocaleString()}/ct</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[11px] text-brand-navy font-bold uppercase opacity-60 italic tracking-widest">Gemstone Multiplier</span>
                                            <span className="text-sm font-bold text-brand-navy">₹{Math.round(calculatedPricing?.diamondValue || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Making & Charges */}
                                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Royal Crafting Fee</span>
                                            <span className="text-xs font-bold text-brand-navy">₹{Math.round(calculatedPricing?.makingCharges || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Insurance & Vault</span>
                                            <span className="text-xs font-bold text-brand-navy">₹{Math.round(calculatedPricing?.otherCharges || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            <span className="text-[11px] uppercase font-black text-brand-gold tracking-[0.3em]">GST (3.0%)</span>
                                            <span className="text-xs font-bold text-brand-navy">₹{Math.round(calculatedPricing?.gst || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Total Card */}
                            <div className="bg-brand-navy text-white p-8 rounded-3xl shadow-2xl shadow-brand-navy/30 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                                <span className="text-[9px] uppercase tracking-[0.5em] font-black text-brand-gold/70 block mb-3">Grand Piece Valuation</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-serif text-white tracking-tighter">₹{Math.round(calculatedPricing?.finalPrice || 0).toLocaleString()}</span>
                                    <span className="text-[10px] uppercase font-black text-brand-gold animate-pulse">Live</span>
                                </div>
                                <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                                    <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
                                        Market Synchronized
                                    </p>
                                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] leading-relaxed font-bold">
                                        Back-calculation verified based on latest LME / Rapaport benchmarks.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="mt-8 space-y-3 pt-6 border-t border-brand-navy/10">
                            <button
                                type="submit"
                                form="productForm"
                                disabled={loading || isUploading}
                                className={`w-full bg-brand-gold text-brand-navy py-5 rounded-2xl uppercase text-[11px] font-black tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-brand-gold/10 flex items-center justify-center gap-3 ${loading || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Securing Data...' : isUploading ? 'Assets Syncing...' : (initialData ? 'Commit Upgrades' : 'Mint New Piece')}
                                {!loading && !isUploading && <span className="text-lg">→</span>}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-red-500 transition-all"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

