/* We will try to redirect to the profile page of the user */
'use client';

import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(13)

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/profile/${user.id}`);
    }
    else {
      router.push("/");
    }
  }, [user, router, isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Progress value={progress} className="w-[60%]" />
    </div>
  )
}

