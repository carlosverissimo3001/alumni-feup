"use client";

import { cn } from "@/lib/utils";
import {
  GlobeIcon,
  PanelRightOpen,
  PanelLeftOpen,
  LogOutIcon,
  ChartNoAxesCombined,
  UsersRoundIcon,
  LogInIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useNavbar } from "@/contexts/NavbarContext";

const Navbar = () => {
  const { isCollapsed, setIsCollapsed } = useNavbar();
  const pathname = usePathname();

  // TODO: Replace this with an actual Auth Context
  const isLoggedIn = false;

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
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Join Us",
      icon: <UsersRoundIcon size={20} />,
      href: "/join",
    },
  ];

  return (
    <div
      className={cn(
        "relative space-y-4 py-4 flex flex-col h-full bg-zinc-900 text-white transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-56"
      )}
    >
      <div className="px-3 py-2 flex-1">
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
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelRightOpen size={25} />
            )}
          </Button>
        </div>
        <div className="space-y-1 px-1">
          {routes.slice(0, 2).map((route) => (
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

      {isLoggedIn ? (
        <div className="mt-auto px-3 py-2">
          <div
            className={cn(
              "flex items-center justify-between",
              isCollapsed && "justify-center"
            )}
          >
            <Link
              href="/profile"
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-zinc-800 rounded-lg transition",
                pathname === "/profile"
                  ? "text-white bg-zinc-800"
                  : "text-zinc-400",
                isCollapsed && "justify-center"
              )}
            >
              <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="/placeholder-avatar.png" />
                  <AvatarFallback className="bg-zinc-800">JD</AvatarFallback>
                </Avatar>
                <div className={cn(
                  "flex flex-col justify-center overflow-hidden whitespace-nowrap transition-all duration-300",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                  <span className="text-sm font-medium">John Doe</span>
                </div>
              </div>
            </Link>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isCollapsed ? "w-0" : "w-9"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 text-zinc-400 hover:text-white h-full"
                onClick={() => {
                  /* handle logout */
                }}
              >
                <LogOutIcon size={20} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto px-3 py-2">
          <Link
            key="/join-us"
            href="/join-us"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-zinc-800 rounded-lg transition",
              pathname === "/join-us"
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
              <UsersRoundIcon size={20} className="shrink-0" />
              <span
                className={cn(
                  "ml-3 transition-opacity duration-300",
                  isCollapsed ? "opacity-0 hidden" : "opacity-100"
                )}
              >
                Join Us
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
