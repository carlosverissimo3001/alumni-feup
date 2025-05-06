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
  GraduationCap,
  MapPin,
  Tags,
  Briefcase,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyOptions } from "@/hooks/analytics/useCompanyOptions";
import { useCountryOptions } from "@/hooks/analytics/useCountryOptions";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { CourseSelect } from "@/components/common/courseSelect";
import { useCityOptions } from "@/hooks/analytics/useCityOptions";
import { useIndustryOptions } from "@/hooks/analytics/useIndustryOptions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPANY_SIZE, COMPANY_TYPE } from "@/types/company";
import {
  CompaniesAnalyticsControllerGetCompaniesWithAlumniCountCompanySizeEnum as CompanySizeEnum,
  CompaniesAnalyticsControllerGetCompaniesWithAlumniCountCompanyTypeEnum as CompanyTypeEnum,
} from "@/sdk";
import { motion, AnimatePresence } from "framer-motion";
import { useRoleOptions } from "@/hooks/analytics/useRoleOptions";

export type FilterState = {
  dateRange?: DateRange | undefined;
  companyIds?: string[];
  courseIds?: string[];
  graduationYears?: string[];
  industryIds?: string[];
  countries?: string[];
  cityIds?: string[];
  escoCodes?: string[];
  currentRolesOnly?: boolean;
  search?: string;
  excludeResearchAndHighEducation?: boolean;
  onlyInternational?: boolean;
  companySize?: CompanySizeEnum[];
  companyType?: CompanyTypeEnum[];
};

type GlobalFiltersProps = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
};

