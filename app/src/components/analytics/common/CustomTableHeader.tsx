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
  customCountHeader?: string;
  showTrend?: boolean;
  trendFrequency?: TrendFrequency;
};

export default function CustomTableHeader({
  sortField,
  sortOrder,
  onSort,
  hoverMessage,
  customNameHeader,
  customCountHeader,
  showTrend = false,
  trendFrequency = TrendFrequency.MAX,
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
    <TableHeader className="bg-gray-100 sticky top-0 z-20 shadow-sm">
      <TableRow>
        <TableHead className="w-[8%] pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          #
        </TableHead>
        <TableHead className="w-[72%] pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="h-8 p-0 font-semibold hover:bg-transparent hover:text-[#A13A23] flex items-center gap-0.5"
              onClick={() => onSort?.(SortBy.NAME)}
            >
              {customNameHeader || "Name"}
              {renderSortIcon(SortBy.NAME)}
            </Button>
          </div>
        </TableHead>
        <TableHead className="w-[20%] pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          <div className="flex flex-col items-start" title={hoverMessage}>
            <Button
              variant="ghost"
              className="h-8 p-0 font-semibold hover:bg-transparent hover:text-[#A13A23] flex items-center gap-0.5"
              onClick={() => onSort?.(SortBy.COUNT)}
            >
              {customCountHeader || "Alumni"}
              {renderSortIcon(SortBy.COUNT)}
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
      const startStr = format(start, 'MMM');
      const endStr = format(now, 'MMM.yy');
      return `${startStr} - ${endStr}`;
    }
  }
};
