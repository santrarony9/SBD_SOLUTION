'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PiX, PiShoppingBag, PiArrowRight, PiTrash } from 'react-icons/pi';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { items, removeFromCart, updateQuantity } = useCart();
    const { formatPrice: globalFormatPrice } = useCurrency();

    const subtotal = items.reduce((acc, item) => acc + (item.product.pricing.finalPrice * item.quantity), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10002]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[10003] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <PiShoppingBag className="text-xl text-brand-gold" />
                                <h2 className="text-lg font-serif text-brand-navy">Your Boutique Bag</h2>
                                <span className="bg-brand-navy/5 text-brand-navy text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    {items.length} Items
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <PiX className="text-xl text-brand-navy" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-brand-cream/50 rounded-full flex items-center justify-center">
                                        <PiShoppingBag className="text-4xl text-brand-gold/40" />
                                    </div>
                                    <p className="text-brand-navy font-serif text-xl italic">Bag is feeling light...</p>
                                    <Link
                                        href="/shop"
                                        onClick={onClose}
                                        className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-gold hover:text-brand-navy transition-colors"
                                    >
                                        Browse Collections
                                    </Link>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="relative w-24 h-24 bg-brand-cream/30 rounded-sm overflow-hidden border border-gray-100 flex-shrink-0">
                                            <Image
                                                src={item.product.images?.[0] || ''}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-sm font-serif text-brand-navy italic line-clamp-1">
                                                        {item.product.name}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-gray-300 hover:text-red-400 transition-colors"
                                                    >
                                                        <PiTrash />
                                                    </button>
                                                </div>
                                                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                                                    {item.product.goldPurity}K Gold · {item.product.diamondCarat} CT
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center border border-gray-100 rounded-sm h-7">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-brand-navy hover:bg-gray-50 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 flex items-center justify-center text-xs font-sans text-brand-navy">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-brand-navy hover:bg-gray-50 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <p className="text-sm font-sans font-medium text-brand-gold">
                                                    {globalFormatPrice(item.product.pricing.finalPrice * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-gray-100 space-y-4 bg-brand-cream/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400">Estimated Total</span>
                                    <span className="text-xl font-sans font-light text-brand-navy italic">
                                        {globalFormatPrice(subtotal)}
                                    </span>
                                </div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
                                    Shipping, taxes, and discounts calculated at checkout.
                                </p>
                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    <Link
                                        href="/checkout"
                                        onClick={onClose}
                                        className="w-full bg-brand-navy text-white h-14 flex items-center justify-center gap-3 group overflow-hidden relative"
                                    >
                                        <span className="uppercase text-xs font-black tracking-[0.3em] z-10">Proceed to Checkout</span>
                                        <PiArrowRight className="text-brand-gold group-hover:translate-x-1 transition-transform z-10" />
                                        <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="w-full h-10 text-[10px] uppercase font-bold tracking-[0.2em] text-brand-navy/60 hover:text-brand-navy transition-colors"
                                    >
                                        Continue Exploring
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
