import { TableCell, TableRow, TableBody } from "@/components/ui/table";

type CompanyDataSkeletonProps = {
  rows?: number;
};

export const CompanyDataSkeleton = ({ rows = 5 }: CompanyDataSkeletonProps) => {
  return (
    <TableBody className="bg-white divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow
          key={index}
          className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
        >
          <TableCell className="w-1/12 py-1 pl-3">
            <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell className="w-8/12 py-1 pl-3 flex items-center gap-1">
            <div className="min-w-[24px] w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell className="w-3/12 px-3 py-1">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};