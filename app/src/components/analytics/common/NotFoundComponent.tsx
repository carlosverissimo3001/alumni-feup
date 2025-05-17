import { SearchX } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

type NotFoundComponentProps = {
  message: string;
  description: string;
  colSpan?: number;
  onAdjustFilters?: () => void;
};

export const NotFoundComponent = ({
  message,
  description,
  colSpan = 3,
}: NotFoundComponentProps) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="text-center h-[220px]">
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg  animate-fade-in">
        <SearchX className="h-8 w-8 text-gray-400 animate-pulse" />
        <h3 className="text-xl font-semibold text-gray-800">{message}</h3>
        <p className="text-sm text-gray-600 max-w-md">{description}</p>
      </div>
    </TableCell>
  </TableRow>
);
