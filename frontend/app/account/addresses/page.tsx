'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AddressBook() {
    const { user, login } = useAuth();
    const { showToast } = useToast();
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
            showToast('Residency Added', 'success');
        } catch (error) {
            showToast('Failed to add residency', 'error');
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
            showToast('Residency Removed', 'success');
        } catch (error) {
            showToast('Failed to remove residency', 'error');
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end border-b border-brand-charcoal/10 pb-4">
                <h2 className="text-3xl font-serif text-brand-navy">Address Book</h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-[10px] px-8 py-3 bg-brand-navy text-white font-bold uppercase tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-lg hover:shadow-brand-gold/20"
                    >
                        + Add Residency
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="bg-white p-8 md:p-12 border border-brand-gold/20 shadow-2xl relative overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h3 className="font-serif text-2xl text-brand-navy">New Collection Point</h3>
                        <button onClick={() => setIsAdding(false)} className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-red-500 font-bold">Cancel</button>
                    </div>

                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="md:col-span-2 group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Recipient Name</label>
                            <input
                                required
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy font-serif text-lg focus:border-brand-gold outline-none transition-colors"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Street Address</label>
                            <input
                                required
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none transition-colors"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">City</label>
                            <input
                                required
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none transition-colors"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">State</label>
                            <input
                                required
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none transition-colors"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Postal Code</label>
                            <input
                                required
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none transition-colors"
                                value={formData.zip}
                                onChange={e => setFormData({ ...formData, zip: e.target.value })}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Contact Number</label>
                            <input
                                required
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none transition-colors font-sans"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2 pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-navy text-white py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-xl hover:shadow-brand-gold/20"
                            >
                                {loading ? 'Saving to Archive...' : 'Confirm Residency'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {user?.addresses?.map((addr: any, index: number) => (
                    <div key={index} className="group relative bg-white p-8 border border-brand-charcoal/5 shadow-sm hover:shadow-xl hover:border-brand-gold/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => removeAddress(index)} className="text-[9px] font-bold uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors">Remove</button>
                        </div>

                        <p className="text-[9px] text-brand-gold font-bold uppercase tracking-[0.2em] mb-6 border-b border-brand-gold/10 pb-2 inline-block">Residency {index + 1}</p>

                        <h4 className="font-serif text-xl text-brand-navy mb-4">{addr.fullName}</h4>
                        <div className="text-sm font-light text-gray-500 space-y-1 leading-relaxed">
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.state} <span className="font-sans">{addr.zip}</span></p>
                            <p className="font-bold text-brand-navy uppercase tracking-widest text-xs mt-4">{addr.country}</p>
                            <p className="mt-4 flex items-center space-x-2 text-brand-navy/60">
                                <span className="text-[10px] uppercase font-bold tracking-widest">Mobile</span>
                                <span className="font-mono text-xs font-sans">{addr.phone}</span>
                            </p>
                        </div>
                    </div>
                ))}

                {(!user?.addresses || user.addresses.length === 0) && !isAdding && (
                    <div className="col-span-2 py-24 text-center border-2 border-dashed border-brand-charcoal/5 rounded-sm bg-brand-cream/20">
                        <div className="w-16 h-16 bg-brand-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                            📍
                        </div>
                        <p className="font-serif text-2xl text-brand-navy mb-2">Empty Archive</p>
                        <p className="text-gray-400 text-sm font-light">Your residency archive is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
