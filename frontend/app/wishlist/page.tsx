'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WishlistRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/account/wishlist');
    }, [router]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-brand-cream/20">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-brand-navy font-serif italic tracking-widest text-sm">Entering your curated collection...</p>
            </div>
        </div>
    );
}
