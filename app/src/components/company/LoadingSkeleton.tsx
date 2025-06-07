import { Card, CardHeader, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="relative pt-12">
      <Card className="w-[95%] md:w-4/5 lg:w-3/5 mx-auto bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/10 rounded-xl border border-[#8C2D19]/20">
        <CardHeader className="responsive-card-header flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-4 flex-1 w-full">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-wrap">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-36" />
                  <Skeleton className="h-8 w-36" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-6 w-52" />
            </div>
          </div>
        </CardHeader>
        <div className="px-6">
          <div className="border-t" />
        </div>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:auto-cols-fr md:grid-flow-col gap-x-4 sm:gap-x-6 gap-y-3 text-center justify-center">
            <div className="flex flex-col gap-1 sm:gap-2 items-center">
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex flex-col gap-1 sm:gap-2 items-center">
              <Skeleton className="h-5 w-28 mb-1" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex flex-col gap-1 sm:gap-2 items-center">
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
