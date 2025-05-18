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
import { motion } from "framer-motion";

interface ProfileButtonProps {
  variant?: "default" | "floating";
}

export const ProfileButton = ({
  variant = "default",
}: ProfileButtonProps) => {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();

  const onLogout = () => {
    logout();
  };

  // Note, just double verifying here so I don't need to do user?.* down the line
  if (!isAuthenticated || !user) {
    return variant === "default" ? (
      <Button
        variant="ghost"
        asChild
        className={cn(
          "bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
        )}
      >
        {pathname !== "/join-us" && <Link href="/join-us">Join us</Link>}
      </Button>
    ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-24 right-8 z-50"
      >
        <Button
          variant="ghost"
          asChild
          className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        >
          {pathname !== "/join-us" && <Link href="/join-us">Join</Link>}
        </Button>
      </motion.div>
    );
  }

  const buttonContent = (
    <Button
      variant="ghost"
      className={cn(
        "relative h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-white hover:shadow-md hover:shadow-[#8C2D19]/20 transition-all duration-300",
        variant === "floating" && "h-12 w-12"
      )}
    >
      <Avatar
        className={cn(
          "h-10 w-10 border-2 border-transparent hover:border-[#8C2D19]/50 hover:ring-2 hover:ring-[#8C2D19]/30 hover:scale-110 transition-all duration-300",
          variant === "floating" && "h-12 w-12"
        )}
      >
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
  );

  const menuContent = (
    <DropdownMenuContent
      className={cn("w-56", variant === "floating" && "mb-2")}
      align={variant === "floating" ? "end" : "end"}
      side={variant === "floating" ? "top" : "bottom"}
      forceMount
      asChild
    >
      <motion.div
        initial={{ opacity: 0, y: variant === "floating" ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
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
            <div className="font-semibold text-sm">
              {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
        <DropdownMenuItem
          asChild
          className="cursor-pointer hover:bg-gradient-to-r hover:from-[#8C2D19]/10 hover:to-gray-100 hover:scale-105 transition-all duration-200"
        >
          <Link
            href={`/profile/${user.id}`}
            className="flex items-center w-full"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:scale-105 transition-all duration-200"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4 hover:animate-pulse transition-all duration-300" />
          <span>Log out</span>
        </DropdownMenuItem>
      </motion.div>
    </DropdownMenuContent>
  );

  if (variant === "floating") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-24 right-8 z-50"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{buttonContent}</DropdownMenuTrigger>
          {menuContent}
        </DropdownMenu>
      </motion.div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{buttonContent}</DropdownMenuTrigger>
      {menuContent}
    </DropdownMenu>
  );
}
