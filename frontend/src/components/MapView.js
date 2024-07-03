/**
* This class is responsable for the display of the world map Based on the filetrs and searches performed on the MenuButton.js Component.
* This class communicates with the MenuButton component through the MapCmp.js
*/
import React, {useState, useEffect, useRef} from 'react';
import { Map as MapGL } from 'react-map-gl';
import MapGLSource from './MapGLSource';
import ClusterInfo from './ClusterInfo';
import Helper from '../helpers/helper';

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapView = ({
  loading,
  alumniGeoJSON,
  clusterLayer,
  handleImageError,
  selectedAlumni,
}) => {
  
  const [hoveredMouseCoords, setHoveredMouseCoords] = useState([]);
  const [listPlaceName, setListPlaceName] = useState(null);
  const [listAlumniNames, setListAlumniNames] = useState(null);
  const [listLinkedinLinks, setListLinkedinLinks] = useState(null);
  const [alumniData, setAlumniData] = useState([]);
  const [hoveredCluster, setHoveredCluster] = useState(Boolean);
  const mapRef = useRef(null);

  // Zooms to the selected alumni
  useEffect(() => {
    if (selectedAlumni) {
      const { name, coordinates } = selectedAlumni;
      var zoom = 0;
      if (name.length!==0) {
        zoom = 10;
      } else {
        zoom = 3;
      }
      if (coordinates) {
        mapRef.current.getMap().flyTo({
          center: coordinates,
          zoom: zoom,
        });
      }
    }
  }, [selectedAlumni]);

  const updateState = (listPlaceName, listAlumniNames, listLinkedinLinks, alumniData) => {
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
  }

  // Clusters content
  const showClusterContent = async event => {
    try {
      if (event.lngLat) {
        setHoveredMouseCoords([event.point.x, event.point.y]);
      }

      if (event.features && event.features.length > 0) {

        // Extracts feature fields
        const feature = event.features[0]; 
        const {listPlaceName, listLinkedinLinks, listAlumniNames, coursesYearConclusionByUser} = await Helper.extractFeatureFields(feature);
        
        var profilePics = await Helper.extractPathToProfilePics(listLinkedinLinks);
        var mapUserCoursesYears = await Helper.extractCoursesYears(coursesYearConclusionByUser);
        var alumniData = await Helper.buildAlumniData(listLinkedinLinks, listAlumniNames, profilePics, mapUserCoursesYears);
        var parsedFlattenedPlaceNames = await Helper.parsePlaceNames(listPlaceName);

        updateState(parsedFlattenedPlaceNames, listAlumniNames, listLinkedinLinks, alumniData);
      } else {
        updateState([], [], [], []);
      }
    } catch (error) {
      console.log("!! error: ", error);
    }
  };

  return (
    <div className="mapCmpDiv">
      <MapGL
        initialViewState={{
          latitude: 0,
          longitude: 0,
          zoom: 3,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={TOKEN}
        interactiveLayerIds={[clusterLayer.id]}
        onMouseMove={showClusterContent}
        onClick={showClusterContent}
        ref={mapRef}
      >
        {loading ? (
          <MapGLSource alumniGeoJSON={{ type: "FeatureCollection", features: [] }}></MapGLSource>
        ) : (
          <MapGLSource alumniGeoJSON={alumniGeoJSON}></MapGLSource>
        )}

        <ClusterInfo
          hoveredCluster={hoveredCluster}
          listAlumniNames={listAlumniNames}
          listLinkedinLinks={listLinkedinLinks}
          listPlaceName={listPlaceName}
          hoveredMouseCoords={hoveredMouseCoords}
          alumniData={alumniData}
          handleImageError={handleImageError}
        />
        
      </MapGL>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-icon"></div>
        </div>
      )}
    </div>
  );
};

export default MapView;
