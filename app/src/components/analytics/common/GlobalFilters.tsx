"use client";

import { DatePickerWithRange } from "@/components/ui/dateRangePicker";
import { DateRange } from "react-day-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import { GroupedMultiSelect } from "@/components/ui/grouped-multi-select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  ListFilterIcon,
  Info,
  Building,
  MapPin,
  Briefcase,
  Users,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyOptions } from "@/hooks/analytics/useCompanyOptions";
import { useCountryOptions } from "@/hooks/analytics/useCountryOptions";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { useCityOptions } from "@/hooks/analytics/useCityOptions";
import { useIndustryOptions } from "@/hooks/analytics/useIndustryOptions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPANY_SIZE, COMPANY_TYPE } from "@/types/company";
import {
  CompanyAnalyticsControllerGetCompaniesWithAlumniCountCompanySizeEnum as CompanySizeEnum,
  CompanyAnalyticsControllerGetCompaniesWithAlumniCountCompanyTypeEnum as CompanyTypeEnum,
} from "@/sdk";
import { motion, AnimatePresence } from "framer-motion";
import { useRoleOptions } from "@/hooks/analytics/useRoleOptions";
import { useAlumniOptions } from "@/hooks/analytics/useAlumniOptions";
import { useListFaculties } from "@/hooks/faculty/useListFaculties";
import Link from "next/link";

export type FilterState = {
  dateRange?: DateRange | undefined;
  companyIds?: string[];
  courseIds?: string[];
  graduationYears?: string[];
  facultyIds?: string[];
  industryIds?: string[];
  companyHQsCountryCodes?: string[];
  companyHQsCityIds?: string[];
  roleCountryCodes?: string[];
  roleCityIds?: string[];
  escoCodes?: string[];
  currentRolesOnly?: boolean;
  search?: string;
  excludeResearchAndHighEducation?: boolean;
  onlyCompaniesWithSalaryData?: boolean;
  onlyInternational?: boolean;
  hideUnknownRoles?: boolean;
  companySize?: CompanySizeEnum[];
  companyType?: CompanyTypeEnum[];
  alumniIds?: string[];
};

type GlobalFiltersProps = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
};

