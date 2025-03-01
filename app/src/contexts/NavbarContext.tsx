'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  menuVisible: boolean;
  toggleMenuVisibility: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [menuVisible, setMenuVisible] = useState(true);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMenuVisibility = () => setMenuVisible(!menuVisible);

  return (
    <NavbarContext.Provider value={{ 
      isCollapsed, 
      toggleCollapse,
      menuVisible,
      toggleMenuVisibility 
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