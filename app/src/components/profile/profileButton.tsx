"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileButton() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();

  const onLogout = () => {
    logout();
  };

  // Note, just double verifying here so I don't need to do user?.* down the line
  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="ghost"
        asChild
        className={cn("text-zinc-400 hover:text-white")}
      >
        {pathname !== "/join-us" && <Link href="/join-us">Join us</Link>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("relative h-8 w-8 rounded-full")}>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.profilePictureUrl || "/placeholder-avatar.png"}
              alt="Profile"
            />
            <AvatarFallback>
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.profilePictureUrl || "/placeholder-avatar.png"}
              alt="Profile"
            />
            <AvatarFallback>
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-sm">{user.firstName} {user.lastName}</div>
          </div>
        </div>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
