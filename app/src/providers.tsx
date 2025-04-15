'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavbarProvider } from "@/contexts/NavbarContext";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <NavbarProvider>
            {children}
          </NavbarProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
} 