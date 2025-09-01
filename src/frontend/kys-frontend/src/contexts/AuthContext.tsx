import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService, { User, LoginCredentials } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini yükle
        const initializeAuth = () => {
            try {
                const currentUser = authService.getCurrentUser();
                const isLoggedIn = authService.isLoggedIn();
                
                if (currentUser && isLoggedIn) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                // Hatalı token varsa temizle
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        // ✅ Hemen başlat
        initializeAuth();
        
        // ✅ Güvenlik: 2 saniye sonra mutlaka loading'i kapat (hızlı loading için)
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('⚠️ Auth loading timeout - zorla kapatılıyor');
                setLoading(false);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [loading]);

    const login = async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            const userData = await authService.login(credentials);
            setUser(userData);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
