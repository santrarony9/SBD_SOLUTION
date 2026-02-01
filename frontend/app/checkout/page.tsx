'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or RAZORPAY
    const [isLoading, setIsLoading] = useState(false);

    if (items.length === 0) {
        return <div className="p-12 text-center">Your cart is empty. Please add items to checkout.</div>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Create Order on Backend
            const order = await fetchAPI('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    shippingAddress,
                    paymentMethod
                })
            });

            if (order) {
                if (paymentMethod === 'RAZORPAY') {
                    // 2a. Razorpay Flow (Simulated)
                    // Ideally: Open Razorpay Modal here using order.razorpayOrderId
                    // For now: Simulate success
                    simulateRazorpaySuccess(order.id);
                } else {
                    // 2b. COD Flow
                    await clearCart();
                    router.push(`/orders/success?id=${order.id}`); // Ideal: Success Page
                    alert('Order Placed Successfully! Order ID: ' + order.id);
                    router.push('/shop'); // Fallback
                }
            }
        } catch (error) {
            console.error('Order failed', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const simulateRazorpaySuccess = async (orderId: string) => {
        // Mocking the payment verification call
        alert(`Razorpay Payment Simulated! \nOrder ID: ${orderId} \nPayment ID: pay_mock_${Date.now()}`);
        await clearCart();
        router.push('/shop');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: Shipping Form */}
                <div>
                    <h2 className="text-2xl font-serif text-brand-navy mb-6">Shipping Details</h2>
                    <form onSubmit={handlePlaceOrder} className="bg-white p-8 rounded shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input required name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-3 focus:border-brand-gold outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input required name="street" value={shippingAddress.street} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-3 focus:border-brand-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input required name="city" value={shippingAddress.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-3 focus:border-brand-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input required name="state" value={shippingAddress.state} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-3 focus:border-brand-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                <input required name="zip" value={shippingAddress.zip} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-3 focus:border-brand-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input required name="phone" value={shippingAddress.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-3 focus:border-brand-gold outline-none" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-brand-navy mb-4">Payment Method</h3>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 p-4 border rounded cursor-pointer hover:border-brand-gold transition-colors">
                                    <input type="radio" name="payment" value="RAZORPAY" checked={paymentMethod === 'RAZORPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-brand-gold focus:ring-brand-gold" />
                                    <span className="font-bold">Pay via Razorpay (Cards/UPI)</span>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded ml-auto">Recommended</span>
                                </label>
                                <label className="flex items-center space-x-3 p-4 border rounded cursor-pointer hover:border-brand-gold transition-colors">
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="text-brand-gold focus:ring-brand-gold" />
                                    <span className="font-bold">Pay on Request / COD</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-navy text-white text-lg font-bold py-4 mt-6 hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 shadow-lg"
                        >
                            {isLoading ? 'Processing...' : `Pay ₹${cartTotal.toLocaleString()}`}
                        </button>
                    </form>
                </div>

                {/* Right: Order Summary */}
                <div className="h-fit sticky top-24">
                    <div className="bg-brand-cream/50 p-8 rounded border border-brand-gold/20">
                        <h2 className="text-xl font-serif text-brand-navy mb-6">Your Order ({items.length} items)</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                            {item.product.images[0] && (
                                                <img src={item.product.images[0]} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-navy">{item.product.name}</p>
                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-mono">₹{item.calculatedPrice?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-brand-gold/20 my-6"></div>
                        <div className="flex justify-between items-center text-2xl font-bold text-brand-navy">
                            <span>Total</span>
                            <span>₹{cartTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
