'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI, API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

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
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const registered = searchParams.get('registered');

    useEffect(() => {
        if (registered) {
            showToast('Registration successful! Please login.', 'success');
        }
    }, [registered, showToast]);

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
                style={{ backgroundImage: 'url("/login-bg.jpg")' }}
            >
                <div className="absolute inset-0 bg-brand-navy/30 mix-blend-multiply"></div>
                <div className="absolute bottom-10 left-10 text-white p-8">
                    <h2 className="font-serif text-4xl mb-2">Welcome Back.</h2>
                    <p className="font-light tracking-wide text-gray-200">Continue your journey with Spark Blue.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md space-y-4 md:space-y-6">
                    <div className="text-center md:text-left">
                        <Link href="/" className="md:hidden font-serif text-2xl tracking-widest text-brand-navy font-bold mb-4 block">SPARK BLUE</Link>
                        <h2 className="text-2xl md:text-3xl font-serif text-brand-navy mb-1">Sign In</h2>
                        <p className="text-gray-500 text-xs md:text-sm">Enter your details to access your account</p>
                    </div>

                    {registered && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Account created successfully! Please login with your details.
                        </div>
                    )}

                    {/* Method Toggle */}
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${loginMethod === 'password' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}
                            onClick={() => setLoginMethod('password')}
                        >
                            Email & Password
                        </button>
                        {/* OTP Login hidden for now */}
                        {/* 
                        <button
                            className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors ${loginMethod === 'otp' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-brand-navy'}`}
                            onClick={() => setLoginMethod('otp')}
                        >
                            Mobile OTP
                        </button>
                        */}
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
                        <form onSubmit={handlePasswordLogin} className="space-y-4 md:space-y-6">
                            <div className="space-y-4 md:space-y-5">
                                {/* Admin Badge */}
                                {loginMethod === 'admin' && (
                                    <div className="bg-brand-gold/10 text-brand-gold border border-brand-gold p-3 text-center text-xs font-bold uppercase tracking-widest mb-4">
                                        Administrative Access
                                    </div>
                                )}
                                <div className="relative z-0 w-full mb-4 md:mb-6 group">
                                    <input
                                        type="email"
                                        className="block py-2 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
                                        placeholder=" "
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-brand-gold peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email Address</label>
                                </div>

                                <div className="relative z-0 w-full mb-4 md:mb-6 group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="block py-2 px-0 w-full text-sm text-brand-navy bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-brand-gold peer"
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
                                className={`w-full text-white py-3.5 rounded-none transition-all duration-300 font-bold uppercase tracking-widest text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed ${loginMethod === 'admin' ? 'bg-brand-gold hover:bg-brand-navy' : 'bg-brand-navy hover:bg-gold-gradient hover:text-brand-navy'}`}
                            >
                                {isLoading ? 'Authenticating...' : (loginMethod === 'admin' ? 'Access Dashboard' : 'Sign In')}
                            </button>

                            {/* Google SSO Button */}
                            {loginMethod === 'password' && (
                                <div className="space-y-3">
                                    <div className="relative flex items-center justify-center">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase tracking-widest font-medium">Or continue with</span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => window.location.href = `${API_URL}/auth/google`}
                                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Sign in with Google
                                    </button>
                                </div>
                            )}
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

                    <div className="text-center text-sm text-gray-500 pb-2">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-bold text-brand-navy hover:text-brand-gold transition-colors">
                            Create Account
                        </Link>
                    </div>

                    {/* Diagnostics/Emergency Reset */}
                    <div className="pt-2 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={handleSuperReset}
                            className="text-[9px] uppercase tracking-widest text-gray-300 hover:text-brand-gold transition-colors"
                        >
                            Emergency Admin Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
