'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        { href: '/account', label: 'My Profile' },
        { href: '/account/orders', label: 'Order History' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif text-brand-navy mb-8">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <nav className="flex flex-col">
                                {links.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`px-6 py-4 text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-brand-navy text-white'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-brand-navy'
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                                <button
                                    onClick={logout}
                                    className="px-6 py-4 text-sm font-medium text-left text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
                                >
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
