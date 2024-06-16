/**
* This class is responsible for managing the inputs, and generating the geoJson based on them. It also transmits these informations
* to the MapCmp, which then redirects the needed ones to the Map View.js 
*/

import React, {useEffect, useState} from 'react';
import setUp from '../helpers/setUp';
import Helper from '../helpers/helper';
import ApiDataAnalysis from '../helpers/apiDataAnalysis';
import locationGeoJSON from '../locationGeoJSON.json';
import { TiDelete } from "react-icons/ti";
import { FaCheckCircle } from "react-icons/fa";

const MenuButtons = ({onLoading, onSelectGeoJSON, onSelectAlumni, yearUrl}) => {
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => 1920 + i).reverse();
    const courses = ['LEIC', 'L.EIC', 'MEI', 'M.EIC', 'MIEIC'];

    const [file, setFile] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState([]);
    const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [filterCourseInput, setFilterCourseInput] = useState('');
    const [loadingJson, setLoadingJson] = useState(true);
    const [numberAlumnisShowing, setNumberAlumnisShowing] = useState(0);
    const [yearFilter, setYearFilter] = useState(['','']);
    const [geoCreated, setGeoCreated] = useState(true); // Inidicates if the geoJson has been created or not
    const [loading, setLoading] = useState(true); // Loading state, if true: loading if false: not loading
    const [yearUrlReceived, setYearUrlReceived] = useState(true); // used to avoid the useEffect that calls the onClickApply to enter into a loop
    const [firstEffectComplete, setFirstEffectComplete] = useState(false); // used to wait for the useEffect that reads the year on the link to finish

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
            onSelectGeoJSON(locationGeoJSON); 

            // Waits a bit before setting the load to false so that the code has time to update the locationGeoJson on the MapCmp.js
            await new Promise(resolve => setTimeout(resolve, 3000));
            setLoading(false); // Data is ready
        }

        fetchData();                 
    }, [firstEffectComplete, selectedOption, filterCourseInput, yearFilter, yearUrlReceived]);

    // Handles changes on the load
    useEffect(() => {
        onLoading(loading);
    }, [loading, onLoading]);

    // sets the variables to be used: nº of alumnis and an array with the info to be printed on the screen
    useEffect(() => {
        const fetchData = async () => {
            if (geoCreated) {
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
    
                    setListAlumniNamesWithCoordinates(alumniNamesWithCoords);
                    setNumberAlumnisShowing(alumniNamesWithCoords.length);
                } catch (error) {
                    console.log("Attention! ", error);
                }
            } else {
                console.log("GeoJson not created");
            }
        };
    
        fetchData();
    }, [geoCreated]);

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
        setGeoCreated(false);
        await setUp.generateGeoJson(courseFilter, yearsConclusionFilters, selectedOption);
        setGeoCreated(true);
        // Waits a bit before setting the load to false so that the code has time to update the locationGeoJson on the MapCmp.js
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoading(false); // Data is ready
    }

    // Cleans the values inserted in the fields
    const onClickClean = async () => {
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

    const handleCourseSelection = async (courseAbreviation) => {
        setFilterCourseInput(courseAbreviation);
    }

    const handleFromYearSelection = async (year) => {
        yearFilter[0] = year;
    }

    const handleToYearSelection = async (year) => {
        yearFilter[1] = year;
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // By calling the API to scrape information: populates the alumni table
    //                                           stores the information in a file
    //                                           uploades the profile pics to the folder: "C:/alimniProject/backend/src/main/java/com/feupAlumni/alumniFEUP/Images"
    // The name of the profile pics is set to the public identifier of the user, wich is retrieved by the API
    // Also stores the information in a backup file
    const handlePopulateAlumniTable = async () => {
        Helper.checkIfExcel(file);        

        const userConfirmed = window.confirm('You are about to delete the info of tables and update with the setelected file');
        if(userConfirmed) {
            console.log("API call commented: ");
            //setUp.populateAlumniTable(file); 
        }
    }

    // Performs backup of the Alumni table
    const handleBackupTableAlumni = async () => {
        await setUp.setAlumniBackup();         
        console.log("Backup of alumni table performed");       
    }

    // Read from a file that contains the API response of scraped profiles => avoid unecessary calls to the API
    const handlePopulateAlumniTableFileBckp = async () => {
        Helper.checkIfTextFile(file);
       
        await setUp.setAlumniUsingBackup(file);
        console.log("Backup set in the Alumni table");
    }

    // DB is inconsistent and some rows don't have the linkedin link stored because of how I once read from the backup file.
    // this function serves as a way to fix this and put the DB consistent
    const handleLinkedinLinksAlumniTable = async () => {
        setUp.addMissingLinkedinLinks(); 
    }

    // Makes sure that every linkedin link in the DB finishes with /
    const handleRefactorlinkdinLinkAlumnis = async () => {
        setUp.refactorlinkdinLinkAlumnis();
    }

    // Deletes repeated alumnis from the alumni table
    const handleDeleteRepeatedAlumnis = async () => {
        setUp.deleteRepeatedAlumnis();
    }

    // Populates the country table: calls the API for the cuntry coordinates
    const handlePopulateCountryTable = async () => {
        await setUp.populateCountryTable();                     
    }

    // Populates the city table: calls API for the city coordinates
    const handlePopulateCityTable = async () => {
        await setUp.populateCityTable();
    }

    // Populates the alumniEic table
    // It receives the excel that has linnkedin links before the forms and after, alongside the courses of each alumni and year of conclusion
    const handlePopulateAlumniEICTable = async () => {
        Helper.checkIfExcel(file);
        const userConfirmed = window.confirm('You are about to delete the info of table AlumniEic and AlumniEic has courses and update with the setelected file');
        if(userConfirmed){
            await setUp.populateAlumniEICTable(file);
        }
    }

    // Populates courses table
    const handlePopulateCoursesTable = async () => {
        Helper.checkIfExcel(file);
        const userConfirmed = window.confirm('You are about to delete the info of table Courses and update with the setelected file');
        if(userConfirmed) {
            await setUp.handlePopulateCoursesTable(file);
            console.log("Courses table populated");
        }
    }

    // Generates the coynntry geoJson
    const handleGenerateCountryGeoJson = async () => {
        // loadingJson ensures the writing to the geoJson hapens only once the writing of the previous has finished
        if (loadingJson) {
            setLoadingJson(false);
            //await setUp.generateCountryGeoJson(""); Not updated
            setLoadingJson(true);
        }
    }

    // Generates the city geoJson
    const handleGenerateCityGeoJson = async () => {
        if(loadingJson){
            setLoadingJson(false);
            //await setUp.generateCityGeoJson(""); Not updated
            setLoadingJson(true);
        }
    }    

    // Matches Students to LinkedIn Links. Receives an excel, updates the linkedin column and downloads the updated file
    const handleAlumnisMatchLinkedin = async () => {
        Helper.checkIfExcel(file);    
        ApiDataAnalysis.matchLinkedinLinksToStudents(file); 
    }
    // This function receives an Excel and writes to it a column with all the Alumni names (this is, the students from the group)
    // and the corresponding professional situation
    const handleExcelAlumniProfSitu = async () => {
        // Check if the selected file is an Excel file (xlsx or xls)
        const allowedFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedFileTypes.includes(file.type)) {
            alert('Invalid file type. Please upload an Excel file.');
            return;
        }
        ApiDataAnalysis.excelAlmnProfSitu(file);
    }
    // Reads the Alumni Table and backs it up to an Excel
    const handleAlmnTblExcel = async () => {
        Helper.checkIfExcel(file);
        ApiDataAnalysis.almnTblExcel(file);
    }

    return (
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
                        <div key={index} onClick={() => handleAlumniSelection(alumniData.name, alumniData.coordinates)}>
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
                    <FaCheckCircle className="icon-apply" onClick={() => onClickApply(filterCourseInput, yearFilter)}/>
                    <span className='forms-button' onClick={() => onClickApply(filterCourseInput, yearFilter)}> Apply </span>
                </div>
                <div className='button-group'>
                    <TiDelete className="icon-delete" onClick={onClickClean}/>
                    <span className='forms-button' onClick={onClickClean}> Clear </span> 
                </div>
            </div>

            <div className='alumnis-total-number'>
                <p className='letter-style text-num-alumnus'>Total number of alumnus: </p> 
                <p>{numberAlumnisShowing}</p>
            </div>

            <a className="text feedback-links" href="https://docs.google.com/forms/d/e/1FAIpQLScPMdQzqv9Dy1llc-nGdr33q33r7GnSZjmYtxwwT1v_oy3Y7Q/viewform" target="_blank" rel="noopener noreferrer">Join us</a>
            <a className="text feedback-links" href="https://forms.gle/iNQ8mrakT9ToZcLT7" target="_blank" rel="noopener noreferrer">Give Feedback</a>
          

            {/*<input type="file" className='fileInput' onChange={handleFileChange} />  
            <button className="button butnPopAlumni" onClick={handlePopulateCoursesTable}>Populate Courses Table</button>
            
            <button className="button butnPopAlumni" onClick={handlePopulateAlumniTable}>AlumniTablePopulate</button>
            <button className="button butnBackAlumni" onClick={handleBackupTableAlumni}>BackupTableAlumni</button>
            <button className="button butnBackAlumniWFile" onClick={handlePopulateAlumniTableFileBckp}>AlumniTablePopulate - backup file</button>
            <button className="button btnMissingLinkedinLinks" onClick={handleLinkedinLinksAlumniTable}>MissingLinkedinLinks</button>

            <button className="button butnPopCountry" onClick={handleDeleteRepeatedAlumnis}>DeleteRepeatedAlumnis</button>
            <button className="button butnPopCity" onClick={handleRefactorlinkdinLinkAlumnis}>RefactorlinkdinLinkAlumnis</button>


            <button className="button butnPopCountry" onClick={handlePopulateCountryTable}>PopulateCoutryTable</button>
            <button className="button butnPopCity" onClick={handlePopulateCityTable}>PopulateCityTable</button>
            <button className="button butnPopAlumniEIC" onClick={handlePopulateAlumniEICTable}>PopulateAlumniEICTable</button>*/}

            {/*<button className="button butnGenCountryGeoJson" onClick={generateCountryGeoJson}>generateCountryGeoJson</button>
            <button className="button butnGenCityGeoJson" onClick={handleGenerateCityGeoJson}>GenerateCityGeoJson</button>

            <button className="button butnAlmWithoutLink" onClick={handleAlumnisMatchLinkedin}>Match Alumnis Linkedin</button>
            <button className="button btnExcelAlumniProfSitu" onClick={handleExcelAlumniProfSitu}>Excel: nomeAlumni + professionalSitu</button>
            <button className="button btnExcelAlumniTableToExcel" onClick={handleAlmnTblExcel}>Excel: Alumni table</button>*/}
        </>
    );
};

export default MenuButtons;
