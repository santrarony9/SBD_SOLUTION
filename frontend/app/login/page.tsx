'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI, API_URL } from '@/lib/api';

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp' | 'admin'>('password');

    // Password Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // OTP Login State
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        console.log('[Login] Attempting password login...', { email, roleSelection: loginMethod });
        try {
            console.log('[Login] Calling fetchAPI to /auth/login...');
            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            console.log('[Login] fetchAPI returned data:', data);

            if (!data.access_token || !data.user) {
                console.error('[Login] Missing token or user in response!', data);
                setError('Invalid server response format. Contact Admin.');
                return;
            }

            console.log('[Login] Calling AuthContext login()');
            login(data.access_token, data.user);
        } catch (err: any) {
            console.error('[Login] Encountered error during login process:', err);
            // Show more specific error if available
            if (err.message.includes('401')) {
                setError('Invalid email or password');
            } else {
                setError(`${err.message} (${API_URL})`);
            }
        } finally {
            console.log('[Login] Finished attempting login process. Setting isLoading=false');
            setIsLoading(false);
        }
    };

    const handleSuperReset = async () => {
        setError('');
        setIsLoading(true);
        try {
            await fetchAPI('/diagnostics/reset-admin', { method: 'POST' });
            setError('Admin account reset successfully! Try logging in with Admin@123');
        } catch (err: any) {
            setError(`Reset failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!mobile || mobile.length < 10) {
            setError('Please enter a valid mobile number');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await fetchAPI('/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ mobile }),
            });
            setOtpSent(true);
        } catch (err) {
            setError('Failed to send OTP. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await fetchAPI('/auth/login-otp', {
                method: 'POST',
                body: JSON.stringify({ mobile, otp }),
            });
            login(data.access_token, data.user);
        } catch (err) {
            setError('Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-brand-navy">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div
                className="hidden md:block w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1589128777090-f944613f990a?q=80&w=2669&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-brand-navy/30 mix-blend-multiply"></div>
                <div className="absolute bottom-10 left-10 text-white p-8">
                    <h2 className="font-serif text-4xl mb-2">Welcome Back.</h2>
                    <p className="font-light tracking-wide text-gray-200">Continue your journey with Spark Blue.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center md:text-left">
                        <Link href="/" className="md:hidden font-serif text-2xl tracking-widest text-brand-navy font-bold mb-8 block">SPARK BLUE</Link>
                        <h2 className="text-3xl font-serif text-brand-navy mb-2">Sign In</h2>
                        <p className="text-gray-500 text-sm">Enter your details to access your account</p>
                    </div>

                    {/* Method Toggle */}
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${loginMethod === 'password' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}
                            onClick={() => setLoginMethod('password')}
                        >
                            Email & Password
                        </button>
                        <button
                            className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${loginMethod === 'otp' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}
                            onClick={() => setLoginMethod('otp')}
                        >
                            Mobile OTP
                        </button>
                        <button
                            className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${loginMethod === 'admin' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}
                            onClick={() => setLoginMethod('admin')}
                        >
                            Admin Access
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-none border-l-4 border-red-500 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {loginMethod === 'password' || loginMethod === 'admin' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-8">
                            <div className="space-y-6">
                                {/* Admin Badge */}
                                {loginMethod === 'admin' && (
                                    <div className="bg-brand-gold/10 text-brand-gold border border-brand-gold p-3 text-center text-xs font-bold uppercase tracking-widest mb-4">
                                        Administrative Access
                                    </div>
                                )}
                                <div className="relative z-0 w-full mb-6 group">
                                    <input
                                        type="email"
                                        className="block py-2.5 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                        placeholder=" "
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email Address</label>
                                </div>

                                <div className="relative z-0 w-full mb-6 group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="block py-2.5 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                        placeholder=" "
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 top-3 flex items-center text-gray-400 hover:text-brand-gold transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <Link href="/forgot-password" className="text-sm font-medium text-brand-gold hover:text-brand-navy transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full text-white py-4 rounded-none transition-all duration-300 font-bold uppercase tracking-widest text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed ${loginMethod === 'admin' ? 'bg-brand-gold hover:bg-brand-navy' : 'bg-brand-navy hover:bg-gold-gradient hover:text-brand-navy'}`}
                            >
                                {isLoading ? 'Authenticating...' : (loginMethod === 'admin' ? 'Access Dashboard' : 'Sign In')}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-8">
                            {!otpSent ? (
                                <div className="space-y-6">
                                    <div className="relative z-0 w-full mb-6 group">
                                        <input
                                            type="tel"
                                            className="block py-2.5 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                            placeholder=" "
                                            required
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                        />
                                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Mobile Number</label>
                                    </div>
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                        className="w-full bg-brand-navy text-white py-4 hover:bg-gold-gradient hover:text-brand-navy transition-all uppercase font-bold text-sm tracking-widest"
                                    >
                                        {isLoading ? 'Sending OTP...' : 'Get OTP'}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="bg-green-50 text-green-700 p-3 text-sm rounded border border-green-200">
                                        OTP sent to {mobile}
                                    </div>
                                    <div className="relative z-0 w-full mb-6 group">
                                        <input
                                            type="text"
                                            className="block py-2.5 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                            placeholder=" "
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Enter OTP</label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-brand-navy text-white py-4 hover:bg-gold-gradient hover:text-brand-navy transition-all uppercase font-bold text-sm tracking-widest"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify & Login'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="w-full text-xs text-brand-gold hover:underline uppercase tracking-wider"
                                    >
                                        Change Mobile Number
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="text-center text-sm text-gray-500 pb-4">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-bold text-brand-navy hover:text-brand-gold transition-colors">
                            Create Account
                        </Link>
                    </div>

                    {/* Diagnostics/Emergency Reset */}
                    <div className="pt-6 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={handleSuperReset}
                            className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-brand-gold transition-colors"
                        >
                            Emergency Admin Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
