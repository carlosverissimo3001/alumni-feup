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
  isTrendViewDisabled?: boolean;
};

export const ViewToggle = ({
  view,
  setView,
  isTrendViewDisabled,
}: ViewToggleProps) => {
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
                className="px-1 py-0.5 sm:px-1.5 sm:py-1"
              >
                <TableIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {view === ViewType.TABLE
              ? "Table view"
              : "Change to table view"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem
                value={ViewType.CHART}
                aria-label="Chart View"
                className="px-1 py-0.5 sm:px-1.5 sm:py-1"
              >
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {view === ViewType.CHART
              ? "Chart view"
              : "Change to chart view"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem
                disabled={isTrendViewDisabled}
                value={ViewType.TREND}
                aria-label="Trend View"
                className={`px-1 py-0.5 sm:px-1.5 sm:py-1 ${
                  isTrendViewDisabled ? "disabled:opacity-10" : ""
                }`}
              >
                <LineChart className="h-3 w-3 sm:h-4 sm:w-4" />
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isTrendViewDisabled
              ? "Trends are not available for this domain"
              : view === ViewType.TREND
                ? "Trend view"
                : "Change to trend view"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </ToggleGroup>
  );
}
