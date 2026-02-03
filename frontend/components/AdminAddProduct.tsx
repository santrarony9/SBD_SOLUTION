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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-8 max-w-2xl w-full shadow-2xl border border-brand-gold/20 max-h-[90vh] overflow-y-auto rounded-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif text-brand-navy">
                        {initialData ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Name</label>
                            <input
                                required
                                className="w-full border border-gray-200 p-2 text-sm focus:border-brand-gold outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Category</label>
                            <select
                                className="w-full border border-gray-200 p-2 text-sm focus:border-brand-gold outline-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Rings">Rings</option>
                                <option value="Necklaces">Necklaces</option>
                                <option value="Earrings">Earrings</option>
                                <option value="Bangles">Bangles</option>
                                <option value="Pendants">Pendants</option>
                            </select>
                        </div>
                        <div className="space-y-6 bg-gray-50/50 p-6 rounded-lg border border-gray-100 md:col-span-2">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest">Media Hub</h3>
                                <span className="text-[10px] text-brand-gold font-bold">Upload from computer</span>
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
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center group-hover:border-brand-gold transition-colors">
                                            {formData.videoUrl ? (
                                                <div className="relative aspect-video bg-black rounded overflow-hidden group/preview">
                                                    <video src={formData.videoUrl} className="w-full h-full object-cover" controls />
                                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center shadow-lg">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        UPLOADED
                                                    </div>
                                                    <button type="button" onClick={(e) => { e.preventDefault(); setFormData({ ...formData, videoUrl: '' }) }} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors shadow-lg z-20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-[10px] text-gray-400 font-bold">DRAG & DROP VIDEO</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* IGI Certificate */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-500">IGI Certification (PDF/Image)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleMediaUpload(e.target.files?.[0], 'certificate')}
                                        />
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center group-hover:border-brand-navy transition-colors">
                                            {formData.certificatePdf ? (
                                                <div className="py-4 bg-brand-navy/5 rounded border border-brand-navy/10 relative group/preview">
                                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        UPLOADED
                                                    </div>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-brand-navy mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <p className="text-[10px] text-brand-navy font-bold">CERTIFICATE LINKED</p>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-[10px] text-gray-400 font-bold">UPLOAD CERTIFICATE</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <label className="block text-[10px] uppercase font-bold text-gray-500">Product Images (Min 3, Max 4)</label>
                                <div className="grid grid-cols-4 gap-4">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div key={index} className="relative aspect-square group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => handleMediaUpload(e.target.files?.[0], `image-${index}`)}
                                            />
                                            <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-white group-hover:border-brand-gold transition-all">
                                                {tempImages[index] ? (
                                                    <img src={tempImages[index]} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                                                ) : (
                                                    <span className="text-xl text-gray-200 font-serif">{index + 1}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 border border-gray-100">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gold Purity (K)</label>
                            <select
                                className="w-full border p-1"
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
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gold Weight (g)</label>
                            <input
                                type="number" step="0.01" required
                                className="w-full border p-1"
                                value={formData.goldWeight}
                                onChange={e => setFormData({ ...formData, goldWeight: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Dia. Carat</label>
                            <input
                                type="number" step="0.01"
                                className="w-full border p-1"
                                value={formData.diamondCarat}
                                onChange={e => setFormData({ ...formData, diamondCarat: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Dia. Clarity</label>
                            <select
                                className="w-full border p-1"
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

                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs uppercase tracking-wider text-gray-500">Description</label>
                            <button
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={isGeneratingAI}
                                className="text-[10px] font-bold bg-brand-gold/10 text-brand-gold px-2 py-1 rounded hover:bg-brand-gold hover:text-white transition-colors flex items-center gap-1"
                            >
                                {isGeneratingAI ? '✨ Writing...' : '✨ AI Generate'}
                            </button>
                        </div>
                        <textarea
                            className="w-full border border-gray-200 p-2 text-sm h-24"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the product..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className={`bg-brand-navy text-white px-8 py-3 uppercase text-xs font-bold tracking-widest transition-colors ${loading || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-gold'}`}
                        >
                            {loading ? (initialData ? 'Updating...' : 'Adding...') : isUploading ? 'Uploading Media...' : (initialData ? 'Update Product' : 'Save Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
