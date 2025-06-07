"use client";

import { useParams, useRouter } from 'next/navigation';
import { useCompanyInsights } from '@/hooks/insights/useCompanyInsights';
import CompanyNotFound from '@/components/company/CompanyNotFound';
import CompanyOverview from '@/components/company/CompanyOverview';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { data, isLoading } = useCompanyInsights(companyId);

  if (!companyId) {
    router.push('/analytics');
    return null;
  }

  if (isLoading) {
    return <CompanyPageSkeleton />;
  }

  if (!data) {
    return <CompanyNotFound />;
  }


  return (
    <div className="p-4 space-y-8 bg-gray-50 min-h-screen">
      {/* Company Overview */}
      <CompanyOverview data={data} />
    </div>
  );
}

function CompanyPageSkeleton() {
  // TODO: update to match new layout
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Company Overview Skeleton */}
      <div className="w-3/4 rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-row items-center gap-4 p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="w-full">
        <Skeleton className="h-10 w-72 mb-6" />
        <Skeleton className="h-80 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
