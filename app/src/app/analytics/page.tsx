"use client";

import {
  BarChart3,
  Users,
  ChartSpline,
  Factory,
  Briefcase,
  MapPin,
  Flag,
  ArrowUp,
} from "lucide-react";
import {
  CompanyDashboard,
  IndustryDashboard,
  GeoDashboard,
  RoleDashboard,
  EducationDashboard,
  AlumniTable,
} from "@/components/analytics/dashboards";
import { useState, useCallback, useMemo, useEffect } from "react";
import OverallStats from "@/components/analytics/OverallStats";
import GlobalFilters, {
  FilterState,
} from "@/components/analytics/common/GlobalFilters";
import { handleDateRange } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useCompanyOptions } from "@/hooks/analytics/useCompanyOptions";
import { EducationDrillType, GeoDrillType } from "@/types/drillType";

export const initialFilters: FilterState = {
  dateRange: undefined,
  courseIds: undefined,
  facultyIds: undefined,
  graduationYears: undefined,
  companyIds: undefined,
  industryIds: undefined,
  roleCountryCodes: undefined,
  roleCityIds: undefined,
  companyHQsCountryCodes: undefined,
  companyHQsCityIds: undefined,
  currentRolesOnly: true,
  onlyInternational: false,
  excludeResearchAndHighEducation: false,
  search: undefined,
  hideUnknownRoles: false,
  classificationLevel: 1,
  companySize: [],
  escoCodes: [],
  alumniIds: [],
};

export default function Analytics() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: companyOptions } = useCompanyOptions();

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

  const [geoMode, setGeoMode] = useState<GeoDrillType>(GeoDrillType.COUNTRY);
  const [educationMode, setEducationMode] = useState<EducationDrillType>(
    EducationDrillType.MAJOR
  );

  const initializeFiltersFromURL = useCallback(() => {
    const urlFilters: FilterState = { ...initialFilters };

    const companyNames = searchParams.get("company")?.toLowerCase().split(",");
    if (companyNames && companyOptions) {
      const companyIds = companyNames
        .map((name) =>
          companyOptions.find((c) => c.name.toLowerCase() === name.trim())
        )
        .filter((company) => company !== undefined)
        .map((company) => company!.id);

      if (companyIds.length > 0) {
        urlFilters.companyIds = companyIds;
      }
    }

    return urlFilters;
  }, [searchParams, companyOptions]);

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    if (companyOptions) {
      setFilters(initializeFiltersFromURL());
    }
  }, [companyOptions, initializeFiltersFromURL]);

  const updateURL = useCallback(
    (newFilters: FilterState) => {
      const companyIds = newFilters.companyIds;
      if (companyIds && companyIds.length > 0 && companyOptions) {
        const companies = companyIds
          .map((id) => companyOptions.find((c) => c.id === id))
          .filter((company) => company !== undefined)
          .map((company) => company!.name.toLowerCase());

        if (companies.length > 0) {
          const params = new URLSearchParams();
          params.set("company", companies.join(","));
          const newURL = `${window.location.pathname}${
            params.toString() ? "?" + params.toString() : ""
          }`;
          router.push(newURL);
        }
      } else {
        router.push(window.location.pathname);
      }
    },
    [router, companyOptions]
  );

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);

      // Here, we're checking if the company filters have changed.
      // If so, no sense in having the parms in the url.
      const onlyCompaniesChanged = Object.entries(newFilters).every(
        ([key, value]) => {
          if (key === "companyIds") return true;
          if (Array.isArray(value)) return value.length === 0;
          if (typeof value === "boolean")
            return value === initialFilters[key as keyof FilterState];
          return !value;
        }
      );

      if (onlyCompaniesChanged) {
        updateURL(newFilters);
      } else {
        router.push(window.location.pathname);
      }
    },
    [updateURL, router]
  );

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
    (geoId: string, type: "role" | "company") => {
      if (geoMode === "country") {
        setFilters((prev) => {
          const key =
            type === "role" ? "roleCountryCodes" : "companyHQsCountryCodes";
          const current = prev[key] || [];
          if (!current.includes(geoId)) {
            const updated = [...current, geoId];
            if (updated.length === 1) {
              setTimeout(() => setGeoMode(GeoDrillType.CITY), 0);
            }
            return {
              ...prev,
              [key]: updated,
            };
          } else {
            return {
              ...prev,
              [key]: current.filter((id: string) => id !== geoId),
            };
          }
        });
      } else {
        setFilters((prev) => {
          const key = type === "role" ? "roleCityIds" : "companyHQsCityIds";
          const current = prev[key] || [];
          if (!current.includes(geoId)) {
            return {
              ...prev,
              [key]: [...current, geoId],
            };
          } else {
            return {
              ...prev,
              [key]: current.filter((id: string) => id !== geoId),
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

  const handleAddAlumniToFilters = useCallback((alumniId: string) => {
    setFilters((prev) => ({
      ...prev,
      alumniIds: [...(prev.alumniIds || []), alumniId],
    }));
  }, []);

  const handleAddEducationToFilters = useCallback((educationId: string) => {
    if (educationMode === EducationDrillType.FACULTY) {
      setFilters((prev) => {
        const current = prev.facultyIds || [];
        if (!current.includes(educationId)) {
          const updated = [...current, educationId];
          if (updated.length === 1) {
            setTimeout(() => setEducationMode(EducationDrillType.MAJOR), 0);
          }
          return {
            ...prev,
            facultyIds: updated,
          };
        } else {
          return {
            ...prev,
            facultyIds: current.filter((id) => id !== educationId)
          };
        }
      });
    } else if (educationMode === EducationDrillType.MAJOR) {
      setFilters((prev) => {
        const current = prev.courseIds || [];
        if (!current.includes(educationId)) {
          const updated = [...current, educationId];
          if (updated.length === 1) {
            setTimeout(() => setEducationMode(EducationDrillType.YEAR), 0);
          }
          return {
            ...prev,
            courseIds: updated,
          };
        } else {
          return {
            ...prev,
            courseIds: current.filter((id) => id !== educationId),
          };
        }
      });
    } else if (educationMode === EducationDrillType.YEAR) {
      setFilters((prev) => {
        const current = prev.graduationYears || [];
        if (!current.includes(educationId)) {
          return {
            ...prev,
            graduationYears: [...current, educationId],
          };
        } else {
          return {
            ...prev,
            graduationYears: current.filter((id) => id !== educationId),
          };
        }
      });
    }
  }, [educationMode, setEducationMode]);

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

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 700);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 space-y-3 bg-gray-100 min-h-screen relative">
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
        <GlobalFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
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

        <EducationDashboard
          filters={combinedFilters}
          mode={educationMode}
          setMode={setEducationMode}
          onAddToFilters={handleAddEducationToFilters}
        />
        <IndustryDashboard
          onDataUpdate={handleIndustryDataUpdate}
          filters={combinedFilters}
          onAddToFilters={handleAddIndustryToFilters}
        />
      </div>

      <AlumniTable
        filters={filters}
        onAddToFilters={handleAddAlumniToFilters}
      />

      <Button
        onClick={scrollToTop}
        className={`fixed bottom-24 z-20 right-8 bg-[#8C2D19] hover:bg-[#A13A23] text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
          showScrollButton
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-16"
        } focus:outline-none focus:ring-2 focus:ring-[#8C2D19] focus:ring-opacity-50`}
        aria-label="Scroll to top"
        title="Scroll to top"
        size="lg"
      >
        <ArrowUp className="h-12 w-12" />
      </Button>
    </div>
  );
}
