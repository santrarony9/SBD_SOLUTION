'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
    }[];
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                // Ensure auth token is attached in api.ts
                const data = await fetchAPI('/orders');
                if (data) {
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to load orders");
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading your legacy...</div>;

    if (orders.length === 0) {
        return (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center border border-gray-100">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-serif text-brand-navy mb-2">No Past Orders</h3>
                <p className="text-gray-500 mb-6">Your collection is waiting to be started.</p>
                <Link href="/shop" className="inline-block px-8 py-3 bg-brand-navy text-white text-sm font-bold uppercase tracking-widest hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300">
                    Discover Issues
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-serif text-brand-navy mb-4">Order History</h2>

            {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:border-brand-gold/30 transition-all duration-300">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Order Placed</p>
                            <p className="text-sm font-medium text-brand-navy">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1 mt-2 sm:mt-0">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Total Amount</p>
                            <p className="text-sm font-bold text-brand-navy">₹{order.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 mt-2 sm:mt-0">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Order #</p>
                            <p className="text-sm font-mono text-gray-600">{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                            Img
                                        </div>
                                        <div>
                                            <p className="font-serif text-brand-navy">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex space-x-2">
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {order.status}
                                </span>
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <button className="text-brand-navy text-sm font-bold hover:text-brand-gold transition-colors">
                                View Invoice
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
