'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { safeLocalStorage } from '@/lib/storage';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    mobile?: string;
    addresses?: any[];
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = safeLocalStorage.getItem('token');
        const storedUser = safeLocalStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error('[AuthContext] Failed to parse stored user, clearing corrupt session.', error);
                safeLocalStorage.removeItem('token');
                safeLocalStorage.removeItem('user');
                setToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        console.log('[AuthContext] login() called with token:', newToken ? 'YES' : 'NO', 'user:', newUser);
        safeLocalStorage.setItem('token', newToken);
        safeLocalStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);

        // Check for any admin-level role
        const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'PRICE_MANAGER'];
        console.log('[AuthContext] Checking if user role is admin:', newUser.role);

        if (adminRoles.includes(newUser.role)) {
            console.log('[AuthContext] Role is admin. Redirecting to /admin...');
            router.push('/admin');
        } else {
            console.log('[AuthContext] Role is regular user. Redirecting to /account...');
            router.push('/account');
        }
    };

    const logout = () => {
        safeLocalStorage.removeItem('token');
        safeLocalStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
