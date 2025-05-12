import { TooltipContent } from "@/components/ui/tooltip";

import { TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown } from "lucide-react";

import { Tooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { EntityType, TrendFrequency } from "@/types/entityTypes";

type TrendTooltipProps = {
  entityType: EntityType;
  trendFrequency: TrendFrequency;
};

export const TrendTooltip = ({ entityType, trendFrequency }: TrendTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-5 w-5 text-[#8C2D19] ml-2" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" align="start">
          <div className="space-y-2">
            <p>
              <strong>Trend View:</strong> Shows the {getFrequencyChange(trendFrequency)} change in {entityType} 
              {' '} presence over the past {getTrendFrequencyLabel(trendFrequency)}
            </p>
            <p>
              <TrendingUp className="h-3.5 w-3.5 inline text-green-500 mr-1" />{" "}
              Indicates growing {getPluralForm(entityType)}
            </p>
            <p>
              <TrendingDown className="h-3.5 w-3.5 inline text-red-500 mr-1" />{" "}
              Indicates declining {getPluralForm(entityType)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const getPluralForm = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.COMPANY:
      return "companies ";
    default:
      return entityType;
  }
};

const getTrendFrequencyLabel = (trendFrequency: TrendFrequency) => {
  switch (trendFrequency) {
    case TrendFrequency.MAX:
      return "15 years";
    case TrendFrequency.Y10:
      return "10 years";
    case TrendFrequency.Y5:
      return "5 years";
    case TrendFrequency.Y3:
      return "3 years";
    case TrendFrequency.Y1:
      return "year";
  }
};

const getFrequencyChange = (trendFrequency: TrendFrequency) => {
  switch (trendFrequency) {
    case TrendFrequency.MAX:
    case TrendFrequency.Y10:
    case TrendFrequency.Y5:
    case TrendFrequency.Y3:
      return "quarterly";
    case TrendFrequency.Y1:
      return "monthly";
  }
};
