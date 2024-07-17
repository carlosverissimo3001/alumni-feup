/**
* This class is responsible for managing the inputs, and generating the geoJson based on them. It also transmits these informations
* to the MapCmp, which then redirects the needed ones to the Map View.js 
*/

import React, {useEffect, useState} from 'react';
import setUp from '../helpers/setUp';
import Helper from '../helpers/helper';
import { TiDelete } from "react-icons/ti";
import { FaCheckCircle } from "react-icons/fa";

const MenuButtons = ({menuVisible, onLoading, onSelectGeoJSON, onSelectAlumni, yearUrl}) => {
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1994 + 1 }, (_, i) => 1994 + i).reverse();
    const courses = ['LEIC', 'L.EIC', 'MEI', 'M.EIC', 'MIEIC'];

    const [selectedOption, setSelectedOption] = useState('');
    const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState([]);
    const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [filterCourseInput, setFilterCourseInput] = useState('');
    const [numberAlumnisShowing, setNumberAlumnisShowing] = useState(0);
    const [yearFilter, setYearFilter] = useState(['','']);
    const [loading, setLoading] = useState(true);                          // Loading state, if true: loading if false: not loading
    const [yearUrlReceived, setYearUrlReceived] = useState(true);          // Used to avoid the useEffect that calls the onClickApply to enter into a loop
    const [firstEffectComplete, setFirstEffectComplete] = useState(false); // Used to wait for the useEffect that reads the year on the link to finish
    const [applyButtonDisabled, setApplyButtonDisabled] = useState(true);  // Defines if the Apply and Clear button are enabled or disabled
    const [locationGeoJSON, setLocationGeoJSON] = useState(null);          // Stores the geoJson file to be used in the world map

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

    // Handles changes in the year input 
    const handleYearChange = (index, value) => {
        const newYearFilter = [...yearFilter];
        newYearFilter[index] = value;
        setYearFilter(newYearFilter);
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
        setLoading(true);           // data is being updated
        setSelectedOption("");      // this will then call the onClickApply("", ["", ""]); which is responsible for regenerating the geoJson
        setSearchInput("");         // cleans the search alumni input 
        onSelectAlumni("", [0,0]);  // positions the user in the middle of the screen
        setYearFilter(['', '']);    // cleans the year filter field
        setFilterCourseInput("");   // cleans the search user input
        // Waits a bit before setting the load to false so that the code has time to update the locationGeoJson on the MapCmp.js
        await new Promise(resolve => setTimeout(resolve, 4000));
        setLoading(false);          // data is ready
    }

    return (
        <>
            { menuVisible && (
              <>
                <p className='text text-distribution'>See alumni distribution across:</p>
                <div className="radio-buttons">
                    <input
                        type="radio"
                        id="countriesCheckbox"
                        value="countries"
                        checked={selectedOption === 'countries'}
                        onChange={handleCheckboxChange}
                        className="custom-radio"
                    />
                    <label htmlFor="countriesCheckbox" className="custom-radio-label custom-radio-label-left-button">Countries</label>
                    <input
                        type="radio"
                        id="citiesCheckbox"
                        value="cities"
                        checked={selectedOption === 'cities'}
                        onChange={handleCheckboxChange}
                        className="custom-radio"
                    />
                    <label htmlFor="citiesCheckbox" className="custom-radio-label custom-radio-label-right-button">Cities</label>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search alumni..."
                        value={searchInput}
                        className='search-bar-alumni search-bar'
                        onChange={handleSearchInputChange}
                    />
                    {filteredAlumniNamesCoord.length > 0 && (
                        <div className={`search-results ${filteredAlumniNamesCoord.length > 5 ? 'scrollable' : ''}`}>
                        {filteredAlumniNamesCoord.map((alumniData, index) => (
                            <div  className='dropdown-search-names' key={index} onClick={() => handleAlumniSelection(alumniData.name, alumniData.coordinates)}>
                                {alumniData.name}
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                <div className="search-container"> 
                    <select 
                    className='filter-course-alumni search-bar' 
                    id="myDropdown"
                    value={filterCourseInput}
                    onChange={handleFilterCourseInputChange}>
                        <option className="content-filter-course" value="">Filter by course</option>
                        {courses.map((course, index) => (
                            <option className="content-filter-options" key={index} value={course} >
                                {course}
                            </option>
                        ))}
                    </select>
                </div>

                <p className='text text-conclusion-year'>Conclusion year:</p>

                <div className="year-filter-container"> 
                    <div className='search-container-year'>
                        <select 
                            className='search-bar' 
                            id="myDropdownYearFrom"
                            value={yearFilter[0]}
                            onChange={e => handleYearChange(0, e.target.value)}>
                                <option value="" >From</option>
                                {years.map((year) => (
                                    <option className="content-filter-options" key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className='search-container-year'>
                        <select 
                            className='search-bar' 
                            id="myDropdownYearTo"
                            value={yearFilter[1]}
                            onChange={e => handleYearChange(1, e.target.value)}>
                                <option value="" >To</option>
                                {years.filter((year) => year > yearFilter[0]).map((year) => (
                                    <option className="content-filter-options" key={year} value={year}>{year}</option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className='button-container'>
                    <div className='button-group'>
                        <FaCheckCircle 
                            className={`icon-apply ${applyButtonDisabled ? 'disabled' : ''}`} 
                            onClick={() => !applyButtonDisabled && onClickApply(filterCourseInput, yearFilter)}
                        />
                        <span 
                            className={`forms-button ${applyButtonDisabled ? 'disabled' : ''}`}
                            onClick={() => !applyButtonDisabled && onClickApply(filterCourseInput, yearFilter)}
                        > 
                            Apply 
                        </span>
                    </div>
                    <div className='button-group'>
                        <TiDelete 
                            className={`icon-delete ${applyButtonDisabled ? 'disabled' : ''}`}
                            onClick={() => !applyButtonDisabled && onClickClean()}
                        />
                        <span 
                            className={`forms-button ${applyButtonDisabled ? 'disabled' : ''}`}
                            onClick={() => !applyButtonDisabled && onClickClean()}
                        >
                            Clear 
                        </span> 
                    </div>
                </div>

                <div className='alumnis-total-number'>
                    <p className='letter-style text-num-alumnus'>Total number of alumni: </p> 
                    <p className='letter-style text-num-alumnus'>{numberAlumnisShowing}</p>
                </div>

                <a className="text feedback-links" href="https://docs.google.com/forms/d/e/1FAIpQLScPMdQzqv9Dy1llc-nGdr33q33r7GnSZjmYtxwwT1v_oy3Y7Q/viewform" target="_blank" rel="noopener noreferrer">Join us</a>
                <a className="text feedback-links" href="https://forms.gle/iNQ8mrakT9ToZcLT7" target="_blank" rel="noopener noreferrer">Give Feedback</a>
            
              </>
            )}
        </>
    );
};

export default MenuButtons;
