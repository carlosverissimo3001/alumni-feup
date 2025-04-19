import { TableHead, TableRow, TableHeader } from "@/components/ui/table";

type CustomTableHeaderProps = {
  includeCompanies?: boolean;
};

export default function CustomTableHeader({
  includeCompanies = true,
}: CustomTableHeaderProps) {
  return (
    <TableHeader className="bg-gray-100 sticky top-0 z-20 shadow-sm">
      <TableRow>
        <TableHead className="w-1/12 pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          #
        </TableHead>
        <TableHead className="w-7/12 pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          Name
        </TableHead>
        {includeCompanies && (
          <TableHead className="w-2/12 pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
            Companies
          </TableHead>
        )}
        <TableHead className="w-2/12 pl-3 py-1.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
          Alumni
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
