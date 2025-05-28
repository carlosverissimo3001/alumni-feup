"use client";

import { cn } from "@/lib/utils";
import Navbar from "./navbar";
import MobileNav from "./mobileNav";
import { useNavbar } from "@/contexts/NavbarContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useNavbar();

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <div className="flex-1 flex relative overflow-x-hidden">
        <div
          className={cn(
            "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-zinc-900",
            isCollapsed ? "md:w-20" : "md:w-60"
          )}
        >
          <Navbar />
        </div>
        <main
          className={cn(
            "flex-1 w-full bg-white pb-20 md:pb-0",
            "relative z-[20] transition-all duration-300",
            "overflow-x-hidden",
            isCollapsed ? "md:pl-20" : "md:pl-60"
          )}
        >
          <div className="max-w-full overflow-x-hidden">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
