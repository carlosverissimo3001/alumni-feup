'use client';

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredResource="admin" requiredAction="read">
      {children}
    </ProtectedRoute>
  );
} 
