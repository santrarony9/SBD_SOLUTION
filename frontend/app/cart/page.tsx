'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
    const { items, cartTotal, removeFromCart, clearCart, isLoading } = useCart();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Cart...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
                <h1 className="text-3xl font-serif text-brand-navy">Your Cart is Empty</h1>
                <p className="text-gray-500">Looks like you haven't added any sparkling treasures yet.</p>
                <Link href="/shop" className="px-8 py-3 bg-brand-navy text-white font-bold uppercase tracking-widest hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif text-brand-navy mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between border border-gray-100 group hover:border-brand-gold/30 transition-all duration-300">
                                <div className="flex items-center space-x-6">
                                    <div className="w-24 h-24 bg-gray-100 relative overflow-hidden rounded">
                                        {item.product.images[0] ? (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${item.product.images[0]})` }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif text-brand-navy">{item.product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{item.product.slug}</p>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                                                Qty: {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-xs text-red-400 hover:text-red-600 underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-brand-navy">
                                        ₹{item.calculatedPrice ? item.calculatedPrice.toLocaleString() : 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-400">Unit Price</p>
                                </div>
                            </div>
                        ))}

                        <button onClick={clearCart} className="text-sm text-gray-500 hover:text-brand-navy underline mt-4">
                            Clear Shopping Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-lg shadow-lg sticky top-32 border-t-4 border-brand-gold">
                            <h2 className="text-2xl font-serif text-brand-navy mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Taxes (Estimated)</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between text-xl font-bold text-brand-navy">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link href="/checkout" className="block w-full text-center bg-brand-navy text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 shadow-md transform hover:-translate-y-1">
                                Proceed to Checkout
                            </Link>

                            <div className="mt-6 flex justify-center space-x-4 grayscale opacity-50">
                                {/* Payment Icons could go here */}
                                <span className="text-xs">Secure Checkout • SSL Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
