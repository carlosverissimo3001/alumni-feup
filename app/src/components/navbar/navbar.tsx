"use client";

import { cn } from "@/lib/utils";
import {
  GlobeIcon,
  PanelRightOpen,
  PanelLeftOpen,
  ChartNoAxesCombined,
  BadgeHelpIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Image from "next/image";
import { useNavbar } from "@/contexts/NavbarContext";
import { useEffect, useRef } from "react";

const Navbar = () => {
  const { isCollapsed, toggleCollapse } = useNavbar();
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (isCollapsed) {
      toggleCollapse();
    }
  };

  const handleMouseLeave = () => {
    if (!isCollapsed) {
      toggleCollapse();
    }
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
    };
  }, [isCollapsed, toggleCollapse]);

  const routes = [
    {
      label: "World",
      icon: <GlobeIcon size={20} />,
      href: "/",
    },
    {
      label: "Dashboard",
      icon: <ChartNoAxesCombined size={20} />,
      href: "/dashboard",
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
        {/* Logo & Collapse Button */}
        <div
          className={cn(
            "flex items-center mb-14",
            isCollapsed ? "justify-center" : "justify-between px-1"
          )}
        >
          <Link href="/">
            <h1
              className={cn(
                "text-2xl font-bold flex items-center gap-2 overflow-hidden whitespace-nowrap transition-opacity duration-300",
                isCollapsed ? "opacity-0 hidden" : "opacity-100"
              )}
            >
              <Image
                src="/images/logo-simple.png"
                alt="logo"
                width={32}
                height={32}
                className="shrink-0"
              />
              <span>30EIC</span>
            </h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
            onClick={toggleCollapse}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelRightOpen size={25} />
            )}
          </Button>
        </div>

        {/* Routes - World, Dashboard, Leave Feedback */}
        <div className="space-y-1 px-1">
          {routes.map((route) => (
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
                <span className={cn("ml-3", isCollapsed && "hidden")}>
                  {route.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

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
