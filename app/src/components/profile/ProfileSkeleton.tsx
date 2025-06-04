import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

type ProfileSkeletonProps = {
  id: string;
};

export default function ProfileSkeleton({ id }: ProfileSkeletonProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
        <div className="max-w-screen-xl mx-auto py-12 px-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>

          {/* Role Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch mb-8">
            {/* Role Card */}
            <div className="p-3 rounded-xl ">
              <Skeleton className="h-[240px] w-full" />
            </div>

            {/* Company Card */}
            <div className="p-3 rounded-xl">
              <Skeleton className="h-[240px] w-full" />
            </div>

            {/* Location Card */}
            <div className="p-3 rounded-xl">
              <Skeleton className="h-[240px] w-full" />
            </div>
          </div>

          {/* Career Timeline */}
          <div className="mb-8">
            <div className="flex items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
              <div className="flex-1" />
              <Skeleton className="h-5 w-5" />
            </div>
          </div>

          {/* Profile Actions - Only show if user is viewing their own profile */}
          {user?.id === id && (
            <div>
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
}
