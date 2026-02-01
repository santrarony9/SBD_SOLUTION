'use client';

import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
    const { user } = useAuth();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-serif text-brand-navy mb-6">Profile Overview</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                    <p className="text-lg font-medium text-gray-900">{user?.name}</p>
                </div>

                <div>
                    <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                    <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                </div>

                <div>
                    <label className="block text-sm text-gray-500 mb-1">Member Since</label>
                    <p className="text-gray-900">February 2026</p>
                </div>
            </div>
        </div>
    );
}
