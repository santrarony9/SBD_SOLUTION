'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
    const { items, cartTotal, removeFromCart, clearCart, isLoading } = useCart();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-cream/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
                    <p className="text-brand-navy font-serif tracking-widest text-sm">Loading Your Collection...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream/50 space-y-6 px-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-brand-gold/10 mb-4">
                    <svg className="w-10 h-10 text-brand-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif text-brand-navy">Your Cart is Empty</h1>
                <p className="text-gray-500 font-light max-w-md text-center">It seems you haven't discovered your perfect piece yet. Explore our collection to find something truly timeless.</p>
                <Link href="/shop" className="px-10 py-4 bg-brand-navy text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 shadow-xl hover:shadow-brand-gold/20">
                    Explore Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-cream/50 py-8 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-brand-navy mb-4">Your Selection</h1>
                    <div className="h-[1px] w-24 bg-brand-gold mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="hidden md:grid grid-cols-12 text-[10px] uppercase font-bold tracking-widest text-gray-400 border-b border-brand-charcoal/10 pb-4">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {items.map((item) => (
                            <div key={item.id} className="group relative bg-white md:bg-transparent p-6 md:p-0 rounded-lg md:rounded-none shadow-sm md:shadow-none flex flex-col md:grid md:grid-cols-12 gap-6 items-center border-b border-brand-charcoal/5 last:border-0 pb-8 transition-all duration-500 hover:bg-white/50 md:hover:bg-transparent">

                                {/* Product Info */}
                                <div className="col-span-6 w-full flex items-center gap-6">
                                    <div className="w-24 h-32 relative overflow-hidden bg-brand-cream/20 flex-shrink-0">
                                        {item.product.images[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{item.product.category || 'Fine Jewellery'}</p>
                                        <Link href={`/product/${item.product.slug}`} className="text-xl font-serif text-brand-navy group-hover:text-brand-gold transition-colors">
                                            {item.product.name}
                                        </Link>
                                        <p className="text-xs text-gray-400 mt-1 font-mono">{item.product.slug}</p>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-[10px] uppercase font-bold tracking-wider text-red-300 hover:text-red-500 mt-4 md:hidden"
                                        >
                                            Remove Item
                                        </button>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-sm font-medium text-brand-navy bg-white px-4 py-2 border border-gray-100">
                                        {item.quantity}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="col-span-2 text-right hidden md:block">
                                    <p className="text-sm text-gray-500">
                                        ₹{item.calculatedPrice ? formatPrice(item.calculatedPrice / item.quantity) : 'N/A'}
                                    </p>
                                </div>

                                {/* Total & Remove Actions */}
                                <div className="col-span-2 text-right w-full md:w-auto flex flex-col items-end justify-between h-full">
                                    <p className="text-lg font-sans text-brand-navy">
                                        ₹{formatPrice(item.calculatedPrice)}
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-[10px] uppercase font-bold tracking-wider text-gray-300 hover:text-red-500 mt-auto hidden md:block transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-8">
                            <Link href="/shop" className="text-xs uppercase font-bold tracking-widest text-brand-navy flex items-center group">
                                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Continue Shopping
                            </Link>
                            <button onClick={clearCart} className="text-xs uppercase font-bold tracking-widest text-gray-400 hover:text-red-500 transition-colors">
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <div className="bg-white/80 backdrop-blur-md p-8 md:p-10 shadow-2xl border border-brand-gold/20 relative overflow-hidden">
                                {/* Decorative BG */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                                <h2 className="text-2xl font-serif text-brand-navy mb-8 relative z-10">Order Summary</h2>

                                <div className="space-y-4 mb-8 relative z-10">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-mono font-sans">₹{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-brand-navy font-bold uppercase text-xs tracking-wider">Complimentary</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Taxes (Estimated)</span>
                                        <span className="text-[10px] italic">Calculated at checkout</span>
                                    </div>

                                    <div className="border-t border-brand-charcoal/10 pt-6 mt-6 flex justify-between items-baseline">
                                        <span className="text-sm font-bold uppercase tracking-widest text-brand-navy">Total</span>
                                        <span className="text-3xl font-sans text-brand-navy">₹{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="block w-full text-center bg-brand-navy text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all duration-500 shadow-lg relative z-10 hover:shadow-brand-gold/20">
                                    Proceed to Checkout
                                </Link>

                                <div className="mt-8 grid grid-cols-2 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        <span>Secure Checkout</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                                        <span>Money-back Guarantee</span>
                                    </div>
                                </div>

                                <button
                                    onClick={clearCart}
                                    className="w-full text-center mt-6 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
