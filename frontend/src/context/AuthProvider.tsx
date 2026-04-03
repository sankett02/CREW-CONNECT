import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from './AuthTypes';
import { AuthContext } from './AuthContextBase';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState<'BRAND' | 'CREATOR'>(() => {
        const savedMode = sessionStorage.getItem('viewMode') as 'BRAND' | 'CREATOR';
        if (savedMode) return savedMode;
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                return userData.role === 'BRAND' ? 'BRAND' : 'CREATOR';
            } catch {
                return 'CREATOR';
            }
        }
        return 'CREATOR';
    });

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('viewMode');
        delete axios.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        const validateSession = async () => {
            const savedUser = sessionStorage.getItem('user');
            if (savedUser) {
                const userData = JSON.parse(savedUser) as User;
                if (userData.token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                    try {
                        const res = await axios.get('/api/auth/me');
                        const profile = res.data.user.profile as Record<string, unknown> | undefined;
                        const updatedUserData: User = {
                            ...userData,
                            displayName: String(profile?.displayName || res.data.user.email || '').split('@')[0],
                        };
                        setUser(updatedUserData);
                        sessionStorage.setItem('user', JSON.stringify(updatedUserData));
                    } catch (err) {
                        console.error('Session validation failed', err);
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        validateSession();
    }, []);

    useEffect(() => {
        if (user && user.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [user]);

    const toggleViewMode = () => {
        const newMode = viewMode === 'BRAND' ? 'CREATOR' : 'BRAND';
        setViewMode(newMode);
        sessionStorage.setItem('viewMode', newMode);
    };

    const login = (data: { user: Record<string, unknown>; token: string }) => {
        const profile = data.user.profile as Record<string, unknown> | undefined;
        const userData: User = {
            id: String(data.user.id || ''),
            email: String(data.user.email || ''),
            role: (data.user.role as User['role']) || 'CREATOR',
            token: data.token,
            displayName: String(profile?.displayName || data.user.email || '').split('@')[0],
        };
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        const initialMode = userData.role === 'BRAND' ? 'BRAND' : 'CREATOR';
        setViewMode(initialMode);
        sessionStorage.setItem('viewMode', initialMode);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            sessionStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, viewMode, login, updateUser, logout, toggleViewMode, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
