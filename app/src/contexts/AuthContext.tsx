'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/sdk/models';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(storedUser));
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error parsing stored user data from cookies:', error.message);
        } else {
          console.error('Error parsing stored user data from cookies:', String(error));
        }
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove('user');
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Continue with client-side cleanup even if backend call fails
    }

    setUser(null);
    setIsAuthenticated(false);
    Cookies.remove('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
