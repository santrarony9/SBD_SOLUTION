'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const router = useRouter();

    const handleSendOtp = async () => {
        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }
        setIsSendingOtp(true);
        setError('');
        try {
            await fetchAPI('/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ mobile })
            });
            setIsOtpSent(true);
            alert('OTP sent to ' + mobile);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await fetchAPI('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password, mobile, otp }),
            });

            // On success, redirect to login
            router.push('/login?registered=true');

        } catch (err: any) {
            console.error('Registration failed', err);
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-brand-navy">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div
                className="hidden md:block w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2574&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-brand-navy/30 mix-blend-multiply"></div>
                <div className="absolute bottom-10 left-10 text-white p-8">
                    <h2 className="font-serif text-4xl mb-2">Join the Elite.</h2>
                    <p className="font-light tracking-wide text-gray-200">Start your exclusive collection today.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center md:text-left">
                        <Link href="/" className="md:hidden font-serif text-2xl tracking-widest text-brand-navy font-bold mb-8 block">SPARK BLUE</Link>
                        <h2 className="text-3xl font-serif text-brand-navy mb-2">Create Account</h2>
                        <p className="text-gray-500 text-sm">Fill in your details to get started</p>
                    </div>

                    {/* Debug Info */}
                    <div className="text-[10px] text-gray-300 text-center md:text-left">
                        API: {(process.env.NEXT_PUBLIC_API_URL || 'undefined').replace(/\/$/, '')}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-none border-l-4 border-red-500 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="relative z-0 w-full mb-6 group">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                    placeholder=" "
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <label htmlFor="name" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Full Name</label>
                            </div>

                            {/* Mobile & OTP Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative z-0 w-full mb-6 group">
                                    <input
                                        type="tel"
                                        name="mobile"
                                        id="mobile"
                                        disabled={isOtpSent}
                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer disabled:text-gray-400"
                                        placeholder=" "
                                        required
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                    />
                                    <label htmlFor="mobile" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Mobile Number</label>

                                    {!isOtpSent && mobile.length >= 10 && (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={isSendingOtp}
                                            className="absolute right-0 top-2 text-xs font-bold text-brand-gold hover:text-brand-navy uppercase tracking-widest"
                                        >
                                            {isSendingOtp ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    )}
                                </div>

                                {isOtpSent && (
                                    <div className="relative z-0 w-full mb-6 group animate-fade-in">
                                        <input
                                            type="text"
                                            name="otp"
                                            id="otp"
                                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                            placeholder=" "
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                        <label htmlFor="otp" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Enter OTP</label>
                                    </div>
                                )}
                            </div>

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

                            <div className="relative z-0 w-full mb-6 group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                    placeholder=" "
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>

                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 top-3 flex items-center text-gray-400 hover:text-brand-gold transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-navy text-white py-4 rounded-none hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 font-bold uppercase tracking-widest text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-brand-navy hover:text-brand-gold transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
