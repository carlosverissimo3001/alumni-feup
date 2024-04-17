import React, { useEffect, useRef, useState } from 'react';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './MapLayers';
import {Map, Source, Layer} from 'react-map-gl';
import MenuButtons from './MenuButtons';

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
      const alumniData = geoJSONFile === 'countries' ? require('../countriesGeoJSON.json') : require('../citiesGeoJSON.json');
      setAlumniGeoJSON(alumniData);
    }, [geoJSONFile]);

    const handleSelectGeoJSON = (file) => {
      setGeoJSONFile(file);
    };

    const onHover = event => {
      if (event.lngLat) {
        setHoveredMouseCoords([event.point.x, event.point.y]);
      }

      if (event.features && event.features.length > 0) {
        const feature = event.features[0];
        var listPlaceName = feature.properties.name;
        var listAlumniNames = feature.properties.listAlumniNames;
        var listLinkedinLinks = feature.properties.listLinkedinLinks;

        // Parse placeName if it's a string
        if (typeof listPlaceName === 'string') {
          const regex = /"([^"]+)"|'([^']+)'/g;
          listPlaceName = listPlaceName.match(regex).map(match => match.replace(/['"]/g, ''));
        }
        // Parse listAlumniNames if it's a string
        if (typeof listAlumniNames === 'string') {
          const regex = /"([^"]+)"|'([^']+)'/g;
          listAlumniNames = listAlumniNames.match(regex).map(match => match.replace(/['"]/g, ''));
        }
        // Parse linkeLinks if it's a string
        if (typeof listLinkedinLinks === 'string') {
          const regex = /"([^"]+)"|'([^']+)'/g;
          listLinkedinLinks = listLinkedinLinks.match(regex).map(match => match.replace(/['"]/g, ''));
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
        listAlumniNames = flattenArray(listAlumniNames);
        listLinkedinLinks = flattenArray(listLinkedinLinks);
        const alumniData = listAlumniNames.map((name, index) => ({
          name: name,
          linkedinLink: listLinkedinLinks[index]
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
                  listAlumniNames: ['concat', ['get', 'listAlumniNames']],
                  listLinkedinLinks: ['concat', ['get', 'listLinkedinLinks']],
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
                    <li key={index}>
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
