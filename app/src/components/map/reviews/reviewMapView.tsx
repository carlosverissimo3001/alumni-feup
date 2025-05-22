/**
 * This class is responsible for the display of the world map based on the filters and searches performed in the MapFilters.tsx component.
 * This class communicates with the filters through the parent component, the "main" component.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Map as MapGL, MapMouseEvent } from "react-map-gl/mapbox";
import { cn } from "@/lib/utils";
import { Feature, Geometry } from "geojson";
import { useNavbar } from "@/contexts/NavbarContext";

import { GeoJSONFeatureCollection } from "@/sdk";
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlumniData } from "@/types/alumni";
import { ReviewData, ReviewGeoJSONProperties } from "@/types/review";
import { buildReviewData, extractReviewFeatureFields, sortReviewData } from "../utils/reviewhelper";
import ReviewClusterInfo from "./reviewClusterInfo";
import ReviewMapGLSource from "./reviewMapGlSource";
import { set } from "date-fns";

import { clusterLayer } from "./reviewMapLayers";
import { parsePlaceNames } from "../utils/helper";

type MapViewProps = {
  loading: boolean;
  reviewGeoJSON: GeoJSONFeatureCollection | null;
  selectedReviews: {
    id: string;
    coordinates: { lat: number; lng: number } | null;
  } | null;
  handleSelectReviews: (id: string, coordinates: number[]) => void;
  handleSelectGeoJSON: (geoData: GeoJSONFeatureCollection) => void;
  reviewData: ReviewData[];
  setReviewData: (reviewData: ReviewData[]) => void;
  sortBy: 'most' | 'least' | null;
  setSortBy: (sortBy: 'most' | 'least' | null) => void;
  scoreFetch: boolean;
  setScoreFetch: (scoreFetch: boolean) => void;
};

const ReviewMapView = ({
  loading,
  reviewGeoJSON,
  selectedReviews,
  reviewData,
  setReviewData,
  sortBy,
  setSortBy,
  scoreFetch,
  setScoreFetch
}: MapViewProps) => {
  const [hoveredMouseCoords, setHoveredMouseCoords] = useState<
    [number, number] | null
  >(null);
  const [listPlaceName, setListPlaceName] = useState<string[]>([]);
  const [listAlumniNames, setListAlumniNames] = useState<string[]>([]);
  const [listLinkedinLinks, setListLinkedinLinks] = useState<string[]>([]);
  const [reviews, setReviews] = useState<number>(0);
  
  const [hoveredCluster, setHoveredCluster] = useState(false);

  const mapRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  const { isCollapsed } = useNavbar();

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  // Zooms to the selected alumni
  useEffect(() => {
    if (selectedReviews && mapLoaded && mapRef.current) {
      const { id, coordinates } = selectedReviews;
      const zoom = id.length !== 0 ? 10 : 3;

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
  }, [selectedReviews, mapLoaded]);

  const updateState = (
    listPlaceName: string[],
    listAlumniNames: string[],
    listLinkedinLinks: string[],
    reviewData: ReviewData[],
  ) => {
      setListPlaceName(listPlaceName);
      setListAlumniNames(listAlumniNames);
      setListLinkedinLinks(listLinkedinLinks);
      setReviewData(reviewData);
      setHoveredCluster(true);
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
            reviews,
            listReviewIds,
            listAlumniNames,
            linkedInLinks,
            profilePics,
            descriptions,
            ratings,
            upvotes,
            downvotes,
            reviewTypes,
            timeSincePosted,
            timeSincePostedType,
            companyNames,
            createdAt
        } = await extractReviewFeatureFields(feature as unknown as Feature<Geometry, ReviewGeoJSONProperties>);

        let reviewData = buildReviewData(
            listReviewIds,
            listAlumniNames,
            linkedInLinks,
            profilePics,
            descriptions,
            ratings,
            upvotes,
            downvotes,
            reviewTypes,
            companyNames,
            timeSincePosted,
            timeSincePostedType,
            createdAt
        );

        reviewData = sortReviewData(
            reviewData,
            sortBy
        )
        
        const parsedFlattenedPlaceNames = parsePlaceNames(listPlaceName);

        updateState(
            parsedFlattenedPlaceNames,
            listAlumniNames,
            listLinkedinLinks,
            reviewData,
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
        {mapLoaded && reviewGeoJSON && (
          <ReviewMapGLSource
            key={`reviews-source-${JSON.stringify(reviewGeoJSON)}`}
            reviewGeoJSON={reviewGeoJSON}
            mapRef={mapRef}
          />
        )}
        <ReviewClusterInfo
          hoveredCluster={hoveredCluster}
          listAlumniNames={listAlumniNames}
          listLinkedinLinks={listLinkedinLinks}
          listPlaceName={listPlaceName}
          hoveredMouseCoords={hoveredMouseCoords || [0, 0]}
          reviewData={reviewData}
          scoreFetch={scoreFetch}
          setScoreFetch={setScoreFetch}
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

export default ReviewMapView;
