'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-serif text-brand-navy mb-2 text-center">Forgot Password</h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Enter your email to receive a password reset link.
                </p>

                {submitted ? (
                    <div className="text-center">
                        <div className="bg-green-50 text-green-600 p-4 rounded mb-6">
                            If an account exists with {email}, you will receive a password reset link shortly.
                        </div>
                        <Link href="/login" className="text-brand-navy font-semibold hover:underline">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-brand-gold"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-navy text-white py-2 rounded hover:bg-brand-gold transition-colors font-medium disabled:opacity-50"
                        >
                            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {!submitted && (
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Remember your password?{' '}
                        <Link href="/login" className="text-brand-gold hover:underline">
                            Login
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