export default function GlobalFilters({
  filters,
  onFiltersChange,
}: GlobalFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [activeTab, setActiveTab] = useState("location");

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

  const {
    data: companyOptions,
    isLoading: isCompanyOptionsLoading,
    isFetching: isCompanyOptionsFetching,
  } = useCompanyOptions();

  const {
    data: countryOptions,
    isLoading: isCountryOptionsLoading,
    isFetching: isCountryOptionsFetching,
  } = useCountryOptions();

  const {
    data: cityOptions,
    isLoading: isCityOptionsLoading,
    isFetching: isCityOptionsFetching,
  } = useCityOptions({
    countryCodes: filters.countries,
  });

  const {
    data: roleOptions,
    isLoading: isRoleOptionsLoading,
    isFetching: isRoleOptionsFetching,
  } = useRoleOptions();

  const {
    data: industryOptions,
    isLoading: isIndustryOptionsLoading,
    isFetching: isIndustryOptionsFetching,
  } = useIndustryOptions();

  const { data: courseOptions, isLoading: isCourseOptionsLoading } =
    useListCourses({});

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
      courses: (courseOptions || []).map((course) => ({
        value: course.id,
        label: course.name,
      })),
      citiesGrouped: (cityOptions || []).map((city) => ({
        id: city.id,
        name: city.name,
        group: city.country,
      })),
      cities: (cityOptions || []).map((city) => ({
        value: city.id,
        label: city.name,
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
      companyTypes: Object.entries(CompanyTypeEnum).map(([key, value]) => ({
        value: value,
          label: COMPANY_TYPE[key as keyof typeof COMPANY_TYPE],
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      roles: (roleOptions || []).map((role) => ({
        value: role.escoCode,
        label: role.title,
      })),
    }),
    [
      companyOptions,
      countryOptions,
      courseOptions,
      cityOptions,
      industryOptions,
      roleOptions,
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
      graduationYears: [],
      industryIds: [],
      countries: [],
      cityIds: [],
      currentRolesOnly: false,
      search: undefined,
      excludeResearchAndHighEducation: false,
      onlyInternational: false,
      companySize: [],
      companyType: [],
    };

    onFiltersChange(emptyFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <motion.div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <motion.button
            className="p-1 hover:bg-gray-100 rounded-full transition-colors select-none"
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ListFilterIcon className="w-5 h-5 text-[#8C2D19]" />
          </motion.button>
          <h2 className="text-lg font-bold text-[#8C2D19]">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="text-sm text-gray-500">({activeFilterCount})</span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              clearFilters();
            }}
            className="text-[#8C2D19] border-[#8C2D19] hover:bg-[#8C2D19] hover:text-white transition-colors"
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
            <TabsList className="grid grid-cols-5 mb-3">
              <TabsTrigger
                value="location"
                className="flex items-center gap-1.5"
              >
                <MapPin className="h-4 w-4" />
                <span>Location </span>
                {/* {activeFilterCount > 0 && (
                  <span className="text-sm text-gray-500">({activeFilterCount})</span>
                )} */}
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className="flex items-center gap-1.5"
              >
                <Building className="h-4 w-4" />
                <span>Organization</span>
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="flex items-center gap-1.5"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Education</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>Roles</span>
              </TabsTrigger>
              <TabsTrigger
                value="options"
                className="flex items-center gap-1.5"
              >
                <Tags className="h-4 w-4" />
                <span>Options</span>
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
                  className="w-full"
                >
                  {/* Render tab content based on activeTab */}
                  {activeTab === "location" && renderLocationTab()}
                  {activeTab === "organization" && renderOrganizationTab()}
                  {activeTab === "education" && renderEducationTab()}
                  {activeTab === "roles" && renderRolesTab()}
                  {activeTab === "options" && renderOptionsTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );

  // Helper functions to render each tab content
  function renderLocationTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="countrySelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Countries
          </Label>
          <MultiSelect
            id="countrySelect"
            options={options.countries}
            value={filters.countries}
            onValueChange={(value) => handleFilterChange("countries", value)}
            placeholder="Select countries"
            isLoading={isCountryOptionsLoading || isCountryOptionsFetching}
            disabled={isCountryOptionsLoading || isCountryOptionsFetching}
            allowSelectAll={true}
            maxCount={2}
          />
        </div>

        <div>
          <Label
            htmlFor="citySelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Cities
          </Label>
          <GroupedMultiSelect
            id="citySelect"
            disabled={!filters.countries || filters.countries.length === 0}
            options={options.citiesGrouped}
            value={filters.cityIds}
            placeholder="Select cities"
            onValueChange={(value) => handleFilterChange("cityIds", value)}
            maxCount={2}
            isLoading={isCityOptionsLoading || isCityOptionsFetching}
          />
        </div>
      </div>
    );
  }

  function renderOrganizationTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <Label
            htmlFor="companySelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Companies
          </Label>
          <MultiSelect
            id="companySelect"
            isLoading={isCompanyOptionsLoading || isCompanyOptionsFetching}
            options={options.companies}
            value={filters.companyIds}
            onValueChange={(value) => handleFilterChange("companyIds", value)}
            placeholder="Select companies"
            maxCount={3}
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
            isLoading={isIndustryOptionsLoading || isIndustryOptionsFetching}
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
      </div>
    );
  }

  function renderEducationTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="courseSelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Courses
          </Label>
          <CourseSelect
            courses={courseOptions || []}
            setCourseIds={(value) => handleFilterChange("courseIds", value)}
            isLoadingCourses={isCourseOptionsLoading}
            courseIds={filters.courseIds || []}
          />
        </div>

        <div>
          <Label
            htmlFor="graduationYearsSelect"
            className="text-xs font-medium text-gray-700 mb-1 block"
          >
            Graduation Years
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
          />
        </div>
      </div>
    );
  }

  function renderRolesTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-white p-2 border shadow-lg rounded-md text-gray-700"
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
                    </strong>
                    will un
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
            isLoading={isRoleOptionsLoading || isRoleOptionsFetching}
            options={options.roles}
            value={filters.escoCodes}
            onValueChange={(value) => handleFilterChange("escoCodes", value)}
            placeholder="Select roles"
            maxCount={3}
          />
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="currentRoles"
              checked={filters.currentRolesOnly}
              onCheckedChange={(checked) =>
                handleFilterChange("currentRolesOnly", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19]"
            />
            <Label
              htmlFor="currentRoles"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Current roles only
            </Label>
          </div>
        </div>
      </div>
    );
  }

  function renderOptionsTab() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="excludeResearchAndHighEducation"
              checked={filters.excludeResearchAndHighEducation}
              onCheckedChange={(checked) =>
                handleFilterChange("excludeResearchAndHighEducation", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19]"
            />
            <Label
              htmlFor="excludeResearchAndHighEducation"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Exclude education and research roles
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="onlyInternational"
              checked={filters.onlyInternational}
              onCheckedChange={(checked) =>
                handleFilterChange("onlyInternational", checked)
              }
              className="border-gray-300 data-[state=checked]:bg-[#8C2D19] data-[state=checked]:border-[#8C2D19]"
            />
            <Label
              htmlFor="onlyInternational"
              className="text-xs font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Only international roles
            </Label>
          </div>
        </div>
      </div>
    );
  }
}
