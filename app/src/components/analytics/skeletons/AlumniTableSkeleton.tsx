import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type AlumniTableSkeletonProps = {
  className?: string;
};

export default function AlumniTableSkeleton({ className }: AlumniTableSkeletonProps) {
  return (
    <TableBody className={className}>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow
          key={index}
          className={`${
            index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
          }`}
        >
          <TableCell className="w-[3%] py-2.5 pl-4">
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell className="w-[82%] py-2.5 pl-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </TableCell>
          <TableCell className="w-[12%] py-2.5">
            <div className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
