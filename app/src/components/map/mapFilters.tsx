import React, { useCallback, useEffect, useState } from "react";
import { getYearList } from "./utils/helper";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { MultiSelect } from "../ui/multi-select";
import { useFetchGeoJson } from "@/hooks/alumni/useFetchGeoJson";
import { GeoJSONFeatureCollection } from "@/sdk";
import { Feature, Point, Position } from "geojson";
import { AlumniControllerFindAllGeoJSONGroupByEnum as GROUP_BY } from "@/sdk";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import SwitchFilter from "../ui/switchFilter";
import { useSearchParams } from "next/navigation";

export interface GeoJSONProperties {
  name: string[];
  students: number;
  totalAlumni: number;
  totalAlumniPrev: number;
  compareYearStudents: number | undefined;
  listLinkedinLinksByUser: { [key: string]: string };
  coursesYearConclusionByUser: { [key: string]: { [key: string]: string } };
  profilePics: { [key: string]: string };
  jobTitles: { [key: string]: string };
  companyNames: { [key: string]: string };
}

type props = {
  handleLoading: (loading: boolean) => void;
  onSelectGeoJSON: (geoJson: GeoJSONFeatureCollection) => void;
  onSelectAlumni: (name: string, coordinates: number[]) => void;
  yearUrl?: string;
  showTimeLine: boolean;
  setShowTimeLine: (show: boolean) => void;
  selectedYear?: number;
  setSelectedYear: (year?: number) => void;
  showCompareYear: boolean;
  setShowCompareYear: (show: boolean) => void;
  compareYear?: number;
  setCompareYear: (year?: number) => void;
};

export type AlumniInfo = {
  name: string;
  coordinates: number[];
  link: string;
  coursesYears: { [key: string]: string };
};

