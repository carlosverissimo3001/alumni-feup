'use client';

import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown } from "lucide-react";
import MapFilters from '@/components/map/mapFilters';
import MapView from '@/components/map/mapView';
import { clusterLayer } from '@/components/map/mapLayers';
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";

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

interface MapCmpProps {
  yearUrl?: string;  // Made optional since useParams won't be used in Next.js page component
}

const MapCmp: React.FC<MapCmpProps> = ({ yearUrl }) => {
  const [alumniGeoJSON, setAlumniGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<SelectedAlumni | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isCollapsed } = useNavbar();

  const handleSelectAlumni = (name: string, coordinates: Coordinates): void => {
    setSelectedAlumni({ name, coordinates });
  };

  const handleLoading = (loading: boolean): void => {
    setLoading(loading);
  };

  const handleSelectGeoJSON = (geoData: GeoJSON.FeatureCollection): void => {
    try {
      setAlumniGeoJSON(geoData);
    } catch (error) {
      console.log("!! error: ", error);
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = `/Images/noImage.png`;
  };

  return (
    <>
      <div className={cn(
        "fixed top-5 z-[100] transition-all duration-300",
        isCollapsed ? "left-24" : "left-64"
      )}>
        <div className="bg-[#EDEDEC] rounded-md p-2.5 flex flex-col">
          <MapFilters 
            onLoading={handleLoading} 
            onSelectAlumni={handleSelectAlumni} 
            onSelectGeoJSON={handleSelectGeoJSON} 
            yearUrl={yearUrl}
          />
        </div>
      </div>
      
      <MapView
        className="pl-56 md:pl-56"
        loading={loading}
        alumniGeoJSON={alumniGeoJSON}
        clusterLayer={clusterLayer}
        handleImageError={handleImageError}
        selectedAlumni={selectedAlumni}
        handleLoading={handleLoading}
        handleSelectAlumni={handleSelectAlumni}
        handleSelectGeoJSON={handleSelectGeoJSON}
        yearUrl={yearUrl}
      />
    </>
  );
};

export default MapCmp;
