'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <NavbarContext.Provider value={{ 
      isCollapsed, 
      toggleCollapse,
    }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
}