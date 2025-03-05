'use client';

import { cn } from '@/lib/utils';
import Navbar from "./navbar";
import { ProfileButton } from "../profile/profileButton";
import { useNavbar } from '@/contexts/NavbarContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useNavbar();

  return (
    <div className="h-screen relative">
      <div className="absolute top-4 right-4 z-[60]">
        <ProfileButton />
      </div>

      <div className="flex h-full">
        <div className={cn(
          "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-zinc-900",
          isCollapsed ? "md:w-15" : "md:w-56"
        )}>
          <Navbar />
        </div>
        <main className={cn(
          "flex-1 h-full w-full",
          "relative z-[20] transition-all duration-300",
          isCollapsed ? "md:pl-20" : "md:pl-72"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;