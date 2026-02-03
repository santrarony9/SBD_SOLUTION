'use client';

import { useState } from 'react';
import { fetchAPI } from '@/lib/api';

export default function AdminAddProduct({ onSuccess }: { onSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Rings', // Default
        price: '',
        images: '', // Comma separated for MVP
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
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
                category: formData.category, // Capture Category
                description: formData.description,
                goldPurity: parseInt(formData.goldPurity),
                goldWeight: parseFloat(formData.goldWeight),
                diamondCarat: parseFloat(formData.diamondCarat || '0'),
                diamondClarity: formData.diamondClarity,
                images: tempImages.filter(img => img), // Filter empty slots
                videoUrl: formData.videoUrl,
                certificatePdf: formData.certificatePdf,
                price: parseFloat(formData.price || '0')
            };

            await fetchAPI('/products', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            alert('Product Added Successfully');
            setIsOpen(false);
            setFormData({
                name: '', category: 'Rings', price: '', images: '',
                goldPurity: '18', goldWeight: '', diamondCarat: '', diamondClarity: 'SI1', description: '',
                videoUrl: '', certificatePdf: ''
            });
            setTempImages([]);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-brand-gold text-brand-navy px-6 py-3 font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-brand-gold border border-brand-gold transition-colors"
            >
                + Add New Product
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 max-w-2xl w-full shadow-2xl border border-brand-gold/20 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif text-brand-navy">Add New Product</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
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
                        <div className="space-y-6 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest">Media Hub</h3>
                                <span className="text-[10px] text-brand-gold font-bold">Upload from computer</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Primary Video */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-500">Primary Product Video (Plays First)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => handleMediaUpload(e.target.files?.[0], 'video')}
                                        />
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center group-hover:border-brand-gold transition-colors">
                                            {formData.videoUrl ? (
                                                <div className="relative aspect-video bg-black rounded overflow-hidden">
                                                    <video src={formData.videoUrl} className="w-full h-full object-cover" controls />
                                                    <button onClick={() => setFormData({ ...formData, videoUrl: '' })} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-[8px]">CHANGE</button>
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
                                                <div className="py-4 bg-brand-navy/5 rounded border border-brand-navy/10">
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
                                <label className="block text-[10px] uppercase font-bold text-gray-500">Product Images (Up to 4)</label>
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
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Description</label>
                        <textarea
                            className="w-full border border-gray-200 p-2 text-sm h-24"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className={`bg-brand-navy text-white px-8 py-3 uppercase text-xs font-bold tracking-widest transition-colors ${loading || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-gold'}`}
                        >
                            {loading ? 'Adding...' : isUploading ? 'Uploading Media...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
