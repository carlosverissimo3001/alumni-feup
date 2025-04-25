"use client";

import { cn } from "@/lib/utils";
import {
  GlobeIcon,
  BadgeHelpIcon,
  UserIcon,
  ChartSpline,
  MessageCircleCode,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useNavbar } from "@/contexts/NavbarContext";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { isCollapsed, toggleCollapse } = useNavbar();
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isCollapsed) {
      toggleCollapse();
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (!isCollapsed) {
        toggleCollapse();
      }
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isCollapsed &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        toggleCollapse();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isCollapsed, toggleCollapse]);

  const routes = [
    {
      label: "World",
      icon: <GlobeIcon size={20} />,
      href: "/",
    },
    {
      label: "Reviews",
      icon: <MessageCircleCode size={20} />,
      href: "/reviews",
    },
    {
      label: "Analytics",
      icon: <ChartSpline size={20} />,
      href: "/analytics",
    },
    {
      label: "Your Network",
      icon: <UserIcon size={20} />,
      href: user ? `/profile/${user.id}` : "/",
      disabled: !isAuthenticated,
    },
    {
      label: "Feedback",
      icon: <BadgeHelpIcon size={20} />,
      href: "/feedback",
    },
  ];

  return (
    <div
      ref={navbarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative space-y-4 py-8 flex flex-col h-full bg-zinc-900 text-white transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-60"
      )}
    >
      <div className="px-3 py-2 flex-1">
        <div
          className={cn(
            "flex items-center mb-14",
            isCollapsed ? "justify-center" : "justify-center px-1"
          )}
        >
          <Link href="/">
            <h1
              className={cn(
                "text-2xl font-bold flex items-center gap-2 overflow-hidden whitespace-nowrap transition-opacity duration-300"
              )}
            >
              <Image
                src="/images/logo-simple.png"
                alt="logo"
                width={32}
                height={32}
                className="shrink-0"
              />
              {!isCollapsed && <span>30EIC</span>}
            </h1>
          </Link>
        </div>

        {/* Routes - World, Dashboard, Profile, Leave Feedback */}
        <div className="space-y-1 px-1">
          {routes.map((route) => (
            !route.disabled && (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-zinc-800 rounded-lg transition",
                  pathname === route.href
                    ? "text-white bg-zinc-800"
                    : "text-zinc-400",
                  isCollapsed && "justify-center"
                )}
              >
                <div
                  className={cn(
                    "flex items-center flex-1",
                    isCollapsed && "justify-center"
                  )}
                >
                  {route.icon}
                  <span className={cn("ml-3 whitespace-nowrap", isCollapsed && "hidden")}>
                    {route.label}
                  </span>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* TODO: Add theme toggle later */}

      {/* Copyright notice */}
      <div
        className={cn(
          "px-2 py-2 text-center text-zinc-500 transition-opacity duration-300 text-[0.6rem]"
        )}
      >
        <span>© FEUP 2025</span>
      </div>
    </div>
  );
};

export default Navbar;
