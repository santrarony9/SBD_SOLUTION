'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchAPI } from '@/lib/api';
import { useToast } from './ToastContext';

// Types
interface CartItem {
    id: string; // CartItem ID or Product ID (for guest)
    productId: string;
    quantity: number;
    product: {
        name: string;
        price: number; // Snapshot or calculated
        images: string[];
        slug: string;
        category?: string;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const { showToast } = useToast();
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Cart on Load/Login
    useEffect(() => {
        if (user && token) {
            fetchServerCart();
        } else {
            // Load from LocalStorage for Guest
            const localCart = localStorage.getItem('guest_cart');
            if (localCart) {
                const parsed = JSON.parse(localCart);
                setItems(parsed.items || []);
                calculateLocalTotal(parsed.items || []);
            }
        }
    }, [user, token]);

    const calculateLocalTotal = (currentItems: CartItem[]) => {
        const total = currentItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        setCartTotal(total);
    };

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
                            name: product.name,
                            price: product.pricing?.finalPrice || product.price || 0,
                            images: product.images,
                            slug: product.slug,
                            category: product.category
                        }
                    };

                    const newItems = [...items, newItem];
                    setItems(newItems);
                    calculateLocalTotal(newItems);
                    localStorage.setItem('guest_cart', JSON.stringify({ items: newItems }));
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
        <CartContext.Provider value={{ items, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart, isLoading }}>
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
