'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchAPI } from '@/lib/api';

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
    };
    calculatedPrice?: number;
}

interface CartContextType {
    items: CartItem[];
    cartTotal: number;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
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
            // Server Sync
            try {
                await fetchAPI('/cart/items', {
                    method: 'POST',
                    body: JSON.stringify({ productId, quantity })
                });
                await fetchServerCart(); // Refresh
            } catch (error) {
                console.error("Add to cart failed", error);
                alert("Failed to add to cart");
            }
        } else {
            // Guest Logic (Simplification: We need product details to store locally)
            // Realistically we'd fetch product details then store. 
            // For now, alerting user to login is easier for this MVP phase, OR we just store ID.
            alert("Please login to add items to cart.");
            // Ideally: fetchAPI(`/products/${productId}`) -> push to local state.
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (user) {
            try {
                await fetchAPI(`/cart/items/${itemId}`, { method: 'DELETE' });
                await fetchServerCart();
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

    return (
        <CartContext.Provider value={{ items, cartTotal, addToCart, removeFromCart, clearCart, isLoading }}>
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
