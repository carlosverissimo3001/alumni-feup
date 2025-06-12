import { Info } from "lucide-react";
import { Card } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { motion } from "framer-motion";

export type StatsCardProps = {
  icon: React.ReactNode;
  name: string;
  values: number | undefined;
  infoMessage?: string;
};

export default function StatsCard({
  icon,
  name,
  values,
  infoMessage,
}: StatsCardProps) {
  if (!values || values === 0) {
    return (
      <Card className="p-2.5 h-full bg-white/50 rounded-xl border border-[#8C2D19]/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#8C2D19]/5 h-10 w-10 animate-pulse"></div>
          <div className="w-full space-y-2">
            <div className="h-4 bg-[#8C2D19]/5 rounded w-24 animate-pulse"></div>
            <div className="h-6 bg-[#8C2D19]/5 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      className="h-full"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className="p-2.5 h-full bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/15 hover:shadow-lg hover:shadow-[#8C2D19]/20 hover:border-[#8C2D19]/50 transition-all duration-300 rounded-xl border border-[#8C2D19]/20 cursor-pointer"
              role="article"
              aria-label={`${name}: ${values.toLocaleString("pt-PT")}`}
            >
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
                              align="start"
                              className="max-w-xs"
                            >
                              <p className="text-sm">{infoMessage}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#8C2D19] tracking-tight">
                    {values.toLocaleString("pt-PT")}
                  </h3>
                </div>
              </div>
            </Card>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}
