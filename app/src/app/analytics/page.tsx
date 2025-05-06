"use client";

import {
  BarChart3,
  Users,
  Globe2,
  ChartSpline,
  Factory,
} from "lucide-react";
import CompanyDashboard from "@/components/analytics/CompanyDashboard";
import IndustryDashboard from "@/components/analytics/IndustryDashboard";
import { useState, useCallback, useMemo } from "react";
import CountriesDashboard from "@/components/analytics/CountryDashboard";
import OverallStats from "@/components/analytics/OverallStats";
import GlobalFilters, {
  FilterState,
} from "@/components/analytics/common/GlobalFilters";
import { handleDateRange } from "@/utils/date";
import RoleDashboard from "@/components/analytics/RoleDashboard";

export const initialFilters: FilterState = {
  dateRange: undefined,
  courseIds: undefined,
  graduationYears: undefined,
  companyIds: undefined,
  industryIds: undefined,
  countries: undefined,
  cityIds: undefined,
  currentRolesOnly: false,
  onlyInternational: false,
  excludeResearchAndHighEducation: false,
  search: undefined,
  companySize: [],
  escoCodes: [],
};

export default function Analytics() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalCompanies: 0,
    totalIndustries: 0,
    totalCountries: 0,
  });

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  const processedDateRange = useMemo(() => {
    if (filters.dateRange) {
      return handleDateRange(filters.dateRange);
    }
    return {};
  }, [filters.dateRange]);
  
  const combinedFilters = useMemo(() => {
    return {
      ...filters,
      ...processedDateRange,
      ...(filters.companySize && filters.companySize.length > 0 && { companySize: filters.companySize }),
    };
  }, [filters, processedDateRange]);

  const handleCompanyDataUpdate = useCallback(
    (alumniCount: number, companyCount: number) => {
      setStats((prev) => ({
        ...prev,
        totalAlumni: alumniCount,
        totalCompanies: companyCount,
      }));
    },
    []
  );

  const handleIndustryDataUpdate = useCallback((industryCount: number) => {
    setStats((prev) => ({ ...prev, totalIndustries: industryCount }));
  }, []);

  const handleCountriesDataUpdate = useCallback((countryCount: number) => {
    setStats((prev) => ({ ...prev, totalCountries: countryCount }));
  }, []);

  const handleAddCompanyToFilters = useCallback(
    (companyId: string) => {
      setFilters((prev) => {
        const currentCompanyIds = prev.companyIds || [];
        if (!currentCompanyIds.includes(companyId)) {
          return {
            ...prev,
            companyIds: [...currentCompanyIds, companyId],
          };
        }
        else {
          return {
            ...prev,
            companyIds: currentCompanyIds.filter((id) => id !== companyId),
          };
        }
      });
    },
    []
  );

  const handleAddCountryToFilters = useCallback(
    (countryId: string) => {
      setFilters((prev) => {
        const currentCountries = prev.countries || [];
        if (!currentCountries.includes(countryId)) {
          return {
            ...prev,
            countries: [...currentCountries, countryId],
          };
        }
        else {
          return {
            ...prev,
            countries: currentCountries.filter((id) => id !== countryId),
          };
        } 
      });
    },
    []
  );

  const handleAddIndustryToFilters = useCallback(
    (industryId: string) => {
      setFilters((prev) => {
        const currentIndustryIds = prev.industryIds || [];
        if (!currentIndustryIds.includes(industryId)) {
          return {
            ...prev,
            industryIds: [...currentIndustryIds, industryId],
          };
        }
        else {
          return {
            ...prev,
            industryIds: currentIndustryIds.filter((id) => id !== industryId),
          };
        }
      });
    },
    []
  );

  const handleAddRoleToFilters = useCallback(
    (escoCode: string) => {
      setFilters((prev) => {
        const currentEscoCodes = prev.escoCodes || [];
        if (!currentEscoCodes.includes(escoCode)) {
          return {
            ...prev,
            escoCodes: [...currentEscoCodes, escoCode],
          };
        }
        else {
          return {
            ...prev,
            escoCodes: currentEscoCodes.filter((id) => id !== escoCode),
          };
        }
      });
    },
    []
  );

  const statsConfig = [
    {
      name: "FEUP EI Alumni",
      value: stats.totalAlumni,
      icon: <Users className="h-4 w-4 text-[#8C2D19]" />,
    },
    {
      name: "Companies",
      value: stats.totalCompanies,
      icon: <BarChart3 className="h-4 w-4 text-[#8C2D19]" />,
    },
    {
      name: "Countries",
      value: stats.totalCountries,
      icon: <Globe2 className="h-4 w-4 text-[#8C2D19]" />,
    },
    {
      name: "Industries",
      value: stats.totalIndustries,
      icon: <Factory className="h-4 w-4 text-[#8C2D19]" />,
    },
  ];

  return (
    <div className="p-6 space-y-3 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-4">
        <ChartSpline className="h-8 w-8 text-[#8C2D19]" />
        <div>
          <h1 className="text-3xl font-extrabold text-[#8C2D19]">
            Alumni Analytics
          </h1>
        </div>
      </div>

      <OverallStats stats={statsConfig} />

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <GlobalFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CompanyDashboard
          onDataUpdate={handleCompanyDataUpdate}
          filters={combinedFilters}
          onAddToFilters={handleAddCompanyToFilters}
        />
        <CountriesDashboard
          onDataUpdate={handleCountriesDataUpdate}
          filters={combinedFilters}
          onAddToFilters={handleAddCountryToFilters}
        />
        <RoleDashboard
          filters={combinedFilters}
          onAddToFilters={handleAddRoleToFilters}
        />
        <IndustryDashboard
          onDataUpdate={handleIndustryDataUpdate}
          filters={combinedFilters}
          onAddToFilters={handleAddIndustryToFilters}
        />
      </div>
    </div>
  );
}
