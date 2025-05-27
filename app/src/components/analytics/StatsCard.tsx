import { Info } from "lucide-react";
import { Card } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { useSpring, animated } from "@react-spring/web";

export type StatsCardProps = {
  icon: React.ReactNode;
  name: string;
  values: number | undefined; // Allow undefined for loading states
  infoMessage?: string;
};

export default function StatsCard({
  icon,
  name,
  values,
  infoMessage,
}: StatsCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [percentage, setPercentage] = useState(0);

  const { number } = useSpring({
    from: { number: 0 },
    number: isLoaded && values ? values : 0,
    delay: 150,
    config: { mass: 1, tension: 20, friction: 10, duration: 1000 },
  });

  useEffect(() => {
    if (values && values > 0) {
      const calculatedPercentage = Math.round((values / values) * 100);
      const timer = setTimeout(() => {
        setIsLoaded(true);
        setPercentage(calculatedPercentage);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [values]);

  const getBadgeVariant = () => {
    if (percentage < 30) return "destructive";
    if (percentage < 70) return "secondary";
    return "default";
  };

  if (!values || values === 0) {
    return (
      <Card className="p-2.5 h-full bg-gray-100 animate-pulse rounded-xl border border-[#8C2D19]/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-5 bg-gray-200 rounded w-10"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16 mt-1"></div>
            <div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="p-2.5 h-full bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15 hover:shadow-lg hover:shadow-[#8C2D19]/20 hover:border-[#8C2D19]/50 transition-all duration-300 rounded-xl border border-[#8C2D19]/20 hover:scale-105">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#8C2D19]/20 hover:bg-[#8C2D19]/30 transition-colors shadow-sm flex-shrink-0 group">
            <div className="group-hover:animate-pulse">{icon}</div>
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-[#000000] truncate max-w-[100px] sm:max-w-full">
                  {name}
                </p>
                {infoMessage && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-[#8C2D19]" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-xs"
                      >
                        <p className="text-sm">{infoMessage}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isLoaded ? 1 : 0,
                  scale: isLoaded ? 1 : 0.5,
                }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <Badge
                  variant={getBadgeVariant()}
                  className="text-xs font-medium px-2 animate-pop"
                >
                  {percentage}%
                </Badge>
              </motion.div>
            </div>
            <motion.h3 className="text-xl font-extrabold text-[#8C2D19] tracking-tight">
              <animated.span>{number.to((n) => Math.floor(n))}</animated.span>
            </motion.h3>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
