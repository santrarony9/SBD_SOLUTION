'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';

export default function AddressBook() {
    const { user, login } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await fetchAPI('/profile/addresses', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            // Update local user state in context
            login(localStorage.getItem('token') || '', updatedUser);
            setIsAdding(false);
            setFormData({ fullName: '', street: '', city: '', state: '', zip: '', country: 'India', phone: '' });
            alert('Residency added for your collection.');
        } catch (error) {
            alert('Faced an era in adding residency.');
        } finally {
            setLoading(false);
        }
    };

    const removeAddress = async (index: number) => {
        if (!confirm('Remove this residency?')) return;
        try {
            const updatedUser = await fetchAPI(`/profile/addresses/${index}`, {
                method: 'DELETE'
            });
            login(localStorage.getItem('token') || '', updatedUser);
        } catch (error) {
            alert('Failed to remove.');
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-serif text-brand-navy">Address Book</h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-[10px] px-6 py-2 bg-brand-gold text-brand-navy font-bold uppercase tracking-widest hover:bg-brand-navy hover:text-white transition-all shadow-lg"
                    >
                        + Add New
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="bg-gray-50 p-8 border border-brand-gold/20 animate-slide-up">
                    <div className="flex justify-between mb-6">
                        <h3 className="font-serif text-lg text-brand-navy">New Collection Point</h3>
                        <button onClick={() => setIsAdding(false)} className="text-xs text-gray-400 uppercase tracking-widest hover:text-red-500">Cancel</button>
                    </div>
                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <input
                                required placeholder="Full Name of Recipient"
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <input
                                required placeholder="Street Address / Area"
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                            />
                        </div>
                        <input
                            required placeholder="City"
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                        <input
                            required placeholder="State / Province"
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                        />
                        <input
                            required placeholder="ZIP / Postal Code"
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                            value={formData.zip}
                            onChange={e => setFormData({ ...formData, zip: e.target.value })}
                        />
                        <input
                            required placeholder="Contact Number"
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-navy text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-xl"
                            >
                                {loading ? 'Saving to Archive...' : 'Confirm Residency'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {user?.addresses?.map((addr: any, index: number) => (
                    <div key={index} className="group relative bg-white p-8 border border-gray-100 shadow-lg hover:border-brand-gold transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => removeAddress(index)} className="text-gray-300 hover:text-red-500 text-sm">Remove</button>
                        </div>
                        <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-4">Saved Contact {index + 1}</p>
                        <h4 className="font-serif text-lg text-brand-navy mb-2">{addr.fullName}</h4>
                        <div className="text-sm font-light text-gray-500 space-y-1">
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="font-bold text-brand-navy uppercase tracking-tighter mt-4">{addr.country}</p>
                            <p className="mt-2 flex items-center space-x-2">
                                <span>📱</span>
                                <span className="font-mono text-xs">{addr.phone}</span>
                            </p>
                        </div>
                    </div>
                ))}

                {(!user?.addresses || user.addresses.length === 0) && !isAdding && (
                    <div className="col-span-2 py-20 text-center border-2 border-dashed border-gray-100 opacity-50">
                        <p className="font-serif text-xl italic text-gray-400">Your residency archive is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
