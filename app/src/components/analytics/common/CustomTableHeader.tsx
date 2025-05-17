import { TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortBy, SortOrder } from "@/consts";
import { TrendFrequency } from "@/types/entityTypes";
import { format } from "date-fns";

type CustomTableHeaderProps = {
  sortField?: SortBy;
  sortOrder?: SortOrder;
  onSort?: (field: SortBy) => void;
  hoverMessage?: string;
  customNameHeader?: string;
  customSecondHeader?: string;
  showTrend?: boolean;
  trendFrequency?: TrendFrequency;
  allowCountSort?: boolean;
  extraHeaderName?: string;
};

export default function CustomTableHeader({
  sortField,
  sortOrder,
  onSort,
  hoverMessage,
  customNameHeader,
  customSecondHeader,
  showTrend = false,
  trendFrequency = TrendFrequency.MAX,
  allowCountSort = true,
  extraHeaderName,
}: CustomTableHeaderProps) {
  const renderSortIcon = (field: SortBy) => {
    if (sortField !== field) {
      return;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 inline-block" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 inline-block" />
    );
  };

  return (
    <TableHeader className="bg-gradient-to-r from-[#A13A23]/10 to-gray-100/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200/80 hover:bg-[#A13A23]/15 transition-all duration-300">
      <TableRow>
        <TableHead className="w-[5%] pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          #
        </TableHead>
        <TableHead
          className={`w-[${
            extraHeaderName ? "62" : "80"
          }%] pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] tracking-wider`}
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="h-8 px-1 font-semibold hover:bg-[#A13A23]/10 hover:text-[#A13A23] flex items-center gap-1 rounded-md transition-all duration-200"
              onClick={() => onSort?.(SortBy.NAME)}
            >
              {customNameHeader || "Name"}
              {renderSortIcon(SortBy.NAME)}
            </Button>
          </div>
        </TableHead>
        {extraHeaderName && (
          <TableHead className="w-[12%] py-1 text-left text-xs font-semibold text-[#8C2D19] tracking-wider">
            <div className="flex items-center">
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
        <TableHead className="w-[20%] pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] tracking-wider">
          <div className="flex flex-col items-start" title={hoverMessage}>
            <Button
              variant="ghost"
              className={`h-8 px-1 font-semibold flex items-center gap-1 rounded-md ${
                allowCountSort
                  ? "hover:text-[#A13A23] hover:bg-[#A13A23]/10 transition-all duration-200 cursor-pointer"
                  : "hover:bg-transparent hover:text-[#8C2D19] cursor-default"
              }`}
              onClick={() => allowCountSort && onSort?.(SortBy.COUNT)}
            >
              {customSecondHeader || "Alumni"}
              {allowCountSort && renderSortIcon(SortBy.COUNT)}
            </Button>
            {showTrend && (
              <span className="text-[10px] text-gray-400 mt-[-2px] inline-center">
                {getDateRange(trendFrequency)}
              </span>
            )}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

const getDateRange = (trendFrequency: TrendFrequency) => {
  switch (trendFrequency) {
    case TrendFrequency.MAX:
      return `${new Date().getFullYear() - 30} - ${new Date().getFullYear()}`;
    case TrendFrequency.Y20:
      return `${new Date().getFullYear() - 20} - ${new Date().getFullYear()}`;
    case TrendFrequency.Y10:
      return `${new Date().getFullYear() - 10} - ${new Date().getFullYear()}`;
    case TrendFrequency.Y5:
      return `${new Date().getFullYear() - 5} - ${new Date().getFullYear()}`;
    case TrendFrequency.Y3:
      return `${new Date().getFullYear() - 3} - ${new Date().getFullYear()}`;
    case TrendFrequency.YTD: {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const startStr = format(start, "MMM");
      const endStr = format(now, "MMM.yy");
      return `${startStr} - ${endStr}`;
    }
  }
};
