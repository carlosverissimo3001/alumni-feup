"use client";

import { useParams, useRouter } from 'next/navigation';
import { useCompanyInsights } from '@/hooks/insights/useCompanyInsights';
import CompanyNotFound from '@/components/company/CompanyNotFound';
import CompanyOverview from '@/components/company/CompanyOverview';
import CompanyChart from '@/components/company/CompanyChart';
import GeographicDistribution from '@/components/company/GeographicDistribution';
import RolesDistribution from '@/components/company/RolesDistribution';
import SimilarCompanies from '@/components/company/SimilarCompanies';
import AlumniList from '@/components/company/AlumniList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Define types to match component expectations
interface GeoData {
  id: string;
  name?: string;
  city?: string;
  country?: string;
  count?: number;
}

interface Role {
  id: string;
  name: string;
  count?: number;
}

// Define basic DTO interfaces to match API response
interface BasicGeoDto {
  name?: string;
  city?: string;
  country?: string;
}

interface BasicRoleDto {
  id: string;
  name: string;
  count?: number;
}

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

  // Convert API data to component-expected types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoCountries: GeoData[] = data.countries?.map((country: BasicGeoDto) => ({
    id: String(Math.random()), // Generate random ID since BasicGeoDto doesn't have one
    name: country.name || country.country,
    country: country.country
  })) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoCities: GeoData[] = data.cities?.map((city: BasicGeoDto) => ({
    id: String(Math.random()), // Generate random ID since BasicGeoDto doesn't have one
    name: city.name,
    city: city.city,
    country: city.country
  })) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companyRoles: Role[] = data.roles?.map((role: BasicRoleDto) => ({
    id: role.id,
    name: role.name,
    count: role.count
  })) || [];

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
      <div className="w-full rounded-xl border bg-card text-card-foreground shadow">
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
