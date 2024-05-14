import React, {useEffect, useState} from 'react';
import setUp from '../helpers/setUp';
import Verifiers from '../helpers/verifiers';
import ApiDataAnalysis from '../helpers/apiDataAnalysis';

const MenuButtons = ({onSelectGeoJSON, onSelectAlumni,}) => {

    const[file, setFile]=useState('');
    const [selectedOption, setSelectedOption] = useState('countries');
    const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState([]);
    const [filteredCourse, setFilteredCourse] = useState([]);
    const [filteredYears, setFilteredYears] = useState([]);
    const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [filterCourseInput, setFilterCourseInput] = useState('');
    const [loadingJson, setLoadingJson] = useState(true);
    const [numberAlumnisShowing, setNumberAlumnisShowing] = useState(0);
    const [yearFilter, setYearFilter] = useState(['','']);

    useEffect(() => {
        try{
            const geoJSONData = selectedOption === 'countries' ? require('../countriesGeoJSON.json') : require('../citiesGeoJSON.json');        
            // Get the names with their LinkedIn links
            const namesLinkedinLinks = geoJSONData.features.flatMap((feature) => {
                const coordinates = feature.geometry.coordinates; // Get coordinates
                return Object.entries(feature.properties.listLinkedinLinksByUser).map(([link, name]) => ({
                  name,
                  link,
                  coordinates, 
                }));
            });

            // Get the courses data with the years of conclusion
            const namesCourseYears = geoJSONData.features.flatMap((feature) => 
                Object.entries(feature.properties.coursesYearConclusionByUser).map(([linkedinLink, courseYears]) => ({
                    linkedinLink,
                    courseYears
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
            onSelectGeoJSON(selectedOption); // Use cities/countries GeoJson file
        } catch(error){
            console.log("Attention!");
        }
    }, [listAlumniNamesWithCoordinates.length, onSelectGeoJSON, selectedOption]);

    // Filter alumni names based on search input
    useEffect(() => {
        if (listAlumniNamesWithCoordinates && searchInput.trim() !== '') {
            const filteredNamesCoord = listAlumniNamesWithCoordinates.filter(alumni => 
                alumni.name.toLowerCase().includes(searchInput.toLowerCase())
            );
            setFilteredAlumniNamesCoord(filteredNamesCoord);
        } else {
            setFilteredAlumniNamesCoord([]);
        }
    }, [listAlumniNamesWithCoordinates, searchInput]);

    // Filter alumnis based on course input
    useEffect(() => {
        if (listAlumniNamesWithCoordinates) {
            // Filter courses based on the input to filter courses
            const allCourses = listAlumniNamesWithCoordinates.flatMap((alumni) => {
                return Object.keys(alumni.coursesYears);
            });

            // Remove duplicates
            const uniqueCourses = [...new Set(allCourses)];
            setFilteredCourse(uniqueCourses);
        } else {
          setFilteredCourse([]);
        }
    }, [listAlumniNamesWithCoordinates, filterCourseInput]);

    // Filter alumnis based on "from" conclusion year
    useEffect(() => {
        if (listAlumniNamesWithCoordinates) {
            // TODO: the if I have is no longer enough
            const allYears = listAlumniNamesWithCoordinates.flatMap((alumni) => {
                return Object.values(alumni.coursesYears).map(yearRange => {
                    return yearRange.split('/')[1]; // Split the string and take the second part
                });
            });

            // Remove duplicates
            const uniqueFromYears = [...new Set(allYears)];
            setFilteredYears(uniqueFromYears);
        } else {
            setFilteredYears([]);
        }
    }, [listAlumniNamesWithCoordinates]);

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleFilterCourseInputChange = (e) => {
        setFilterCourseInput(e.target.value);
    };

    const handleAlumniSelection = (name, coordinates) => {
        onSelectAlumni(name, coordinates);
    };

    const handleCourseSelection = async (courseAbreviation) => {
        setFilterCourseInput(courseAbreviation);
    }

    const handleFromYearSelection = async (year) => {
        yearFilter[0] = year;
    }

    const handleToYearSelection = async (year) => {
        yearFilter[1] = year;
    }

    // Function to handle checkbox selection
    const handleCheckboxChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // By calling the API to scrape information: populates the alumni table
    //                                           stores the information in a file
    //                                           uploades the profile pics to the folder: "C:/alimniProject/backend/src/main/java/com/feupAlumni/alumniFEUP/Images"
    // The name of the profile pics is set to the public identifier of the user, wich is retrieved by the API
    const handlePopulateAlumniTable = async () => {
        Verifiers.checkIfExcel(file);        

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
        Verifiers.checkIfTextFile(file);
       
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
        Verifiers.checkIfExcel(file);
        const userConfirmed = window.confirm('You are about to delete the info of table AlumniEic and AlumniEic has courses and update with the setelected file');
        if(userConfirmed){
            await setUp.populateAlumniEICTable(file);
        }
    }

    // Populates courses table
    const handlePopulateCoursesTable = async () => {
        Verifiers.checkIfExcel(file);
        const userConfirmed = window.confirm('You are about to delete the info of table Courses and update with the setelected file');
        if(userConfirmed) {
            await setUp.handlePopulateCoursesTable(file);
            console.log("Courses table populated");
        }
    }

    // Generates the coynntry geoJason
    const handleGenerateCountryGeoJason = async () => {
        // loadingJson ensures the writing to the geoJson hapens only once the writing of the previous has finished
        if (loadingJson) {
            setLoadingJson(false);
            //await setUp.generateCountryGeoJson(""); Not updated
            setLoadingJson(true);
        }
    }

    // Generates the city geoJason
    const handleGenerateCityGeoJason = async () => {
        if(loadingJson){
            setLoadingJson(false);
            //await setUp.generateCityGeoJson(""); Not updated
            setLoadingJson(true);
        }
    }    

    // Matches Students to LinkedIn Links. Receives an excel, updates the linkedin column and downloads the updated file
    const handleAlumnisMatchLinkedin = async () => {
        Verifiers.checkIfExcel(file);    
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
        Verifiers.checkIfExcel(file);
        ApiDataAnalysis.almnTblExcel(file);
    }

    const handleYearChange = (index, value) => {
        const newYearFilter = [...yearFilter];
        newYearFilter[index] = value;
        setYearFilter(newYearFilter);
    };

    // Cleans the values inserted in the fields
    const onClickClean = async () => {
        onClickApply("", ["", ""]);
        setSearchInput("");         // cleans the search alumni input 
        onSelectAlumni("", [0,0]);  // positions the user in the middle of the screen
        setYearFilter(['', '']);  // cleans the year filter field
        setFilterCourseInput(""); // cleans the search user input
    }

    // Applies the values inserted in the fields
    const onClickApply = async (courseFilter, yearsConclusionFilters) => {
        setUp.generateGeoJson(courseFilter, yearsConclusionFilters, selectedOption);
    }

    return (
        <>
            <p>See alumni distribution across:</p>
            <div>
                <input
                    type="radio"
                    id="countriesCheckbox"
                    value="countries"
                    checked={selectedOption === 'countries'}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor="countriesCheckbox">Countries</label>
            </div>
            <div>
                <input
                    type="radio"
                    id="citiesCheckbox"
                    value="cities"
                    checked={selectedOption === 'cities'}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor="citiesCheckbox">Cities</label>
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
                <label for="myDropdown">Course:</label>
                <select 
                className='filter-course-alumni search-bar' 
                id="myDropdown"
                value={filterCourseInput}
                onChange={handleFilterCourseInputChange}>
                    <option value="" > </option>
                    {filteredCourse.map((course, index) => (
                        <option key={index} value={course} >
                            {course}
                        </option>
                    ))}
                </select>
            </div>

            <div className="year-filter-container"> 
                <div className='search-container-year'>
                    <label for="myDropdown">From Year:</label>
                    <select 
                        className='filter-year-from-alumni search-bar' 
                        id="myDropdownYearFrom"
                        value={yearFilter[0]}
                        onChange={e => handleYearChange(0, e.target.value)}>
                            <option value="" > </option>
                            {filteredYears.map((year, index) => (
                                <option key={index} value={year} >
                                    {year}
                                </option>
                            ))}
                    </select>
                </div>
                <div className='search-container-year'>
                    <label for="myDropdown">To Year:</label>
                    <select 
                        className='filter-year-to-alumni search-bar' 
                        id="myDropdownYearTo"
                        value={yearFilter[1]}
                        onChange={e => handleYearChange(1, e.target.value)}>
                            <option value="" > </option>
                            {filteredYears.map((year, index) => (
                                <option key={index} value={year} >
                                    {year}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <button className="my-button" onClick={() => onClickApply(filterCourseInput, yearFilter)}> Apply </button>
            <button className="my-button my-button-clean" onClick={onClickClean}> Clean </button>

            <p>Total selected: {numberAlumnisShowing}</p>

            {/*<input type="file" className='fileInput' onChange={handleFileChange} />  
            <button className="button butnPopAlumni" onClick={handlePopulateCoursesTable}>Populate Courses Table</button>
            
            <button className="button butnPopAlumni" onClick={handlePopulateAlumniTable}>AlumniTablePopulate</button>
            <button className="button butnBackAlumni" onClick={handleBackupTableAlumni}>BackupTableAlumni</button>
            <button className="button butnBackAlumniWFile" onClick={handlePopulateAlumniTableFileBckp}>AlumniTablePopulate - backup file</button>
            <button className="button btnMissingLinkedinLinks" onClick={handleLinkedinLinksAlumniTable}>MissingLinkedinLinks</button>

            <button className="button butnPopCountry" onClick={handleDeleteRepeatedAlumnis}>DeleteRepeatedAlumnis</button>
            <button className="button butnPopCity" onClick={handleRefactorlinkdinLinkAlumnis}>RefactorlinkdinLinkAlumnis</button>*/}


            {/*<button className="button butnPopCountry" onClick={handlePopulateCountryTable}>PopulateCoutryTable</button>
            <button className="button butnPopCity" onClick={handlePopulateCityTable}>PopulateCityTable</button>
            <button className="button butnPopAlumniEIC" onClick={handlePopulateAlumniEICTable}>PopulateAlumniEICTable</button>*/}

            {/*<button className="button butnGenCountryGeoJason" onClick={generateCountryGeoJson}>generateCountryGeoJson</button>
            <button className="button butnGenCityGeoJason" onClick={handleGenerateCityGeoJson}>GenerateCityGeoJson</button>

            <button className="button butnAlmWithoutLink" onClick={handleAlumnisMatchLinkedin}>Match Alumnis Linkedin</button>
            <button className="button btnExcelAlumniProfSitu" onClick={handleExcelAlumniProfSitu}>Excel: nomeAlumni + professionalSitu</button>
            <button className="button btnExcelAlumniTableToExcel" onClick={handleAlmnTblExcel}>Excel: Alumni table</button>*/}
        </>
    );
};

export default MenuButtons;
