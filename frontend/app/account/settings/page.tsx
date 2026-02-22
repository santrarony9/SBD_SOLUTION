'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AccountSettings() {
    const { user, login } = useAuth();
    const { showToast } = useToast();

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        mobile: user?.mobile || ''
    });
    const [isProfileUpdating, setIsProfileUpdating] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileUpdating(true);
        try {
            const updatedUser = await fetchAPI('/profile', {
                method: 'PATCH',
                body: JSON.stringify(profileData)
            });
            login(localStorage.getItem('token') || '', updatedUser);
            showToast('Your profile has been polished', 'success');
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setIsProfileUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        setIsPasswordUpdating(true);
        try {
            await fetchAPI('/profile/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                })
            });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            showToast('Your security credentials have been updated', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to update security', 'error');
        } finally {
            setIsPasswordUpdating(false);
        }
    };

    return (
        <div className="space-y-20">
            {/* Profile Section */}
            <section>
                <header className="border-b border-brand-charcoal/10 pb-4 mb-10">
                    <h2 className="text-3xl font-serif text-brand-navy">Personal Profile</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mt-2">Manage your identity at Spark Blue</p>
                </header>

                <form onSubmit={handleProfileUpdate} className="max-w-2xl space-y-10">
                    <div className="group">
                        <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Full Name</label>
                        <input
                            required
                            className="w-full bg-transparent border-b border-gray-300 py-2 text-xl font-serif text-brand-navy focus:border-brand-gold outline-none transition-colors"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                    </div>
                    <div className="group">
                        <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Mobile Number</label>
                        <input
                            placeholder="Connect your mobile"
                            className="w-full bg-transparent border-b border-gray-300 py-2 text-lg font-sans text-brand-navy focus:border-brand-gold outline-none transition-colors"
                            value={profileData.mobile}
                            onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isProfileUpdating}
                        className="px-10 py-5 bg-brand-navy text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-xl hover:shadow-brand-gold/20"
                    >
                        {isProfileUpdating ? 'Polishing...' : 'Update Profile'}
                    </button>
                </form>
            </section>

            {/* Security Section */}
            <section>
                <header className="border-b border-brand-charcoal/10 pb-4 mb-10">
                    <h2 className="text-3xl font-serif text-brand-navy">Vault Security</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mt-2">Update your private access key</p>
                </header>

                <form onSubmit={handleChangePassword} className="max-w-2xl space-y-10">
                    <div className="group">
                        <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Current Password</label>
                        <input
                            required type="password"
                            className="w-full bg-transparent border-b border-gray-300 py-2 text-lg focus:border-brand-gold outline-none transition-colors"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">New Password</label>
                            <input
                                required type="password"
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-lg focus:border-brand-gold outline-none transition-colors"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-2 group-focus-within:text-brand-gold transition-colors">Confirm Password</label>
                            <input
                                required type="password"
                                className="w-full bg-transparent border-b border-gray-300 py-2 text-lg focus:border-brand-gold outline-none transition-colors"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isPasswordUpdating}
                        className="px-10 py-5 border border-brand-navy text-brand-navy text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-navy hover:text-white transition-all shadow-lg"
                    >
                        {isPasswordUpdating ? 'Updating Vault...' : 'Change Access Key'}
                    </button>
                </form>
            </section>
        </div>
    );
}
