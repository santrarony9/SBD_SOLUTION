'use client';

import { useState, useEffect } from 'react';
import { PiUserPlus, PiShieldCheck, PiEnvelope, PiLockKey } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';

export default function AdminTeamManager() {
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAPI('/auth/admin/team');
            if (Array.isArray(data)) {
                setTeamMembers(data);
            } else {
                console.error("Unexpected response format:", data);
                setTeamMembers([]);
            }
        } catch (error: any) {
            console.error("Failed to load team", error);
            setError(error.message || "Failed to load team members");
        } finally {
            setIsLoading(false);
        }
    };

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
            loadTeam(); // Refresh list
        } catch (error: any) {
            console.error("Failed to create admin", error);
            showStatus(error.message || 'Failed to create admin', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Notification */}
            {status && (
                <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded shadow-2xl border flex items-center gap-3 transition-all transform animate-slide-up ${status.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-sm font-bold tracking-wide">{status.message}</span>
                </div>
            )}

            {/* Left Column: Team List */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-serif text-brand-navy">Team Members</h3>
                            <p className="text-gray-400 text-sm">Manage administrators and staff access.</p>
                        </div>
                        <span className="bg-brand-navy text-brand-gold px-3 py-1 rounded-full text-xs font-bold">
                            Total: {teamMembers.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">User</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3 rounded-r-lg">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">Loading...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-red-500">
                                            <p className="font-bold">Error loading team</p>
                                            <p className="text-xs">{error}</p>
                                            <button onClick={loadTeam} className="mt-2 text-brand-navy underline text-xs">Retry</button>
                                        </td>
                                    </tr>
                                ) : teamMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">No team members found.</td>
                                    </tr>
                                ) : (
                                    teamMembers.map(member => (
                                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy font-bold text-xs">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-brand-navy">{member.name}</p>
                                                        <p className="text-xs text-gray-400">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${member.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    member.role === 'PRICE_MANAGER' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                    {member.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column: Add Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-brand-navy/5 rounded-full text-brand-navy">
                            <PiUserPlus className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-serif text-brand-navy">Add User</h3>
                    </div>

                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1.5">Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                className="w-full border p-2.5 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="e.g. admin@sparkbluediamond.com"
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                className="w-full border p-2.5 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1.5">Access Role</label>
                            <select
                                value={newAdmin.role}
                                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                className="w-full border p-2.5 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy appearance-none"
                            >
                                <option value="ADMIN">Super Admin</option>
                                <option value="PRICE_MANAGER">Price Manager</option>
                                <option value="STAFF">Staff</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1.5">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newAdmin.password}
                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                className="w-full border p-2.5 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-navy text-white py-2.5 rounded font-bold uppercase tracking-widest text-xs hover:bg-brand-gold hover:text-brand-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Creating...' : 'Create Admin Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
