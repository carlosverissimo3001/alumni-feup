import { cn } from "@/lib/utils";
import {
  GlobeIcon,
  UserIcon,
  ChartSpline,
  InfoIcon,
  FormInputIcon,
  MessageCircleCode,
  Menu,
  UserPlus,
  LogOut,
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
  const { isAuthenticated, user, logout } = useAuth();
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
    {
      label: "Join Us",
      icon: <UserPlus size={24} />,
      href: "/join-us",
      disabled: isAuthenticated,
    },
  ];

  const moreRoutes = [
    {
      label: "About",
      icon: <InfoIcon size={24} />,
      href: "/about",
    },
    {
      label: "Feedback",
      icon: <FormInputIcon size={24} />,
      href: "/feedback",
    },
    {
      label: "Reviews",
      icon: <MessageCircleCode size={24} />,
      href: "/reviews",
      disabled: !isAuthenticated,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/90 backdrop-blur-md shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around py-2 px-3 max-w-full">
        {mainRoutes
          .filter((route) => !route.disabled)
          .map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.label}
                href={route.href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[#8C2D19]/10 text-[#8C2D19] font-medium"
                    : "text-zinc-400 hover:text-[#8C2D19]"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="mb-0.5"
                >
                  {route.icon}
                </motion.div>
                <span className="text-[12px]">{route.label}</span>
              </Link>
            );
          })}

        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex flex-col items-center justify-center px-3 py-2 text-zinc-400 hover:text-[#8C2D19] rounded-xl transition-all duration-200">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="mb-0.5"
              >
                <Menu size={24} />
              </motion.div>
              <span className="text-[12px]">More</span>
            </button>
          </DrawerTrigger>

          <DrawerContent className="h-[45vh]">
            <div className="bg-white h-full w-full max-w-md mx-auto rounded-t-2xl px-4 pt-3 pb-4 flex flex-col">
              <DrawerTitle className="text-base font-semibold text-zinc-900 mb-3">
                More Options
              </DrawerTitle>
              <div className="flex-1 space-y-1 overflow-y-auto">
                {moreRoutes
                  .filter((route) => !route.disabled)
                  .map((route) => (
                    <Link
                      key={route.label}
                      href={route.href}
                      className={cn(
                        "flex items-center p-3 rounded-xl transition-all duration-200",
                        pathname === route.href
                          ? "bg-[#8C2D19]/10 text-[#8C2D19]"
                          : "text-zinc-600 hover:text-[#8C2D19] hover:bg-[#8C2D19]/5"
                      )}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="mr-3"
                      >
                        {route.icon}
                      </motion.div>
                      <span className="font-medium">{route.label}</span>
                    </Link>
                  ))}

                {isAuthenticated && (
                  <>
                    <div className="h-px bg-zinc-200 my-2" />
                    <button
                      onClick={logout}
                      className="flex items-center p-3 w-full rounded-xl transition-all duration-200 text-red-500/80 hover:text-red-500 hover:bg-red-100"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="mr-3"
                      >
                        <LogOut size={24} />
                      </motion.div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
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
