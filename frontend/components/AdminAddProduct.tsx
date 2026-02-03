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
        description: ''
    });
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
                images: formData.images.split(',').map(s => s.trim()).filter(s => s),
                price: parseFloat(formData.price) // For now assuming backend might rely on this or calc
            };

            await fetchAPI('/products', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            alert('Product Added Successfully');
            setIsOpen(false);
            setFormData({
                name: '', category: 'Rings', price: '', images: '',
                goldPurity: '18', goldWeight: '', diamondCarat: '', diamondClarity: 'SI1', description: ''
            });
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
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Images (Comma split URL)</label>
                            <input
                                className="w-full border border-gray-200 p-2 text-sm focus:border-brand-gold outline-none"
                                placeholder="https://..., https://..."
                                value={formData.images}
                                onChange={e => setFormData({ ...formData, images: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Est. Price (Optional)</label>
                            <input
                                type="number"
                                className="w-full border border-gray-200 p-2 text-sm focus:border-brand-gold outline-none"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
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
                            disabled={loading}
                            className="bg-brand-navy text-white px-8 py-3 uppercase text-xs font-bold tracking-widest hover:bg-brand-gold transition-colors"
                        >
                            {loading ? 'Adding...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
