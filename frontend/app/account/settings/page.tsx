'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/lib/api';

export default function AccountSettings() {
    const { user, login } = useAuth();

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
            alert('Your profile has been polished.');
        } catch (error) {
            alert('Failed to update profile.');
        } finally {
            setIsProfileUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match the confirm input.');
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
            alert('Your security credentials have been updated.');
        } catch (error: any) {
            alert(error.message || 'Face an error in updating security.');
        } finally {
            setIsPasswordUpdating(false);
        }
    };

    return (
        <div className="space-y-20">
            {/* Profile Section */}
            <section>
                <header className="border-b border-gray-100 pb-4 mb-8">
                    <h2 className="text-2xl font-serif text-brand-navy">Personal Profile</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mt-1">Manage your identity at Spark Blue</p>
                </header>

                <form onSubmit={handleProfileUpdate} className="max-w-xl space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Full Name</label>
                        <input
                            required
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Mobile Number</label>
                        <input
                            placeholder="Connect your mobile"
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                            value={profileData.mobile}
                            onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isProfileUpdating}
                        className="text-[10px] px-10 py-4 bg-brand-navy text-white font-bold uppercase tracking-widest hover:bg-gold-gradient hover:text-brand-navy transition-all shadow-xl"
                    >
                        {isProfileUpdating ? 'Polishing...' : 'Update Profile'}
                    </button>
                </form>
            </section>

            {/* Security Section */}
            <section>
                <header className="border-b border-gray-100 pb-4 mb-8">
                    <h2 className="text-2xl font-serif text-brand-navy">Vault Security</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mt-1">Update your private access key</p>
                </header>

                <form onSubmit={handleChangePassword} className="max-w-xl space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Ongoing Password</label>
                        <input
                            required type="password"
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">New Secret Key</label>
                            <input
                                required type="password"
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Confirm New Key</label>
                            <input
                                required type="password"
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-brand-gold outline-none"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isPasswordUpdating}
                        className="text-[10px] px-10 py-4 border-2 border-brand-navy text-brand-navy font-bold uppercase tracking-widest hover:bg-brand-navy hover:text-white transition-all"
                    >
                        {isPasswordUpdating ? 'Updating Vault...' : 'Change Access Key'}
                    </button>
                </form>
            </section>
        </div>
    );
}
