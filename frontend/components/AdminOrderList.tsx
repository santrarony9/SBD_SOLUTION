'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { PiRocket, PiCheckCircle, PiMagnifyingGlass, PiFunnel, PiCaretLeft, PiCaretRight } from "react-icons/pi";
import { formatPrice } from '@/lib/utils';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    shiprocketOrderId?: string;
    shipmentId?: string;
    awbCode?: string;
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
    const [pushingId, setPushingId] = useState<string | null>(null);

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (search) params.append('search', search);
            if (statusFilter !== 'ALL') params.append('status', statusFilter);

            const response = await fetchAPI(`/orders/all?${params.toString()}`);

            if (response.data) {
                setOrders(response.data);
                setTotalPages(response.meta.last_page);
            } else if (Array.isArray(response)) {
                // Fallback for old API response if any
                setOrders(response);
            }
        } catch (error) {
            console.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadOrders();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [refreshTrigger, search, statusFilter, page]);

    const handleDownloadInvoice = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/${orderId}`, {
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

    const handleShipOrder = async (id: string) => {
        setPushingId(id);
        try {
            const res = await fetchAPI(`/orders/${id}/shiprocket`, { method: 'POST' });
            // The backend now returns { success: true, awb: ..., trackingUrl: ... }
            if (res.success || res.awb) {
                alert(`Order Shipped! AWB: ${res.awb || res.shiprocketOrder?.awb_code}`);
                await loadOrders();
            } else {
                alert("Shipment initiated but no AWB returned yet. Check status.");
                await loadOrders();
            }
        } catch (error) {
            console.error("Ship order failed", error);
            alert("Failed to ship order. Check console/logs.");
        } finally {
            setPushingId(null);
        }
    };

    const handleDownloadLabel = async (orderId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/label`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.labelUrl) {
                window.open(data.labelUrl, '_blank');
            } else {
                alert('Label not available yet.');
            }
        } catch (error) {
            console.error("Failed to get label", error);
            alert("Failed to fetch label.");
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/bulk`, {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoice/credit-note/${orderId}`, {
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
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <h3 className="font-serif text-xl text-brand-navy whitespace-nowrap">Order Intelligence</h3>

                    {/* Search */}
                    <div className="relative group w-full md:w-64">
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Order ID, Name, Phone..."
                            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative group ml-2">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <PiFunnel />
                        </div>
                        <select
                            className="pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold appearance-none cursor-pointer hover:border-brand-gold/50 transition-colors"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                    {selectedOrders.length > 0 ? (
                        <div className="flex items-center gap-2 animate-fadeIn">
                            <span className="text-xs font-bold text-brand-navy mr-2">{selectedOrders.length} selected</span>
                            <button onClick={() => handleBulkPrint('invoice')} className="px-3 py-1.5 bg-brand-navy text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-brand-gold transition-colors">Inv</button>
                            <button onClick={() => handleBulkPrint('label')} className="px-3 py-1.5 bg-brand-gold text-brand-navy text-[10px] font-bold uppercase tracking-widest rounded hover:bg-brand-navy hover:text-white transition-colors">Lbl</button>
                            <button onClick={() => handleBulkPrint('credit-note')} className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-700 transition-colors">CN</button>
                            <button onClick={() => setSelectedOrders([])} className="px-2 text-gray-400 hover:text-red-500">✕</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/shiprocket/test`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        const data = await res.json();
                                        alert(data.message);
                                    } catch (e) {
                                        alert('Connection Test Failed');
                                    }
                                }}
                                className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/60 border border-brand-navy/10 px-3 py-1.5 rounded hover:bg-brand-navy hover:text-white transition-all"
                            >
                                Test Shiprocket
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[400px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48 text-gray-400 text-sm animate-pulse">
                        Searching orders...
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                            <tr>
                                <th className="px-4 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedOrders(orders.map(o => o.id));
                                            else setSelectedOrders([]);
                                        }}
                                        checked={orders.length > 0 && selectedOrders.length === orders.length}
                                        className="accent-brand-gold"
                                    />
                                </th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Logistics</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                                        No orders found matching your filters.
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} className={`transition-colors ${selectedOrders.includes(order.id) ? 'bg-brand-gold/5' : 'hover:bg-gray-50/80'}`}>
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={() => toggleSelect(order.id)}
                                            className="accent-brand-gold"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        <span className="block font-bold text-brand-navy">{order.id.slice(-8)}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-brand-navy">{order.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-brand-gold">{order.user?.email || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 font-serif text-brand-navy">
                                        ₹{formatPrice(order.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.shiprocketOrderId ? (
                                            <div className="flex flex-col gap-1 items-start">
                                                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                                    <PiCheckCircle className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Synced</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDownloadLabel(order.id)}
                                                    className="text-[9px] font-bold uppercase tracking-widest text-brand-gold hover:underline pl-1"
                                                >
                                                    Get Label
                                                </button>
                                                {order.awbCode && <span className="text-[9px] font-mono text-gray-400 pl-1">AWB: {order.awbCode}</span>}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleShipOrder(order.id)}
                                                disabled={pushingId === order.id}
                                                className="flex items-center gap-1.5 text-white bg-brand-navy hover:bg-brand-gold px-3 py-1.5 rounded-md transition-all disabled:opacity-50 shadow-sm"
                                            >
                                                <PiRocket className={`w-3.5 h-3.5 ${pushingId === order.id ? 'animate-bounce' : ''}`} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {pushingId === order.id ? 'Shipping...' : 'Ship Order'}
                                                </span>
                                            </button>
                                        )}
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
                                            className="text-[10px] border border-gray-200 rounded p-1 outline-none focus:border-brand-gold"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PROCESSED">Processed</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                            <option value="RETURN_REQUESTED">Return Requested</option>
                                            <option value="RETURNED">Returned</option>
                                            <option value="EXCHANGE_REQUESTED">Exchange Requested</option>
                                            <option value="EXCHANGED">Exchanged</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500 font-medium">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 bg-white border border-gray-200 rounded hover:border-brand-gold disabled:opacity-50 disabled:hover:border-gray-200 transition-colors"
                    >
                        <PiCaretLeft className="w-4 h-4 text-brand-navy" />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 bg-white border border-gray-200 rounded hover:border-brand-gold disabled:opacity-50 disabled:hover:border-gray-200 transition-colors"
                    >
                        <PiCaretRight className="w-4 h-4 text-brand-navy" />
                    </button>
                </div>
            </div>
        </div>
    );
}
