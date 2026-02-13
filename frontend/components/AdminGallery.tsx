'use client';

import { useState, useEffect } from 'react';
import { fetchAPI, API_URL } from '@/lib/api';
import { PiTrash, PiPencil, PiPlus, PiImage } from 'react-icons/pi';

interface GalleryItem {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    link?: string;
    order: number;
}

export default function AdminGallery() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        imageUrl: '',
        link: '',
        order: 0
    });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        try {
            const data = await fetchAPI('/gallery');
            setItems(data || []);
        } catch (error) {
            console.error('Failed to load gallery', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: File) => {
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
                throw new Error(errorText || 'Upload failed');
            }
            const result = await response.json();
            setFormData(prev => ({ ...prev, imageUrl: result.url }));
        } catch (error) {
            console.error('Upload Error:', error);
            alert(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await fetchAPI(`/gallery/${editingItem.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchAPI('/gallery', {
                    method: 'POST',
                    body: JSON.stringify({ ...formData, order: items.length + 1 })
                });
            }
            closeModal();
            loadGallery();
        } catch (error) {
            alert('Failed to save item');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await fetchAPI(`/gallery/${id}`, { method: 'DELETE' });
            loadGallery();
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    const openModal = (item?: GalleryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                subtitle: item.subtitle || '',
                imageUrl: item.imageUrl,
                link: item.link || '',
                order: item.order
            });
        } else {
            setEditingItem(null);
            setFormData({ title: '', subtitle: '', imageUrl: '', link: '', order: items.length + 1 });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif text-brand-navy">Gallery & Top Picks</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Manage Homepage Carousel</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-brand-navy text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-all shadow-lg"
                >
                    <PiPlus className="w-4 h-4" /> Add Item
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                        <div className="aspect-[3/4] overflow-hidden relative">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => openModal(item)}
                                    className="bg-white text-brand-navy p-2 rounded-full hover:bg-brand-gold transition-colors"
                                >
                                    <PiPencil />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <PiTrash />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-serif text-brand-navy truncate">{item.title}</h3>
                            <p className="text-[10px] text-brand-gold uppercase tracking-widest truncate">{item.subtitle || 'No Subtitle'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="bg-brand-navy p-4 flex justify-between items-center">
                            <h3 className="text-white font-serif">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={closeModal} className="text-white/50 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Title</label>
                                <input
                                    required
                                    className="w-full border border-gray-200 rounded p-2 text-sm focus:border-brand-gold outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Subtitle</label>
                                <input
                                    className="w-full border border-gray-200 rounded p-2 text-sm focus:border-brand-gold outline-none"
                                    value={formData.subtitle}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Link (Optional)</label>
                                <input
                                    className="w-full border border-gray-200 rounded p-2 text-sm focus:border-brand-gold outline-none"
                                    placeholder="/shop"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Image</label>
                                <div className={`relative border-2 ${isUploading ? 'border-brand-gold border-solid' : 'border-dashed border-gray-200'} rounded-lg p-4 h-48 flex items-center justify-center bg-gray-50 group hover:border-brand-gold transition-colors overflow-hidden`}>
                                    {isUploading ? (
                                        <div className="flex flex-col items-center justify-center text-brand-gold animate-pulse">
                                            <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <p className="text-xs font-bold uppercase tracking-widest">Uploading...</p>
                                        </div>
                                    ) : formData.imageUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={formData.imageUrl} className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                    className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg hover:scale-105 transition-transform"
                                                >
                                                    Remove Image
                                                </button>
                                            </div>
                                            {/* Success Indicator */}
                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-md">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <PiImage className="w-8 h-8 mx-auto text-gray-300 mb-2 group-hover:text-brand-gold transition-colors" />
                                            <p className="text-xs text-gray-400 font-bold group-hover:text-brand-navy">CLICK TO UPLOAD</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP</p>
                                        </div>
                                    )}

                                    {!isUploading && !formData.imageUrl && (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                            disabled={isUploading}
                                        />
                                    )}
                                </div>
                                {/* Error Message Placeholder (Managed via Alert currently, can be state driven later if needed) */}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-xs font-bold uppercase text-gray-500 hover:text-brand-navy">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={!formData.imageUrl || isUploading}
                                    className="bg-brand-navy text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-colors disabled:opacity-50"
                                >
                                    {editingItem ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
