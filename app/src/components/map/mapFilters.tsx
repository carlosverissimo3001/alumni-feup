/**
 * This class is responsible for managing the inputs, and generating the geoJson based on them. It also transmits these informations
 * to the MapCmp, which then redirects the needed ones to the Map View.js
 */

import React, { useEffect, useState } from "react";
import setUp from "./helper/setup";
import Helper from "./helper/helper";
import { ChevronDown, ChevronUp, FilterIcon, XCircleIcon } from "lucide-react";
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { Course } from "@/consts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

type props = {
  onLoading: (loading: boolean) => void;
  onSelectGeoJSON: (geoJson: GeoJSON.FeatureCollection) => void;
  onSelectAlumni: (name: string, coordinates: number[]) => void;
  yearUrl: string;
};

const MapFilters = ({
  onLoading,
  onSelectGeoJSON,
  onSelectAlumni,
  yearUrl,
}: props) => {
  const { isCollapsed } = useNavbar();
  const [isVisible, setIsVisible] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1994 + 1 },
    (_, i) => currentYear - i
  );

  const courses = Object.values(Course);

  const [selectedOption, setSelectedOption] = useState("");
  const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState([]);
  const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] =
    useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterCourseInput, setFilterCourseInput] = useState("");
  const [numberAlumnisShowing, setNumberAlumnisShowing] = useState(0);
  const [yearFilter, setYearFilter] = useState(""); // Changed from array to single string
  const [loading, setLoading] = useState(true); // Loading state, if true: loading if false: not loading
  const [yearUrlReceived, setYearUrlReceived] = useState(true); // Used to avoid the useEffect that calls the onClickApply to enter into a loop
  const [firstEffectComplete, setFirstEffectComplete] = useState(false); // Used to wait for the useEffect that reads the year on the link to finish
  const [applyButtonDisabled, setApplyButtonDisabled] = useState(true); // Defines if the Apply and Clear button are enabled or disabled
  const [locationGeoJSON, setLocationGeoJSON] = useState(null); // Stores the geoJson file to be used in the world map

  useEffect(() => {
    setSelectedOption("countries");
    setApplyButtonDisabled(false); // enable the apply button when an option is selected
  }, []);

  // Reads the year parameter on the URL
  useEffect(() => {
    const fetchData = async () => {
      if (yearUrl && yearUrlReceived) {
        setSelectedOption("countries");
        setYearFilter(yearUrl);
        setYearUrlReceived(true);
      }
      setFirstEffectComplete(true);
    };
    fetchData();
  }, [yearUrl, yearUrlReceived]);

  // When selected option changes to "" which happens on Clear button or when a reload page happens
  useEffect(() => {
    if (!firstEffectComplete) return; // waits for the useEffect that reads the year on the link to finish

    const fetchData = async () => {
      if (selectedOption === "" && !yearUrlReceived) {
        onClickApply("", "");
      } else if (yearUrlReceived) {
        onClickApply(filterCourseInput, yearFilter);
        setYearUrlReceived(false);
      }

      // Waits a bit before setting the load to false so that the code has time to update the locationGeoJson on the MapCmp.js
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false); // Data is ready
    };

    fetchData();
  }, [firstEffectComplete, selectedOption, yearUrlReceived]);

  // Handles changes on the load
  useEffect(() => {
    onLoading(loading);
  }, [loading, onLoading]);

  // sets the variables to be used: nº of alumnis and an array with the info to be printed on the screen
  useEffect(() => {
    const fetchData = async () => {
      if (locationGeoJSON) {
        try {
          // Get the names with their LinkedIn links
          const namesLinkedinLinks = locationGeoJSON.features.flatMap(
            (feature) => {
              const coordinates = feature.geometry.coordinates; // Get coordinates
              return Object.entries(
                feature.properties.listLinkedinLinksByUser
              ).map(([link, name]) => ({
                name,
                link,
                coordinates,
              }));
            }
          );

          // Get the courses data with the years of conclusion
          const namesCourseYears = locationGeoJSON.features.flatMap((feature) =>
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
          setNumberAlumnisShowing(alumniNamesWithCoords.length);
        } catch (error) {
          console.log("Attention! ", error);
        }
        onSelectGeoJSON(locationGeoJSON);
      } else {
        console.log("GeoJson not created");
      }
    };

    fetchData();
  }, [locationGeoJSON]);

  // Filter alumni names based on search input
  useEffect(() => {
    const normalizeString = (str) => {
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

  // Handles changes in the search input
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handles the filtering of a selected alumni
  const handleAlumniSelection = (name, coordinates) => {
    onSelectAlumni(name, coordinates);
  };

  // Function to handle checkbox selection
  const handleCheckboxChange = (event) => {
    setSelectedOption(event.target.value);
    setApplyButtonDisabled(false); // enable the apply button when an option is selected
  };

  // Applies the values inserted in the fields and generates a new geoJson
  const onClickApply = async (courseFilter: string, yearFilter: string) => {
    setLoading(true);
    var locationGeoJsonBlob = await setUp.fetchGeoJson(
      courseFilter,
      [yearFilter, yearFilter],
      selectedOption
    );
    var locationGeoJsonGeoJSON = await Helper.convertBlobToGeoJSON(
      locationGeoJsonBlob
    );
    setLocationGeoJSON(locationGeoJsonGeoJSON);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setLoading(false);
  };

  // Cleans the values inserted in the fields
  const onClickClean = async () => {
    setApplyButtonDisabled(true);
    setLoading(true);
    setSelectedOption("");
    setSearchInput("");
    onSelectAlumni("", [-9.142685, 38.736946]);
    setYearFilter("");
    setFilterCourseInput("");
    await new Promise((resolve) => setTimeout(resolve, 4000));
    setLoading(false);
  };

  // Add toggle function
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className={cn(
      "fixed top-5 z-50 transition-all duration-300",
      isCollapsed ? "left-24" : "left-64"
    )}>
      {/* Toggle Button Container */}
      <div onClick={toggleVisibility} className={cn(
        "bg-[#EDEDEC] rounded-md p-2 flex items-center justify-between gap-2 transition-all cursor-pointer duration-300 h-10",
        isVisible ? "rounded-b-none" : "hover:bg-[#E5E5E4] "
      )}>
        {/* Show a label when menu is collapsed */}
        {!isVisible && (
          <span className="text-[#A02D20] text-sm font-medium px-2">
            Map Filters
          </span>
        )}
        {!isVisible && (
          <FilterIcon className="text-[#A02D20] w-6 h-6 cursor-pointer hover:opacity-80" /> 
        )}
      </div>

      {/* Main Content */}
      <div className={cn(
        "bg-white rounded-b-lg shadow-lg overflow-hidden w-80 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Group By</h2>
        </div>

        {/* Group By Toggle */}
        <div className="flex border-b">
          <Button
            onClick={() => handleCheckboxChange({ target: { value: "countries" } })}
            variant="ghost"
            className={cn(
              "flex-1 rounded-none border-0",
              selectedOption === "countries"
                ? "bg-red-800 text-white hover:bg-red-800"
                : "bg-transparent text-gray-900 hover:bg-gray-100"
            )}
          >
            Countries
          </Button>
          <Button
            onClick={() => handleCheckboxChange({ target: { value: "cities" } })}
            variant="ghost"
            className={cn(
              "flex-1 rounded-none border-0",
              selectedOption === "cities"
                ? "bg-red-800 text-white hover:bg-red-800"
                : "bg-transparent text-gray-900 hover:bg-gray-100"
            )}
          >
            Cities
          </Button>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b">
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
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter</h3>

          {/* Course Dropdown */}
          <div className="mb-4">
            <Select
              value={filterCourseInput}
              onValueChange={setFilterCourseInput}
            >
              <SelectTrigger>
                <SelectValue placeholder="By course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Dropdown */}
          <div className="mb-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="By conclusion year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onClickApply(filterCourseInput, yearFilter)}
              disabled={applyButtonDisabled}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-white flex items-center justify-center gap-2",
                applyButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-800 hover:bg-red-900"
              )}
            >
              Apply
            </Button>
            <Button
              onClick={onClickClean}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">
            Total number of alumni: {numberAlumnisShowing}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            *Data from LinkedIn profiles and Sigarra
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
