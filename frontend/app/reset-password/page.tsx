'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { Suspense } from 'react';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await fetchAPI('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPass: newPassword }),
            });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center p-8 bg-red-50 text-red-600 border border-red-100">
                <p className="font-bold">Invalid Reset Link</p>
                <Link href="/forgot-password" className="text-sm underline mt-2 inline-block">Request a new link</Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center p-8 bg-green-50 text-green-700 border border-green-100 animate-fade-in">
                <h2 className="text-2xl font-serif mb-2">Success!</h2>
                <p>Your password has been reset. Redirecting to login...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <div className="relative z-0 w-full mb-6 group">
                    <input
                        type="password"
                        required
                        className="block py-2.5 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                        placeholder=" "
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">New Password</label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                    <input
                        type="password"
                        required
                        className="block py-2.5 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                        placeholder=" "
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm New Password</label>
                </div>
            </div>

            {error && <p className="text-red-500 text-xs italic">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-navy text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-lg disabled:opacity-50"
            >
                {isLoading ? 'Resetting...' : 'Set New Password'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-10 shadow-2xl border border-brand-gold/10">
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-serif text-brand-navy mb-2">Vault Recovery</h1>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">Reset your private access key</p>
                </header>

                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-xs text-brand-gold hover:underline uppercase tracking-widest font-bold">Return to Login</Link>
                </div>
            </div>
        </div>
    );
}
