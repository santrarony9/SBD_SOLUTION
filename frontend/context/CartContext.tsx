'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchAPI } from '@/lib/api';
import { useToast } from './ToastContext';
import { useFestive } from './FestiveContext';

// Types
interface CartItem {
    id: string; // CartItem ID or Product ID (for guest)
    productId: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
        slug: string;
        category?: string;
        goldPurity?: number;
        diamondCarat?: number;
        pricing: {
            finalPrice: number;
        };
    };
    calculatedPrice?: number;
}

interface CartContextType {
    items: CartItem[];
    cartTotal: number;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    isLoading: boolean;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    festiveDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const { showToast } = useToast();
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { config, isFestiveActive } = useFestive();
    const [festiveDiscount, setFestiveDiscount] = useState(0);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // Fetch Cart on Load/Login
    useEffect(() => {
        if (user && token) {
            fetchServerCart();
        } else {
            // Load from LocalStorage for Guest
            const localCart = localStorage.getItem('guest_cart');
            if (localCart) {
                try {
                    const parsed = JSON.parse(localCart);
                    setItems(parsed.items || []);
                    calculateLocalTotal(parsed.items || []);
                } catch (error) {
                    console.error('[CartContext] Failed to parse guest cart, clearing corrupt data.', error);
                    localStorage.removeItem('guest_cart');
                    setItems([]);
                    setCartTotal(0);
                }
            }
        }
    }, [user, token]);

    const calculateLocalTotal = (currentItems: CartItem[]) => {
        const total = currentItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        setCartTotal(total);
    };

    // Calculate Dynamic Festive Discount
    useEffect(() => {
        if (isFestiveActive && config) {
            const subtotal = items.reduce((sum, item) => {
                const price = item.calculatedPrice || item.product.price || 0;
                return sum + (price * item.quantity);
            }, 0);

            const { tieredDiscount } = config.theme;
            if (subtotal > 0) {
                const discount = subtotal >= tieredDiscount.threshold
                    ? tieredDiscount.aboveThreshold
                    : tieredDiscount.flat;
                setFestiveDiscount(discount);
            } else {
                setFestiveDiscount(0);
            }
        } else {
            setFestiveDiscount(0);
        }
    }, [items, isFestiveActive, config]);

    const fetchServerCart = async () => {
        try {
            setIsLoading(true);
            const data = await fetchAPI('/cart');
            if (data) {
                setItems(data.items.map((i: any) => ({
                    id: i.id,
                    productId: i.productId,
                    quantity: i.quantity,
                    product: i.product, // Ensure backend returns enriched product
                    calculatedPrice: i.calculatedPrice
                })));
                setCartTotal(data.cartTotal);
            }
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity: number) => {
        if (user) {
            try {
                await fetchAPI('/cart/items', {
                    method: 'POST',
                    body: JSON.stringify({ productId, quantity })
                });
                await fetchServerCart();
                openCart();
                showToast("Added to your collection", "success");
            } catch (error) {
                console.error("Add to cart failed", error);
                showToast("Failed to add to cart", "error");
            }
        } else {
            // Guest Logic: Fetch product briefly to store in local cart
            try {
                const product = await fetchAPI(`/products/${productId}`);
                if (product) {
                    const newItem: CartItem = {
                        id: Math.random().toString(36).substr(2, 9),
                        productId: product.id,
                        quantity,
                        product: {
                            id: product.id,
                            name: product.name,
                            price: product.pricing?.finalPrice || product.price || 0,
                            images: product.images,
                            slug: product.slug,
                            category: product.category,
                            goldPurity: product.goldPurity,
                            diamondCarat: product.diamondCarat,
                            pricing: {
                                finalPrice: product.pricing?.finalPrice || product.price || 0
                            }
                        }
                    };

                    const newItems = [...items, newItem];
                    setItems(newItems);
                    calculateLocalTotal(newItems);
                    localStorage.setItem('guest_cart', JSON.stringify({ items: newItems }));
                    openCart();
                    showToast("Added to your guest collection", "success");
                }
            } catch (err) {
                showToast("Please login to add items", "info");
            }
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (user) {
            try {
                await fetchAPI(`/cart/items/${itemId}`, { method: 'DELETE' });
                await fetchServerCart();
                showToast("Item removed", "info");
            } catch (error) {
                console.error("Remove failed", error);
            }
        } else {
            const newItems = items.filter(i => i.id !== itemId);
            setItems(newItems);
            calculateLocalTotal(newItems);
            localStorage.setItem('guest_cart', JSON.stringify({ items: newItems }));
            showToast("Item removed", "info");
        }
    };

    const clearCart = async () => {
        if (user) {
            await fetchAPI('/cart', { method: 'DELETE' });
            setItems([]);
            setCartTotal(0);
        } else {
            localStorage.removeItem('guest_cart');
            setItems([]);
            setCartTotal(0);
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;

        // Optimistic UI Update
        const oldItems = [...items];
        const newItems = items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
        );
        setItems(newItems);
        // Recalculate total locally for responsiveness
        const total = newItems.reduce((sum, item) => {
            const price = item.calculatedPrice || item.product.price || 0;
            return sum + (price * item.quantity);
        }, 0);
        setCartTotal(total);

        if (user) {
            try {
                await fetchAPI(`/cart/items/${itemId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ quantity })
                });
                await fetchServerCart(); // Resync for accurate pricing/totals
            } catch (error) {
                console.error("Update failed", error);
                setItems(oldItems); // Revert on failure
            }
        } else {
            // Guest Logic
            // Update local storage...
            // For MVP, since guest logic is partial, we'll focus on authenticated user first.
            // But let's support local update for now.
            const localCart = JSON.stringify({ items: newItems });
            localStorage.setItem('guest_cart', localCart);
        }
    };

    return (
        <CartContext.Provider value={{ items, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart, isLoading, isCartOpen, openCart, closeCart, festiveDiscount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
