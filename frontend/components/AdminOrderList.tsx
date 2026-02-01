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

    const handleDownloadInvoice = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoice/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Failed to download invoice", error);
            alert("Error downloading invoice");
        }
    };

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

    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const toggleSelect = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const handleBulkPrint = async (type: 'invoice' | 'label' | 'credit-note') => {
        if (selectedOrders.length === 0) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoice/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderIds: selectedOrders, type })
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Bulk-${type}s.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Bulk print failed", error);
        }
    };

    const handleDownloadCreditNote = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoice/credit-note/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CreditNote-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Credit note download failed", error);
        }
    };

    const handleDownloadLabel = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoice/label/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Label-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Label download failed", error);
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
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                <h3 className="font-serif text-xl text-brand-navy">Order Intelligence</h3>

                {selectedOrders.length > 0 && (
                    <div className="flex items-center gap-3 animate-fadeIn">
                        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">{selectedOrders.length} Selected</span>
                        <button onClick={() => handleBulkPrint('invoice')} className="px-3 py-1.5 bg-brand-navy text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-brand-gold transition-colors">Bulk Invoices</button>
                        <button onClick={() => handleBulkPrint('label')} className="px-3 py-1.5 bg-brand-gold text-brand-navy text-[10px] font-bold uppercase tracking-widest rounded hover:bg-brand-navy hover:text-white transition-colors">Bulk Labels</button>
                        <button onClick={() => handleBulkPrint('credit-note')} className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-700 transition-colors">Bulk Credit Notes</button>
                        <button onClick={() => setSelectedOrders([])} className="text-[10px] text-gray-400 uppercase font-bold tracking-widest hover:text-red-500">Cancel</button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                        <tr>
                            <th className="px-4 py-4 w-10"></th>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className={`transition-colors ${selectedOrders.includes(order.id) ? 'bg-brand-gold/5' : 'hover:bg-gray-50/80'}`}>
                                <td className="px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={() => toggleSelect(order.id)}
                                        className="accent-brand-gold"
                                    />
                                </td>
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
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleDownloadInvoice(order.id)}
                                        className="p-1.5 text-brand-gold hover:bg-brand-gold/10 rounded"
                                        title="Tax Invoice"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDownloadLabel(order.id)}
                                        className="p-1.5 text-brand-navy hover:bg-brand-navy/10 rounded"
                                        title="Shipping Label"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </button>
                                    {order.status === 'CANCELLED' && (
                                        <button
                                            onClick={() => handleDownloadCreditNote(order.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                            title="Download Credit Note"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                            </svg>
                                        </button>
                                    )}
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className="text-[10px] border border-gray-200 rounded p-1"
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
