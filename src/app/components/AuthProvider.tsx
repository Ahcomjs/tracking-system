'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { showMessage } from './MessageModal'; 

interface AuthContextType {
  token: string | null;
  userId: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, userName: string) => void;
  logout: () => void;
  isLoadingAuth: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');

    if (storedToken && storedUserId && storedUserName) {
      setToken(storedToken);
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = useCallback((newToken: string, newUserId: string, newUserName: string) => {
    setToken(newToken);
    setUserId(newUserId);
    setUserName(newUserName);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('userName', newUserName);
    showMessage('Login successful!', 'success');
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setUserName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    showMessage('Logged out successfully.', 'info');
    router.push('/auth/login'); 
  }, [router]);

  const isAuthenticated = !!token && !!userId;

  return (
    <AuthContext.Provider value={{ token, userId, userName, isAuthenticated, login, logout, isLoadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}