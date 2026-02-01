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
        <div className="min-h-screen flex text-brand-navy">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div
                className="hidden md:block w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1610214605996-3b320d571850?q=80&w=2670&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-brand-navy/30 mix-blend-multiply"></div>
                <div className="absolute bottom-10 left-10 text-white p-8">
                    <h2 className="font-serif text-4xl mb-2">Secure Your Legacy.</h2>
                    <p className="font-light tracking-wide text-gray-200">Account recovery made simple and secure.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center md:text-left">
                        <Link href="/" className="md:hidden font-serif text-2xl tracking-widest text-brand-navy font-bold mb-8 block">SPARK BLUE</Link>
                        <h2 className="text-3xl font-serif text-brand-navy mb-2">Forgot Password</h2>
                        <p className="text-gray-500 text-sm">Enter your email to receive a reset link</p>
                    </div>

                    {submitted ? (
                        <div className="text-center md:text-left animate-fade-in">
                            <div className="bg-green-50 text-green-800 p-6 border-l-4 border-green-500 mb-8 shadow-sm">
                                <p className="font-bold mb-2">Check your inbox</p>
                                <p className="text-sm">We have sent a password reset link to <span className="font-semibold">{email}</span>.</p>
                            </div>
                            <Link href="/login" className="inline-block bg-brand-navy text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="relative z-0 w-full mb-6 group">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                    placeholder=" "
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email Address</label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand-navy text-white py-4 rounded-none hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 font-bold uppercase tracking-widest text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    {!submitted && (
                        <div className="text-center text-sm text-gray-500">
                            Remember your password?{' '}
                            <Link href="/login" className="font-bold text-brand-navy hover:text-brand-gold transition-colors">
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
