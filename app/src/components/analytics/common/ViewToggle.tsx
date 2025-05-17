import { ViewType } from "@/consts";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LineChart, PieChart, TableIcon } from "lucide-react";

type ViewToggleProps = {
  view: ViewType;
  setView: (view: ViewType) => void;
  disabled?: boolean;
};

export default function ViewToggle({
  view,
  setView,
  disabled,
}: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value: string) => value && setView(value as ViewType)}
      className="flex"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem
                value={ViewType.TABLE}
                aria-label="Table View"
                className="px-1.5 py-1"
              >
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>View table</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ToggleGroupItem
        value={ViewType.CHART}
        aria-label="Chart View"
        className="px-1.5 py-1 disabled:opacity-10"
        title="Chart View"
      >
        <PieChart className="h-4 w-4" />
      </ToggleGroupItem>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem
                disabled={disabled}
                value={ViewType.TREND}
                aria-label="Trend View"
                className={`px-1.5 py-1 ${
                  disabled ? "disabled:opacity-10" : ""
                }`}
              >
                <LineChart className="h-4 w-4" />
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {disabled
              ? "Trends are not available for this view"
              : "View trend over time"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </ToggleGroup>
  );
}
