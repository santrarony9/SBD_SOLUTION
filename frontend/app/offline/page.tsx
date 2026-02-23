'use client';

import Link from 'next/link';
import { PiWifiSlash, PiArrowLeft } from 'react-icons/pi';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-brand-navy/5 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <PiWifiSlash className="text-5xl text-brand-navy opacity-40" />
            </div>

            <h1 className="text-4xl font-serif text-brand-navy mb-4">You're Offline</h1>
            <p className="text-gray-500 max-w-sm mb-12 leading-relaxed">
                It seems you've lost your connection. Don't worry, your collection is safe. We'll reconnect you as soon as you're back online.
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                    onClick={() => window.location.reload()}
                    className="bg-brand-navy text-white py-4 px-8 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold transition-all shadow-lg shadow-brand-navy/10"
                >
                    Try Reconnecting
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 text-brand-navy hover:text-brand-gold transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <PiArrowLeft /> Return Home
                </Link>
            </div>

            <div className="mt-20 opacity-20 flex items-center gap-2">
                <div className="w-8 h-px bg-brand-navy"></div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-navy">Spark Blue Diamond</span>
                <div className="w-8 h-px bg-brand-navy"></div>
            </div>
        </div>
    );
}
