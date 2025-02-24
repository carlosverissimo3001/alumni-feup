/**
* This class is responsible for managing the inputs, and generating the geoJson based on them. It also transmits these informations
* to the MapCmp, which then redirects the needed ones to the Map View.js 
*/

import React, {useEffect, useState} from 'react';
import setUp from './helper/setup';
import Helper from './helper/helper';
import { Delete } from "lucide-react";
import { Check } from "lucide-react";

const MenuButtons = ({menuVisible, onLoading, onSelectGeoJSON, onSelectAlumni, yearUrl}) => {
       
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1994 + 1 }, (_, i) => 1994 + i);
    const yearRanges = years.map((year, index) => 
        index < years.length - 1 ? `${years[index]}/${years[index + 1]}` : null
    ).filter(Boolean).reverse(); // Reverse the array to get ranges in descending order

    const courses = ['LEIC', 'L.EIC', 'MEI', 'M.EIC', 'MIEIC'];

    const [selectedOption, setSelectedOption] = useState('');
    const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState([]);
    const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [filterCourseInput, setFilterCourseInput] = useState('');
    const [numberAlumnisShowing, setNumberAlumnisShowing] = useState(0);
    const [yearFilter, setYearFilter] = useState(['','']);
    const [yearRangeFilter, setYearRangeFilter] = useState('');
    const [loading, setLoading] = useState(true);                          // Loading state, if true: loading if false: not loading
    const [yearUrlReceived, setYearUrlReceived] = useState(true);          // Used to avoid the useEffect that calls the onClickApply to enter into a loop
    const [firstEffectComplete, setFirstEffectComplete] = useState(false); // Used to wait for the useEffect that reads the year on the link to finish
    const [applyButtonDisabled, setApplyButtonDisabled] = useState(true);  // Defines if the Apply and Clear button are enabled or disabled
    const [locationGeoJSON, setLocationGeoJSON] = useState(null);          // Stores the geoJson file to be used in the world map

    useEffect(() => {
        setSelectedOption("countries");
        setApplyButtonDisabled(false); // enable the apply button when an option is selected
    }, []);

    // Reads the year parameter on the URL
    useEffect(() => {
        const fetchData = async () => {
            if (yearUrl && yearUrlReceived) {
                setSelectedOption("countries");
                setYearFilter([yearUrl, yearUrl]);   
                setYearUrlReceived(true);
            }
            setFirstEffectComplete(true);
        }
        fetchData();
    }, [yearUrl, yearUrlReceived]);
    
    // When selected option changes to "" which happens on Clear button or when a reload page happens
    useEffect(() => {
        if (!firstEffectComplete) return; // waits for the useEffect that reads the year on the link to finish

        const fetchData = async () => {
            if (selectedOption === ""  && !yearUrlReceived) {
                onClickApply("", ["", ""]);
            } 
            else if (yearUrlReceived) {
                onClickApply(filterCourseInput, yearFilter);
                setYearUrlReceived(false);
            } 

            // Waits a bit before setting the load to false so that the code has time to update the locationGeoJson on the MapCmp.js
            await new Promise(resolve => setTimeout(resolve, 3000));
            setLoading(false); // Data is ready
        }

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
                    const namesLinkedinLinks = locationGeoJSON.features.flatMap((feature) => {
                        const coordinates = feature.geometry.coordinates; // Get coordinates
                        return Object.entries(feature.properties.listLinkedinLinksByUser).map(([link, name]) => ({
                            name,
                            link,
                            coordinates,
                        }));
                    });
    
                    // Get the courses data with the years of conclusion
                    const namesCourseYears = locationGeoJSON.features.flatMap((feature) => 
                        Object.entries(feature.properties.coursesYearConclusionByUser).map(([linkedinLink, courseYears]) => ({
                            linkedinLink,
                            courseYears,
                        }))
                    );
    
                    const alumniNamesWithCoords = namesLinkedinLinks.map((alumniInfo) => { 
                        // Find the corresponding courses data based on name
                        const coursesData = namesCourseYears.find((courseItem) => courseItem.linkedinLink === alumniInfo.link);
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
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, '');
        };

        if (listAlumniNamesWithCoordinates && searchInput.trim() !== '') {
            const normalizedSearchInput = normalizeString(searchInput.toLowerCase());
            const filteredNamesCoord = listAlumniNamesWithCoordinates.filter(alumni => 
                normalizeString(alumni.name.toLowerCase()).includes(normalizedSearchInput)
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

    // Handles changes in the filter course input
    const handleFilterCourseInputChange = (e) => {
        setFilterCourseInput(e.target.value);
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

    const handleYearRangeChange = (value) => {
        const splitYearsRange = value.split("/"); // 2017/2018
        const newYearFilter = [...yearFilter];
        newYearFilter[0] = splitYearsRange[0]; // 2017
        newYearFilter[1] = splitYearsRange[1]; // 2018
        setYearFilter(newYearFilter);
        setYearRangeFilter(value);
    };


    // Applies the values inserted in the fields and generates a new geoJson
    const onClickApply = async (courseFilter, yearsConclusionFilters) => {
        setLoading(true); // Data is being updated

        // Receives the blob with the required filters
        var locationGeoJsonBlob = await setUp.fetchGeoJson(courseFilter, yearsConclusionFilters, selectedOption);
        // Converts the blob to geoJson
        var locationGeoJsonGeoJSON = await Helper.convertBlobToGeoJSON(locationGeoJsonBlob);

        setLocationGeoJSON(locationGeoJsonGeoJSON);

        // Waits a bit before setting the load to false so that the code has time to update the locationGeoJson on the MapCmp.js
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoading(false); // Data is ready
    }

    // Cleans the values inserted in the fields
    const onClickClean = async () => {
        setApplyButtonDisabled(true);
        setLoading(true);                            // data is being updated
        setSelectedOption("");                       // this will then call the onClickApply("", ["", ""]); which is responsible for regenerating the geoJson
        setSearchInput("");                          // cleans the search alumni input 
        onSelectAlumni("", [-9.142685, 38.736946]);  // positions the user in Portugal 
        setYearFilter(['', '']);                     // cleans the year filter field
        setYearRangeFilter('');
        setFilterCourseInput("");                    // cleans the search user input
        // Waits a bit before setting the load to false so that the code has time to update the locationGeoJson on the MapCmp.js
        await new Promise(resolve => setTimeout(resolve, 4000));
        setLoading(false);                           // data is ready
    }

    return (
        <div className="absolute top-4 left-20 bg-red-500 p-4 z-50">
            <button 
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => console.log("Button clicked")}
            >
                Test Button
            </button>
            {menuVisible && (
                <div>Menu is visible</div>
            )}
        </div>
    );
};

export default MenuButtons;
