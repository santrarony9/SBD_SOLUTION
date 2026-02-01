'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    items: {
        id: string;
        name: string;
        quantity: number;
    }[];
}

export default function AdminOrderList({ refreshTrigger }: { refreshTrigger: number }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const data = await fetchAPI('/orders/all');
            if (Array.isArray(data)) setOrders(data);
        } catch (error) {
            console.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [refreshTrigger]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await fetchAPI(`/orders/${id}/status`, {
                method: 'POST',
                body: JSON.stringify({ status: newStatus })
            });
            loadOrders(); // Refresh
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (isLoading) return <div className="text-gray-500 text-sm">Loading orders...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'SHIPPED': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="mt-8 bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <h3 className="font-serif text-xl text-brand-navy p-6 border-b border-gray-100 bg-gray-50/50">Recent Orders</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{order.id.slice(-8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-brand-navy">{order.user.name}</div>
                                    <div className="text-xs text-gray-400">{order.user.email}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-brand-gold">
                                    ₹{order.totalAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    {order.items.length} items
                                    <div className="text-gray-400 truncate max-w-[150px]">
                                        {order.items.map(i => i.name).join(', ')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className="text-xs border border-gray-200 rounded p-1 outline-none focus:border-brand-gold"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROCESSED">Processed</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
