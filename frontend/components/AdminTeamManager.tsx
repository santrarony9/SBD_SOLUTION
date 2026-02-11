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
    const [backendVersion, setBackendVersion] = useState<string | null>(null);

    useEffect(() => {
        loadTeam();
    }, []);

    const checkVersion = async () => {
        try {
            const res = await fetchAPI('/version'); // Global version
            setBackendVersion(res.version ? `v${res.version}` : 'Unknown');
        } catch (e) {
            setBackendVersion('Error');
        }
    };

    const loadTeam = async () => {
        setIsLoading(true);
        setError(null);
        checkVersion(); // Check version on load
        try {
            // Using new Users Module endpoint
            const data = await fetchAPI('/users');
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
            await fetchAPI('/users', {
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

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await fetchAPI(`/users/${id}`, { method: 'DELETE' });
            showStatus('User Deleted Successfully', 'success');
            loadTeam(); // Refresh list
        } catch (error: any) {
            console.error("Failed to delete user", error);
            showStatus(error.message || 'Failed to delete user', 'error');
        }
    };

    return (
        <div className="max-w-6xl animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Notification */}
            {status && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {status.message}
                </div>
            )}

            {/* Left Column: Team List */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-serif text-brand-navy">Team Members</h3>
                            <p className="text-gray-600 text-sm italic">Manage administrators and staff access.</p>
                            {backendVersion && (
                                <span className="text-xs text-brand-gold bg-brand-navy px-2 py-0.5 rounded ml-2">
                                    Backend: {backendVersion}
                                </span>
                            )}
                        </div>
                        <span className="bg-brand-navy text-brand-gold px-3 py-1 rounded-full text-xs font-bold">
                            Total: {teamMembers.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3">USER</th>
                                    <th className="px-4 py-3">ROLE</th>
                                    <th className="px-4 py-3">JOINED</th>
                                    <th className="px-4 py-3 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-600">Loading...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-red-500">
                                            <p className="font-bold">Error loading team</p>
                                            <p className="text-xs">{error}</p>
                                            <button onClick={loadTeam} className="mt-2 text-brand-navy underline text-xs">Retry</button>
                                        </td>
                                    </tr>
                                ) : teamMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">No team members found.</td>
                                    </tr>
                                ) : (
                                    teamMembers.map(member => (
                                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-brand-navy">{member.name}</div>
                                                <div className="text-xs text-brand-navy/70">{member.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    member.role === 'PRICE_MANAGER' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {member.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-brand-navy font-medium">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(member.id, member.name)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Delete
                                                </button>
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
                            <label className="block text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                className="w-full border p-2.5 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="e.g. admin@sparkbluediamond.com"
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                className="w-full border p-2.5 rounded text-sm outline-none focus:border-brand-gold bg-gray-50 text-brand-navy"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Access Role</label>
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
                            <label className="block text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1.5">Password</label>
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
                            className="w-full bg-brand-navy text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-gold hover:text-brand-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Creating...' : 'Create Admin Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
