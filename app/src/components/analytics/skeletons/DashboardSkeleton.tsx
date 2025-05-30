import { TableCell, TableRow, TableBody } from "@/components/ui/table";

type DashboardSkeletonProps = {
  rows?: number;
  hasExtraColumn?: boolean;
};

export const DashboardSkeleton = ({
  rows = 5,
  hasExtraColumn = false,
}: DashboardSkeletonProps) => {
  return (
    <TableBody className="bg-white divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow
          key={index}
          className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
        >
          <TableCell className="w-[5%] py-3 pl-3 text-sm align-middle">
            <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell
            className={`w-[${
              hasExtraColumn ? "45" : "60"
            }%] py-1.5 pl-3 text-sm align-middle`}
          >
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          {hasExtraColumn && (
            <TableCell className="w-[10%] px-3 py-1.5 text-sm align-middle">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            </TableCell>
          )}
          <TableCell className="w-[20%] px-3 py-1.5 text-sm align-middle">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};
