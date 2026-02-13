'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-cream text-center px-4">
            <h2 className="text-3xl font-serif text-brand-navy mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                We apologize for the inconvenience. Our team has been notified.
            </p>

            {/* Debug Info (Only shows in dev or if explicitly enabled) */}
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded text-left text-xs text-red-800 font-mono w-full max-w-lg overflow-auto">
                {error.message}
                {error.digest && <div className="mt-2 text-gray-500">Digest: {error.digest}</div>}
            </div>

            <button
                onClick={() => reset()}
                className="bg-brand-navy text-white px-8 py-3 uppercase tracking-widest font-bold text-xs hover:bg-brand-gold transition-colors"
            >
                Try Again
            </button>
        </div>
    );
}
