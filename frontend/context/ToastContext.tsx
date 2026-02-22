'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PiCheckCircle, PiWarningCircle, PiInfo, PiX } from 'react-icons/pi';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                flex items-center gap-3 px-6 py-4 rounded-sm shadow-2xl border backdrop-blur-xl
                                ${toast.type === 'success' ? 'bg-brand-navy/95 border-brand-gold/30 text-white' : ''}
                                ${toast.type === 'error' ? 'bg-red-950/95 border-red-500/30 text-white' : ''}
                                ${toast.type === 'info' ? 'bg-white/95 border-brand-gold/20 text-brand-navy' : ''}
                                min-w-[300px] max-w-[450px]
                            `}>
                                {toast.type === 'success' && <PiCheckCircle className="text-brand-gold text-xl shrink-0" />}
                                {toast.type === 'error' && <PiWarningCircle className="text-red-400 text-xl shrink-0" />}
                                {toast.type === 'info' && <PiInfo className="text-brand-gold text-xl shrink-0" />}

                                <p className="text-xs font-medium tracking-wide flex-grow">{toast.message}</p>

                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <PiX className="text-lg opacity-50" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
