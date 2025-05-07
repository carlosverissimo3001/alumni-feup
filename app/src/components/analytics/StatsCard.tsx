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

export type StatsCardProps = {
  icon: React.ReactNode;
  name: string;
  values: number[];
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

  useEffect(() => {
    // Calculate percentage
    const calculatedPercentage =
      values[1] > 0 ? Math.round((values[0] / values[1]) * 100) : 0;

    // Animate loading effect
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setPercentage(calculatedPercentage);
    }, 300);

    return () => clearTimeout(timer);
  }, [values]);

  // Determine badge variant based on percentage
  const getBadgeVariant = () => {
    if (percentage < 30) return "destructive";
    if (percentage < 70) return "secondary";
    return "default";
  };

  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="p-3 bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15 hover:shadow-lg hover:shadow-[#8C2D19]/10 transition-all duration-300 rounded-xl border border-[#8C2D19]/20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-[#8C2D19]/20 hover:bg-[#8C2D19]/30 transition-colors shadow-sm">
            {icon}
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-[#000000]">{name}</p>
                {infoMessage && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-5 w-5 text-[#8C2D19]" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="start"
                        className="max-w-xs"
                      >
                        <p className="text-sm">{infoMessage}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant={getBadgeVariant()} className="font-medium">
                  {percentage}%
                </Badge>
              </motion.div>
            </div>
            <motion.h3
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-extrabold text-[#8C2D19] tracking-tight"
            >
              {values[0]}
            </motion.h3>
            <p className="text-xs font-normal text-[#5D5D5D]">
              (out of a total of{" "}
              <span className="text-xs font-semibold text-[#5D5D5D] italic">
                {values[1]}
              </span>
              )
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
