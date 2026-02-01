'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const links = [
        { href: '/account', label: 'Dashboard Overview', icon: '🏰' },
        { href: '/account/orders', label: 'My Orders', icon: '🛍️' },
        { href: '/account/wishlist', label: 'Wishlist', icon: '💎' },
        { href: '/account/addresses', label: 'Address Book', icon: '📍' },
        { href: '/account/settings', label: 'Account Settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-brand-cream/30 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
                    <h1 className="text-4xl font-serif text-brand-navy mb-2">My Royal Account</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-light">Welcome back, <span className="text-brand-gold font-bold">{user?.name}</span></p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <div className="bg-white shadow-xl border border-brand-gold/10 overflow-hidden sticky top-32">
                            <div className="p-6 bg-brand-navy text-white text-center">
                                <div className="w-20 h-20 bg-gold-gradient rounded-full mx-auto flex items-center justify-center text-brand-navy text-2xl font-serif mb-4 shadow-inner">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <h3 className="font-serif text-lg">{user?.name}</h3>
                                <p className="text-[10px] uppercase tracking-tighter opacity-70">Spark Blue Elite Member</p>
                            </div>
                            <nav className="flex flex-col py-4">
                                {links.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center space-x-4 group ${isActive
                                                ? 'bg-brand-gold/10 text-brand-navy border-r-4 border-brand-gold'
                                                : 'text-gray-500 hover:text-brand-gold hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                                            <span className="tracking-wide uppercase text-[11px] font-bold">{link.label}</span>
                                        </Link>
                                    );
                                })}
                                <div className="px-8 mt-6 pt-6 border-t border-gray-100 mb-6">
                                    <button
                                        onClick={logout}
                                        className="w-full text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 flex items-center space-x-2 transition-colors"
                                    >
                                        <span>🔚</span>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-9 animate-fade-in">
                        <div className="bg-white p-8 md:p-12 shadow-2xl border border-brand-gold/10 min-h-[600px] relative overflow-hidden">
                            {/* Circular decorative gold elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
