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
import "mapbox-gl/dist/mapbox-gl.css";
import { GeoJSONProperties } from "./mapFilters";
import { AlumniData } from "@/types/alumni";
import { useSearchParams } from "next/navigation";
import { GEO_DRILL_TYPE } from "@/types/drillType";

type MapViewProps = {
  loading: boolean;
  alumniGeoJSON: GeoJSONFeatureCollection | null;
  selectedAlumni: {
    name: string;
    coordinates: { lat: number; lng: number } | null;
  } | null;
  handleSelectAlumni: (name: string, coordinates: number[]) => void;
  handleSelectGeoJSON: (geoData: GeoJSONFeatureCollection) => void;
  selectedYear?: number | undefined;
  compareYear?: number | undefined;
};

const MapView = ({
  loading,
  alumniGeoJSON,
  selectedAlumni,
  selectedYear,
  compareYear,
}: MapViewProps) => {
  const [hoveredMouseCoords, setHoveredMouseCoords] = useState<
    [number, number] | null
  >(null);
  const [listPlaceName, setListPlaceName] = useState<string[]>([]);
  const [students, setStudents] = useState<number>(0);
  const [totalAlumni, setTotalAlumni] = useState<number>(0);
  const [totalAlumniPrev, setTotalAlumniPrev] = useState<number>(0);
  const [compareYearStudents, setCompareYearStudents] = useState<
    number | undefined
  >(undefined);
  const [listAlumniNames, setListAlumniNames] = useState<string[]>([]);
  const [listLinkedinLinks, setListLinkedinLinks] = useState<string[]>([]);
  const [alumniData, setAlumniData] = useState<AlumniData[]>([]);
  const [hoveredCluster, setHoveredCluster] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  const { isCollapsed } = useNavbar();

  const searchParams = useSearchParams();

  const onMapLoad = useCallback(() => {
    mapRef.current.loadImage(
      "logos/arrow.png",
      (error: Error | null, image: HTMLImageElement | undefined) => {
        if (error) throw error;
        if (image) {
          mapRef.current.addImage("arrowicon", image, { sdf: true });
        } else {
          console.log("Image not found");
        }
      }
    );
    mapRef.current.loadImage(
      "logos/equals.png",
      (error: Error | null, image: HTMLImageElement | undefined) => {
        if (error) throw error;
        if (image) {
          mapRef.current.addImage("equalsicon", image, { sdf: true });
        } else {
        }
      }
    );
    setMapLoaded(true);
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      let zoom = 10;
      const lat = searchParams.get("lat");
      const lng = searchParams.get("lng");
      const groupBy = searchParams.get("group_by");
      if (groupBy && groupBy === GEO_DRILL_TYPE.COUNTRY) {
        zoom = 5.5;
      }

      if (lat && lng) {
        const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
        const map = mapRef.current.getMap();
        if (map) {
          map.flyTo({
            center: [coordinates.lng, coordinates.lat],
            zoom,
            duration: 2000,
          });
        }
      }
    }
  }, [mapLoaded, searchParams]);

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
    alumniData: AlumniData[],
    compareYearStudents: number | undefined,
    students: number,
    totalAlumni: number,
    totalAlumniPrev: number
  ) => {
    setListPlaceName(listPlaceName);
    setListAlumniNames(listAlumniNames);
    setListLinkedinLinks(listLinkedinLinks);
    setAlumniData(alumniData);
    setHoveredCluster(true);
    setCompareYearStudents(compareYearStudents);
    setStudents(students);
    setTotalAlumni(totalAlumni);
    setTotalAlumniPrev(totalAlumniPrev);
  };

  // Clusters content
  const showClusterContent = async (event: MapMouseEvent) => {
    try {
      if (!event || !event.features) {
        updateState([], [], [], [], undefined, 0, 0, 0);
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
          students,
          totalAlumni,
          totalAlumniPrev,
          compareYearStudents,
          listLinkedinLinks,
          listAlumniNames,
          coursesYearConclusionByUser,
          profilePics,
          jobTitles,
          companyNames,
        } = await extractFeatureFields(
          feature as unknown as Feature<Geometry, GeoJSONProperties>
        );
        const mapUserCoursesYears = await extractCoursesYears(
          typeof coursesYearConclusionByUser === "string"
            ? coursesYearConclusionByUser
            : JSON.stringify(coursesYearConclusionByUser)
        );

        const alumniData = buildAlumniData(
          listLinkedinLinks,
          listAlumniNames,
          profilePics,
          mapUserCoursesYears,
          jobTitles,
          companyNames
        );

        const parsedFlattenedPlaceNames = parsePlaceNames(listPlaceName);

        updateState(
          parsedFlattenedPlaceNames,
          listAlumniNames,
          listLinkedinLinks,
          alumniData,
          compareYearStudents,
          students,
          totalAlumni,
          totalAlumniPrev
        );
      } else {
        updateState([], [], [], [], undefined, 0, 0, 0);
      }
    } catch (error) {
      console.error("Error in showClusterContent:", error);
      updateState([], [], [], [], undefined, 0, 0, 0);
    }
  };

  const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

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
          latitude: 46.2276,
          longitude: -2.2137,
          zoom: 3.5,
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
          students={students}
          totalAlumni={totalAlumni}
          totalAlumniPrev={totalAlumniPrev}
          compareYearStudents={compareYearStudents}
          hoveredMouseCoords={hoveredMouseCoords || [0, 0]}
          alumniData={alumniData}
          selectedYear={selectedYear}
          compareYear={compareYear}
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
