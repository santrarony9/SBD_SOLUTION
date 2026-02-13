'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

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

    const [paymentMethod, setPaymentMethod] = useState('PHONEPE');
    const [isLoading, setIsLoading] = useState(false);

    const [showGST, setShowGST] = useState(false);
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [billingAddress, setBillingAddress] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        businessName: '',
        gstin: ''
    });

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    const handleApplyPromo = async () => {
        setPromoError('');
        setIsApplyingPromo(true);
        try {
            const res = await fetchAPI('/promos/validate', {
                method: 'POST',
                body: JSON.stringify({ code: promoCode })
            });

            if (res.discountType === 'FLAT') {
                if (res.discountValue > cartTotal) {
                    setPromoError('Cart value must be higher than discount');
                } else {
                    setDiscount(res.discountValue);
                }
            } else if (res.discountType === 'PERCENTAGE') {
                const disc = Math.round((cartTotal * res.discountValue) / 100);
                setDiscount(disc);
            }
        } catch (err) {
            setPromoError('Invalid Code');
            setDiscount(0);
        } finally {
            setIsApplyingPromo(false);
        }
    };

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
                    billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
                    paymentMethod: 'PHONEPE',
                    promoCode: discount > 0 ? promoCode : null,
                    discountAmount: discount,
                    isB2B: showGST,
                    customerGSTIN: billingAddress.gstin,
                    businessName: billingAddress.businessName,
                    placeOfSupply: shippingAddress.state
                })
            });

            if (order) {
                // 2. Initiate PhonePe Payment
                try {
                    const paymentRes = await fetchAPI('/phonepe/initiate', {
                        method: 'POST',
                        body: JSON.stringify({
                            orderId: order.id,
                            amount: order.totalAmount, // Backend will convert to paise
                            mobile: shippingAddress.phone || '9999999999',
                            userId: user?.id || 'GUEST'
                        })
                    });

                    if (paymentRes.url) {
                        // Redirect to PhonePe Payment Page
                        await clearCart(); // Clear cart before redirecting
                        window.location.href = paymentRes.url;
                    } else {
                        alert('Failed to initiate PhonePe payment.');
                        setIsLoading(false);
                    }
                } catch (paymentError) {
                    console.error('PhonePe Initiation Error', paymentError);
                    alert('Payment System Unavailable. Please try again.');
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error('Order failed', error);
            alert('Failed to place order. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream/50 py-8 md:py-16">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 relative">

                {/* Left: Shipping Form */}
                <div className="lg:col-span-7">
                    <header className="mb-12">
                        <Link href="/cart" className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-brand-navy mb-4 inline-block transition-colors">
                            ← Back to Cart
                        </Link>
                        <h2 className="text-4xl md:text-5xl font-serif text-brand-navy mb-2">Checkout</h2>
                        <div className="w-16 h-1 bg-brand-gold"></div>
                        <p className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500 mt-4">Secure Your Masterpiece</p>
                    </header>

                    <form onSubmit={handlePlaceOrder} className="space-y-12">

                        {/* Shipping Section */}
                        <div className="animate-fade-in-up">
                            <h3 className="font-serif text-2xl text-brand-navy mb-8 flex items-center">
                                <span className="w-8 h-8 rounded-full border border-brand-navy text-brand-navy text-sm flex items-center justify-center mr-4 font-sans">1</span>
                                Shipping Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-10 pl-4 md:pl-12 border-l border-brand-charcoal/10">
                                <div className="md:col-span-2 group">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Full Name</label>
                                    <input required name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors placeholder-gray-300 font-serif text-lg" placeholder="John Doe" />
                                </div>
                                <div className="md:col-span-2 group">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Residency Address</label>
                                    <input required name="street" value={shippingAddress.street} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors placeholder-gray-300" placeholder="House No, Street Name" />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">City</label>
                                    <input required name="city" value={shippingAddress.city} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors" />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">State</label>
                                    <input required name="state" value={shippingAddress.state} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors" />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Postal Code</label>
                                    <input required name="zip" value={shippingAddress.zip} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors" />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Phone Number</label>
                                    <input required name="phone" value={shippingAddress.phone} onChange={handleInputChange} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* GST & Billing Section */}
                        <div className="animate-fade-in-up delay-100">
                            <h3 className="font-serif text-2xl text-brand-navy mb-8 flex items-center">
                                <span className="w-8 h-8 rounded-full border border-brand-navy text-brand-navy text-sm flex items-center justify-center mr-4 font-sans">2</span>
                                Billing & Tax
                            </h3>

                            <div className="pl-4 md:pl-12 border-l border-brand-charcoal/10 space-y-8">
                                <label className="flex items-center space-x-4 cursor-pointer group">
                                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${showGST ? 'bg-brand-navy border-brand-navy' : 'border-gray-300 group-hover:border-brand-gold'}`}>
                                        {showGST && <svg className="w-3 h-3 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input type="checkbox" checked={showGST} onChange={(e) => setShowGST(e.target.checked)} className="hidden" />
                                    <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">I require a GST Invoice (B2B)</span>
                                </label>

                                {showGST && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/50 p-6 border border-brand-gold/10">
                                        <div className="group">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Business Name</label>
                                            <input required value={billingAddress.businessName} onChange={(e) => setBillingAddress({ ...billingAddress, businessName: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors" />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">GSTIN</label>
                                            <input required value={billingAddress.gstin} onChange={(e) => setBillingAddress({ ...billingAddress, gstin: e.target.value.toUpperCase() })} className="w-full bg-transparent border-b border-gray-300 py-2 text-brand-navy focus:border-brand-gold outline-none transition-colors uppercase" placeholder="e.g. 24AAAAA0000A1Z5" />
                                        </div>
                                    </div>
                                )}

                                <label className="flex items-center space-x-4 cursor-pointer group">
                                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${billingSameAsShipping ? 'bg-brand-navy border-brand-navy' : 'border-gray-300 group-hover:border-brand-gold'}`}>
                                        {billingSameAsShipping && <svg className="w-3 h-3 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} className="hidden" />
                                    <span className="text-xs font-medium text-gray-500 italic">Billing address is same as shipping</span>
                                </label>

                                {!billingSameAsShipping && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/50 p-6 border border-brand-gold/10">
                                        {/* Billing Fields ... (Simplified for brevity, same style as shipping) */}
                                        <div className="md:col-span-2 group">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Billing Address</label>
                                            <input required value={billingAddress.street} onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none" />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">City</label>
                                            <input required value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none" />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Postal Code</label>
                                            <input required value={billingAddress.zip} onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-brand-gold outline-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="animate-fade-in-up delay-200">
                            <h3 className="font-serif text-2xl text-brand-navy mb-8 flex items-center">
                                <span className="w-8 h-8 rounded-full border border-brand-navy text-brand-navy text-sm flex items-center justify-center mr-4 font-sans">3</span>
                                Payment Method
                            </h3>

                            <div className="pl-4 md:pl-12 border-l border-brand-charcoal/10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className={`relative p-6 border transition-all cursor-pointer group ${paymentMethod === 'PHONEPE' ? 'border-brand-gold bg-white shadow-lg shadow-brand-gold/5' : 'border-gray-200 bg-white/50 hover:border-brand-gold/30'}`}>
                                        <input type="radio" name="payment" value="PHONEPE" checked={paymentMethod === 'PHONEPE'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="font-serif text-lg text-brand-navy">PhonePe Secure</span>
                                            {paymentMethod === 'PHONEPE' && <div className="w-4 h-4 rounded-full bg-brand-gold"></div>}
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed mb-4">Pay securely via UPI, Credit/Debit Card, or Net Banking using PhonePe gateway.</p>
                                        <div className="flex gap-2">
                                            <div className="h-6 w-10 bg-purple-600/10 rounded flex items-center justify-center text-[8px] text-purple-600 font-bold">UPI</div>
                                            <div className="h-6 w-10 bg-gray-100/50 rounded flex items-center justify-center text-[8px] text-gray-500 font-bold">CARD</div>
                                        </div>
                                        <span className="absolute top-0 right-0 bg-brand-gold text-brand-navy text-[9px] px-3 py-1 font-bold uppercase tracking-widest">Preferred</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-navy text-white py-6 md:py-5 mt-8 font-bold uppercase tracking-[0.3em] text-xs hover:bg-gold-gradient hover:text-brand-navy transition-all duration-500 shadow-xl shadow-brand-navy/20 relative overflow-hidden group"
                        >
                            <span className="relative z-10 group-hover:tracking-[0.4em] transition-all duration-500">
                                {isLoading ? 'Processing...' : `Pay & Complete — ₹${formatPrice(Math.round((cartTotal - discount) * 1.03))}`}
                            </span>
                            <div className="absolute inset-0 bg-brand-gold/0 group-hover:bg-brand-gold/10 transition-colors duration-500"></div>
                        </button>
                    </form>
                </div>

                {/* Right: Order Summary (Sticky) */}
                <div className="lg:col-span-5 h-full">
                    <div className="sticky top-32">
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-none border-t-4 border-brand-gold shadow-2xl">
                            <h2 className="text-2xl font-serif text-brand-navy mb-8">Summary</h2>

                            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-16 h-20 bg-brand-cream/30 relative overflow-hidden flex-shrink-0">
                                            {item.product.images[0] && (
                                                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-serif text-brand-navy text-lg leading-tight mb-1">{item.product.name}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="font-serif text-brand-navy">₹{formatPrice(item.calculatedPrice)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-[1px] w-full bg-brand-charcoal/10 my-8"></div>

                            {/* Promo Code Input */}
                            <div className="mb-8">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Promo Code</label>
                                <div className="flex bg-white border-b border-gray-300 focus-within:border-brand-gold transition-colors">
                                    <input
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        disabled={discount > 0}
                                        className="flex-1 bg-transparent px-0 py-3 text-sm font-mono uppercase outline-none placeholder-gray-200 text-brand-navy"
                                    />
                                    {discount > 0 ? (
                                        <button onClick={() => { setDiscount(0); setPromoCode(''); }} className="text-[10px] uppercase font-bold text-red-400 hover:text-red-600 px-4">
                                            Remove
                                        </button>
                                    ) : (
                                        <button onClick={handleApplyPromo} disabled={!promoCode || isApplyingPromo} className="text-[10px] uppercase font-bold text-brand-navy hover:text-brand-gold px-4 disabled:opacity-30">
                                            {isApplyingPromo ? '...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                {promoError && <p className="text-red-500 text-[10px] mt-2 font-bold tracking-wide">{promoError}</p>}
                                {discount > 0 && <p className="text-green-600 text-[10px] mt-2 font-bold tracking-wide">Discount Applied Successfully</p>}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-center text-gray-500 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-mono">₹{formatPrice(cartTotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-green-600 text-sm font-medium">
                                        <span>Discount</span>
                                        <span className="font-mono">- ₹{formatPrice(discount)}</span>
                                    </div>
                                )}

                                <div className="border-t border-dashed border-gray-200 pt-4 mt-4 flex justify-between items-baseline text-brand-navy">
                                    <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                                    <span className="text-3xl font-sans">
                                        ₹{formatPrice(Math.round((cartTotal - (discount || 0)) * 1.03))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-gray-400">
                            <svg className="w-3 h-3 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            SSL Encrypted Transaction
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
