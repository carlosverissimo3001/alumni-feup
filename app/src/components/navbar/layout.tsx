'use client';

import { useState } from 'react';
import Navbar from './navbar';
import { cn } from '@/lib/utils';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="h-full relative">
      <div className={cn(
        "hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-zinc-900",
        isCollapsed ? "md:w-15" : "md:w-56"
      )}>
        <Navbar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />
      </div>
      <main className={cn(
        "relative z-[20] transition-all duration-300",
        isCollapsed ? "md:pl-20" : "md:pl-72"
      )}>
        {children}
      </main>
    </div>
  );
};

export default Layout;