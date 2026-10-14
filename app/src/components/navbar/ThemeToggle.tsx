"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  /** Matches navbar.tsx's collapsed-sidebar row layout. */
  variant?: "desktop" | "mobile";
  isCollapsed?: boolean;
};

export function ThemeToggle({ variant = "desktop", isCollapsed = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid rendering theme-dependent UI before hydration confirms the resolved theme.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-5 w-5" />;
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Light mode" : "Dark mode";
  const icon = isDark ? <Sun size={variant === "desktop" ? 20 : 24} /> : <Moon size={variant === "desktop" ? 20 : 24} />;

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex items-center p-3 w-full rounded-xl transition-all duration-200 text-zinc-600 hover:text-primary hover:bg-primary/5"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="mr-3">
          {icon}
        </motion.div>
        <span className="font-medium">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer text-zinc-400 hover:text-white hover:bg-gradient-to-r hover:from-primary/20 hover:to-zinc-800 rounded-lg transition-all duration-200",
        isCollapsed && "justify-center"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className={cn("flex items-center flex-1", isCollapsed && "justify-center")}>
        <motion.div whileHover={{ scale: 1.2, rotate: 15 }} transition={{ duration: 0.3 }}>
          {icon}
        </motion.div>
        <span className={cn("ml-3 whitespace-nowrap", isCollapsed && "hidden")}>{label}</span>
      </div>
    </button>
  );
}
