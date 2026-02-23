'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

interface ComparisonContextType {
    comparisonItems: string[];
    addToComparison: (productId: string) => void;
    removeFromComparison: (productId: string) => void;
    clearComparison: () => void;
    isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [comparisonItems, setComparisonItems] = useState<string[]>([]);
    const { showToast } = useToast();

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('sbd_comparison');
        if (saved) {
            try {
                setComparisonItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse comparison items", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('sbd_comparison', JSON.stringify(comparisonItems));
    }, [comparisonItems]);

    const addToComparison = (productId: string) => {
        if (comparisonItems.includes(productId)) {
            showToast("Item already in comparison", "info");
            return;
        }

        if (comparisonItems.length >= 3) {
            showToast("Comparison limited to 3 items", "info");
            return;
        }

        setComparisonItems(prev => [...prev, productId]);
        showToast("Added to comparison", "success");
    };

    const removeFromComparison = (productId: string) => {
        setComparisonItems(prev => prev.filter(id => id !== productId));
    };

    const clearComparison = () => {
        setComparisonItems([]);
    };

    const isInComparison = (productId: string) => {
        return comparisonItems.includes(productId);
    };

    return (
        <ComparisonContext.Provider value={{ comparisonItems, addToComparison, removeFromComparison, clearComparison, isInComparison }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
}
