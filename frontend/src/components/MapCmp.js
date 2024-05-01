import React, { useEffect, useRef, useState } from 'react';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './MapLayers';
import {Map, Source, Layer} from 'react-map-gl';
import MenuButtons from './MenuButtons';
import ApiDataAnalysis from '../helpers/apiDataAnalysis';

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
      try {
        if (event.lngLat) {
          setHoveredMouseCoords([event.point.x, event.point.y]);
        }
  
        if (event.features && event.features.length > 0) {
          const feature = event.features[0];        
          var listPlaceName = feature.properties.name;
  
          const linkUsersString = feature.properties.listLinkedinLinksByUser;
          const jsonObjects = extractJSONObjects(linkUsersString);
          const mapUserLinks = jsonObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
          var listAlumniNames = Object.keys(mapUserLinks)
          var listLinkedinLinks = Object.values(mapUserLinks)
          var profilePics = [];
  
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
          profilePics = await ApiDataAnalysis.extractPathToProfilePics(listLinkedinLinks);
          const alumniData = listAlumniNames.map((name, index) => ({
            name: name,
            linkedinLink: listLinkedinLinks[index],
            profilePics: profilePics[index]
          }));
  
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
      } catch (error) {
        console.log("!! error: ", error);
      }
    };

    const handleSelectAlumni = (name, coordinates) => {
      setSelectedAlumni({name, coordinates});
    }

    return (
      <>
        <div>
          <div className="menu-buttons-container">
              <MenuButtons onSelectAlumni={handleSelectAlumni} onSelectGeoJSON={handleSelectGeoJSON} />
          </div>
        </div>
        <div className="mapCmpDiv">
          <Map
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
                }}
            >
                <Layer {...clusterLayer}/>
                <Layer {...clusterCountLayer}/>
                <Layer {...unclusterPointLayer}/>
            </Source>
          </Map>
          
          { hoveredCluster && listAlumniNames.length > 0  && listLinkedinLinks.length > 0 && listPlaceName.length > 0 && (
            <div
              className="clusterRectangle"
              style={{
                position: 'absolute',
                top:`${hoveredMouseCoords[1]}px`,
                left: `${hoveredMouseCoords[0]}px`
              }}
            >
              <ul className={`list-alumni${listAlumniNames.length > 5 ? ' scrollable' : ''}`}>
                <span style={{ fontWeight: 'bold' }}>Place: </span>
                {listPlaceName.map( (place, index) => (
                  <span key={index}>{place}{index !== listPlaceName.length - 1 && ', '}</span>
                ))}

                <p></p>
                <span style={{ fontWeight: 'bold' }}>Alumni: </span>
                {alumniData
                  .slice() // Create a copy of the array to avoid mutating the original
                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort the array alphabetically
                  .map((alumni, index) => (
                    <li key={index} className="listing-image-profile-picture">
                      <img className="profile-picture" src={alumni.profilePics} alt="" />
                      <a className="link" href={alumni.linkedinLink} target="_blank" rel="noopener noreferrer">{alumni.name}</a>
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>
      </>
    );
};

export default MapCmp;
