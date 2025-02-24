'use client';

import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from "lucide-react";
import MenuButtons from '@/components/map/menuButtons';
import MapView from '@/components/map/mapView';
import { clusterLayer } from '@/components/map/mapLayers';

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
  const [menuVisible, setMenuVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

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

  const toggleMenuVisibility = (): void => {
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <div className="menu-buttons-container">
        <div className='button-group'>
          {menuVisible ?
            <ArrowUp className="icon-show-menu" onClick={toggleMenuVisibility} />
            :
            <ArrowDown className="icon-show-menu" onClick={toggleMenuVisibility} />
          }
        </div>
        <MenuButtons 
          menuVisible={menuVisible} 
          onLoading={handleLoading} 
          onSelectAlumni={handleSelectAlumni} 
          onSelectGeoJSON={handleSelectGeoJSON} 
          yearUrl={yearUrl}
        />
      </div>
      
      <MapView
        className="pl-56 md:pl-56"
        loading={loading}
        alumniGeoJSON={alumniGeoJSON}
        clusterLayer={clusterLayer}
        handleImageError={handleImageError}
        selectedAlumni={selectedAlumni}
      />
    </>
  );
};

export default MapCmp;
