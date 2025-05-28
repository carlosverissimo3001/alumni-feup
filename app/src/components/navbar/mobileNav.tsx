import { cn } from "@/lib/utils";
import {
  GlobeIcon,
  UserIcon,
  ChartSpline,
  InfoIcon,
  FormInputIcon,
  MessageCircleCode,
  XIcon,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerClose,
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t w-full overflow-x-hidden z-[90]">
      <div className="flex items-center justify-around p-2 max-w-full">
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
                <Menu size={24} />
              </motion.div>
              <span className="text-xs mt-1">More</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="h-[40vh]">
            <div className="bg-white h-full w-[90%] max-w-md mx-auto rounded-t-lg">
            <div className="flex justify-between items-center px-4 pt-4 border-b pb-4">
                <DrawerTitle className="text-lg font-semibold text-zinc-900">
                  More Options
                </DrawerTitle>
              </div>
              <div className="p-2">
                <div className="space-y-2">
                  {moreRoutes
                    .filter((route) => !route.disabled)
                    .map((route) => (
                      <Link
                        key={route.label}
                        href={route.href}
                        className={cn(
                          "flex items-center p-3 rounded-lg transition-all duration-200",
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
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default MobileNav;
