'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | 'new'>('new');
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

    const handleAddressSelect = (index: number | 'new') => {
        setSelectedAddressIndex(index);
        if (index === 'new') {
            setShippingAddress({
                fullName: user?.name || '',
                street: '',
                city: '',
                state: '',
                zip: '',
                country: 'India',
                phone: '',
            });
        } else {
            const addr = user?.addresses?.[index as number];
            if (addr) {
                setShippingAddress({ ...addr });
            }
        }
    };

    if (items.length === 0) {
        return <div className="p-32 text-center font-serif text-2xl text-brand-navy italic">Your royal collection is empty.</div>;
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
                    <header className="mb-8">
                        <h2 className="text-3xl font-serif text-brand-navy">Checkout Flow</h2>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-gold mt-1">Finalize your premium acquisition</p>
                    </header>

                    {user?.addresses && user.addresses.length > 0 && (
                        <div className="mb-8 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy">Select Saved Residency</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user?.addresses?.map((addr: any, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleAddressSelect(idx)}
                                        className={`p-4 border cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold' : 'border-gray-200 hover:border-brand-gold/50'}`}
                                    >
                                        <p className="font-bold text-xs uppercase tracking-tighter">{addr.fullName}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{addr.street}, {addr.city}</p>
                                    </div>
                                ))}
                                <div
                                    onClick={() => handleAddressSelect('new')}
                                    className={`p-4 border border-dashed cursor-pointer flex items-center justify-center transition-all ${selectedAddressIndex === 'new' ? 'border-brand-navy bg-gray-50' : 'border-gray-200 hover:border-brand-navy/50'}`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest">+ New Address</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="bg-white p-8 md:p-12 shadow-2xl border border-brand-gold/10 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16"></div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Full Name</label>
                                <input required name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Residency Address</label>
                                <input required name="street" value={shippingAddress.street} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">City</label>
                                <input required name="city" value={shippingAddress.city} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">State</label>
                                <input required name="state" value={shippingAddress.state} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Postal Code</label>
                                <input required name="zip" value={shippingAddress.zip} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Phone Number</label>
                                <input required name="phone" value={shippingAddress.phone} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="mt-12 relative z-10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy mb-6">Secured Acquisition Method</h3>
                            <div className="space-y-4">
                                <label className={`flex items-center space-x-4 p-5 border transition-all cursor-pointer ${paymentMethod === 'RAZORPAY' ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-200 hover:border-brand-gold/50'}`}>
                                    <input type="radio" name="payment" value="RAZORPAY" checked={paymentMethod === 'RAZORPAY'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-brand-gold" />
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-widest">Digital Transfer</p>
                                        <p className="text-[10px] text-gray-500 tracking-tighter">Debit, Credit Cards, or UPI Secure Portals</p>
                                    </div>
                                    <span className="bg-brand-gold text-brand-navy text-[8px] px-2 py-0.5 font-bold rounded-full ml-auto uppercase tracking-tighter">Recommended</span>
                                </label>
                                <label className={`flex items-center space-x-4 p-5 border transition-all cursor-pointer ${paymentMethod === 'COD' ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-200 hover:border-brand-gold/50'}`}>
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-brand-gold" />
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-widest">Acquisition on Delivery</p>
                                        <p className="text-[10px] text-gray-500 tracking-tighter">Pay at your residency upon receiving the piece</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-navy text-white py-5 mt-10 font-bold uppercase tracking-[0.3em] text-xs hover:bg-gold-gradient hover:text-brand-navy transition-all duration-500 shadow-2xl relative z-10"
                        >
                            {isLoading ? 'Securing Collection...' : `Confirm Acquisition — ₹${cartTotal.toLocaleString()}`}
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
                                                <Image src={item.product.images[0]} alt={item.product.name} width={50} height={50} className="w-full h-full object-cover" />
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
