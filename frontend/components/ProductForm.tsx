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
        images: '',
        coverImage: '',
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
                name: '', slug: '', description: '', images: '', coverImage: '',
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

    const inputClasses = "block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer transition-colors";
    const labelClasses = "peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6";

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-8 border border-brand-gold/20 shadow-lg relative overflow-hidden">
            {/* Gold Accent Top Border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative z-0 w-full group">
                    <input required name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder=" " />
                    <label className={labelClasses}>Product Name</label>
                </div>
                <div className="relative z-0 w-full group">
                    <input required name="slug" value={formData.slug} onChange={handleChange} className={inputClasses} placeholder=" " />
                    <label className={labelClasses}>Slug (URL)</label>
                </div>
            </div>

            <div className="relative z-0 w-full group">
                <textarea required name="description" value={formData.description} onChange={handleChange} className={inputClasses} rows={2} placeholder=" " />
                <label className={labelClasses}>Description</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative z-0 w-full group">
                    <input name="images" value={formData.images} onChange={handleChange} className={inputClasses} placeholder=" " />
                    <label className={labelClasses}>Image URLs (comma separated)</label>
                </div>
                <div className="relative z-0 w-full group">
                    <input name="coverImage" value={formData.coverImage} onChange={handleChange} className={inputClasses} placeholder=" " />
                    <label className={labelClasses}>Cover Image URL (Hover Effect)</label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest block">Gold Purity</label>
                    <select name="goldPurity" value={formData.goldPurity} onChange={handleChange} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-brand-gold bg-transparent">
                        <option value={24}>24K</option>
                        <option value={22}>22K</option>
                        <option value={18}>18K</option>
                    </select>
                </div>
                <div className="relative z-0 w-full group">
                    <input type="number" step="0.01" required name="goldWeight" value={formData.goldWeight} onChange={handleChange} className={inputClasses} placeholder=" " />
                    <label className={labelClasses}>Gold Weight (g)</label>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest block">Diamond Clarity</label>
                    <select name="diamondClarity" value={formData.diamondClarity} onChange={handleChange} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-brand-gold bg-transparent">
                        <option value="VVS1">VVS1</option>
                        <option value="VS1">VS1</option>
                        <option value="SI1">SI1</option>
                    </select>
                </div>
                <div className="relative z-0 w-full group">
                    <input type="number" step="0.01" required name="diamondWeight" value={formData.diamondWeight} onChange={handleChange} className={inputClasses} placeholder=" " />
                    <label className={labelClasses}>Diamond Carat</label>
                </div>
            </div>

            <div className="pt-6">
                {message && (
                    <div className={`p-4 mb-4 text-sm ${message.includes('success') ? 'text-green-800 bg-green-50 border-green-200' : 'text-red-800 bg-red-50 border-red-200'} border-l-4`}>
                        {message}
                    </div>
                )}
                <button type="submit" disabled={isLoading} className="bg-brand-navy text-white px-6 py-4 w-full md:w-auto font-bold uppercase tracking-widest text-sm hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 shadow-md">
                    {isLoading ? 'Creating...' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
