/**
 * This class is responsible for the display of the world map based on the filters and searches performed in the MapFilters.tsx component.
 * This class communicates with the filters through the parent component, the "main" component.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Map as MapGL, MapMouseEvent } from "react-map-gl/mapbox";
import MapGLSource from "./mapGlSource";
import ClusterInfo from "./clusterInfo";
import { cn } from "@/lib/utils";
import { Feature, Geometry } from "geojson";
import { clusterLayer } from "./mapLayers";
import { useNavbar } from "@/contexts/NavbarContext";
import {
  parsePlaceNames,
  buildAlumniData,
  extractCoursesYears,
  extractFeatureFields,
} from "./utils/helper";
import { GeoJSONFeatureCollection } from "@/sdk";
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeoJSONProperties } from "./mapFilters";
import { AlumniData } from "@/types/alumni";

type MapViewProps = {
  loading: boolean;
  alumniGeoJSON: GeoJSONFeatureCollection | null;
  selectedAlumni: {
    name: string;
    coordinates: { lat: number; lng: number } | null;
  } | null;
  handleSelectAlumni: (name: string, coordinates: number[]) => void;
  handleSelectGeoJSON: (geoData: GeoJSONFeatureCollection) => void;
};

const MapView = ({
  loading,
  alumniGeoJSON,
  selectedAlumni,
}: MapViewProps) => {
  const [hoveredMouseCoords, setHoveredMouseCoords] = useState<
    [number, number] | null
  >(null);
  const [listPlaceName, setListPlaceName] = useState<string[]>([]);
  const [listAlumniNames, setListAlumniNames] = useState<string[]>([]);
  const [listLinkedinLinks, setListLinkedinLinks] = useState<string[]>([]);
  const [alumniData, setAlumniData] = useState<AlumniData[]>([]);
  const [hoveredCluster, setHoveredCluster] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

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

  const updateState = (
    listPlaceName: string[],
    listAlumniNames: string[],
    listLinkedinLinks: string[],
    alumniData: AlumniData[]
  ) => {
    if (
      listAlumniNames.length > 0 &&
      listLinkedinLinks.length > 0 &&
      listPlaceName.length > 0
    ) {
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
  };

  // Clusters content
  const showClusterContent = async (event: MapMouseEvent) => {
    try {
      if (!event || !event.features) {
        updateState([], [], [], []);
        return;
      }

      if (event.lngLat && event.point) {
        setHoveredMouseCoords([event.point.x, event.point.y]);
      }

      if (event.features && event.features.length > 0) {
        // Extracts feature fields
        const feature = event.features[0];
        const {
          listPlaceName,
          listLinkedinLinks,
          listAlumniNames,
          coursesYearConclusionByUser,
          profilePics
        } = await extractFeatureFields(feature as unknown as Feature<Geometry, GeoJSONProperties>);

        const mapUserCoursesYears = await extractCoursesYears(
          coursesYearConclusionByUser
        );
        const alumniData = buildAlumniData(
          listLinkedinLinks,
          listAlumniNames,
          profilePics,
          mapUserCoursesYears
        );
        const parsedFlattenedPlaceNames = parsePlaceNames(listPlaceName);

        console.log(alumniData);

        updateState(
          parsedFlattenedPlaceNames,
          listAlumniNames,
          listLinkedinLinks,
          alumniData
        );
      } else {
        updateState([], [], [], []);
      }
    } catch (error) {
      console.error("Error in showClusterContent:", error);
      updateState([], [], [], []);
    }
  };

  const TOKEN =
    "pk.eyJ1IjoiamVuaWZlcjEyMyIsImEiOiJjbHJndXUyNnAwamF1MmptamwwMjNqZm0xIn0.vUNEIrEka3ibQKmb8jzgFQ";

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <div
        className={cn(
          "absolute inset-0 bg-black transition-opacity duration-300 z-10 pointer-events-none",
          !isCollapsed ? "opacity-20" : "opacity-0"
        )}
      />

      <MapGL
        initialViewState={{
          latitude: 38.736946,
          longitude: -9.142685,
          zoom: 3
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={TOKEN}
        interactiveLayerIds={clusterLayer.id ? [clusterLayer.id] : []}
        onMouseMove={showClusterContent}
        onClick={showClusterContent}
        ref={mapRef}
        onLoad={onMapLoad}
      >
        {mapLoaded && alumniGeoJSON && (
          <MapGLSource
            key={`alumni-source-${JSON.stringify(alumniGeoJSON)}`}
            alumniGeoJSON={alumniGeoJSON}
            mapRef={mapRef}
          />
        )}
        <ClusterInfo
          hoveredCluster={hoveredCluster}
          listAlumniNames={listAlumniNames}
          listLinkedinLinks={listLinkedinLinks}
          listPlaceName={listPlaceName}
          hoveredMouseCoords={hoveredMouseCoords || [0, 0]}
          alumniData={alumniData}
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
