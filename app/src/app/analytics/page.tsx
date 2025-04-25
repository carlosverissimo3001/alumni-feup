"use client";

import {
  BarChart3,
  Users,
  Globe2,
  ChartSpline,
  Factory,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import CompanyDashboard from "@/components/analytics/CompanyDashboard";
import IndustryDashboard from "@/components/analytics/IndustryDashboard";
import { useState, useCallback } from "react";
import CountriesDashboard from "@/components/analytics/CountryDashboard";
import OverallStats from "@/components/analytics/OverallStats";
import GlobalFilters, {
  FilterState,
} from "@/components/analytics/common/GlobalFilters";

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
};

export default function Analytics() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalCompanies: 0,
    totalIndustries: 0,
    totalCountries: 0,
  });

  const [filters, setFilters] = useState<FilterState>(initialFilters);

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
          filters={filters}
        />
        <CountriesDashboard
          onDataUpdate={handleCountriesDataUpdate}
          filters={filters}
        />
        <IndustryDashboard
          onDataUpdate={handleIndustryDataUpdate}
          filters={filters}
        />
      </div>
    </div>
  );
}
