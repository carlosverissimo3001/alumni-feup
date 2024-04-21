import React, {useEffect, useState} from 'react';
import setUp from '../helpers/setUp';
import Verifiers from '../helpers/verifiers';
import ApiDataAnalysis from '../helpers/apiDataAnalysis';

const MenuButtons = ({onSelectGeoJSON, onSelectAlumni}) => {

    const[file, setFile]=useState('');
    const [selectedOption, setSelectedOption] = useState('countries');
    const [filteredAlumniNamesCoord, setFilteredAlumniNamesCoord] = useState([]);
    const [filteredCourse, setFilteredCourse] = useState([]);
    const [listAlumniNamesWithCoordinates, setListAlumniNamesWithCoordinates] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [filterCourseInput, setFilterCourseInput] = useState('');
    
    useEffect(() => {
        const geoJSONData = selectedOption === 'countries' ? require('../countriesGeoJSON.json') : require('../citiesGeoJSON.json');        
        // Get the names with their LinkedIn links
        const namesLinkedinLinks = geoJSONData.features.flatMap((feature) => 
            Object.entries(feature.properties.listLinkedinLinksByUser).map(([name, link]) => ({
                name,
                link,
            }))
        );
        // Get the courses data with the years of conclusion
        const namesCourseYears = geoJSONData.features.flatMap((feature) => 
            Object.entries(feature.properties.coursesYearConclusionByUser).map(([name, courseYears]) => ({
                name,
                courseYears
            }))
        );
        const alumniNamesWithCoords = geoJSONData.features.flatMap((feature) => {
            const coordinates = feature.geometry.coordinates;
            const alumnis = namesLinkedinLinks.map((item) => { 
                // Find the corresponding courses data based on name
                const coursesData = namesCourseYears.find((courseItem) => courseItem.name === item.name);

                return {
                    name: item.name,
                    coordinates: coordinates,
                    link: item.link,
                    courses: coursesData ? coursesData.courseYears : [],
                };
            });
            return alumnis;
        });
        setListAlumniNamesWithCoordinates(alumniNamesWithCoords);
        onSelectGeoJSON(selectedOption); // Use cities/countries GeoJson file
    }, [selectedOption]);

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

    // Filter alumni names based on course input
    useEffect(() => {
        if (listAlumniNamesWithCoordinates && filterCourseInput.trim() !== '') {
            const allCourses = listAlumniNamesWithCoordinates.flatMap((alumni) => {
                return Object.keys(alumni.courses).filter(course =>
                    course.toLowerCase().includes(filterCourseInput.trim().toLowerCase())
                );
            });
            // Remove duplicates
            const uniqueCourses = [...new Set(allCourses)];
            setFilteredCourse(uniqueCourses);
        } else {
          setFilteredCourse([]);
        }
    }, [listAlumniNamesWithCoordinates, filterCourseInput]);

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
        if (selectedOption === "countries") {
            await setUp.generateCountryGeoJason(courseAbreviation);
        } else if (selectedOption === "cities") {
            await setUp.generateCityGeoJason(courseAbreviation);
        }
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
        await setUp.generateCountryGeoJason("");
    }

    // Generates the city geoJason
    const handleGenerateCityGeoJason = async () => {
        await setUp.generateCityGeoJason("");
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

    return (
        <>
            <p>See alumni distribution across:</p>
            <div>
                <input
                    type="checkbox"
                    id="countriesCheckbox"
                    value="countries"
                    checked={selectedOption === 'countries'}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor="countriesCheckbox">Countries</label>
            </div>
            <div>
                <input
                    type="checkbox"
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
                <input
                    type="text"
                    placeholder="Filter by course..."
                    value={filterCourseInput}
                    className='filter-course-alumni search-bar'
                    onChange={handleFilterCourseInputChange}
                />
                {filteredCourse.length > 0 && (
                    <div className={`search-results ${filteredCourse.length > 5 ? 'scrollable' : ''}`}>
                    {filteredCourse.map((courseAbreviation, index) => (
                        <div key={index} onClick={() => handleCourseSelection(courseAbreviation)}>
                            {courseAbreviation}
                        </div>
                    ))}
                    </div>
                )}
            </div>

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

            <button className="button butnGenCountryGeoJason" onClick={handleGenerateCountryGeoJason}>GenerateCountryGeoJason</button>
            <button className="button butnGenCityGeoJason" onClick={handleGenerateCityGeoJason}>GenerateCityGeoJason</button>

            {/*<button className="button butnAlmWithoutLink" onClick={handleAlumnisMatchLinkedin}>Match Alumnis Linkedin</button>
            <button className="button btnExcelAlumniProfSitu" onClick={handleExcelAlumniProfSitu}>Excel: nomeAlumni + professionalSitu</button>
            <button className="button btnExcelAlumniTableToExcel" onClick={handleAlmnTblExcel}>Excel: Alumni table</button>*/}
        </>
    );
};

export default MenuButtons;
