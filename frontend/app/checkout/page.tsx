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
                    paymentMethod,
                    promoCode: discount > 0 ? promoCode : null,
                    discountAmount: discount,
                    isB2B: showGST,
                    customerGSTIN: billingAddress.gstin,
                    businessName: billingAddress.businessName,
                    placeOfSupply: shippingAddress.state
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

                    <form onSubmit={handlePlaceOrder} className="bg-white p-8 md:p-12 shadow-2xl border border-brand-gold/10 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16"></div>

                        {/* Shipping Section */}
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy border-b pb-2">1. Shipping Residency</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>

                        {/* GST & Billing Section */}
                        <div className="relative z-10 space-y-6 pt-6 border-t border-brand-gold/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy border-b pb-2">2. Tax & Billing</h3>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={showGST} onChange={(e) => setShowGST(e.target.checked)} className="accent-brand-gold" />
                                <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">I want GST Credit (B2B)</span>
                            </label>

                            {showGST && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Business Name</label>
                                        <input required value={billingAddress.businessName} onChange={(e) => setBillingAddress({ ...billingAddress, businessName: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">GSTIN</label>
                                        <input required value={billingAddress.gstin} onChange={(e) => setBillingAddress({ ...billingAddress, gstin: e.target.value.toUpperCase() })} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors placeholder:text-[8px]" placeholder="e.g. 24AAAAA0000A1Z5" />
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center space-x-3 cursor-pointer mt-4">
                                <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} className="accent-brand-gold" />
                                <span className="text-xs font-medium text-gray-500 italic">Billing address is same as shipping</span>
                            </label>

                            {!billingSameAsShipping && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-fadeIn">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Billing Street</label>
                                        <input required value={billingAddress.street} onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Billing City</label>
                                        <input required value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Billing State</label>
                                        <input required value={billingAddress.state} onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Billing Postal Code</label>
                                        <input required value={billingAddress.zip} onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none transition-colors" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className="mt-12 relative z-10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-navy mb-6">3. Secured Acquisition Method</h3>
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
                            {isLoading ? 'Securing Collection...' : `Confirm Acquisition — ₹${(cartTotal - discount).toLocaleString()}`}
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

                        {/* Promo Code Input */}
                        <div className="my-6 pt-6 border-t border-brand-gold/20">
                            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Have a Promo Code?</label>
                            <div className="flex space-x-2">
                                <input
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="Enter Code"
                                    disabled={discount > 0}
                                    className="flex-1 bg-white border border-gray-300 px-4 py-2 text-xs font-mono uppercase focus:border-brand-gold outline-none"
                                />
                                {discount > 0 ? (
                                    <button onClick={() => { setDiscount(0); setPromoCode(''); }} className="bg-red-50 text-red-500 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-red-100 hover:bg-red-100">
                                        Remove
                                    </button>
                                ) : (
                                    <button onClick={handleApplyPromo} disabled={!promoCode || isApplyingPromo} className="bg-brand-navy text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-navy transition-colors disabled:opacity-50">
                                        {isApplyingPromo ? '...' : 'Apply'}
                                    </button>
                                )}
                            </div>
                            {promoError && <p className="text-red-500 text-[10px] mt-2 font-bold tracking-wide">{promoError}</p>}
                            {discount > 0 && <p className="text-green-600 text-[10px] mt-2 font-bold tracking-wide">Code Applied! You saved flat ₹{discount.toLocaleString()}</p>}
                        </div>

                        <div className="flex justify-between items-center text-gray-500 text-sm mb-2">
                            <span>Subtotal</span>
                            <span>₹{cartTotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-green-600 text-sm mb-2 font-bold">
                                <span>Discount</span>
                                <span>- ₹{discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-2xl font-bold text-brand-navy mt-4 pt-4 border-t border-brand-navy/10">
                            <span>Total</span>
                            <span>₹{(cartTotal - discount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
