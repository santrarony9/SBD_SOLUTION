'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        const token = searchParams.get('token');
        const userDataStr = searchParams.get('user');

        if (token && userDataStr) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                login(token, userData);
                showToast('Successfully logged in with Google!', 'success');
            } catch (error) {
                console.error('Failed to parse user data from Google callback', error);
                showToast('Login failed. Please try again.', 'error');
                router.push('/login');
            }
        } else {
            console.error('Missing token or user data in callback');
            router.push('/login');
        }
    }, [searchParams, login, router, showToast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto"></div>
                <h2 className="text-xl font-serif text-brand-navy">Authenticating with Google...</h2>
                <p className="text-gray-500 font-light">Please wait while we set up your session.</p>
            </div>
        </div>
    );
}

export default function GoogleAuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div>
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