const MapFilters = ({
  handleLoading,
  onSelectGeoJSON,
  onSelectAlumni,
  showTimeLine,
  setShowTimeLine,
  selectedYear,
  setSelectedYear,
  showCompareYear,
  setShowCompareYear,
  compareYear,
  setCompareYear,
}: props) => {
  const { isCollapsed } = useNavbar();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(true);
  const { data: courses, isLoading: isLoadingCourses } = useListCourses({
    enabled: true,
  });
  const yearList = getYearList();

  /** Selectors & Filters **/
  // Search input
  const [searchInput, setSearchInput] = useState<string>("");
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  // Group by
  const [groupBy, setGroupBy] = useState<GROUP_BY>(GROUP_BY.Countries);
  // Conclusion years
  const [conclusionYears, setConclusionYears] = useState<number[]>([]);
  // Course
  const [courseIds, setCourseIds] = useState<string[]>([]);

  const [isInitialized, setIsInitialized] = useState(false);
  const {
    data: geoJson,
    refetch: refetchGeoJson,
    isLoading: isLoadingGeoJson,
  } = useFetchGeoJson({
    courseIds,
    conclusionYears,
    groupBy,
    selectedYear,
    compareYear,
    enabled: isInitialized,
  });

  // State variables
  const [cleanButtonEnabled, setCleanButtonEnabled] = useState(false);
  const [paramsCleaned, setParamsCleaned] = useState(false);

  const initializeFiltersFromURL = useCallback(() => {
    let hasProcessedYears = false;
    let hasProcessedCourses = false;

    if (searchParams.has("lat") || searchParams.has("lng")) {
      setGroupBy(GROUP_BY.Cities);
    }

    // Check for map-specific parameters that should enable the clean button immediately
    const hasMapParams =
      searchParams.has("lat") ||
      searchParams.has("lng") ||
      searchParams.has("name") ||
      searchParams.has("group_by");

    if (hasMapParams) {
      setCleanButtonEnabled(true);
    }

    const yearParam = searchParams.getAll("conclusion_year");
    if (yearParam.length) {
      const years = yearParam
        .flatMap((param) => param.split(","))
        .map((year) => Number(year.trim()))
        .filter(
          (year) =>
            !isNaN(year) && year > 1900 && year <= new Date().getFullYear()
        );
      if (years.length) {
        setConclusionYears(years);
      }
    }
    hasProcessedYears = true;

    const courseParam = searchParams.getAll("course");
    if (courseParam.length && courses?.length) {
      const courseMap = new Map(
        courses.map((c) => [c.acronym.toLowerCase(), c.id])
      );
      const courseIds = courseParam
        .flatMap((param) => param.split(","))
        .map((acronym) => acronym.toLowerCase().replace(/_/g, ".").trim())
        .map((acronym) => courseMap.get(acronym))
        .filter((id): id is string => id !== undefined);

      if (courseIds.length) {
        setCourseIds(courseIds);
      }
    }
    hasProcessedCourses = true;

    if (hasProcessedYears && hasProcessedCourses) {
      setIsInitialized(true);
    }
  }, [searchParams, courses]);

  useEffect(() => {
    initializeFiltersFromURL();
  }, [initializeFiltersFromURL]);

  const [hasUserChangedFilters, setHasUserChangedFilters] = useState(false);

  type FilterType = "conclusionYears" | "courseIds";
  type FilterValue = number[] | string[];

  const handleFilterChange = useCallback(
    (type: FilterType, value: FilterValue) => {
      setHasUserChangedFilters(true);
      switch (type) {
        case "conclusionYears":
          setConclusionYears(value as number[]);
          break;
        case "courseIds":
          setCourseIds(value as string[]);
          break;
      }
    },
    []
  );

  useEffect(() => {
    if (!isInitialized || !hasUserChangedFilters) return;

    const hasUrlParams =
      searchParams.has("lat") ||
      searchParams.has("lng") ||
      searchParams.has("name") ||
      searchParams.has("group_by");

    if (hasUrlParams) {
      clearUrlParams();
    }

    refetchGeoJson();
  }, [
    isInitialized,
    conclusionYears,
    courseIds,
    groupBy,
    hasUserChangedFilters,
  ]);

  useEffect(() => {
    if (!isInitialized) return;

    const hasFilters = conclusionYears.length > 0 || courseIds.length > 0;
    setCleanButtonEnabled(hasFilters);
    refetchGeoJson();
  }, [refetchGeoJson, conclusionYears.length, courseIds.length, isInitialized]);

  useEffect(() => {
    // Only show loading for geoJson updates
    handleLoading(isLoadingGeoJson);
  }, [isLoadingGeoJson, handleLoading]);

  // Panel state
  const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState<
    AlumniInfo[]
  >([]);
  const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] =
    useState<AlumniInfo[]>([]);
  const [alumniLength, setAlumniLength] = useState(0);

  // Use the data when it changes
  useEffect(() => {
    if (geoJson) {
      onSelectGeoJSON(geoJson);
    }
  }, [geoJson, onSelectGeoJSON]);

  // Handles the filtering of a selected alumni
  const handleAlumniSelection = (name: string, coordinates: Position) => {
    onSelectAlumni(name, coordinates);
  };

  // sets the variables to be used: nº of alumnis and an array with the info to be printed on the screen
  useEffect(() => {
    const fetchData = async () => {
      if (geoJson) {
        try {
          // Get the names with their LinkedIn links
          const namesLinkedinLinks = (
            geoJson.features as Feature<Point, GeoJSONProperties>[]
          ).flatMap((feature) => {
            const coordinates = feature.geometry.coordinates;
            return Object.entries(
              feature.properties.listLinkedinLinksByUser
            ).map(([link, name]) => ({
              name,
              link,
              coordinates,
            }));
          });

          // Get the courses data with the years of conclusion
          const namesCourseYears = (
            geoJson.features as Feature<Point, GeoJSONProperties>[]
          ).flatMap((feature) =>
            Object.entries(feature.properties.coursesYearConclusionByUser).map(
              ([linkedinLink, courseYears]) => ({
                linkedinLink,
                courseYears,
              })
            )
          );

          const alumniNamesWithCoords = namesLinkedinLinks.map((alumniInfo) => {
            // Find the corresponding courses data based on name
            const coursesData = namesCourseYears.find(
              (courseItem) => courseItem.linkedinLink === alumniInfo.link
            );
            return {
              name: alumniInfo.name,
              coordinates: alumniInfo.coordinates,
              link: alumniInfo.link,
              coursesYears: coursesData ? coursesData.courseYears : {},
            };
          });

          // Sort the alumni names alphabetically
          alumniNamesWithCoords.sort((a, b) => a.name.localeCompare(b.name));

          setListAlumniNamesWithCoordinates(alumniNamesWithCoords);
          setAlumniLength(alumniNamesWithCoords.length);
        } catch (error) {
          console.log("Attention! ", error);
        }
      } else {
        console.log("GeoJson not created");
      }
    };

    fetchData();
  }, [geoJson]);

  // Filter alumni names based on search input
  useEffect(() => {
    const normalizeString = (str: string) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, "");
    };

    if (listAlumniNamesWithCoordinates && searchInput.trim() !== "") {
      const normalizedSearchInput = normalizeString(searchInput.toLowerCase());
      const filteredNamesCoord = listAlumniNamesWithCoordinates.filter(
        (alumni) =>
          normalizeString(alumni.name.toLowerCase()).includes(
            normalizedSearchInput
          )
      );
      setFilteredAlumniNamesCoord(filteredNamesCoord);
    } else {
      setFilteredAlumniNamesCoord([]);
    }
  }, [listAlumniNamesWithCoordinates, searchInput]);

  const clearUrlParams = () => {
    if (paramsCleaned) return;

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("conclusion_year");
    urlParams.delete("course");
    window.history.replaceState(
      {},
      "",
      window.location.pathname +
        (urlParams.toString() ? "?" + urlParams.toString() : "")
    );
    setParamsCleaned(true);
  };

  const onClickClean = () => {
    // Reset the filters
    setGroupBy(GROUP_BY.Countries);
    setSearchInput("");
    setConclusionYears([]);
    setCourseIds([]);
    setSelectedYear(undefined);
    setShowCompareYear(false);
    setShowTimeLine(false);
    setCompareYear(undefined);

    // Reset alumni selection
    onSelectAlumni("", [-9.142685, 38.736946]);

    // Clear URL parameters if they exist
    clearUrlParams();

    // Only refetch if we have courses data
    if (courses) {
      // Use a slight delay to ensure state updates first
      setTimeout(() => {
        refetchGeoJson();
      }, 50);
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    const hasFilters =
      courseIds.length > 0 ||
      conclusionYears.length > 0 ||
      searchInput.trim() !== "" ||
      selectedYear !== undefined ||
      compareYear !== undefined;

    const hasUrlParams =
      searchParams.has("lat") ||
      searchParams.has("lng") ||
      searchParams.has("name") ||
      searchParams.has("group_by");
    setCleanButtonEnabled(hasFilters || hasUrlParams);
  }, [
    courseIds,
    conclusionYears,
    groupBy,
    searchInput,
    selectedYear,
    compareYear,
    searchParams,
  ]);

  const handleTimeLineCheckboxChange = () => {
    if (showTimeLine) {
      setShowTimeLine(false);
      setSelectedYear(undefined);
    } else {
      setShowTimeLine(true);
    }
  };

  const handleCompareYearCheckboxChange = () => {
    if (showCompareYear) {
      setShowCompareYear(false);
      setCompareYear(undefined);
    } else {
      setShowCompareYear(true);
    }
  };

  const handleGroupByChange = (value: GROUP_BY) => {
    setHasUserChangedFilters(true);
    setGroupBy(value);
  };

  return (
    <div
      className={cn(
        "fixed top-5 z-50 transition-all duration-300",
        isCollapsed ? "left-24" : "left-64",
        !isVisible && "pointer-events-none"
      )}
    >
      {/* Toggle Button Container */}
      <div
        onClick={toggleVisibility}
        className={cn(
          "bg-[#EDEDEC] rounded-md p-2 flex items-center justify-between gap-2 transition-all cursor-pointer duration-300 h-10",
          isVisible ? "rounded-b-none" : "hover:bg-[#E5E5E4]",
          !isVisible && "pointer-events-auto"
        )}
      >
        {
          <span className="text-[#A02D20] text-md font-medium px-2">
            Map Filters
          </span>
        }
        {!isVisible ? (
          <ChevronLeft className="text-[#A02D20] w-6 h-6 cursor-pointer hover:opacity-80" />
        ) : (
          <ChevronDown className="text-[#A02D20] w-6 h-6 cursor-pointer hover:opacity-80" />
        )}
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "bg-white rounded-b-lg shadow-lg overflow-hidden w-96 transition-all duration-300",
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Group By</h2>
        </div>

        {/* Group By Toggle */}
        <div className="flex">
          <div
            onClick={() => handleGroupByChange(GROUP_BY.Countries)}
            className={cn(
              "flex-1 text-center py-2 cursor-pointer",
              groupBy === GROUP_BY.Countries
                ? "bg-red-800 text-white"
                : "bg-gray-100 text-gray-900"
            )}
          >
            Countries
          </div>
          <div
            onClick={() => handleGroupByChange(GROUP_BY.Cities)}
            className={cn(
              "flex-1 text-center py-2 cursor-pointer",
              groupBy === GROUP_BY.Cities
                ? "bg-red-800 text-white"
                : "bg-gray-100 text-gray-900"
            )}
          >
            Cities
          </div>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Search</h3>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="By alumni name"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
          />
          {filteredAlumniNamesCoord.length > 0 && (
            <div
              className={`search-results ${
                filteredAlumniNamesCoord.length > 5 ? "scrollable" : ""
              }`}
            >
              {filteredAlumniNamesCoord.map((alumniData, index) => (
                <div
                  className="dropdown-search-names"
                  key={index}
                  onClick={() =>
                    handleAlumniSelection(
                      alumniData.name,
                      alumniData.coordinates
                    )
                  }
                >
                  {alumniData.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter</h3>

          {/* Course Dropdown */}
          <div className="mb-4">
            <MultiSelect
              options={
                Array.isArray(courses)
                  ? courses.map((course) => ({
                      label: course.acronym,
                      value: course.id,
                    }))
                  : []
              }
              onValueChange={(values) =>
                handleFilterChange("courseIds", values || [])
              }
              value={courseIds}
              placeholder={
                isLoadingCourses ? "Loading courses..." : "Select course"
              }
              variant="inverted"
              maxCount={4}
              disabled={isLoadingCourses || !Array.isArray(courses)}
              allowSelectAll={true}
            />
          </div>

          {/* Year Dropdown */}
          <div className="mb-4">
            <MultiSelect
              options={yearList.map((year) => ({
                label: year,
                value: year,
              }))}
              onValueChange={(values) =>
                handleFilterChange("conclusionYears", values.map(Number))
              }
              value={conclusionYears.map(String)}
              placeholder="Select conclusion year"
              variant="inverted"
              maxCount={4}
            />
          </div>

          {/* Time Line Checkbox */}
          <div className="mb-4">
            <Checkbox
              checked={showTimeLine}
              onCheckedChange={handleTimeLineCheckboxChange}
            />
            <Label className="text-lg font-semibold text-gray-800 ml-2">
              Time Line
            </Label>
          </div>

          {showTimeLine ? (
            <div className="flex items-center space-x-2">
              <SwitchFilter
                checked={showCompareYear}
                onChange={handleCompareYearCheckboxChange}
              />
              <Label className="font-bold">
                {showCompareYear ? "Range Selection" : "Single Year"}
              </Label>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onClickClean}
              disabled={!cleanButtonEnabled}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-white",
                !cleanButtonEnabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-600 hover:bg-gray-700"
              )}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-xl text-gray-600 font-bold">
            Total number of alumni: {alumniLength}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            *Data from LinkedIn profiles and SIGARRA
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
