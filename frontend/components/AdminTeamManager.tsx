'use client';

import { useState } from 'react';
import { PiUserPlus, PiShieldCheck, PiEnvelope, PiLockKey } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';

export default function AdminTeamManager() {
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showStatus = (message: string, type: 'success' | 'error') => {
        setStatus({ message, type });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
            return showStatus('All fields are required', 'error');
        }

        setIsLoading(true);
        try {
            await fetchAPI('/auth/admin/create', {
                method: 'POST',
                body: JSON.stringify(newAdmin)
            });
            showStatus('New Admin Created Successfully', 'success');
            setNewAdmin({ name: '', email: '', password: '', role: 'ADMIN' });
        } catch (error: any) {
            console.error("Failed to create admin", error);
            showStatus(error.message || 'Failed to create admin', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl animate-fade-in">
            {/* Status Notification */}
            {status && (
                <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded shadow-2xl border flex items-center gap-3 transition-all transform animate-slide-up ${status.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-sm font-bold tracking-wide">{status.message}</span>
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brand-navy/5 rounded-full text-brand-navy">
                        <PiShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-brand-navy">Add Team User</h3>
                        <p className="text-gray-400 text-sm">Create a new administrator account with full access.</p>
                    </div>
                </div>

                <form onSubmit={handleCreateAdmin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Full Name</label>
                        <div className="relative">
                            <PiUserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                className="w-full border p-3 pl-10 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Email Address</label>
                        <div className="relative">
                            <PiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                placeholder="e.g. admin@sparkbluediamond.com"
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                className="w-full border p-3 pl-10 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Access Role</label>
                        <div className="relative">
                            <PiShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={newAdmin.role}
                                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                className="w-full border p-3 pl-10 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy transition-colors appearance-none"
                            >
                                <option value="ADMIN">Super Admin (Full Access)</option>
                                <option value="PRICE_MANAGER">Price Manager (Rates Only)</option>
                                <option value="STAFF">Staff (Read Only)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Password</label>
                        <div className="relative">
                            <PiLockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newAdmin.password}
                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                className="w-full border p-3 pl-10 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-navy text-white py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-brand-gold hover:text-brand-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating...' : 'Create Admin Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