export const GlobalFilters = ({
  filters,
  onFiltersChange,
}: GlobalFiltersProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [activeTab, setActiveTab] = useState("roles");

  useEffect(() => {
    // Active:
    // - arrays that are not empty
    // - dates that are defined
    // - booleans that are true
    // - strings that are not empty
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      } else if (key === "dateRange") {
        const dateRange = value as DateRange | undefined;
        return dateRange?.from || dateRange?.to;
      } else if (typeof value === "boolean") {
        return value;
      } else {
        return value && String(value).trim() !== "";
      }
    });
    setActiveFilterCount(activeFilters.length);
  }, [filters]);

  const { data: companyOptions, isLoading: isCompanyOptionsLoading } =
    useCompanyOptions();

  const { data: countryOptions, isLoading: isCountryOptionsLoading } =
    useCountryOptions();

  const { data: roleCityOptions, isLoading: isRoleCityOptionsLoading } =
    useCityOptions({
      countryCodes: filters.roleCountryCodes,
    });

  const { data: companyCityOptions, isLoading: isCompanyCityOptionsLoading } =
    useCityOptions({
      countryCodes: filters.companyHQsCountryCodes,
    });

  const { data: roleOptions, isLoading: isRoleOptionsLoading } =
    useRoleOptions();

  const { data: industryOptions, isLoading: isIndustryOptionsLoading } =
    useIndustryOptions();

  const { data: alumniOptions, isLoading: isAlumniOptionsLoading } =
    useAlumniOptions();

  const { data: courseOptions, isLoading: isCourseOptionsLoading } =
    useListCourses({
      params: {
        facultyIds: filters.facultyIds?.length ? filters.facultyIds : undefined,
      },
    });

  const { data: facultyOptions, isLoading: isFacultyOptionsLoading } =
    useListFaculties();

  const options = useMemo(
    () => ({
      companies: (companyOptions || []).map((company) => ({
        value: company.id,
        label: company.name,
      })),
      industries: (industryOptions || []).map((industry) => ({
        value: industry.id,
        label: industry.name,
      })),
      countries: (countryOptions || []).map((country) => ({
        value: country.id,
        label: country.name,
      })),
      coursesGrouped: (courseOptions || []).map((course) => ({
        id: course.id,
        value: `(${course.acronym}) ${course.name}`,
        group: course.facultyAcronym,
      })),
      faculties: (facultyOptions || []).map((faculty) => ({
        value: faculty.id,
        label: `(${faculty.acronym}) ${faculty.name} `,
      })),
      roleCitiesGrouped: (roleCityOptions || []).map((city) => ({
        id: city.id,
        value: city.name,
        group: city.country,
      })),
      roleCities: (roleCityOptions || []).map((city) => ({
        value: city.id,
        label: city.name,
      })),
      companyCitiesGrouped: (companyCityOptions || []).map((city) => ({
        id: city.id,
        value: city.name,
        group: city.country,
      })),
      companyCities: (companyCityOptions || []).map((city) => ({
        value: city.id,
        label: city.name,
      })),
      alumni: (alumniOptions || []).map((alumni) => ({
        value: alumni.id,
        label: alumni.fullName,
      })),
      graduationYears: Array.from(
        { length: new Date().getFullYear() - 1994 + 1 },
        (_, i) => {
          const year = 1994 + i;
          return {
            value: year.toString(),
            label: year.toString(),
          };
        }
      ),
      companySizes: Object.entries(CompanySizeEnum).map(([key, value]) => ({
        value: value,
        label: COMPANY_SIZE[key as keyof typeof COMPANY_SIZE],
      })),
      companyTypes: Object.entries(CompanyTypeEnum)
        .map(([key, value]) => ({
          value: value,
          label: COMPANY_TYPE[key as keyof typeof COMPANY_TYPE],
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      roles: (roleOptions || []).map((role) => ({
        value: role.escoCode,
        label: `${role.title} `,
      })),
    }),
    [
      companyOptions,
      countryOptions,
      courseOptions,
      roleCityOptions,
      companyCityOptions,
      industryOptions,
      roleOptions,
      alumniOptions,
      facultyOptions,
    ]
  );

  const handleFilterChange = <T extends FilterState[keyof FilterState]>(
    key: keyof FilterState,
    value: T
  ) => {
    if (key === "currentRolesOnly") {
      onFiltersChange({
        ...filters,
        currentRolesOnly: value as boolean,
        ...(value === true && {
          dateRange: {
            from: filters.dateRange?.from,
            to: undefined,
          },
        }),
      });
    } else {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      dateRange: undefined,
      companyIds: [],
      courseIds: [],
      facultyIds: [],
      graduationYears: [],
      industryIds: [],
      companyHQsCountryCodes: [],
      companyHQsCityIds: [],
      roleCountryCodes: [],
      roleCityIds: [],
      escoCodes: [],
      currentRolesOnly: false,
      search: undefined,
      excludeResearchAndHighEducation: false,
      onlyInternational: false,
      onlyCompaniesWithSalaryData: false,
      companySize: [],
      companyType: [],
      alumniIds: [],
    };

    onFiltersChange(emptyFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim() === "" ? undefined : e.target.value;
    handleFilterChange("search", value);
  };

  const handleClearSearch = () => {
    handleFilterChange("search", undefined);
  };

  const buildMapUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.graduationYears?.length) {
      params.set("conclusion_year", filters.graduationYears.join(","));
    }

    if (filters.courseIds?.length && courseOptions) {
      const courseAcronyms = filters.courseIds
        .map((id) => courseOptions.find((c) => c.id === id)?.acronym)
        .filter((acronym): acronym is string => !!acronym)
        .map((acronym) => acronym.toLowerCase().replace(/\./g, "_"));

      if (courseAcronyms.length) {
        params.set("course", courseAcronyms.join(","));
      }
    }

    return `/${params.toString() ? "?" + params.toString() : ""}`;
  }, [filters.graduationYears, filters.courseIds, courseOptions]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <motion.div
          className="flex items-center justify-between p-4 cursor-pointer select-none"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2">
            <motion.button
              className="p-1 hover:bg-gradient-to-r hover:from-[#A13A23]/10 hover:to-gray-100 rounded-full transition-colors select-none relative"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ListFilterIcon className="w-5 h-5 text-[#8C2D19]" />
              {Math.max(0, activeFilterCount) > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-[#8C2D19] text-white text-xs rounded-full flex items-center justify-center animate-pulse ${
                    activeFilterCount > 9 ? "h-5 w-5" : "h-4 w-4"
                  }`}
                  aria-label={`Active filters: ${activeFilterCount}`}
                >
                  {activeFilterCount}
                </span>
              )}
              {Math.max(0, activeFilterCount) > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-[#8C2D19] text-white text-xs rounded-full flex items-center justify-center ${
                    activeFilterCount > 9 ? "h-5 w-5" : "h-4 w-4"
                  }`}
                  aria-label={`Active filters: ${activeFilterCount}`}
                >
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
            <h2 className="text-lg font-bold text-[#8C2D19]">Filters</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={buildMapUrl()}
                    target="_blank"
                    className="group relative flex items-center gap-1.5 ml-1 text-sm bg-gradient-to-r from-red-50 via-white to-red-50/50 
                        px-3 py-1.5 rounded-full border border-red-200/50 shadow-sm
                        hover:shadow-md hover:border-red-300/70 hover:from-red-100 hover:via-white hover:to-red-50
                        transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-red-700 transition-transform duration-300 group-hover:scale-110" />
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-red-500/20"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                    <span className="font-medium bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent whitespace-nowrap">
                      View on map
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-white/95 backdrop-blur-sm border-red-100 shadow-lg p-0"
                >
                  <div className="p-3 max-w-[280px]">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-red-700">
                        Interactive Map View
                      </span>
                      <br />
                      See alumni distribution across the globe with your current
                      filters
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-red-100/50 flex items-start gap-2 text-xs text-gray-600">
                      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        Supported filters on the map: Course & Conclusion Year
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div
            className="relative flex-1 mx-8 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-[#8C2D19] group-hover:scale-110 group-focus-within:text-[#8C2D19] group-focus-within:scale-110" />
              <Input
                type="text"
                placeholder="Search company or alumni..."
                value={filters.search || ""}
                onChange={handleSearchChange}
                className="pl-10 pr-12 py-2 w-full bg-gradient-to-r from-gray-50 to-white border-gray-200 shadow-sm transition-all duration-200
                         hover:border-[#8C2D19]/50 hover:shadow-md focus-visible:border-[#8C2D19]/70 focus-visible:ring-2 focus-visible:ring-[#8C2D19]/30
                         placeholder:text-gray-400 placeholder:text-sm placeholder:italic rounded-lg"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-[#8C2D19] transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-[#8C2D19] border-[#8C2D19] hover:bg-[#8C2D19] hover:text-white transition-colors animate-pulse"
            >
              Clear
            </Button>
          )}
        </motion.div>

        {!isCollapsed && (
          <div className="px-4 pb-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-3 bg-gray-50 rounded-lg p-1">
                <TabsTrigger
                  value="roles"
                  className="flex items-center gap-1.5 hover:bg-[#A13A23]/10 hover:scale-105 hover:shadow-md transition-all duration-200 rounded-md text-sm"
                >
                  <Briefcase className="h-4 w-4 text-[#8C2D19]" />
                  <span>Roles</span>
                </TabsTrigger>
                <TabsTrigger
                  value="organization"
                  className="flex items-center gap-1.5 hover:bg-[#A13A23]/10 hover:scale-105 hover:shadow-md transition-all duration-200 rounded-md text-sm"
                >
                  <Building className="h-4 w-4 text-[#8C2D19]" />
                  <span>Organization</span>
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="flex items-center gap-1.5 hover:bg-[#A13A23]/10 hover:scale-105 hover:shadow-md transition-all duration-200 rounded-md text-sm"
                >
                  <MapPin className="h-4 w-4 text-[#8C2D19]" />
                  <span>Location</span>
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="flex items-center gap-1.5 hover:bg-[#A13A23]/10 hover:scale-105 hover:shadow-md transition-all duration-200 rounded-md text-sm whitespace-nowrap"
                >
                  <Users className="h-4 w-4 text-[#8C2D19]" />
                  <span>Alumni & Education</span>
                </TabsTrigger>
              </TabsList>

              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg"
                  >
                    {activeTab === "roles" && renderRolesTab()}
                    {activeTab === "location" && renderLocationTab()}
                    {activeTab === "organization" && renderOrganizationTab()}
                    {activeTab === "education" && renderEducationTab()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );

  function renderRolesTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Label
              htmlFor="dateRange"
              className="text-xs font-medium text-gray-700"
            >
              Role Range
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help hover:scale-110 transition-transform duration-200" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-white p-2 border shadow-lg rounded-md text-gray-700 animate-fadeIn"
                >
                  <p className="text-sm">
                    <strong className="text-[#8C2D19]">Role Range</strong> shows
                    when people worked in roles:
                    <br />
                    • If you select a date range (e.g., 2020-2023), it shows
                    roles active during that period
                    <br />• If you leave the end date empty, it shows roles up
                    to the present day
                    <br />• Selecting{" "}
                    <strong className="text-[#8C2D19]">
                      current roles only
                    </strong>{" "}
                    will return only those that do not have an end date
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <DatePickerWithRange
            value={filters.dateRange}
            onChange={(date) => {
              handleFilterChange("dateRange", date);
            }}
            className="w-full"
          />
        </div>

        <div>
          <Label
            htmlFor="roleSelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Roles
          </Label>
          <MultiSelect
            id="roleSelect"
            isLoading={isRoleOptionsLoading}
            options={options.roles}
            value={filters.escoCodes}
            onValueChange={(value) => handleFilterChange("escoCodes", value)}
            placeholder="Select roles"
            maxCount={1}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 gap-x-4 mt-5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="currentRoles"
              checked={filters.currentRolesOnly}
              onCheckedChange={(checked) =>
                handleFilterChange("currentRolesOnly", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19] hover:scale-110 transition-transform duration-200"
            />
            <Label
              htmlFor="currentRoles"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Current roles only
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="onlyInternational"
              checked={filters.onlyInternational}
              onCheckedChange={(checked) =>
                handleFilterChange("onlyInternational", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19] hover:scale-110 transition-transform duration-200"
            />
            <Label
              htmlFor="onlyInternational"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Only international roles
            </Label>
          </div>
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="hideUnknownRoles"
              checked={filters.hideUnknownRoles}
              onCheckedChange={(checked) =>
                handleFilterChange("hideUnknownRoles", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19] hover:scale-110 transition-transform duration-200"
            />
            <Label
              htmlFor="hideUnknownRoles"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Hide remote/unlocated roles
            </Label>
          </div> */}
        </div>
      </div>
    );
  }

  function renderLocationTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Location Section */}
        <div>
          <div className="flex items-center space-x-1">
            <span className="mb-1 font-semibold text-xs text-[#8C2D19]">
              Company Location
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 mb-0.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-white p-2 border shadow-lg rounded-md text-gray-700 animate-fadeIn"
                >
                  <p>
                    The alumni worked for a company that is HQ&apos;ed in this
                    country/city.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <MultiSelect
                id="companyCountrySelect"
                options={options.countries}
                value={filters.companyHQsCountryCodes}
                onValueChange={(value) =>
                  handleFilterChange("companyHQsCountryCodes", value)
                }
                placeholder="Select countries"
                isLoading={isCountryOptionsLoading}
                disabled={isCountryOptionsLoading}
                allowSelectAll={true}
                maxCount={6}
              />
            </div>
            <div>
              <GroupedMultiSelect
                id="companyCitySelect"
                disabled={
                  !filters.companyHQsCountryCodes ||
                  filters.companyHQsCountryCodes.length === 0
                }
                options={options.companyCitiesGrouped}
                value={filters.companyHQsCityIds}
                placeholder="Select cities"
                onValueChange={(value) =>
                  handleFilterChange("companyHQsCityIds", value)
                }
                maxCount={6}
                isLoading={isCompanyCityOptionsLoading}
              />
            </div>
          </div>
        </div>

        {/* Role Location Section */}
        <div>
          <div className="flex items-center space-x-1">
            <span className="mb-1 font-semibold text-xs text-[#8C2D19]">
              Role Location
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 mb-0.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-white p-2 border shadow-lg rounded-md text-gray-700 animate-fadeIn"
                >
                  <p>The alumni exercised the role from this country/city.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <MultiSelect
                id="roleCountryCodeSelect"
                isLoading={isRoleOptionsLoading}
                options={options.countries}
                value={filters.roleCountryCodes}
                onValueChange={(value) =>
                  handleFilterChange("roleCountryCodes", value)
                }
                placeholder="Select countries"
                maxCount={3}
              />
            </div>
            <div>
              <GroupedMultiSelect
                id="roleCityIdSelect"
                disabled={
                  !filters.roleCountryCodes ||
                  filters.roleCountryCodes.length === 0
                }
                options={options.roleCitiesGrouped}
                value={filters.roleCityIds}
                placeholder="Select cities"
                onValueChange={(value) =>
                  handleFilterChange("roleCityIds", value)
                }
                maxCount={3}
                isLoading={isRoleCityOptionsLoading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderOrganizationTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div>
          <Label
            htmlFor="companySelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Companies
          </Label>
          <MultiSelect
            id="companySelect"
            isLoading={isCompanyOptionsLoading}
            options={options.companies}
            value={filters.companyIds}
            onValueChange={(value) => handleFilterChange("companyIds", value)}
            placeholder="Select companies"
            maxCount={2}
          />
        </div>

        <div>
          <Label
            htmlFor="industrySelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Industries
          </Label>
          <MultiSelect
            id="industrySelect"
            options={options.industries}
            value={filters.industryIds}
            onValueChange={(value) => handleFilterChange("industryIds", value)}
            placeholder="Select industries"
            lazyLoading={true}
            isLoading={isIndustryOptionsLoading}
          />
        </div>

        <div>
          <Label
            htmlFor="companySizeSelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Company Size
          </Label>
          <div className="flex items-center gap-2">
            <MultiSelect
              id="companySizeSelect"
              options={options.companySizes}
              value={filters.companySize || []}
              onValueChange={(value) =>
                handleFilterChange("companySize", value)
              }
              placeholder="Select company size"
              allowSelectAll={true}
              maxCount={1}
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="companyTypeSelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Company Type
          </Label>
          <div className="flex items-center gap-2">
            <MultiSelect
              id="companyTypeSelect"
              options={options.companyTypes}
              value={filters.companyType || []}
              onValueChange={(value) =>
                handleFilterChange("companyType", value)
              }
              placeholder="Select company type"
              allowSelectAll={true}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="excludeResearchAndHighEducation"
              checked={filters.excludeResearchAndHighEducation}
              onCheckedChange={(checked) =>
                handleFilterChange("excludeResearchAndHighEducation", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19] hover:scale-110 transition-transform duration-200"
            />
            <Label
              htmlFor="excludeResearchAndHighEducation"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Exclude education and research institutions
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="onlyCompaniesWithSalaryData"
              checked={filters.onlyCompaniesWithSalaryData}
              onCheckedChange={(checked) =>
                handleFilterChange("onlyCompaniesWithSalaryData", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19] hover:scale-110 transition-transform duration-200"
            />
            <Label
              htmlFor="hideUnknownRoles"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Only companies with salary data
            </Label>
          </div>
        </div>
      </div>
    );
  }

  function renderEducationTab() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <Label
            htmlFor="alumniSelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Alumni
          </Label>
          <MultiSelect
            id="alumniSelect"
            options={options.alumni}
            value={filters.alumniIds}
            onValueChange={(value) => handleFilterChange("alumniIds", value)}
            placeholder="Search and select alumni"
            isLoading={isAlumniOptionsLoading}
            maxCount={1}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label
              htmlFor="facultySelect"
              className="text-xs font-medium text-gray-700 mb-1 block"
            >
              Faculty
            </Label>
            <MultiSelect
              id="facultySelect"
              options={options.faculties}
              value={filters.facultyIds}
              onValueChange={(value) => handleFilterChange("facultyIds", value)}
              placeholder="Select faculties"
              isLoading={isFacultyOptionsLoading}
              maxCount={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label
              htmlFor="courseSelect"
              className="text-xs font-medium text-gray-700 mb-1 block"
            >
              Course
            </Label>
            <GroupedMultiSelect
              id="courseSelect"
              options={options.coursesGrouped}
              value={filters.courseIds}
              onValueChange={(value) => handleFilterChange("courseIds", value)}
              placeholder="Select courses"
              isLoading={isCourseOptionsLoading}
              maxCount={1}
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="graduationYearsSelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Graduation Year
          </Label>
          <MultiSelect
            id="graduationYearsSelect"
            options={options.graduationYears}
            value={filters.graduationYears}
            onValueChange={(value) =>
              handleFilterChange("graduationYears", value)
            }
            placeholder="Select graduation years"
            allowSelectAll={true}
            className="border-gray-200 focus:ring-2 focus:ring-[#A13A23]/50 hover:border-[#A13A23] transition-all duration-200"
          />
        </div>
      </div>
    );
  }
};
