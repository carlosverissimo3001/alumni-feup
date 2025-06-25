"use client";

import React, { useState, Suspense } from "react";
import MapFilters from "@/components/map/mapFilters";
import MapView from "@/components/map/mapView";
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { GeoJSONFeatureCollection } from "@/sdk";
import { ChartSpline } from "lucide-react";

import "./app.css";
import TimeLineBar from "@/components/map/timeLineBar";

// Type definitions
interface Coordinates {
  lat: number;
  lng: number;
}

interface SelectedAlumni {
  name: string;
  coordinates: Coordinates;
}

const MapComponent = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-3 bg-gray-100 min-h-screen">
          <div className="flex items-center gap-4">
            <ChartSpline className="h-8 w-8 text-[#8C2D19]" />
            <div>
              <h1 className="text-3xl font-extrabold text-[#8C2D19]">
                Loading Map...
              </h1>
            </div>
          </div>
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
};

function MapContent() {
  const [alumniGeoJSON, setAlumniGeoJSON] =
    useState<GeoJSONFeatureCollection | null>(null);

  // The alumni the user is searching for.
  // Set in the filters -> Used in the mapView to center the map on the alumni.
  const [selectedAlumni, setSelectedAlumni] = useState<SelectedAlumni | null>(
    null
  );
  const { isCollapsed } = useNavbar();
  const [loading, setLoading] = useState(false);

  const handleSelectAlumni = (name: string, coordinates: number[]): void => {
    setSelectedAlumni({
      name,
      coordinates: {
        lat: coordinates[1],
        lng: coordinates[0],
      },
    });
  };

  const handleLoading = (loading: boolean): void => {
    setLoading(loading);
  };

  const handleSelectGeoJSON = (geoData: GeoJSONFeatureCollection): void => {
    try {
      setAlumniGeoJSON(geoData);
    } catch (error) {
      console.log("!! error: ", error);
    }
  };

  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const [showTimeLine, setShowTimeLine] = useState<boolean>(false);
  const [compareYear, setCompareYear] = useState<number | undefined>(undefined);
  const [showCompareYear, setShowCompareYear] = useState<boolean>(false);

  return (
    <>
      <div
        className={cn(
          "fixed top-5 z-[100] transition-all duration-300",
          isCollapsed ? "left-24" : "left-64"
        )}
      >
        <div className="bg-[#EDEDEC] rounded-md p-2.5 flex flex-col">
          <MapFilters
            handleLoading={handleLoading}
            onSelectAlumni={handleSelectAlumni}
            onSelectGeoJSON={handleSelectGeoJSON}
            showTimeLine={showTimeLine}
            setShowTimeLine={setShowTimeLine}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            showCompareYear={showCompareYear}
            setShowCompareYear={setShowCompareYear}
            compareYear={compareYear}
            setCompareYear={setCompareYear}
          />
        </div>
      </div>
      <MapView
        loading={loading}
        alumniGeoJSON={alumniGeoJSON}
        selectedAlumni={selectedAlumni}
        handleSelectAlumni={handleSelectAlumni}
        handleSelectGeoJSON={handleSelectGeoJSON}
        selectedYear={selectedYear}
        compareYear={compareYear}
      />
      <TimeLineBar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        showTimeLine={showTimeLine}
        isCollapsed={isCollapsed}
        showCompareYear={!showCompareYear}
        compareYear={compareYear}
        setCompareYear={setCompareYear}
      ></TimeLineBar>
    </>
  );
}

export default MapComponent;
