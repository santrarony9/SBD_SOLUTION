'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { PiUsers, PiTrophy, PiStar, PiNotebook, PiUserCircle, PiArrowUpRight } from 'react-icons/pi';

export default function CRMDashboard() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAPI('/crm/customers');
            setCustomers(data);
        } catch (err) {
            console.error("Failed to load CRM data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async (userId: string) => {
        try {
            await fetchAPI(`/crm/notes/${userId}`, {
                method: 'POST',
                body: JSON.stringify({ notes: noteText })
            });
            alert('Note saved!');
            loadCustomers();
        } catch (err) {
            alert('Failed to save note');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-brand-navy">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif text-brand-navy">CRM & Customer Intelligence</h1>
                    <p className="text-gray-500 text-sm">Managing the Royal Circles and relationship histories.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-lg shadow-sm border-l-4 border-brand-gold">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Active Royals</span>
                        <span className="text-xl font-serif text-brand-navy">
                            {customers.length}
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xs uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2">
                            <PiUsers className="text-lg" /> High Value Customers
                        </h2>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4 text-center">Tier</th>
                                <th className="px-6 py-4 text-right">Lifetime Spend</th>
                                <th className="px-6 py-4 text-right">Points</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {customers.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => { setSelectedUser(user); setNoteText(user.crmNotes || ''); }}
                                    className={`border-b border-gray-50 hover:bg-brand-gold/5 cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-brand-gold/10' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-[10px] font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold">{user.name}</div>
                                                <div className="text-[10px] text-gray-400">{user.email || user.mobile}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${user.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-600' :
                                                user.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-600' :
                                                    user.tier === 'SILVER' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {user.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium">₹{user.lifetimeSpend?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-brand-gold">{user.loyaltyPoints}</td>
                                    <td className="px-6 py-4 text-center">
                                        <PiArrowUpRight className="inline text-gray-300" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Intelligence Sidepanel */}
                <div className="space-y-6">
                    {selectedUser ? (
                        <div className="bg-white rounded-xl shadow-lg border border-brand-gold/20 p-6 sticky top-8">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center text-xl text-brand-gold font-serif">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif">{selectedUser.name}</h3>
                                    <p className="text-xs text-gray-400">Member since {new Date().getFullYear()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Total Orders</span>
                                    <span className="text-lg font-bold">₹{selectedUser.lifetimeSpend?.toLocaleString()}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg text-center">
                                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Available Points</span>
                                    <span className="text-lg font-bold text-brand-gold">{selectedUser.loyaltyPoints}</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2 flex items-center gap-2">
                                    <PiNotebook /> Relationship Manager Notes
                                </label>
                                <textarea
                                    className="w-full h-32 p-4 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-brand-gold resize-none"
                                    placeholder="Add preferences, family notes, or gift ideas..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                ></textarea>
                                <button
                                    onClick={() => handleAddNote(selectedUser.id)}
                                    className="w-full mt-3 bg-brand-navy text-white text-[10px] uppercase font-bold tracking-widest py-3 rounded hover:bg-brand-gold hover:text-brand-navy transition-all"
                                >
                                    Save Customer Intelligence
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] uppercase font-bold text-gray-400">Relationship History</h4>
                                <div className="text-[10px] text-gray-500 italic p-4 border border-dashed border-gray-200 rounded text-center">
                                    No logged staff actions yet.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 text-center p-8">
                            <PiUserCircle className="text-5xl mb-4 opacity-20" />
                            <p className="text-xs italic uppercase tracking-widest">Select a customer to view<br />deep intelligence</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
