import StatsCard, { StatsCardProps } from "./StatsCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { ChevronDown, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

type OverallStatsProps = {
  stats: StatsCardProps[];
};

export default function OverallStats({ stats }: OverallStatsProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="rounded-lg border border-[#8C2D19]/20">
      <Button
        variant="ghost"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#8C2D19]/5 transition-colors rounded-t-lg group"
      >
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-[#8C2D19] group-hover:animate-pulse" />
          <span className="text-base font-semibold text-[#8C2D19]">
            Overall Statistics
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-[#8C2D19] transition-transform duration-300",
            isCollapsed ? "" : "rotate-180"
          )}
        />
      </Button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <motion.div layout className="px-2 pb-2">
              <div className="overflow-x-auto sm:overflow-visible">
                <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[600px] sm:min-w-0">
                  {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
