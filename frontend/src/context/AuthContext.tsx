import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { Spin } from 'antd';
import { setToken, getToken, clearAllTokens, setRefreshToken } from '@/storage/token';
import { User } from '@/@types/user';
import api from '@/http/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User, refreshToken?: string) => void;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const initializationRef = useRef<boolean>(false);

  const logout = useCallback(() => {
    clearAllTokens();
    setUser(null);
    setIsAuthenticated(false);
    // Use window.location.replace to prevent back button issues
    window.location.replace('/login');
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Failed to verify user authentication:', error);
      clearAllTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      // Only redirect if it's actually a 401 and we're not already on login page
      if (error.response?.status === 401 && 
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/forgot-password') &&
          !window.location.pathname.includes('/reset-password')) {
        window.location.replace('/login');
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const login = useCallback((token: string, userData: User, refreshToken?: string) => {
    setToken(token);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  // Initialize authentication on mount
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }
    
    initializationRef.current = true;
    
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  // Show loading spinner only during initial load
  if (isLoading && !isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      isLoading, 
      updateUser, 
      refreshUser,
      isInitialized
    }}>
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
