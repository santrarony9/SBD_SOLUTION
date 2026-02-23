'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'INR' | 'USD' | 'AED' | 'GBP' | 'EUR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    exchangeRates: Record<Currency, number>;
    formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Baseline: 1 INR = X of other currencies (simplified rates)
// Realistically, these would be fetched from an API or manageable via Admin
const exchangeRates: Record<Currency, number> = {
    INR: 1,
    USD: 0.012,    // 1 INR ≈ 0.012 USD
    AED: 0.044,    // 1 INR ≈ 0.044 AED
    GBP: 0.0095,   // 1 INR ≈ 0.0095 GBP
    EUR: 0.011     // 1 INR ≈ 0.011 EUR
};

const currencySymbols: Record<Currency, string> = {
    INR: '₹',
    USD: '$',
    AED: 'dh',
    GBP: '£',
    EUR: '€'
};

const currencyLocales: Record<Currency, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    AED: 'en-AE',
    GBP: 'en-GB',
    EUR: 'de-DE'
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('INR');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedCurrency = localStorage.getItem('currency') as Currency;
        if (storedCurrency && exchangeRates[storedCurrency]) {
            setCurrencyState(storedCurrency);
        }
    }, []);

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('currency', newCurrency);
    };

    const formatPrice = (amount: number) => {
        if (!isMounted) return ''; // Avoid hydration flicker

        const rate = exchangeRates[currency];
        const convertedAmount = amount * rate;

        const symbol = currencySymbols[currency];
        const locale = currencyLocales[currency];

        // Decimals for USD/EUR/GBP/AED, no decimals for INR (standard luxury practice)
        const decimals = currency === 'INR' ? 0 : 2;

        const formattedAmount = convertedAmount.toLocaleString(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        if (currency === 'AED') {
            return `${formattedAmount} ${symbol}`;
        }

        return `${symbol}${formattedAmount}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
