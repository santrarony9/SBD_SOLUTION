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
import { PiCreditCard, PiBank, PiCurrencyInr, PiCheckCircle, PiWarningCircle, PiShoppingBag, PiShieldCheck } from 'react-icons/pi';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getFestiveDiscount } from '@/config/festive-config';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { formatPrice: globalFormatPrice, currency, exchangeRates } = useCurrency();
    const router = useRouter();

    const [activeStep, setActiveStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ... (rest of states: shippingAddress, paymentMethod, promoCode, appliedPromo, showGST, billingAddress)
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
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; value: number; type: string } | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showGST, setShowGST] = useState(false);
    const [billingAddress, setBillingAddress] = useState({
        businessName: '',
        gstin: ''
    });

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const validateShipping = () => {
        const phoneRegex = /^[0-9]{10}$/;
        const zipRegex = /^[0-9]{6}$/;

        if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
            setError("Please fill in all required shipping details.");
            return false;
        }
        if (!phoneRegex.test(shippingAddress.phone.replace(/\D/g, ''))) {
            setError("Please enter a valid 10-digit mobile number.");
            return false;
        }
        if (!zipRegex.test(shippingAddress.zip)) {
            setError("Please enter a valid 6-digit pincode.");
            return false;
        }
        setError(null);
        return true;
    };

    const handleNextStep = () => {
        if (activeStep === 1) {
            if (validateShipping()) setActiveStep(2);
        } else if (activeStep === 2) {
            setActiveStep(3);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoMessage(null);
        try {
            const res = await fetchAPI('/promos/validate', { method: 'POST', body: JSON.stringify({ code: promoCode }) });
            if (res && res.code) {
                setAppliedPromo({ code: res.code, value: res.discountValue, type: res.discountType });
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

    const calculateDiscount = () => {
        let totalDiscount = 0;

        // Manual Promo Code
        if (appliedPromo) {
            if (appliedPromo.type === 'PERCENTAGE') {
                totalDiscount += (cartTotal * appliedPromo.value) / 100;
            } else {
                totalDiscount += appliedPromo.value;
            }
        }

        // Automatic Festive Discount
        const festiveDiscount = getFestiveDiscount(cartTotal);
        totalDiscount += festiveDiscount;

        return totalDiscount;
    };

    const discountAmount = calculateDiscount();
    const finalTotal = Math.max(0, cartTotal - discountAmount);
    const taxAmount = showGST ? finalTotal * 0.03 : 0;
    const grandTotalINR = finalTotal + taxAmount;

    // Converted totals for order creation
    const conversionRate = exchangeRates[currency];
    const convertedGrandTotal = Number((grandTotalINR * conversionRate).toFixed(2));
    const convertedDiscount = Number((discountAmount * conversionRate).toFixed(2));

    const handlePlaceOrder = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const orderPayload = {
                shippingAddress,
                billingAddress: shippingAddress,
                paymentMethod,
                totalAmount: convertedGrandTotal,
                currency: currency,
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                isB2B: showGST,
                customerGSTIN: showGST ? billingAddress.gstin : undefined,
                businessName: showGST ? billingAddress.businessName : undefined,
                promoCode: appliedPromo ? appliedPromo.code : null,
                discountAmount: convertedDiscount
            };

            const order = await fetchAPI('/orders', { method: 'POST', body: JSON.stringify(orderPayload) });

            if (order && order.id) {
                if (paymentMethod === 'CCAVENUE') {
                    const paymentPayload = {
                        orderId: order.id,
                        amount: order.totalAmount,
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

                    const paymentRes = await fetchAPI('/ccavenue/initiate', { method: 'POST', body: JSON.stringify(paymentPayload) });

                    if (paymentRes.encRequest && paymentRes.access_code && paymentRes.url) {
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = paymentRes.url;
                        const encInput = document.createElement('input'); encInput.type = 'hidden'; encInput.name = 'encRequest'; encInput.value = paymentRes.encRequest; form.appendChild(encInput);
                        const accessCodeInput = document.createElement('input'); accessCodeInput.type = 'hidden'; accessCodeInput.name = 'access_code'; accessCodeInput.value = paymentRes.access_code; form.appendChild(accessCodeInput);
                        document.body.appendChild(form);
                        await clearCart();
                        form.submit();
                    } else { throw new Error('Invalid payment initialization response.'); }
                } else {
                    showToast("Payment method disabled", "info");
                    setIsLoading(false);
                }
            } else { throw new Error("Failed to create order."); }
        } catch (err: any) {
            setError(err.message || 'Payment System Unavailable.');
            setIsLoading(false);
        }
    };

    if (items.length === 0 && !isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
                    <PiShoppingBag className="text-3xl text-brand-gold" />
                </div>
                <h2 className="text-2xl font-serif text-brand-navy mb-4">Your Bag is Empty</h2>
                <p className="text-gray-500 mb-8 max-w-xs">Looks like you haven't added anything to your collection yet.</p>
                <Link href="/shop" className="bg-brand-navy text-white px-8 py-3 uppercase tracking-widest text-[10px] font-bold">Start Shopping</Link>
            </div>
        );
    }

    return (
        <section className="bg-brand-cream/30 py-8 md:py-16 min-h-screen">
            <div className="max-w-4xl mx-auto px-4">
                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-serif text-brand-navy mb-2">Secure Checkout</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Fast • Secure • Certified</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {/* Step 1: Shipping */}
                    <div className={`bg-white shadow-sm border ${activeStep === 1 ? 'border-brand-gold' : 'border-gray-100'} overflow-hidden transition-all duration-500`}>
                        <button
                            onClick={() => activeStep > 1 && setActiveStep(1)}
                            className={`w-full flex items-center justify-between p-6 text-left ${activeStep === 1 ? 'bg-brand-gold/5' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep > 1 ? 'bg-green-500 text-white' : activeStep === 1 ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {activeStep > 1 ? <PiCheckCircle /> : '1'}
                                </span>
                                <h2 className="text-lg font-serif text-brand-navy">Shipping Details</h2>
                            </div>
                            {activeStep > 1 && <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Edit</span>}
                        </button>

                        <AnimatePresence>
                            {activeStep === 1 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        {error && (
                                            <div className="col-span-2 p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase font-bold flex items-center gap-2 animate-shake">
                                                <PiWarningCircle className="text-lg" />
                                                {error}
                                            </div>
                                        )}
                                        <div className="col-span-2">
                                            <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 text-sm focus:border-brand-gold outline-none" placeholder="Full Name" required />
                                        </div>
                                        <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 text-sm focus:border-brand-gold outline-none" placeholder="Mobile Number" required />
                                        <input type="text" name="zip" value={shippingAddress.zip} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 text-sm focus:border-brand-gold outline-none" placeholder="Pincode" required />
                                        <div className="col-span-2">
                                            <input type="text" name="street" value={shippingAddress.street} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 text-sm focus:border-brand-gold outline-none" placeholder="Flat / House No. / Building / Colony" required />
                                        </div>
                                        <input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 text-sm focus:border-brand-gold outline-none" placeholder="City" required />
                                        <input type="text" name="state" value={shippingAddress.state} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 text-sm focus:border-brand-gold outline-none" placeholder="State" required />
                                    </div>
                                    <button onClick={handleNextStep} className="w-full mt-6 bg-brand-navy text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all">
                                        Continue to Payment
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Step 2: Payment */}
                    <div className={`bg-white shadow-sm border ${activeStep === 2 ? 'border-brand-gold' : 'border-gray-100'} overflow-hidden transition-all duration-500`}>
                        <button
                            onClick={() => activeStep > 2 && setActiveStep(2)}
                            disabled={activeStep < 2}
                            className={`w-full flex items-center justify-between p-6 text-left ${activeStep === 2 ? 'bg-brand-gold/5' : ''} ${activeStep < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep > 2 ? 'bg-green-500 text-white' : activeStep === 2 ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {activeStep > 2 ? <PiCheckCircle /> : '2'}
                                </span>
                                <h2 className="text-lg font-serif text-brand-navy">Payment Method</h2>
                            </div>
                            {activeStep > 2 && <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Edit</span>}
                        </button>

                        <AnimatePresence>
                            {activeStep === 2 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-8"
                                >
                                    <div className="grid grid-cols-1 gap-3 mt-2">
                                        <button
                                            onClick={() => setPaymentMethod('CCAVENUE')}
                                            className={`flex items-center justify-between p-4 border transition-all ${paymentMethod === 'CCAVENUE' ? 'border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold' : 'border-gray-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <PiCreditCard className="text-xl text-brand-navy" />
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-brand-navy uppercase tracking-widest">Online Payment</p>
                                                    <p className="text-[10px] text-gray-400">Cards, UPI, NetBanking</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'CCAVENUE' && <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />}
                                        </button>
                                        <div className="p-4 border border-gray-100 opacity-40 grayscale flex items-center justify-between cursor-not-allowed">
                                            <div className="flex items-center gap-3">
                                                <PiBank className="text-xl text-gray-400" />
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">PhonePe / GPay</p>
                                                    <p className="text-[10px] text-gray-400">Coming Soon</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleNextStep} className="w-full mt-6 bg-brand-navy text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all">
                                        Review Order
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Step 3: Review */}
                    <div className={`bg-white shadow-sm border ${activeStep === 3 ? 'border-brand-gold' : 'border-gray-100'} overflow-hidden transition-all duration-500`}>
                        <div className={`w-full flex items-center gap-4 p-6 ${activeStep === 3 ? 'bg-brand-gold/5' : activeStep < 3 ? 'opacity-50' : ''}`}>
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 3 ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
                                3
                            </span>
                            <h2 className="text-lg font-serif text-brand-navy">Review & Place Order</h2>
                        </div>

                        <AnimatePresence>
                            {activeStep === 3 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-8"
                                >
                                    <div className="space-y-4 mb-8">
                                        <div className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold mb-2 border-b border-brand-gold/10 pb-2">Your Curated Collection</div>
                                        {items.map((item, idx) => (
                                            <motion.div
                                                key={item.productId}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex gap-4 items-center py-3 border-b border-gray-50 last:border-0"
                                            >
                                                <div className="relative w-16 h-16 bg-brand-cream/30 rounded-full flex-shrink-0 border border-brand-gold/5 p-1">
                                                    <Image src={item.product.images[0] || '/placeholder.jpg'} alt={item.product.name} fill className="object-contain p-1" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-[11px] font-serif italic text-brand-navy line-clamp-1">{item.product.name}</p>
                                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                                                </div>
                                                <p className="text-xs font-sans font-medium text-brand-navy">{globalFormatPrice(item.product.pricing.finalPrice * item.quantity)}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Order Totals Bar - Receipt Style */}
                                    <div className="bg-[#FDFAF7] border border-brand-gold/10 p-8 mb-8 relative">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold/0 via-brand-gold to-brand-gold/0 opacity-20" />

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                                                <span>Subtotal</span>
                                                <span className="font-sans text-brand-navy">{globalFormatPrice(cartTotal)}</span>
                                            </div>

                                            {appliedPromo && (
                                                <div className="flex justify-between text-[10px] uppercase tracking-widest text-green-600">
                                                    <span>Boutique Credit ({appliedPromo.code})</span>
                                                    <span>-{globalFormatPrice(calculateDiscount() - getFestiveDiscount(cartTotal))}</span>
                                                </div>
                                            )}

                                            {getFestiveDiscount(cartTotal) > 0 && (
                                                <div className="flex justify-between text-[10px] uppercase tracking-widest text-green-600">
                                                    <span>Festive Gift (Automatic)</span>
                                                    <span>-{globalFormatPrice(getFestiveDiscount(cartTotal))}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                                                <span>Insured Shipping</span>
                                                <span className="text-brand-gold font-black">Complimentary</span>
                                            </div>

                                            {taxAmount > 0 && (
                                                <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                                                    <span>GST (3%)</span>
                                                    <span className="font-sans text-brand-navy">{globalFormatPrice(taxAmount)}</span>
                                                </div>
                                            )}

                                            <div className="pt-6 border-t border-brand-gold/10 mt-4">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy">Grand Total</span>
                                                    <div className="text-right">
                                                        <span className="text-3xl font-sans font-extralight text-brand-gold">
                                                            {globalFormatPrice(grandTotalINR)}
                                                        </span>
                                                        <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">Secure Transaction via CCAvenue ({currency})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 p-3 border border-red-100 text-red-500 text-[10px] uppercase font-bold flex items-center gap-2">
                                            <PiWarningCircle className="text-lg" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isLoading}
                                        className="w-full bg-brand-gold text-brand-navy py-5 text-sm font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {isLoading ? 'Processing...' : `Pay ${globalFormatPrice(grandTotalINR)}`}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 text-gray-400">
                    <div className="flex gap-4">
                        <PiShieldCheck className="text-2xl text-green-500/50" />
                        <span className="text-[9px] uppercase tracking-widest font-bold">Safe & Secure 256-bit Encryption</span>
                    </div>
                    <p className="text-[8px] uppercase tracking-widest leading-relaxed text-center opacity-60">
                        By placing your order, you agree to Spark Blue Diamond's<br />
                        <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}

