'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/sdk/api';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(storedUser));
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Initialize userId in localStorage if not already set
        if (typeof window !== 'undefined' && parsedUser.id) {
          localStorage.setItem('userId', parsedUser.id);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error parsing stored user data from cookies:', error.message);
        } else {
          console.error('Error parsing stored user data from cookies:', String(error));
        }
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove('user');
        
        // Also remove userId from localStorage if user data is invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userId');
        }
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    Cookies.set('auth_token', newToken, { expires: 7 });
    Cookies.set('user', encodeURIComponent(JSON.stringify(newUser)), { expires: 7 });
    
    // Store userId in localStorage for API middleware
    if (typeof window !== 'undefined' && newUser.id) {
      localStorage.setItem('userId', newUser.id);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    Cookies.remove('auth_token');
    Cookies.remove('user');
    
    // Remove userId from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }

    // TODO: Maybe invalidate the token in the backend


/*     toast({
      title: 'Logged out',
      description: 'You have been logged out',
      variant: 'default',
    }); */
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 
