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
import { usePathname } from 'next/navigation';

export default function ProfileButton() {
  const pathname = usePathname();
  // TODO: Replace with actual auth state/hook
  // const { isLoggedIn, logout } = useAuth();
  const isLoggedIn = false;

  const onLogout = () => {
    // TODO: Implement logout
    console.log("Logging out");
  };
  if (!isLoggedIn) {
    return (
      <Button
        variant="ghost"
        asChild
        className={cn(
          "text-zinc-400 hover:text-white"
        )}
      >
        {pathname !== '/join-us' && (
          <Link href="/join-us">Join us</Link>
        )}
      </Button>
    );
  }

  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative h-8 w-8 rounded-full"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.png" alt="Profile" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}