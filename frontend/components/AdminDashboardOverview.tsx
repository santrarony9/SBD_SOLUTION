'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: any[];
    monthlySales: { name: string, value: number }[];
}

export default function AdminDashboardOverview() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchAPI('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

    const cards = [
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-700' },
        { title: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-50 text-blue-700' },
        { title: 'Customers', value: stats.totalCustomers, color: 'bg-purple-50 text-purple-700' },
        { title: 'Products', value: stats.totalProducts, color: 'bg-orange-50 text-orange-700' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className={`p-6 rounded-none border border-gray-100 shadow-sm ${card.color}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">{card.title}</h3>
                        <p className="text-3xl font-serif mt-2">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-brand-navy mb-6">Sales Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlySales}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-brand-navy mb-6">Recent Activity</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 font-medium">Order ID</th>
                                    <th className="pb-3 font-medium">Customer</th>
                                    <th className="pb-3 font-medium text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 font-mono text-xs">{order.id.substring(0, 8)}...</td>
                                        <td className="py-3">{order.user?.name || 'Guest'}</td>
                                        <td className="py-3 text-right font-medium text-brand-navy">₹{order.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
