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
  const [allowed, setAllowed] = useState<boolean | null>(null);

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
    if (user === undefined || isLoading) {
      setAllowed(null);
      return;
    }
    if (!user) {
      router.replace(fallbackPath);
      setAllowed(false);
      return;
    }
    if (isSuccess) {
      if (hasPermission) {
        setAllowed(true);
      } else {
        router.replace(fallbackPath);
        setAllowed(false);
      }
    }
  }, [user, isLoading, isSuccess, hasPermission, router, fallbackPath]);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allowed === false) {
    return null; // or some fallback component if you want
  }

  return <>{children}</>;
}
