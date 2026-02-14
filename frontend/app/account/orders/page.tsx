'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    awbCode?: string; // Added for Shiprocket Tracking
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        product?: {
            images: string[];
            slug: string;
        };
    }[];
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
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

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;

        try {
            // Re-using the update status endpoint, but ideally should be a specific 'cancel' endpoint for users
            // However, since we don't have a user-facing 'cancel' endpoint yet, we'll direct them to support 
            // OR if we want to be proactive, we'd add 'POST /orders/:id/cancel' in backend.
            // For now, let's use the support alert as a safe fallback to prevent unauthorized status changes if endpoints aren't secured for user status updates.
            alert('To ensure security, please contact our Concierge to cancel your order.\n\nSupport: +91 99999 99999');
        } catch (error) {
            console.error("Cancellation failed", error);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase tracking-widest text-brand-navy">Retrieving your collection...</p>
        </div>
    );

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center border border-brand-charcoal/5 bg-white p-12">
                <div className="w-20 h-20 bg-brand-navy/5 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">💎</span>
                </div>
                <h3 className="text-2xl font-serif text-brand-navy mb-2">No Past Orders</h3>
                <p className="text-gray-500 mb-8 max-w-md font-light">Your legacy collection is waiting to be started. Explore our finest pieces.</p>
                <Link href="/shop" className="px-8 py-4 bg-brand-navy text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 shadow-lg hover:shadow-brand-gold/20">
                    Explore Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-brand-charcoal/10 pb-4">
                <h2 className="text-3xl font-serif text-brand-navy">Order History</h2>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{orders.length} Orders</p>
            </div>

            <div className="grid gap-8">
                {orders.map((order) => (
                    <div key={order.id} className="group bg-white border border-brand-charcoal/5 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-500 overflow-hidden relative">
                        {/* Decorative BG */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* Header */}
                        <div className="bg-brand-cream/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-charcoal/5 relative z-10">
                            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Placed On</p>
                                    <p className="text-sm font-sans text-brand-navy">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Order ID</p>
                                    <p className="text-sm font-mono text-brand-navy tracking-wide">#{order.id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 flex flex-col items-end">
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">Total Amount</p>
                                <p className="text-xl font-sans font-light text-brand-navy">₹{formatPrice(order.totalAmount)}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="p-6 relative z-10">
                            <div className="space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-6 items-center group/item hover:bg-brand-cream/20 p-2 rounded-lg transition-colors -mx-2">
                                        <div className="w-16 h-20 bg-brand-cream relative overflow-hidden flex-shrink-0 border border-brand-charcoal/5">
                                            {item.product?.images?.[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover/item:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 uppercase">img</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-serif text-lg text-brand-navy mb-1 group-hover/item:text-brand-gold transition-colors">{item.name}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span className="uppercase tracking-wider font-bold text-[9px]">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <p className="text-brand-navy font-sans text-right">₹{formatPrice(item.price)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer / Actions */}
                            <div className="mt-8 pt-6 border-t border-brand-charcoal/5 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex gap-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-navy/5 text-brand-navy border border-brand-navy/10'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-brand-navy'}`}></span>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm ${order.paymentStatus === 'PAID' ? 'bg-brand-gold/10 text-brand-navy border border-brand-gold/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>

                                <div className="flex gap-4">
                                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="text-[10px] uppercase font-bold tracking-[0.2em] text-red-400 hover:text-red-600 hover:underline transition-all"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    {order.status === 'DELIVERED' && (
                                        <button
                                            onClick={() => alert('Please contact support to initiate a return.\n\nSupport: +91 99999 99999')}
                                            className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-navy hover:text-brand-gold hover:underline transition-all"
                                        >
                                            Return / Exchange
                                        </button>
                                    )}
                                    <button className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-gold hover:text-brand-navy hover:underline transition-all">
                                        Download Invoice
                                    </button>
                                    {order.awbCode && (
                                        <a
                                            href={`https://shiprocket.co/tracking/${order.awbCode}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-brand-navy text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-brand-gold transition-colors shadow-sm"
                                        >
                                            Track Order
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
