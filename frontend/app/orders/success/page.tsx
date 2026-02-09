'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PiCheckCircle, PiShoppingBag } from 'react-icons/pi';

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        // Clean up confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-brand-cream/50 flex items-center justify-center relative overflow-hidden px-4">
            {/* Confetti (Simple CSS implementation or placeholder for library) */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* We can add a more complex confetti component here if desired */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="absolute top-0 w-2 h-4 bg-brand-gold/30 animate-confetti" style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`
                            }}></div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white/80 backdrop-blur-md p-8 md:p-16 shadow-2xl border border-brand-gold/20 max-w-2xl w-full text-center relative z-10 animate-fade-in-up">

                {/* Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-xl scale-150 animate-pulse-slow"></div>
                    <PiCheckCircle className="w-24 h-24 text-green-600 relative z-10 bg-white rounded-full" />
                </div>

                {/* Celebration Text */}
                <h1 className="text-4xl md:text-5xl font-serif text-brand-navy mb-4">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Thank you for choosing Spark Blue Diamond. Your masterpiece is being prepared with the utmost care.
                </p>

                {/* Order ID Box */}
                <div className="bg-brand-navy/5 border border-brand-navy/10 py-4 px-8 inline-block mb-10 rounded-sm">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Order ID</p>
                    <p className="text-xl font-mono text-brand-navy font-bold">{orderId || 'Loading...'}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href={`/account`} className="px-8 py-4 bg-white border border-brand-navy text-brand-navy text-xs font-bold uppercase tracking-[0.2em] hover:bg-brand-navy hover:text-white transition-all duration-300">
                        View Order Details
                    </Link>
                    <Link href="/shop" className="px-8 py-4 bg-brand-navy text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 shadow-lg hover:shadow-brand-gold/20 flex items-center justify-center gap-2">
                        <PiShoppingBag className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Footer Note */}
                <p className="text-[10px] text-gray-400 mt-12 italic">
                    A confirmation email has been sent to your registered address.
                </p>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-navy/5 rounded-full blur-3xl"></div>
        </div>
    );
}

// Add keyframes for confetti in global.css if needed, or simple inline style
