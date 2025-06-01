import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronDown, CalendarIcon, Star } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { GeoJSONFeatureCollection, AlumniControllerFindAllGeoJSONGroupByEnum as GROUP_BY } from "@/sdk";
import { useFetchReviewGeoJson } from "@/hooks/reviews/useFetchReviewGeoJson";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


type props = {
  handleLoading: (loading: boolean) => void;
  onSelectGeoJSON: (geoJson: GeoJSONFeatureCollection) => void;
  onSelectReview: (id: string, coordinates: number[]) => void;
  sortBy: 'most' | 'least' | null;
  setSortBy: (sortBy: 'most' | 'least' | null) => void;
  scoreFetch: boolean;
  setScoreFetch: (upvoteFetch: boolean) => void;
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
  scoreFetch,
  setScoreFetch,
  sortBy,
  setSortBy
}: props) => {
  // Global navbar state
  const { isCollapsed } = useNavbar();

  // Panel state
  const [isVisible, setIsVisible] = useState(true);

  // Filter states
  const [reviewType, setReviewType] = useState<string | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  // Group by
  const [groupBy, setGroupBy] = useState<GROUP_BY>(GROUP_BY.Countries);

  const { data: geoJson, refetch: refetchGeoJson, isLoading: isLoadingGeoJson } = useFetchReviewGeoJson({
    groupBy,
    reviewType: reviewType ?? undefined,
    rating: rating ?? undefined,
    dateFrom: dateRange.from ?? undefined,
    dateTo: dateRange.to ?? undefined,
  });

  // State variables
  const [cleanButtonEnabled, setCleanButtonEnabled] = useState(false)
  const [paramsCleaned, setParamsCleaned] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hadYear, setHadYear] = useState(false)

  useEffect(() => {
    // Only show loading for geoJson updates
    handleLoading(isLoadingGeoJson);
  }, [isLoadingGeoJson, handleLoading]);

  useEffect(() => {
    if(scoreFetch) {
      refetchGeoJson();
      setScoreFetch(false);
    }
  }, [scoreFetch, refetchGeoJson, setScoreFetch]);

  // Use the data when it changes
  useEffect(() => {
    if (geoJson) {
      onSelectGeoJSON(geoJson);
    }
  }, [geoJson, onSelectGeoJSON]);


  useEffect(() => {
    const hasFilters =
      reviewType != null ||
      rating != null ||
      dateRange.from != undefined ||
      dateRange.to != undefined ||
      sortBy != null;

    setCleanButtonEnabled(hasFilters);
  }, [
    reviewType,
    rating,
    groupBy,
    dateRange,
    sortBy,
  ]);
 
  const onClickClean = () => {
    // Reset the filters
    setGroupBy(GROUP_BY.Countries);
    setReviewType(null)
    setRating(null)
    setDateRange({ from: undefined, to: undefined })
    setSortBy(null)
    
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
        <div className="p-4 border-b">
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

        <div className="container mx-auto py-8 px-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Review Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {reviewType || "Review Type"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 ml-10">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setReviewType("Company")}>Company</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReviewType("Location")}>Location</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rating Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {rating !== null ? `${rating} Star${rating !== 1 ? "s" : ""}` : "Rating"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 ml-10">
              <DropdownMenuLabel>Filter by rating</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <DropdownMenuItem key={rating} onClick={() => setRating(rating)}>
                    <div className="flex items-center">
                      {Array(rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary mr-0.5" />
                        ))}
                      {Array(5 - rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-muted-foreground mr-0.5" />
                        ))}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd LLL")} - {format(dateRange.to, "dd LLL")}
                    </>
                  ) : (
                    format(dateRange.from, "dd LLL, y")
                  )
                ) : (
                  "Date Range"
                )}
                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Sort by votes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
              {sortBy === "most" ? "Most Voted" 
              : sortBy === "least" ? "Least Voted" : "Sort by Votes"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 ml-10">
              <DropdownMenuLabel>Sort by votes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSortBy("most")}>Most Voted</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("least")}>Least Voted</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active filters */}
        {(reviewType || rating !== null || dateRange.from || sortBy !== null) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {reviewType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {reviewType}
                <button className="ml-1 hover:bg-muted rounded-full" onClick={() => setReviewType(null)}>
                  <span className="sr-only">Remove type filter</span>×
                </button>
              </Badge>
            )}
            {rating !== null && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: {rating} Star{rating !== 1 ? "s" : ""}
                <button className="ml-1 hover:bg-muted rounded-full" onClick={() => setRating(null)}>
                  <span className="sr-only">Remove rating filter</span>×
                </button>
              </Badge>
            )}
            {dateRange.from && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Date: {format(dateRange.from, "LLL dd, y")}
                {dateRange.to && ` - ${format(dateRange.to, "LLL dd, y")}`}
                <button
                  className="ml-1 hover:bg-muted rounded-full"
                  onClick={() => setDateRange({ from: undefined, to: undefined })}
                >
                  <span className="sr-only">Remove date filter</span>×
                </button>
              </Badge>
            )}
            {sortBy !== null && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {sortBy === "most" ? "Most" : "Least"} Voted
                <button className="ml-1 hover:bg-muted rounded-full" onClick={() => setSortBy(null)}>
                  <span className="sr-only">Remove sort filter</span>×
                </button>
              </Badge>
            )}
          </div>
        )}

      </div>
      
          <div className="flex translate-x-1/2 left-1/2 gap-2 w-1/2 mb-5 mt-5">
            <Button
              onClick={onClickClean}
              disabled={!cleanButtonEnabled}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-white place-items-center",
                !cleanButtonEnabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-600 hover:bg-gray-700"
              )}
            >
              Clear
            </Button>
          </div>
      </div>
    </div>
  );
};

export default ReviewMapFilters;
