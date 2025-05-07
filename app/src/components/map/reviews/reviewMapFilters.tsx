import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { useFetchGeoJson } from "@/hooks/alumni/useFetchGeoJson";
import { GeoJSONFeatureCollection } from "@/sdk";
import { Feature, Point } from 'geojson';
import { AlumniControllerFindAllGeoJSONGroupByEnum as GROUP_BY } from "@/sdk";
import { useFetchReviewGeoJson } from "@/hooks/reviews/useFetchReviewGeoJson";
import { Select } from "@/components/ui/select";
import { ReviewGeoJSONProperties } from "@/types/review";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";


type props = {
  handleLoading: (loading: boolean) => void;
  onSelectGeoJSON: (geoJson: GeoJSONFeatureCollection) => void;
  onSelectReview: (id: string, coordinates: number[]) => void;
  yearUrl?: string;
};

export type AlumniInfo = {
  name: string;
  coordinates: number[];
  reviewId: string;
}

const ReviewMapFilters = ({
  handleLoading,
  onSelectGeoJSON,
  onSelectReview,
}: props) => {
  // Global navbar state
  const { isCollapsed } = useNavbar();

  // Panel state
  const [isVisible, setIsVisible] = useState(true);


  const reviewTypes = ['Company', 'Location'];
  
  /** Selectors & Filters **/
  // Search input
  const [searchInput, setSearchInput] = useState<string>("");
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  // Group by
  const [groupBy, setGroupBy] = useState<GROUP_BY>(GROUP_BY.Countries);

  const [reviewType, setReviewType] = useState<string>('');

  const [reviewTypesTemp, setReviewTypesTemp] = useState<string[]>([]);
  
  const { data: geoJson, refetch: refetchGeoJson, isLoading: isLoadingGeoJson } = useFetchReviewGeoJson({
    groupBy,
    //reviewType
    //reviewType[0],
  });

  // State variables
  const [cleanButtonEnabled, setCleanButtonEnabled] = useState(false)
  const [paramsCleaned, setParamsCleaned] = useState(false)

  const [hadYear, setHadYear] = useState(false)

  useEffect(() => {
    // Only show loading for geoJson updates
    handleLoading(isLoadingGeoJson);
  }, [isLoadingGeoJson, handleLoading]);

  // Panel state
  const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState<AlumniInfo[]>([]);
  const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] =
    useState<AlumniInfo[]>([]);
  const [alumniLength, setAlumniLength] = useState(0);

  // Use the data when it changes
  useEffect(() => {
    if (geoJson) {
      onSelectGeoJSON(geoJson);
    }
  }, [geoJson, onSelectGeoJSON]);

  // sets the variables to be used: nº of alumnis and an array with the info to be printed on the screen
  useEffect(() => {
    const fetchData = async () => {
      if (geoJson) {
        try {
          // Get the names with their LinkedIn links
          const namesLinkedinLinks = (geoJson.features as Feature<Point, ReviewGeoJSONProperties>[]).flatMap(
            (feature) => {
              const coordinates = feature.geometry.coordinates;
              return Object.entries(feature.properties.alumniNames)
                .map(([reviewId, name]) => ({
                  name,
                  reviewId,
                  coordinates,
                }));
            }
          );

          const alumniNamesWithCoords = namesLinkedinLinks.map((alumniInfo) => {
            return {
              name: alumniInfo.name,
              coordinates: alumniInfo.coordinates,
              reviewId: alumniInfo.reviewId,
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

 
  const onClickClean = () => {
    // Reset the filters
    setGroupBy(GROUP_BY.Countries);
    setSearchInput("");
    setReviewType('');
    
    // Reset alumni selection
    onSelectReview("", [-9.142685, 38.736946]);

    clearUrlParams();
  };

  const clearUrlParams = () => {
    if (paramsCleaned || !hadYear) 
      return;
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('year');
    urlParams.delete('course');
    window.history.replaceState({}, '', window.location.pathname + '?' + urlParams.toString());
    setParamsCleaned(true);
  }

  const toggleVisibility = () => setIsVisible(!isVisible);

//   useEffect(() => {
//     // Button is enabled if any filter has a value
//     const hasFilters = 
//       searchInput.trim() !== '' ||
//       reviewType !== undefined ||

//     setCleanButtonEnabled(hasFilters);
//   }, [groupBy, searchInput, reviewType]);

// const setReviewTypesTemp = (value: string[]) => {
//     setReviewType(value[0]);
// }


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
        { (
          <span className="text-[#A02D20] text-md font-medium px-2">
            Review Filters
          </span>
        )}
        { !isVisible ? 
        (
          <ChevronLeft className="text-[#A02D20] w-6 h-6 cursor-pointer hover:opacity-80" />
        ) :
        (
          <ChevronDown className="text-[#A02D20] w-6 h-6 cursor-pointer hover:opacity-80" />
        )
      }
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
            onClick={() => setGroupBy(GROUP_BY.Countries)}
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
            onClick={() => setGroupBy(GROUP_BY.Cities)}
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
        </div>

        {/* Filter Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter</h3>

          {/* Year Dropdown
          <div className="mb-4">
                <Select
                onValueChange={(value) => setReviewType(value)}
                defaultValue={reviewTypes[0]}
                name="type"
            />
          </div> */}

          {/* Year Dropdown */}
          <div className="mb-4">
            <MultiSelect
              options={reviewTypes.map((review) => ({
                label: review,
                value: review,
              }))}
              onValueChange={(values) => setReviewTypesTemp(values)}
              value={reviewTypesTemp.map(String)}
              placeholder="Select conclusion year"
              variant="inverted"
              maxCount={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
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

export default ReviewMapFilters;