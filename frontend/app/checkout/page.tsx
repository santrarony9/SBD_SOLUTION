'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PiCreditCard, PiBank, PiCurrencyInr, PiCheckCircle, PiWarningCircle } from 'react-icons/pi';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: user?.mobile || '',
    });

    const [paymentMethod, setPaymentMethod] = useState('CCAVENUE');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; value: number; type: string } | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // ... (Existing GST/Billing state - Keeping minimalistic for this view but functional)
    const [showGST, setShowGST] = useState(false);
    const [billingAddress, setBillingAddress] = useState({
        businessName: '',
        gstin: ''
    });

    // Address Handling
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoMessage(null);

        try {
            const res = await fetchAPI('/promos/validate', {
                method: 'POST',
                body: JSON.stringify({ code: promoCode })
            });

            if (res && res.code) {
                setAppliedPromo({
                    code: res.code,
                    value: res.discountValue,
                    type: res.discountType
                });
                setPromoMessage({ type: 'success', text: `Coupon '${res.code}' applied!` });
            } else {
                setAppliedPromo(null);
                setPromoMessage({ type: 'error', text: 'Invalid Coupon Code' });
            }
        } catch (err: any) {
            setAppliedPromo(null);
            setPromoMessage({ type: 'error', text: err.message || 'Failed to apply coupon' });
        } finally {
            setPromoLoading(false);
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoMessage(null);
    };

    // Calculate Totals
    const calculateDiscount = () => {
        if (!appliedPromo) return 0;
        if (appliedPromo.type === 'PERCENTAGE') {
            return (cartTotal * appliedPromo.value) / 100;
        }
        return appliedPromo.value; // FLAT
    };

    const discountAmount = calculateDiscount();
    const finalTotal = Math.max(0, cartTotal - discountAmount);
    const taxAmount = showGST ? finalTotal * 0.03 : 0; // GST on discounted price (standard practice, verify if needed on gross)
    const grandTotal = finalTotal + taxAmount;

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validation
        if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.phone || !shippingAddress.zip) {
            setError("Please fill in all required shipping details.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create Order
            const orderPayload = {
                shippingAddress,
                billingAddress: shippingAddress, // simplified for now
                paymentMethod,
                totalAmount: grandTotal, // Send FINAL amount
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                isB2B: showGST,
                customerGSTIN: showGST ? billingAddress.gstin : undefined,
                businessName: showGST ? billingAddress.businessName : undefined,
                // Promo Data
                promoCode: appliedPromo ? appliedPromo.code : null,
                discountAmount: discountAmount
            };

            const order = await fetchAPI('/orders', {
                method: 'POST',
                body: JSON.stringify(orderPayload)
            });

            if (order && order.id) {
                if (paymentMethod === 'CCAVENUE') {
                    // Initiate Payment
                    const paymentPayload = {
                        orderId: order.id,
                        amount: order.totalAmount, // vital security check on backend
                        user: {
                            name: shippingAddress.fullName,
                            address: shippingAddress.street,
                            city: shippingAddress.city,
                            zip: shippingAddress.zip,
                            state: shippingAddress.state,
                            country: 'India',
                            phone: shippingAddress.phone,
                            email: user?.email || 'guest@sparkbluediamond.com'
                        }
                    };

                    const paymentRes = await fetchAPI('/ccavenue/initiate', {
                        method: 'POST',
                        body: JSON.stringify(paymentPayload)
                    });

                    if (paymentRes.encRequest && paymentRes.access_code && paymentRes.url) {
                        // Create hidden form
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = paymentRes.url;

                        const encInput = document.createElement('input');
                        encInput.type = 'hidden';
                        encInput.name = 'encRequest';
                        encInput.value = paymentRes.encRequest;
                        form.appendChild(encInput);

                        const accessCodeInput = document.createElement('input');
                        accessCodeInput.type = 'hidden';
                        accessCodeInput.name = 'access_code';
                        accessCodeInput.value = paymentRes.access_code;
                        form.appendChild(accessCodeInput);

                        document.body.appendChild(form);

                        // Clear cart
                        await clearCart();

                        // Submit
                        form.submit();
                    } else {
                        throw new Error('Invalid payment initialization response from server.');
                    }
                } else {
                    showToast("Payment method disabled", "info");
                    setIsLoading(false);
                }
            } else {
                throw new Error("Failed to create order. Please try again.");
            }
        } catch (err: any) {
            setError(err.message || 'Payment System Unavailable. Please check your connection.');
            setIsLoading(false);
        }
    };

    if (items.length === 0 && !isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-3xl font-serif text-brand-navy mb-4">Your Bag is Empty</h2>
                <Link href="/collections" className="btn-primary">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <section className="bg-brand-cream/30 py-12 min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-12 text-center">
                    <h1 className="fluid-h2 font-serif text-brand-navy mb-4">Checkout</h1>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Link href="/cart" className="text-gray-500 hover:text-brand-gold transition-colors font-medium">Cart</Link>
                        <span>/</span>
                        <Link href="#shipping" className="text-brand-gold font-bold hover:text-brand-navy transition-colors">Details</Link>
                        <span>/</span>
                        <Link href="#payment" className="text-brand-navy font-bold hover:text-brand-gold transition-colors">Payment</Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address */}
                        <div id="shipping" className="bg-white p-8 shadow-sm border border-brand-charcoal/5 rounded-xl scroll-mt-24">
                            <h2 className="text-2xl font-serif text-brand-navy mb-6 flex items-center">
                                <PiCheckCircle className="mr-3 text-brand-gold" />
                                Shipping Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                                    <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-all" placeholder="John Doe" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone</label>
                                    <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-all" placeholder="+91 98765 43210" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Pincode</label>
                                    <input type="text" name="zip" value={shippingAddress.zip} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-all" placeholder="110001" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Address</label>
                                    <input type="text" name="street" value={shippingAddress.street} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-all" placeholder="Flat No, Building, Street" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">City</label>
                                    <input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-all" placeholder="New Delhi" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">State</label>
                                    <input type="text" name="state" value={shippingAddress.state} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-brand-gold focus:ring-0 outline-none transition-all" placeholder="Delhi" required />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div id="payment" className="bg-white p-8 shadow-sm border border-brand-charcoal/5 rounded-xl scroll-mt-24">
                            <h2 className="text-2xl font-serif text-brand-navy mb-6 flex items-center">
                                <PiCreditCard className="mr-3 text-brand-gold" />
                                Payment Method
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('CCAVENUE')}
                                    className={`relative p-6 border rounded-lg text-left transition-all ${paymentMethod === 'CCAVENUE' ? 'border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-serif text-lg text-brand-navy font-medium">Online Payment</span>
                                        {paymentMethod === 'CCAVENUE' && <div className="w-4 h-4 rounded-full bg-brand-gold border-2 border-white shadow-sm"></div>}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Credit/Debit Cards, NetBanking, UPI</p>
                                    <div className="flex gap-2 opacity-50">
                                        <div className="bg-gray-200 h-6 w-10"></div>
                                        <div className="bg-gray-200 h-6 w-10"></div>
                                        <div className="bg-gray-200 h-6 w-10"></div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('PHONEPE')}
                                    className={`relative p-6 border rounded-lg text-left transition-all opacity-50 cursor-not-allowed border-gray-100 bg-gray-50`}
                                    disabled
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-serif text-lg text-gray-400 font-medium">PhonePe / GPay</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">Temporarily Unavailable</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-brand-navy text-white p-8 rounded-xl sticky top-8 shadow-xl shadow-brand-navy/20">
                            <h3 className="text-xl font-serif mb-6 border-b border-white/10 pb-4">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-white/70">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-white/70">
                                    <span>Shipping</span>
                                    <span className="text-brand-gold">Free</span>
                                </div>

                                {appliedPromo && (
                                    <div className="flex justify-between text-brand-gold">
                                        <span>Discount ({appliedPromo.code})</span>
                                        <span>- {formatPrice(discountAmount)}</span>
                                    </div>
                                )}

                                {showGST && (
                                    <div className="flex justify-between text-white/70 text-xs mt-2 pt-2 border-t border-white/10">
                                        <span>GST (3%)</span>
                                        <span>{formatPrice(taxAmount)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Promo Code Input */}
                            <div className="mb-6">
                                {appliedPromo ? (
                                    <div className="flex justify-between items-center bg-brand-gold/20 p-3 rounded border border-brand-gold/30">
                                        <div className="flex items-center text-brand-gold text-xs font-bold uppercase tracking-wider">
                                            <PiCheckCircle className="mr-2 text-lg" />
                                            {appliedPromo.code} Applied
                                        </div>
                                        <button onClick={removePromo} className="text-white/50 hover:text-white text-xs underline">Remove</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            className="w-full bg-white/10 border border-white/10 p-3 text-white placeholder-white/40 focus:outline-none focus:border-brand-gold text-sm uppercase"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={promoLoading || !promoCode}
                                            className="px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                        >
                                            {promoLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                                {promoMessage && (
                                    <p className={`text-[10px] mt-2 ${promoMessage.type === 'success' ? 'text-brand-gold' : 'text-red-300'}`}>
                                        {promoMessage.text}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-2xl font-serif mb-8 pt-4 border-t border-white/10">
                                <span>Total</span>
                                <span>{formatPrice(grandTotal)}</span>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-200 text-sm">
                                    <PiWarningCircle className="mr-2 text-xl flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isLoading}
                                className={`w-full py-4 bg-brand-gold text-brand-navy font-bold uppercase tracking-widest hover:bg-white hover:text-brand-navy transition-all duration-300 relative overflow-hidden ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    "Place Order"
                                )}
                            </button>

                            <div className="mt-4 flex justify-center space-x-2 text-white/30">
                                <PiCheckCircle />
                                <span className="text-xs">Secure SSL Encrypted Transaction</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
