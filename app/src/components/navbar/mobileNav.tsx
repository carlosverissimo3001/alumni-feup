import { cn } from "@/lib/utils";
import {
  GlobeIcon,
  UserIcon,
  ChartSpline,
  MoreHorizontalIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { motion } from "framer-motion";

const MobileNav = () => {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  const mainRoutes = [
    {
      label: "World",
      icon: <GlobeIcon size={24} />,
      href: "/",
    },
    {
      label: "Analytics",
      icon: <ChartSpline size={24} />,
      href: "/analytics",
    },
    {
      label: "Profile",
      icon: <UserIcon size={24} />,
      href: user ? `/profile/${user.id}` : "/",
      disabled: !isAuthenticated,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="flex items-center justify-around p-2">
        {mainRoutes
          .filter((route) => !route.disabled)
          .map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                pathname === route.href
                  ? "text-[#8C2D19]"
                  : "text-zinc-400 hover:text-[#8C2D19]"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {route.icon}
              </motion.div>
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          ))}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex flex-col items-center p-2 text-zinc-400 hover:text-[#8C2D19] rounded-lg transition-colors">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreHorizontalIcon size={24} />
              </motion.div>
              <span className="text-xs mt-1">More</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle className="text-lg font-semibold px-4 pt-4">
              More Options
            </DrawerTitle>
            <div className="p-4 pt-2">
              <div className="space-y-2">
                <Link
                  href="/about"
                  className="flex items-center p-3 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <span>About</span>
                </Link>
                <Link
                  href="/feedback"
                  className="flex items-center p-3 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <span>Feedback</span>
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/reviews"
                    className="flex items-center p-3 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <span>Reviews</span>
                  </Link>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default MobileNav;
