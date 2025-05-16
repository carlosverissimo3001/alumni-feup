"use client";

import { cn } from "@/lib/utils";
import {
  GlobeIcon,
  BadgeHelpIcon,
  UserIcon,
  ChartSpline,
  MessageCircleCode,
  BrainIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useNavbar } from "@/contexts/NavbarContext";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { isCollapsed, toggleCollapse } = useNavbar();
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

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
      label: "Analytics",
      icon: <ChartSpline size={20} />,
      href: "/analytics",
    },
    {
      label: "Insights",
      icon: <BrainIcon   size={20} />,
      href: "/insights",
    },
    {
      label: "Reviews",
      icon: <MessageCircleCode size={20} />,
      href: "/reviews",
      disabled: !isAuthenticated,
    },
    {
      label: "My Profile",
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
        "relative space-y-4 py-8 flex flex-col h-full bg-gradient-to-b from-zinc-900 to-zinc-800 text-white transition-all duration-500 ease-in-out z-50 hover:shadow-xl hover:shadow-[#8C2D19]/20",
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
                "text-2xl font-bold flex items-center gap-2 overflow-hidden whitespace-nowrap transition-opacity duration-300 group"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/images/logo-simple.png"
                  alt="logo"
                  width={32}
                  height={32}
                  className="shrink-0"
                />
              </motion.div>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  30EIC
                </motion.span>
              )}
            </h1>
          </Link>
        </div>

        {/* Routes - World, Dashboard, Profile, Leave Feedback */}
        <div className="space-y-1 px-1">
          {routes
            .filter((route) => !route.disabled)
            .map((route) => (
              <Link
                key={`${route.label}-${route.href}`}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-gradient-to-r hover:from-[#8C2D19]/20 hover:to-zinc-800 rounded-lg transition-all duration-200",
                  pathname === route.href
                    ? "text-white bg-gradient-to-r from-[#8C2D19]/20 to-zinc-800"
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
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ duration: 0.3 }}
                  >
                    {route.icon}
                  </motion.div>
                  <span
                    className={cn(
                      "ml-3 whitespace-nowrap",
                      isCollapsed && "hidden"
                    )}
                  >
                    {route.label}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </div>

      <motion.div
        className={cn(
          "px-2 py-2 text-center text-zinc-500 transition-opacity duration-300 text-[0.6rem]"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <span>© FEUP 2025</span>
      </motion.div>
    </div>
  );
};

export default Navbar;
