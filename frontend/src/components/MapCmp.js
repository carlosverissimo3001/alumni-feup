import React, { useEffect, useRef, useState } from 'react';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './MapLayers';
import {Map as MapGL, Source, Layer} from 'react-map-gl';
import MenuButtons from './MenuButtons';
import ApiDataAnalysis from '../helpers/apiDataAnalysis';
import { FaRegUser } from "react-icons/fa";

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapCmp = () => {

    const mapRef = useRef(null);
    const [alumniGeoJSON, setAlumniGeoJSON] = useState(null);
    const [listPlaceName, setListPlaceName] = useState(null);
    const [listAlumniNames, setListAlumniNames] = useState(null);
    const [listLinkedinLinks, setListLinkedinLinks] = useState(null);
    const [alumniData, setAlumniData] = useState([]);
    const [hoveredCluster, setHoveredCluster] = useState(Boolean);
    const [hoveredMouseCoords, setHoveredMouseCoords] = useState([]);
    const [geoJSONFile, setGeoJSONFile] = useState('countries'); // by default it shows the countries
    const [selectedAlumni, setSelectedAlumni] = useState(null);

    useEffect(() => {
      if (selectedAlumni) {
        const { coordinates } = selectedAlumni;
        if (coordinates) {
          mapRef.current.getMap().flyTo({
            center: coordinates,
            zoom: 10,
          });
        }
      }
    }, [selectedAlumni]);

    useEffect(() => {
      try {
        setTimeout(() => { // timeout so that react only renders the GeoJson once it is created
          const alumniData = geoJSONFile === 'countries' ? require('../countriesGeoJSON.json') : require('../citiesGeoJSON.json');
          setAlumniGeoJSON(alumniData);
        }, 1000); 
      } catch (error) {
        console.log("!! error: ", error);
      }
    }, [geoJSONFile]);

    const handleSelectGeoJSON = (file) => {
      setGeoJSONFile(file);
    };

    const extractJSONObjects = (str) => {
      const jsonObjects = [];
      let depth = 0; // to keep track of nested levels
      let currentObject = '';
    
      // Iterate over the string to separate JSON objects
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '{') {
          if (depth === 0) {
            currentObject = ''; // start a new object
          }
          depth++; // increment depth for nested objects
        }
    
        if (depth > 0) {
          currentObject += str[i];
        }
    
        if (str[i] === '}') {
          depth--; // decrement depth when closing a JSON object
          if (depth === 0) {
            jsonObjects.push(currentObject); // complete object
          }
        }
      }
    
      return jsonObjects.map((jsonStr) => JSON.parse(jsonStr));
    };

    const onHover = async event => {
      //try {
        if (event.lngLat) {
          setHoveredMouseCoords([event.point.x, event.point.y]);
        }
  
        if (event.features && event.features.length > 0) {
          // Extracts feature fields
          const feature = event.features[0];        
          var listPlaceName = feature.properties.name;
          const linkUsersString = feature.properties.listLinkedinLinksByUser;
          const coursesYearConclusionByUser = feature.properties.coursesYearConclusionByUser;

            // Separates fields of linkUsersString
          var jsonObjects = extractJSONObjects(linkUsersString);
          var mapUserLinks = jsonObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
          const listAlumniNames = Object.keys(mapUserLinks)
          const listLinkedinLinks = Object.values(mapUserLinks)
  
            // Parse placeName if it's a string
          if (typeof listPlaceName === 'string') {
            const regex = /"([^"]+)"|'([^']+)'/g;
            listPlaceName = listPlaceName.match(regex).map(match => match.replace(/['"]/g, ''));
          }
          
          // Function to flatten nested arrays
          const flattenArray = arr => {
            if (!Array.isArray(arr)) return [arr];
            let flattened = [];
            arr.forEach(item => {
              flattened = flattened.concat(flattenArray(item));
            });
            return flattened;
          };
          listPlaceName = flattenArray(listPlaceName);
          
          var profilePics = await ApiDataAnalysis.extractPathToProfilePics(listLinkedinLinks);
          
          var mapUserCoursesYears = new Map();
          var jsonObjectsPeopleCoursesConclusion = extractJSONObjects(coursesYearConclusionByUser);
          var mapUserPeopleCoursesConclusion = jsonObjectsPeopleCoursesConclusion.reduce((acc, obj) => ({ ...acc, ...obj }), {});
          Object.entries(mapUserPeopleCoursesConclusion).forEach(([userName, courseYear]) => {
            var mapCoursesYears = new Map();
            Object.entries(courseYear).forEach((courseConclusionYears)=>{
              const courseConclusionYearsSplited = courseConclusionYears[1].split("/");
              mapCoursesYears.set(courseConclusionYears[0], courseConclusionYearsSplited[1]);
            });
            mapUserCoursesYears.set(userName, mapCoursesYears);
          });

          const alumniData = listAlumniNames.map((name, index) => {
            var coursesCurrentAlumni = "";
            var yearConclusionCurrentAlumni="";
            var userCoursesYearsConclusion = mapUserCoursesYears.get(name);

            userCoursesYearsConclusion.forEach((yearConclusion, course) => {
              coursesCurrentAlumni+=course+" ";
              yearConclusionCurrentAlumni+=yearConclusion+" ";
            });

            if (coursesCurrentAlumni==="" || yearConclusionCurrentAlumni==="") {
              coursesCurrentAlumni = "-";
              yearConclusionCurrentAlumni = "-";
            } 

            return {
              name: name,
              linkedinLink: listLinkedinLinks[index],
              profilePics: profilePics[index],
              courses: coursesCurrentAlumni,
              yearConclusions: yearConclusionCurrentAlumni,
            };
          });
  
          if (listAlumniNames.length > 0 && listLinkedinLinks.length > 0 && listPlaceName.length > 0) {
            setListPlaceName(listPlaceName);
            setListAlumniNames(listAlumniNames);
            setListLinkedinLinks(listLinkedinLinks);
            setAlumniData(alumniData);
            setHoveredCluster(true);
          } else {
            setListPlaceName([]);
            setListAlumniNames([]);
            setListLinkedinLinks([]);
            setAlumniData([]);
            setHoveredCluster(false);
            setHoveredMouseCoords(null);
          }
        } else {
          setListPlaceName([]);
          setListAlumniNames([]);
          setListLinkedinLinks([]);
          setAlumniData([]);
          setHoveredCluster(false);
          setHoveredMouseCoords(null);
        }
      /*} catch (error) {
        console.log("!! error: ", error);
      }*/
    };

    const handleSelectAlumni = (name, coordinates) => {
      setSelectedAlumni({name, coordinates});
    }

    const handleImageError = (event) => {
      event.target.src = `/Images/noImage.png`;
    };

    return (
      <>
        <div>
          <div className="menu-buttons-container">
              <MenuButtons onSelectAlumni={handleSelectAlumni} onSelectGeoJSON={handleSelectGeoJSON} />
          </div>
        </div>
        <div className="mapCmpDiv">
          <MapGL
            initialViewState={{
                latitude: 0,
                longitude: 0,
                zoom: 3,
                //pitch: 45, // Set pitch to create a 3D effect         // 3D
                //bearing: 0, // Set bearing to control the orientation // 3D
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11"                  // 3D preto e branco
            //mapStyle="mapbox://styles/mapbox/dark-v9"                 // 2D
            //mapStyle="mapbox://styles/mapbox/satellite-v9"            // 2D
            //mapStyle="mapbox://styles/mapbox/satellite-streets-v12"   // 3D
            mapboxAccessToken={TOKEN}
            interactiveLayerIds={[clusterLayer.id]}
            onMouseMove={onHover}
            ref={mapRef}
            >
            <Source
                id="alumniDistribution"
                type="geojson"
                data={alumniGeoJSON}
                cluster={true}
                clusterMaxZoom={14}
                clusterRadius={50}
                clusterProperties={{
                  name: ['concat', ['get', 'name']],
                  students: ['+', ['get', 'students']],
                  listLinkedinLinksByUser: ['concat', ['get', 'listLinkedinLinksByUser'], ';'],
                  coursesYearConclusionByUser: ['concat', ['get', 'coursesYearConclusionByUser'], ';'],
                }}
            >
                <Layer {...clusterLayer}/>
                <Layer {...clusterCountLayer}/>
                <Layer {...unclusterPointLayer}/>
            </Source>

            { hoveredCluster && listAlumniNames.length > 0  && listLinkedinLinks.length > 0 && listPlaceName.length > 0 && (
              <div
                className="clusterRectangle"
                style={{
                  position: 'absolute',
                  top:`${hoveredMouseCoords[1]}px`,
                  left: `${hoveredMouseCoords[0]}px`
                }}
              >
                <span><b>Place:</b></span>
                <div style={{ maxHeight: listPlaceName.length > 10 ? '100px' : 'auto', overflow: 'auto' }}>
                  {listPlaceName.map( (place, index) => (
                    <span key={index}>{place}{index !== listPlaceName.length - 1 && ', '}</span>
                  ))}
                </div>

                <p></p>

                <ul className={`list-alumni${listAlumniNames.length > 5 ? ' scrollable' : ''}`}>
                  <table className="alumni-table">
                    <thead>
                      <tr>
                        <th className="table-titles">Alumni</th>
                        <th className="table-titles">Course</th>
                        <th className="table-titles">Finish Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumniData
                        .slice() // Create a copy of the array to avoid mutating the original
                        .sort((a, b) => a.name.localeCompare(b.name)) // Sort the array alphabetically
                        .map((alumni, index) => (
                          <tr key={index}>
                            <td>
                              <div className='alumni-cell'>
                                <img
                                  className="profile-picture"
                                  src={alumni.profilePics}
                                  alt=""
                                  onError={handleImageError}
                                />
                                <a
                                  className="link"
                                  href={alumni.linkedinLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {alumni.name}
                                </a>
                              </div>
                            </td>
                            <td>{alumni.courses}</td>
                            <td>{alumni.yearConclusions}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </ul>
              </div>
            )}
          </MapGL>
        </div>
      </>
    );
};

export default MapCmp;
