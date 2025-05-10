"use client";

import {
  BarChart3,
  Users,
  ChartSpline,
  Factory,
  Briefcase,
  MapPin,
  Flag,
} from "lucide-react";
import {
  CompanyDashboard,
  IndustryDashboard,
  GeoDashboard,
  RoleDashboard,
} from "@/components/analytics/dashboards";
import { useState, useCallback, useMemo } from "react";
import OverallStats from "@/components/analytics/OverallStats";
import GlobalFilters, {
  FilterState,
} from "@/components/analytics/common/GlobalFilters";
import { handleDateRange } from "@/utils/date";

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
  classificationLevel: 1,
  companySize: [],
  escoCodes: [],
};

export default function Analytics() {
  const [stats, setStats] = useState({
    alumniFilteredCount: 0,
    alumniCount: 0,
    companyFilteredCount: 0,
    companyCount: 0,
    industryCount: 0,
    industryFilteredCount: 0,
    countryCount: 0,
    countryFilteredCount: 0,
    cityCount: 0,
    cityFilteredCount: 0,
    roleCount: 0,
    roleFilteredCount: 0,
  });

  const [geoMode, setGeoMode] = useState<"country" | "city">("country");

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
      ...(filters.companySize &&
        filters.companySize.length > 0 && { companySize: filters.companySize }),
    };
  }, [filters, processedDateRange]);

  const handleCompanyDataUpdate = useCallback(
    (
      alumniCount: number,
      companyCount: number,
      alumniFilteredCount: number,
      companyFilteredCount: number
    ) => {
      setStats((prev) => ({
        ...prev,
        alumniCount,
        companyCount,
        alumniFilteredCount,
        companyFilteredCount,
      }));
    },
    []
  );

  const handleIndustryDataUpdate = useCallback(
    (industryCount: number, industryFilteredCount: number) => {
      setStats((prev) => ({
        ...prev,
        industryCount,
        industryFilteredCount,
      }));
    },
    []
  );

  const handleGeoDataUpdate = useCallback(
    (
      countryCount: number,
      countryFilteredCount: number,
      cityCount: number,
      cityFilteredCount: number
    ) => {
      setStats((prev) => ({
        ...prev,
        countryCount,
        countryFilteredCount,
        cityCount,
        cityFilteredCount,
      }));
    },
    []
  );

  const handleRoleDataUpdate = useCallback(
    (roleCount: number, roleFilteredCount: number) => {
      setStats((prev) => ({
        ...prev,
        roleCount,
        roleFilteredCount,
      }));
    },
    []
  );

  const handleAddCompanyToFilters = useCallback((companyId: string) => {
    setFilters((prev) => {
      const currentCompanyIds = prev.companyIds || [];
      if (!currentCompanyIds.includes(companyId)) {
        return {
          ...prev,
          companyIds: [...currentCompanyIds, companyId],
        };
      } else {
        return {
          ...prev,
          companyIds: currentCompanyIds.filter((id) => id !== companyId),
        };
      }
    });
  }, []);

  const handleGeoAddToFilters = useCallback(
    (geoId: string) => {
      if (geoMode === "country") {
        setFilters((prev) => {
          const currentCountries = prev.countries || [];
          if (!currentCountries.includes(geoId)) {
            const updatedCountries = [...currentCountries, geoId];
            
            // Drilling down to cities after adding a country filter
            if (updatedCountries.length === 1) {
              setTimeout(() => setGeoMode("city"), 0);
            }
            return {
              ...prev,
              countries: updatedCountries,
            };
          } else {
            return {
              ...prev,
              countries: currentCountries.filter((id) => id !== geoId),
            };
          }
        });
      } else {
        setFilters((prev) => {
          const currentCities = prev.cityIds || [];
          if (!currentCities.includes(geoId)) {
            return {
              ...prev,
              cityIds: [...currentCities, geoId],
            };
          } else {
            return {
              ...prev,
              cityIds: currentCities.filter((id) => id !== geoId),
            };
          }
        });
      }
    },
    [geoMode, setGeoMode]
  );

  const handleAddIndustryToFilters = useCallback((industryId: string) => {
    setFilters((prev) => {
      const currentIndustryIds = prev.industryIds || [];
      if (!currentIndustryIds.includes(industryId)) {
        return {
          ...prev,
          industryIds: [...currentIndustryIds, industryId],
        };
      } else {
        return {
          ...prev,
          industryIds: currentIndustryIds.filter((id) => id !== industryId),
        };
      }
    });
  }, []);

  const handleAddRoleToFilters = useCallback((escoCode: string) => {
    setFilters((prev) => {
      const currentEscoCodes = prev.escoCodes || [];
      if (!currentEscoCodes.includes(escoCode)) {
        return {
          ...prev,
          escoCodes: [...currentEscoCodes, escoCode],
        };
      } else {
        return {
          ...prev,
          escoCodes: currentEscoCodes.filter((id) => id !== escoCode),
        };
      }
    });
  }, []);

  const handleLevelChange = useCallback((level: number) => {
    setFilters((prev) => ({ ...prev, classificationLevel: level }));
  }, []);

  const statsConfig = [
    {
      name: "FEUP EI Alumni",
      values: [stats.alumniFilteredCount, stats.alumniCount],
      icon: <Users className="h-4 w-4 text-[#8C2D19]" />,
      infoMessage:
        "The number of alumni who have graduated from the tracked courses",
    },
    {
      name: "Roles",
      values: [stats.roleFilteredCount, stats.roleCount],
      icon: <Briefcase className="h-4 w-4 text-[#8C2D19]" />,
      infoMessage: "The total number of individual roles that alumni had",
    },
    {
      name: "Companies",
      values: [stats.companyFilteredCount, stats.companyCount],
      icon: <BarChart3 className="h-4 w-4 text-[#8C2D19]" />,
    },
    {
      name: "Countries",
      values: [stats.countryFilteredCount, stats.countryCount],
      icon: <Flag className="h-4 w-4 text-[#8C2D19]" />,
    },
    {
      name: "Cities",
      values: [stats.cityFilteredCount, stats.cityCount],
      icon: <MapPin className="h-4 w-4 text-[#8C2D19]" />,
    },
    {
      name: "Industries",
      values: [stats.industryFilteredCount, stats.industryCount],
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

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
         <CompanyDashboard
          onDataUpdate={handleCompanyDataUpdate}
          filters={combinedFilters}
          onAddToFilters={handleAddCompanyToFilters}
        /> 
        <GeoDashboard
          onDataUpdate={handleGeoDataUpdate}
          filters={combinedFilters}
          onAddToFilters={handleGeoAddToFilters}
          mode={geoMode}
          setMode={setGeoMode}
        />
        <RoleDashboard
          onDataUpdate={handleRoleDataUpdate}
          filters={combinedFilters}
          onAddToFilters={handleAddRoleToFilters}
          onLevelChange={handleLevelChange}
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
