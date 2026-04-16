import React, { createContext, useContext, useState, useEffect } from 'react';
import { Business } from '../types';

interface AuthContextType {
  token: string | null;
  business: Business | null;
  isAuthenticated: boolean;
  login: (token: string, business: Business) => void;
  // login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [business, setBusiness] = useState<Business | null>(() => {
    try {
      const saved = localStorage.getItem('business');
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Invalid JSON in localStorage:", error);
      return null;
    }
  });

  const login = (newToken: string, newBusiness: Business) => {
    localStorage.setItem('token', newToken);
    if (newBusiness) {
      localStorage.setItem('business', JSON.stringify(newBusiness));
    }
    setToken(newToken);
    setBusiness(newBusiness);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setBusiness(null);
    window.location.href = '/login';
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, business, isAuthenticated, login, logout }}>
    {/* <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}> */}
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
