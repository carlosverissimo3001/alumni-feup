"use client";

import {
  BarChart3,
  Users,
  ChartSpline,
  Briefcase,
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
  SeniorityDashboard,
} from "@/components/analytics/dashboards";
import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import OverallStats from "@/components/analytics/OverallStats";
import { GlobalFilters, FilterState } from "@/components/analytics/common";
import { handleDateRange } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useFetchOptions } from "@/hooks/analytics/useFetchOptions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AnalyticsControllerGetAnalyticsSelectorTypeEnum as SelectorType,
  AnalyticsControllerGetAnalyticsSeniorityLevelEnum as SeniorityLevel,
} from "@/sdk";
import { useFetchAnalytics } from "@/hooks/analytics/useFetchAnalytics";
import { ITEMS_PER_PAGE, SortBy, SortOrder } from "@/consts";
import {
  EDUCATION_DRILL_TYPE,
  GEO_DRILL_TYPE,
  ESCO_CLASSIFICATION_LEVEL,
} from "@/types/drillType";
import { useDropdownContext } from "@/contexts/DropdownContext";
import { useLoading } from "@/contexts/LoadingContext";
import GlobalLoadingModal from "@/components/analytics/common/GlobalLoadingModal";

const initialFilters: FilterState = {
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
  escoClassificationLevel: undefined,
  companySize: [],
  escoCodes: [],
  alumniIds: [],
  seniorityLevel: [],
};

export default function Analytics() {
  return (
    <Suspense fallback={<GlobalLoadingModal />}>
      <AnalyticsContent />
    </Suspense>
  );
}

