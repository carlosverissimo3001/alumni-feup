import { TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortBy, SortOrder } from "@/consts";
import { TrendFrequency } from "@/types/entityTypes";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CustomTableHeaderProps = {
  sortField?: SortBy;
  sortOrder?: SortOrder;
  onSort?: (field: SortBy) => void;
  hoverMessage?: string;
  customNameHeader?: string;
  customAlumniHeader?: string;
  showTrend?: boolean;
  trendFrequency?: TrendFrequency;
  allowCountSort?: boolean;
  extraHeaderName?: string;
};

export const CustomTableHeader = ({
  sortField,
  sortOrder,
  onSort,
  hoverMessage,
  customNameHeader,
  customAlumniHeader,
  showTrend = false,
  trendFrequency = TrendFrequency.MAX,
  allowCountSort = true,
  extraHeaderName,
}: CustomTableHeaderProps) => {
  const renderSortIcon = (field: SortBy) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 inline-block" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 inline-block" />
    );
  };

  // Dynamically calculate column widths
  const numberColWidth = "w-[5%]";
  const nameColWidth = extraHeaderName
    ? "w-[45%]"
    : "w-[60%]";
  const extraHeaderWidth = "w-[10%]";
  const countColWidth = "w-[20%]";

  return (
    <TableHeader className="bg-gradient-to-r from-[#A13A23]/10 to-gray-100/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200/80 hover:bg-[#A13A23]/15 transition-all duration-300">
      <TableRow>
        {/* Number column */}
        <TableHead className={`${numberColWidth} pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider`}>
          #
        </TableHead>

        {/* Name column */}
        <TableHead className={`${nameColWidth} text-xs font-semibold text-[#8C2D19] tracking-wider`}>
          <div className="flex items-center min-w-0">
            <Button
              variant="ghost"
              className="h-8 px-1 font-semibold hover:bg-[#A13A23]/10 hover:text-[#A13A23] flex items-center gap-1 rounded-md transition-all duration-200 truncate"
              onClick={() => onSort?.(SortBy.NAME)}
            >
              <span className="truncate">{customNameHeader || "Name"}</span>
              {renderSortIcon(SortBy.NAME)}
            </Button>
          </div>
        </TableHead>

        {/* Optional extra header (e.g., Year) */}
        {extraHeaderName && (
          <TableHead className={`${extraHeaderWidth} py-1 text-left text-xs font-semibold text-[#8C2D19] tracking-wider`}>
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                className="h-8 px-1 font-semibold hover:bg-[#A13A23]/10 hover:text-[#A13A23] flex items-center gap-1 rounded-md transition-all duration-200"
                onClick={() => onSort?.(SortBy.YEAR)}
              >
                {extraHeaderName}
                {renderSortIcon(SortBy.YEAR)}
              </Button>
            </div>
          </TableHead>
        )}

        {/* Count / Alumni column */}
        <TableHead className={`${countColWidth} py-1 text-xs font-semibold text-[#8C2D19] tracking-wider`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center w-full">
                  <Button
                    variant="ghost"
                    className={`h-8 px-1 font-semibold flex items-center gap-1 rounded-md ${
                      allowCountSort
                        ? "hover:text-[#A13A23] hover:bg-[#A13A23]/10 transition-all duration-200 cursor-pointer"
                        : "hover:bg-transparent hover:text-[#8C2D19] cursor-default"
                    }`}
                    onClick={() => allowCountSort && onSort?.(SortBy.COUNT)}
                  >
                    {customAlumniHeader || "Alumni"}
                    {allowCountSort && renderSortIcon(SortBy.COUNT)}
                  </Button>
                  {showTrend && (
                    <span className="text-[10px] text-gray-400 flex justify-center w-full">
                      {getDateRange(trendFrequency)}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hoverMessage}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

const getDateRange = (trendFrequency: TrendFrequency) => {
  const currentYear = new Date().getFullYear();
  switch (trendFrequency) {
    case TrendFrequency.MAX:
      return `${currentYear - 30} - ${currentYear}`;
    case TrendFrequency.Y20:
      return `${currentYear - 20} - ${currentYear}`;
    case TrendFrequency.Y10:
      return `${currentYear - 10} - ${currentYear}`;
    case TrendFrequency.Y5:
      return `${currentYear - 5} - ${currentYear}`;
    case TrendFrequency.Y3:
      return `${currentYear - 3} - ${currentYear}`;
    case TrendFrequency.YTD: {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const startStr = format(start, "MMM");
      const endStr = format(now, "MMM.yy");
      return `${startStr} - ${endStr}`;
    }
  }
};
