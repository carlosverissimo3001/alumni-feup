/**
* This class is responsable for the display of the world map Based on the filetrs and searches performed on the MenuButton.js Component.
* This class communicates with the MenuButton component through the MapCmp.js
*/
import React, {useState, useEffect, useRef, useCallback} from 'react';
import { Map as MapGL } from 'react-map-gl/mapbox';
import MapGLSource from './mapGlSource';
import ClusterInfo from './clusterInfo';
import Helper from './helper/helper';
import { clusterLayer } from './mapLayers';
import { cn } from '@/lib/utils';
import { useNavbar } from '@/contexts/NavbarContext';

interface MapViewProps {
  className?: string;
  loading: boolean;
  alumniGeoJSON: any;
  handleImageError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  selectedAlumni: any;
}

const MapView = ({
  className,
  clusterLayer,
  loading,
  alumniGeoJSON,
  handleImageError,
  selectedAlumni,
}: MapViewProps) => {
  
  const [hoveredMouseCoords, setHoveredMouseCoords] = useState([]);
  const [listPlaceName, setListPlaceName] = useState(null);
  const [listAlumniNames, setListAlumniNames] = useState(null);
  const [listLinkedinLinks, setListLinkedinLinks] = useState(null);
  const [alumniData, setAlumniData] = useState([]);
  const [hoveredCluster, setHoveredCluster] = useState(Boolean);
  const mapRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  const { isCollapsed } = useNavbar();

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);


  // Zooms to the selected alumni
  useEffect(() => {
    if (selectedAlumni && mapLoaded && mapRef.current) {
      const { name, coordinates } = selectedAlumni;
      const zoom = name.length !== 0 ? 10 : 3;
      
      if (coordinates) {
        const map = mapRef.current.getMap();
        if (map) {
          map.flyTo({
            center: coordinates,
            zoom: zoom,
          });
        }
      }
    }
  }, [selectedAlumni, mapLoaded]);

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
      // Add null checks for event and event.lngLat
      if (!event || !event.features) {
        return;
      }

      if (event.lngLat && event.point) {
        setHoveredMouseCoords([event.point.x, event.point.y]);
      }

      if (event.features && event.features.length > 0) {
        // Extracts feature fields
        const feature = event.features[0]; 
        const {listPlaceName, listLinkedinLinks, listAlumniNames, coursesYearConclusionByUser} = await Helper.extractFeatureFields(feature);
        
        const profilePics = await Helper.extractPathToProfilePics(listLinkedinLinks);
        const mapUserCoursesYears = await Helper.extractCoursesYears(coursesYearConclusionByUser);
        const alumniData = await Helper.buildAlumniData(listLinkedinLinks, listAlumniNames, profilePics, mapUserCoursesYears);
        const parsedFlattenedPlaceNames = await Helper.parsePlaceNames(listPlaceName);

        updateState(parsedFlattenedPlaceNames, listAlumniNames, listLinkedinLinks, alumniData);
      } else {
        updateState([], [], [], []);
      }
    } catch (error) {
      console.error("Map interaction error:", error);
      updateState([], [], [], []);
    }
  };

  const TOKEN = 'pk.eyJ1IjoiamVuaWZlcjEyMyIsImEiOiJjbHJndXUyNnAwamF1MmptamwwMjNqZm0xIn0.vUNEIrEka3ibQKmb8jzgFQ'

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <div className={cn(
        "absolute inset-0 bg-black transition-opacity duration-300 z-10 pointer-events-none",
        !isCollapsed ? "opacity-20" : "opacity-0"
      )} />
      <MapGL
        initialViewState={{ // By default it presents the map in Portugal
          latitude: 38.736946,
          longitude: -9.142685,
          zoom: 3,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={TOKEN}
        interactiveLayerIds={[clusterLayer.id]}
        onMouseMove={showClusterContent}
        onClick={showClusterContent}
        ref={mapRef} 
        cursor="pointer"
        onLoad={onMapLoad}

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
