'use client';

import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavbarProvider } from "@/contexts/NavbarContext";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { DropdownProvider } from "./contexts/DropdownContext";
import { ThemeProvider } from "@/components/theme-provider";
import { isDarkModeRoute } from "@/lib/theme-routes";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Dark mode only reached a few pages in CAR-169 - force light everywhere else
  // so unmigrated pages (still hardcoded light-only) don't render broken.
  const forcedTheme = isDarkModeRoute(pathname) ? undefined : "light";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem forcedTheme={forcedTheme}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <NavbarProvider>
              <DropdownProvider>
                {children}
              </DropdownProvider>
            </NavbarProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
