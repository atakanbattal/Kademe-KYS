import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginCredentials, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
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
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for user token on mount
  useEffect(() => {
    const checkUserToken = async () => {
      if (authService.isLoggedIn()) {
        try {
          setLoading(true);
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          authService.logout();
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkUserToken();
  }, []);

  // Login user
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login(credentials);
      setUser(userData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await authService.register(userData);
      setUser(newUser);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 