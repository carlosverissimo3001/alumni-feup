import { TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortBy, SortOrder } from "@/consts";


type CustomTableHeaderProps = {
  includeCompanies?: boolean;
  sortField?: SortBy;
  sortOrder?: SortOrder;
  onSort?: (field: SortBy) => void;
  alumniHoverMessage?: string;
  companiesHoverMessage?: string;
  useRoleTitle?: boolean;
};

export default function CustomTableHeader({
  includeCompanies = true,
  sortField,
  sortOrder,
  onSort,
  alumniHoverMessage,
  companiesHoverMessage,
  useRoleTitle = false,
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
        <TableHead className="w-[8%] pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          #
        </TableHead>
        <TableHead className={`${includeCompanies ? 'w-[52%]' : 'w-[72%]'} pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider`}>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="h-8 p-0 font-semibold hover:bg-transparent hover:text-[#A13A23] flex items-center gap-0.5"
              onClick={() => onSort?.(SortBy.NAME)}
            >
              Name
              {renderSortIcon(SortBy.NAME)}
            </Button>
          </div>
        </TableHead>
        {includeCompanies && (
          <TableHead className="w-[20%] pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
            <div className="flex items-center" title={companiesHoverMessage}>
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent hover:text-[#A13A23] flex items-center gap-0.5"
                onClick={() => onSort?.(SortBy.COMPANY_COUNT)}
              >
                Companies
                {renderSortIcon(SortBy.COMPANY_COUNT)}
              </Button>
            </div>
          </TableHead>
        )}
        <TableHead className="w-[20%] pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          <div className="flex items-center" title={alumniHoverMessage}>
            <Button
              variant="ghost"
              className="h-8 p-0 font-semibold hover:bg-transparent hover:text-[#A13A23] flex items-center gap-0.5"
              onClick={() => onSort?.(SortBy.ALUMNI_COUNT)}
            >
              {useRoleTitle ? "Roles" : "Alumni"}
              {renderSortIcon(SortBy.ALUMNI_COUNT)}
            </Button>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
