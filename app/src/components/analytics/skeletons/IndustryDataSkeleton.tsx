import { TableCell, TableRow, TableBody } from "@/components/ui/table";

type IndustryDataSkeletonProps = {
  rows?: number;
};

export const IndustryDataSkeleton = ({ rows = 5 }: IndustryDataSkeletonProps) => {
  return (
    <TableBody className="bg-white divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow
          key={index}
          className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
        >
          <TableCell className="w-1/12 py-1 pl-3 text-sm align-middle">
            <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell className="w-5/12 py-1 pl-3 text-sm align-middle">
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell className="w-3/12 py-1 pl-3 text-sm align-middle">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell className="w-3/12 py-1 pl-3 text-sm align-middle">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};