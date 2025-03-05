'use client';

import React, { useState } from 'react';
import MapFilters from '@/components/map/mapFilters';
import MapView from '@/components/map/mapView';
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { GeoJSONFeatureCollection } from "@/sdk";

import './app.css';

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
  const [alumniGeoJSON, setAlumniGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);

  // The alumni the user is searching for.
  // Set in the filters -> Used in the mapView to center the map on the alumni.
  const [selectedAlumni, setSelectedAlumni] = useState<SelectedAlumni | null>(null);
  const { isCollapsed } = useNavbar();
  const [loading, setLoading] = useState(false);

  const handleSelectAlumni = (name: string, coordinates: number[]): void => {
    setSelectedAlumni({ 
      name, 
      coordinates: { 
        lat: coordinates[1], 
        lng: coordinates[0] 
      } 
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

  return (
    <>
      <div className={cn(
        "fixed top-5 z-[100] transition-all duration-300",
        isCollapsed ? "left-24" : "left-64"
      )}>
        <div className="bg-[#EDEDEC] rounded-md p-2.5 flex flex-col">
          <MapFilters 
            handleLoading={handleLoading}
            onSelectAlumni={handleSelectAlumni} 
            onSelectGeoJSON={handleSelectGeoJSON} 
          />
        </div>
      </div>
      
      <MapView
        loading={loading}
        alumniGeoJSON={alumniGeoJSON}
        selectedAlumni={selectedAlumni}
        handleSelectAlumni={handleSelectAlumni}
        handleSelectGeoJSON={handleSelectGeoJSON}
      />
    </>
  );
};

export default MapComponent;
