'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavbarProvider } from "@/contexts/NavbarContext";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NavbarProvider>
        {children}
      </NavbarProvider>
    </QueryClientProvider>
  );
} 