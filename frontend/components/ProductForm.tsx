'use client';

import { useState } from 'react';
import { fetchAPI } from '@/lib/api';

interface ProductFormProps {
    onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        images: '', // Comma separated for now
        goldPurity: 22,
        goldWeight: 0,
        diamondWeight: 0,
        diamondClarity: 'SI1',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'goldWeight' || name === 'diamondWeight' || name === 'goldPurity' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await fetchAPI('/products', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
                    diamondCarat: formData.diamondWeight // Mapping UI 'weight' to Schema 'carat'
                }),
            });
            setMessage('Product created successfully!');
            setFormData({
                name: '', slug: '', description: '', images: '',
                goldPurity: 22, goldWeight: 0, diamondWeight: 0, diamondClarity: 'SI1'
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            setMessage('Failed to create product.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" rows={3} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Image URLs (comma separated)</label>
                <input name="images" value={formData.images} onChange={handleChange} className="w-full border p-2 rounded" placeholder="https://..., https://..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Gold Purity (K)</label>
                    <select name="goldPurity" value={formData.goldPurity} onChange={handleChange} className="w-full border p-2 rounded">
                        <option value={24}>24K</option>
                        <option value={22}>22K</option>
                        <option value={18}>18K</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Gold Weight (g)</label>
                    <input type="number" step="0.01" required name="goldWeight" value={formData.goldWeight} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Diamond Clarity</label>
                    <select name="diamondClarity" value={formData.diamondClarity} onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="VVS1">VVS1</option>
                        <option value="VS1">VS1</option>
                        <option value="SI1">SI1</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Diamond Weight (ct)</label>
                    <input type="number" step="0.01" required name="diamondWeight" value={formData.diamondWeight} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
            </div>

            <div className="pt-4">
                {message && <p className={`text-sm mb-2 ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
                <button type="submit" disabled={isLoading} className="bg-brand-navy text-white px-4 py-2 rounded w-full hover:bg-brand-gold transition-colors">
                    {isLoading ? 'Creating...' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
