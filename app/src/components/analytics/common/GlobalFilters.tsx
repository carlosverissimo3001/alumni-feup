"use client";

import { DatePickerWithRange } from "@/components/ui/dateRangePicker";
import { DateRange } from "react-day-picker";
import { MultiSelect } from "@/components/ui/multi-select";
import { GroupedMultiSelect } from "@/components/ui/grouped-multi-select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, ListFilterIcon, Info } from "lucide-react";
import { useState, useMemo } from "react";
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
import { initialFilters } from "@/app/analytics/page";
import { useCityOptions } from "@/hooks/analytics/useCityOptions";

export type FilterState = {
  dateRange?: DateRange | undefined;
  companyIds?: string[];
  courseIds?: string[];
  graduationYears?: string[];
  industryIds?: string[];
  countries?: string[];
  cityIds?: string[];
  currentRolesOnly?: boolean;
  search?: string;
  excludeResearchAndHighEducation?: boolean;
  onlyInternational?: boolean;
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
  const [companySearch, setCompanySearch] = useState<string | undefined>(
    undefined
  );

  const {
    data: companyOptions,
    isLoading: isCompanyOptionsLoading,
    isFetching: isCompanyOptionsFetching,
  } = useCompanyOptions({
    ...filters,
    companySearch,
  });

  const {
    data: countryOptions,
    isLoading: isCountryOptionsLoading,
    isFetching: isCountryOptionsFetching,
  } = useCountryOptions()

  const {
    data: cityOptions,
    isLoading: isCityOptionsLoading,
    isFetching: isCityOptionsFetching,
  } = useCityOptions({
    countryCodes: filters.countries,
  });

  const {
    data: courseOptions,
    isLoading: isCourseOptionsLoading,
  } = useListCourses({});

  const options = useMemo(
    () => ({
      companies: (companyOptions || []).map((company) => ({
        value: company.id,
        label: company.name,
      })),
      industries: [],
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
        group: city.country
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
    }),
    [companyOptions, countryOptions, courseOptions, cityOptions]
  );

  const handleFilterChange = <T extends FilterState[keyof FilterState]>(
    key: keyof FilterState,
    value: T
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange(initialFilters);
    setCompanySearch(undefined);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header Section */}
      <div
        className={`flex items-center justify-between ${
          isCollapsed ? "" : "mb-2"
          
        }`}
        /* onClick={() => setIsCollapsed(!isCollapsed)} */
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <button
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ListFilterIcon className="w-5 h-5 text-[#8C2D19]" />
          </button>
          <h2 className="text-lg font-bold text-[#8C2D19]">Filters</h2>
        </div>
        {!isCollapsed && (
          <Button
            variant="outline"
            size="sm"
          onClick={clearFilters}
          className="text-[#8C2D19] border-[#8C2D19] hover:bg-[#8C2D19] hover:text-white transition-colors"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Filter Inputs */}
      <div className={`space-y-4 ${isCollapsed ? "hidden" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div>
            <Label
              htmlFor="companySelect"
              className="text-xs font-medium text-gray-700 mb-1 block"
            >
              Companies
            </Label>
            <MultiSelect
              id="companySelect"
              onSearchChange={setCompanySearch}
              isLoading={isCompanyOptionsLoading || isCompanyOptionsFetching}
              options={options.companies}
              value={filters.companyIds}
              onValueChange={(value) => handleFilterChange("companyIds", value)}
              placeholder="Select companies"
              allowSelectAll={true}
              lazyLoading={true}
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
              onValueChange={(value) =>
                handleFilterChange("industryIds", value)
              }
              placeholder="Select industries"
              lazyLoading={true}
            />
          </div>

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
              // onValueChange={(value) => handleFilterChange("cityIds", value)}
              // Still not implemented in the BE
              placeholder="Select cities"
              onValueChange={(value) => console.log(value)}
              maxCount={2}
              isLoading={isCityOptionsLoading || isCityOptionsFetching}
            />
          </div>

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
              onValueChange={(value) => handleFilterChange("graduationYears", value)}
              placeholder="Select graduation years"
              allowSelectAll={true}
            />
          </div>

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
                      <strong className="text-[#8C2D19]">Role Range</strong>{" "}
                      shows when people worked in roles:
                      <br />
                      • If you select a date range (e.g., 2020-2023), it shows
                      roles active during that period
                      <br />• If you leave the end date empty, it shows roles up
                      to the present day
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

          {/* Checkboxes */}
          <div className="space-y-2">
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
      </div>
    </div>
  );
}
