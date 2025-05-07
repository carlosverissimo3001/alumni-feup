'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useCheck } from "@/hooks/misc/useCheck";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredResource: string;
  requiredAction?: string;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredResource,
  requiredAction = "read",
  fallbackPath = "/analytics",
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: hasPermission,
    isLoading,
    isSuccess,
  } = useCheck(
    user
      ? {
          checkPermissionDto: {
            userId: user.id,
            resource: requiredResource,
            action: requiredAction,
          },
        }
      : null
  );

  useEffect(() => {
    if (!isLoading && isSuccess && !hasPermission) {
      router.replace(fallbackPath);
    }
  }, [isLoading, isSuccess, hasPermission, router, fallbackPath]);

  if (isLoading || (isSuccess && !hasPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
