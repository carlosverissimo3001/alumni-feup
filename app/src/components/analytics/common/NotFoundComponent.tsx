import { SearchX } from "lucide-react";

import { TableCell } from "@/components/ui/table";

import { TableRow } from "@/components/ui/table"

type NotFoundComponentProps = {
  message: string;
  description: string;
  colSpan?: number;
}

export const NotFoundComponent = ({ message, description, colSpan = 3 }: NotFoundComponentProps) => (
  <TableRow>
    <TableCell
  colSpan={colSpan}
  className="text-center py-10"
>
  <div className="flex flex-col items-center justify-center gap-3">
        <SearchX className="h-6 w-6 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-600">
          {message}
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          {description}
        </p>
      </div>
    </TableCell>
  </TableRow>
);
