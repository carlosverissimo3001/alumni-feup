'use client';

import React, { useState } from 'react';
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { GeoJSONFeatureCollection } from "@/sdk";


import ReviewMapView from '@/components/map/reviews/reviewMapView';
import ReviewMapFilters from '@/components/map/reviews/reviewMapFilters';

// Type definitions
interface Coordinates {
  lat: number;
  lng: number;
}

interface SelectedReviews {
  id: string;
  coordinates: Coordinates;
}

const ReviewMapComponent = () => {
  const [reviewGeoJSON, setReviewGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);

  // The alumni the user is searching for.
  // Set in the filters -> Used in the mapView to center the map on the alumni.
  const [selectedReviews, setSelectedReviews] = useState<SelectedReviews | null>(null);
  const { isCollapsed } = useNavbar();
  const [loading, setLoading] = useState(false);

  const handleSelectReviews = (id: string, coordinates: number[]): void => {
    setSelectedReviews({ 
      id, 
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
      setReviewGeoJSON(geoData);
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
          <ReviewMapFilters 
            handleLoading={handleLoading}
            onSelectReview={handleSelectReviews} 
            onSelectGeoJSON={handleSelectGeoJSON}
          />
        </div>
      </div>
      <ReviewMapView
        loading={loading}
        reviewGeoJSON={reviewGeoJSON}
        selectedReviews={selectedReviews}
        handleSelectReviews={handleSelectReviews}
        handleSelectGeoJSON={handleSelectGeoJSON}
      />
    </>
  );
};

export default ReviewMapComponent;
