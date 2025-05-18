import { TableCell } from "@/components/ui/table";

type TableNumberCellProps = {
  rowNumber: number;
};

export default function TableNumberCell({ rowNumber }: TableNumberCellProps) {
  return (
    <TableCell className="w-[3%] py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
      {rowNumber}
    </TableCell>
  );
}