function AnalyticsContent() {
  const { isAnyOpen } = useDropdownContext();
  const { setIsLoading } = useLoading();


  // State
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [stats, setStats] = useState<{
    alumniCount: number;
    companyCount: number;
    countryCount: number;
    roleCount: number;
  }>({
    alumniCount: 0,
    companyCount: 0,
    countryCount: 0,
    roleCount: 0,
  });
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [initializedFromURL, setInitializedFromURL] = useState(false);
  const [geoMode, setGeoMode] = useState<GEO_DRILL_TYPE>(GEO_DRILL_TYPE.COUNTRY);
  const [educationMode, setEducationMode] = useState<EDUCATION_DRILL_TYPE>(
    EDUCATION_DRILL_TYPE.MAJOR
  );
  const [classificationLevel, setClassificationLevel] =
    useState<ESCO_CLASSIFICATION_LEVEL>(ESCO_CLASSIFICATION_LEVEL.LEVEL_5);

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: options, isLoading: isOptionsLoading } = useFetchOptions({
    selectorType: SelectorType.All,
  });

  // Getting companies from URL
  const initializeCompaniesFromURL = useCallback(() => {
    const urlFilters: FilterState = { ...initialFilters };

    const companyNames = searchParams.get("company")?.toLowerCase().split(",");
    if (companyNames && options?.companies) {
      const companyIds = companyNames
        .map((name) =>
          options.companies?.find((c) => c.name.toLowerCase() === name.trim())
        )
        .filter((company) => company !== undefined)
        .map((company) => company!.id);

      if (companyIds.length > 0) {
        urlFilters.companyIds = companyIds;
      }
    }

    return urlFilters;
  }, [searchParams, options]);

  useEffect(() => {
    if (options?.companies && !initializedFromURL) {
      setFilters(initializeCompaniesFromURL());
      setInitializedFromURL(true);
    }
  }, [options?.companies, initializeCompaniesFromURL, initializedFromURL]);

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

  const { data, isLoading, isFetching } = useFetchAnalytics({
    params: {
      ...combinedFilters,
      limit: ITEMS_PER_PAGE[1],
      sortBy: SortBy.COUNT,
      selectorType: SelectorType.All,
      sortOrder: SortOrder.DESC,
      offset: 0,
      escoClassificationLevel:  Number(ESCO_CLASSIFICATION_LEVEL.LEVEL_5.split(" ")[1]),
    },
    options: {
      isInitialLoad: true,
    },
  });

  useEffect(() => {
    setIsLoading((isLoading || isFetching) && !isAnyOpen);
  }, [isLoading, isFetching, isAnyOpen, setIsLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /*** Helper Functions ***/
  const getClassificationLevel = (classificationLevel: ESCO_CLASSIFICATION_LEVEL) => {
    return Number(classificationLevel.split(" ")[1]);
  };

  const getCodeLevel = (code: string) => {
    if (code.length <= 5) {
      return code.length;
    }
    const parts = code.split(".");
    return parts.length + 4; // 4 as the first 4 digits are not seperated by a dot
  };

  // Scroll to top button
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

  /*** Filter Handlers ***/
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      if (searchParams.toString()) {
        router.replace(window.location.pathname);
      }
    },
    [router, searchParams]
  );

  const handleCompanyDataUpdate = useCallback(
    (alumniCount: number, companyCount: number) => {
      setStats((prev) => ({
        ...prev,
        alumniCount,
        companyCount,
      }));
    },
    []
  );

  const handleGeoDataUpdate = useCallback((countryCount: number) => {
    setStats((prev) => ({
      ...prev,
      countryCount,
    }));
  }, []);

  const handleRoleDataUpdate = useCallback((roleCount: number) => {
    setStats((prev) => ({
      ...prev,
      roleCount,
    }));
  }, []);

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
      if (geoMode === GEO_DRILL_TYPE.COUNTRY) {
        setFilters((prev) => {
          const key =
            type === "role" ? "roleCountryCodes" : "companyHQsCountryCodes";
          const current = prev[key] || [];
          if (!current.includes(geoId)) {
            const updated = [...current, geoId];
            if (updated.length === 1) {
              setTimeout(() => setGeoMode(GEO_DRILL_TYPE.CITY), 0);
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

  const handleAddRoleToFilters = useCallback(
    (escoCode: string) => {
      setFilters((prev) => {
        const newCodeLevel = getCodeLevel(escoCode);

        // If the code is already selected, remove it (clear the filter)
        const isAlreadySelected = prev.escoCodes?.includes(escoCode);
        const newEscoCodes = isAlreadySelected ? [] : [escoCode];

        // If we're adding a new code and not at level 8, increment the level
        if (
          !isAlreadySelected &&
          classificationLevel !== ESCO_CLASSIFICATION_LEVEL.LEVEL_8 &&
          newCodeLevel >= getClassificationLevel(classificationLevel)
        ) {
          const currentLevel = Number(classificationLevel.split(" ")[1]);
          const nextLevel = `Level ${currentLevel + 1}` as ESCO_CLASSIFICATION_LEVEL;
          setClassificationLevel(nextLevel);
        }

        return { ...prev, escoCodes: newEscoCodes };
      });
    },
    [classificationLevel]
  );

  const handleAddAlumniToFilters = useCallback((alumniId: string) => {
    setFilters((prev) => {
      const currentAlumniIds = prev.alumniIds || [];
      if (!currentAlumniIds.includes(alumniId)) {
        return {
          ...prev,
          alumniIds: [...currentAlumniIds, alumniId],
        };
      } else {
        return {
          ...prev,
          alumniIds: currentAlumniIds.filter((id) => id !== alumniId),
        };
      }
    });
  }, []);

  const handleAddSeniorityToFilters = useCallback(
    (seniorityLevel: SeniorityLevel) => {
      setFilters((prev) => {
        const currentSeniorityLevels = prev.seniorityLevel || [];
        if (!currentSeniorityLevels.includes(seniorityLevel)) {
          return {
            ...prev,
            seniorityLevel: [...currentSeniorityLevels, seniorityLevel],
          };
        } else {
          return {
            ...prev,
            seniorityLevel: currentSeniorityLevels.filter(
              (level) => level !== seniorityLevel
            ),
          };
        }
      });
    },
    []
  );

  const handleAddEducationToFilters = useCallback(
    (id: string, year?: number) => {
      if (educationMode === EDUCATION_DRILL_TYPE.FACULTY) {
        setFilters((prev) => {
          const current = prev.facultyIds || [];
          if (!current.includes(id)) {
            const updated = [...current, id];
            if (updated.length === 1) {
              setTimeout(() => setEducationMode(EDUCATION_DRILL_TYPE.MAJOR), 0);
            }
            return {
              ...prev,
              facultyIds: updated,
            };
          } else {
            return {
              ...prev,
              facultyIds: current.filter((id) => id !== id),
            };
          }
        });
      } else if (educationMode === EDUCATION_DRILL_TYPE.MAJOR) {
        setFilters((prev) => {
          const current = prev.courseIds || [];
          if (!current.includes(id)) {
            const updated = [...current, id];
            if (updated.length === 1) {
              setTimeout(() => setEducationMode(EDUCATION_DRILL_TYPE.YEAR), 0);
            }
            return {
              ...prev,
              courseIds: updated,
            };
          } else {
            return {
              ...prev,
              courseIds: current.filter((id) => id !== id),
            };
          }
        });
      } else if (educationMode === EDUCATION_DRILL_TYPE.YEAR) {
        setFilters((prev) => {
          const currentYears = prev.graduationYears || [];
          const currentCourses = prev.courseIds || [];
          const yearString = year?.toString() || "";

          if (!currentYears.includes(yearString)) {
            return {
              ...prev,
              courseIds: currentCourses.includes(id)
                ? currentCourses
                : [...currentCourses, id],
              graduationYears: [...currentYears, yearString],
            };
          } else {
            const updatedYears = currentYears.filter(
              (gradYear) => gradYear !== yearString
            );

            const shouldRemoveCourse = !currentYears.some(
              (y) => y !== yearString && currentCourses.includes(id)
            );

            return {
              ...prev,
              courseIds: shouldRemoveCourse
                ? currentCourses.filter((courseId) => courseId !== id)
                : currentCourses,
              graduationYears: updatedYears,
            };
          }
        });
      }
    },
    [educationMode, setEducationMode]
  );

  const statsConfig = [
    {
      name: "Alumni",
      values: stats.alumniCount,
      icon: <Users className="h-4 w-4 text-[#8C2D19]" />,
      infoMessage:
        "The number of alumni who have graduated from the tracked courses",
    },
    {
      name: "Roles",
      values: stats.roleCount,
      icon: <Briefcase className="h-4 w-4 text-[#8C2D19]" />,
      infoMessage: "The total number of individual roles that alumni had",
    },
    {
      name: "Companies",
      values: stats.companyCount,
      icon: <BarChart3 className="h-4 w-4 text-[#8C2D19]" />,
    },
    {
      name: "Countries",
      values: stats.countryCount,
      icon: <Flag className="h-4 w-4 text-[#8C2D19]" />,
    },
  ];

  return (
    <>
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
            globalOptions={options}
            isOptionsLoading={isOptionsLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          <CompanyDashboard
            globalData={data?.companyData}
            isGlobalDataLoading={isLoading}
            onDataUpdate={handleCompanyDataUpdate}
            filters={combinedFilters}
            onAddToFilters={handleAddCompanyToFilters}
          />
          <GeoDashboard
            globalData={{
              countryData: data?.countryData,
              cityData: data?.cityData,
            }}
            isGlobalDataLoading={isLoading}
            onDataUpdate={handleGeoDataUpdate}
            filters={combinedFilters}
            onAddToFilters={handleGeoAddToFilters}
            mode={geoMode}
            setMode={setGeoMode}
          />
          <RoleDashboard
            globalData={data?.roleData}
            isGlobalDataLoading={isLoading}
            onDataUpdate={handleRoleDataUpdate}
            filters={combinedFilters}
            onAddToFilters={handleAddRoleToFilters}
            classificationLevel={classificationLevel}
            setClassificationLevel={setClassificationLevel}
          />

          <IndustryDashboard
            globalData={data?.industryData}
            isGlobalDataLoading={isLoading}
            filters={combinedFilters}
            onAddToFilters={handleAddIndustryToFilters}
          />
          <EducationDashboard
            globalData={{
              faculties: data?.facultyData,
              majors: data?.majorData,
              graduations: data?.graduationData,
            }}
            isGlobalDataLoading={isLoading}
            filters={combinedFilters}
            mode={educationMode}
            setMode={setEducationMode}
            onAddToFilters={handleAddEducationToFilters}
          />

          <SeniorityDashboard
            globalData={data?.seniorityData}
            isGlobalDataLoading={isLoading}
            filters={combinedFilters}
            onAddToFilters={handleAddSeniorityToFilters}
          />
        </div>

        <AlumniTable filters={combinedFilters} onAddToFilters={handleAddAlumniToFilters} />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={scrollToTop}
                className={`fixed bottom-24 z-20 right-8 bg-[#8C2D19] hover:bg-[#A13A23] text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
                  showScrollButton
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-16"
                } focus:outline-none focus:ring-2 focus:ring-[#8C2D19] focus:ring-opacity-50`}
                aria-label="Scroll to top"
                size="lg"
              >
                <ArrowUp className="h-12 w-12" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">Scroll to top</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
