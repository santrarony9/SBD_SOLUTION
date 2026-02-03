'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

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
        price: '', // Not used in backend but kept for UI if needed or removed
        images: '',
        goldPurity: '18',
        goldWeight: '',
        diamondCarat: '',
        diamondClarity: 'SI1',
        description: '',
        videoUrl: '',
        certificatePdf: ''
    });
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                category: initialData.category || 'Rings',
                price: '',
                images: '',
                goldPurity: initialData.goldPurity?.toString() || '18',
                goldWeight: initialData.goldWeight?.toString() || '',
                diamondCarat: initialData.diamondCarat?.toString() || '',
                diamondClarity: initialData.diamondClarity || 'SI1',
                description: initialData.description || '',
                videoUrl: initialData.videoUrl || '',
                certificatePdf: initialData.certificatePdf || ''
            });
            setTempImages(initialData.images || []);
        } else {
            // Reset if opening in Add mode
            setFormData({
                name: '', category: 'Rings', price: '', images: '',
                goldPurity: '18', goldWeight: '', diamondCarat: '', diamondClarity: 'SI1', description: '',
                videoUrl: '', certificatePdf: ''
            });
            setTempImages([]);
        }
    }, [initialData, isOpen]);

    const handleMediaUpload = async (file: File | undefined, type: string) => {
        if (!file) return;
        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('file', file);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            const result = await response.json();

            if (type === 'video') setFormData({ ...formData, videoUrl: result.url });
            else if (type === 'certificate') setFormData({ ...formData, certificatePdf: result.url });
            else if (type.startsWith('image')) {
                const index = parseInt(type.split('-')[1]);
                const newImages = [...tempImages];
                newImages[index] = result.url;
                setTempImages(newImages);
            }
        } catch (error) {
            alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!formData.name || !formData.goldWeight) {
            alert('Please enter Name, Category and Weight first to generate a description.');
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
            }
        } catch (error) {
            alert('Failed to generate description. Check if API Key is set.');
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
            alert('Please upload at least 3 product images.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                slug: initialData ? initialData.slug : (formData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()),
                category: formData.category,
                description: formData.description,
                goldPurity: parseInt(formData.goldPurity) || 0,
                goldWeight: parseFloat(formData.goldWeight) || 0,
                diamondCarat: parseFloat(formData.diamondCarat) || 0,
                diamondClarity: formData.diamondClarity,
                images: validImages,
                videoUrl: formData.videoUrl,
                certificatePdf: formData.certificatePdf
            };

            const url = initialData
                ? `/products/${initialData.id}`
                : '/products';

            const method = initialData ? 'PUT' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify(payload)
            });

            alert(`Product ${initialData ? 'Updated' : 'Added'} Successfully! 💎`);
            onClose();
            onSuccess();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white max-w-2xl w-full shadow-2xl overflow-hidden rounded-xl border border-white/20 max-h-[90vh] flex flex-col">
                <div className="bg-brand-navy p-6 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-serif text-white tracking-wide">
                        {initialData ? 'Edit Product' : 'Add New Product'}
                        <span className="block text-[10px] text-brand-gold font-sans uppercase tracking-[0.2em] mt-1">Inventory Management</span>
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">✕</button>
                </div>

                <div className="overflow-y-auto p-8 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold">Product Name</label>
                                <input
                                    required
                                    className="w-full border border-gray-200 bg-gray-50 p-3 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none rounded transition-all focus:bg-white"
                                    value={formData.name}
                                    placeholder="e.g. Royal Sapphire Ring"
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full border border-gray-200 bg-gray-50 p-3 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none rounded appearance-none transition-all focus:bg-white"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Rings">Rings</option>
                                        <option value="Necklaces">Necklaces</option>
                                        <option value="Earrings">Earrings</option>
                                        <option value="Bangles">Bangles</option>
                                        <option value="Pendants">Pendants</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                        </div>

                        {/* Specs Panel */}
                        <div className="bg-brand-cream/30 p-6 rounded-lg border border-brand-gold/10 space-y-4">
                            <h3 className="text-xs uppercase font-bold text-brand-navy tracking-widest border-b border-brand-gold/10 pb-2 mb-4">Specifications</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gold Purity (K)</label>
                                    <select
                                        className="w-full border border-gray-200 rounded p-2 text-sm bg-white focus:border-brand-gold outline-none"
                                        value={formData.goldPurity}
                                        onChange={e => setFormData({ ...formData, goldPurity: e.target.value })}
                                    >
                                        <option value="14">14K</option>
                                        <option value="16">16K</option>
                                        <option value="18">18K</option>
                                        <option value="22">22K</option>
                                        <option value="24">24K</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gold Wt (g)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full border border-gray-200 rounded p-2 text-sm focus:border-brand-gold outline-none"
                                        value={formData.goldWeight}
                                        onChange={e => setFormData({ ...formData, goldWeight: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Dia. Carat</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full border border-gray-200 rounded p-2 text-sm focus:border-brand-gold outline-none"
                                        value={formData.diamondCarat}
                                        onChange={e => setFormData({ ...formData, diamondCarat: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Clarity</label>
                                    <select
                                        className="w-full border border-gray-200 rounded p-2 text-sm bg-white focus:border-brand-gold outline-none"
                                        value={formData.diamondClarity}
                                        onChange={e => setFormData({ ...formData, diamondClarity: e.target.value })}
                                    >
                                        <option value="VVS1">VVS1</option>
                                        <option value="VVS2">VVS2</option>
                                        <option value="VS1">VS1</option>
                                        <option value="VS2">VS2</option>
                                        <option value="SI1">SI1</option>
                                        <option value="SI2">SI2</option>
                                        <option value="I1">I1</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Media Hub */}
                        <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs uppercase font-bold text-brand-navy tracking-widest">Media Hub</h3>
                                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Ready to Upload
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Primary Video */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-500">Primary Product Video (Optional)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleMediaUpload(e.target.files?.[0], 'video')}
                                        />
                                        <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-4 text-center group-hover:border-brand-gold transition-colors h-32 flex flex-col items-center justify-center">
                                            {formData.videoUrl ? (
                                                <div className="relative w-full h-full bg-black rounded overflow-hidden group/preview">
                                                    <video src={formData.videoUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-xs">Video Uploaded</div>
                                                    <button type="button" onClick={(e) => { e.preventDefault(); setFormData({ ...formData, videoUrl: '' }) }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-20">✕</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-2xl mb-2 text-gray-300 group-hover:text-brand-gold transition-colors">▶</span>
                                                    <p className="text-[10px] text-gray-400 font-bold group-hover:text-brand-navy">DRAG VIDEO HERE</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* IGI Certificate */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-500">IGI Certification</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleMediaUpload(e.target.files?.[0], 'certificate')}
                                        />
                                        <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-4 text-center group-hover:border-brand-navy transition-colors h-32 flex flex-col items-center justify-center">
                                            {formData.certificatePdf ? (
                                                <div className="text-brand-navy text-center">
                                                    <div className="text-2xl mb-1">📄</div>
                                                    <p className="text-[10px] font-bold">CERTIFICATE LINKED</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-2xl mb-2 text-gray-300 group-hover:text-brand-navy transition-colors">Certificate</span>
                                                    <p className="text-[10px] text-gray-400 font-bold group-hover:text-brand-navy">UPLOAD PDF/IMG</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Gallery */}
                            <div className="space-y-2">
                                <label className="block text-[10px] uppercase font-bold text-gray-500">Product Images (Min 3 / Max 4)</label>
                                <div className="grid grid-cols-4 gap-4">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div key={index} className="relative aspect-square group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => handleMediaUpload(e.target.files?.[0], `image-${index}`)}
                                            />
                                            <div className="w-full h-full border-2 border-dashed border-gray-300 bg-white rounded-lg overflow-hidden flex items-center justify-center group-hover:border-brand-gold transition-all">
                                                {tempImages[index] ? (
                                                    <img src={tempImages[index]} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                                                ) : (
                                                    <span className="text-xl text-gray-200 font-serif group-hover:text-brand-gold">{index + 1}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Description & AI */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold">Description</label>
                                <button
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={isGeneratingAI}
                                    className="text-[10px] font-bold bg-brand-gold text-brand-navy px-3 py-1.5 rounded-full hover:bg-brand-navy hover:text-brand-gold transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    {isGeneratingAI ? '✨ Writing...' : '✨ Magic Write'}
                                </button>
                            </div>
                            <textarea
                                className="w-full border border-gray-200 bg-gray-50 p-4 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none rounded transition-all focus:bg-white min-h-[100px]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed product description..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex justify-end gap-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-brand-navy transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isUploading}
                                className={`bg-brand-navy text-white px-8 py-3 rounded uppercase text-xs font-bold tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-colors shadow-lg ${loading || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (initialData ? 'Updating...' : 'Adding...') : isUploading ? 'Uploading Media...' : (initialData ? 'Update Product' : 'Save Product')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

