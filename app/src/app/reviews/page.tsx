"use client";

import React, { useState } from "react";
import { useNavbar } from "@/contexts/NavbarContext";
import { cn } from "@/lib/utils";
import { GeoJSONFeatureCollection } from "@/sdk";

import ReviewMapView from "@/components/map/reviews/reviewMapView";
import ReviewButton from "./review-button";
import { ReviewData } from "@/types/review";
import ReviewMapFilters from "@/components/map/reviews/reviewMapFilters";

interface Coordinates {
  lat: number;
  lng: number;
}

interface SelectedReviews {
  id: string;
  coordinates: Coordinates;
}

const ReviewMapComponent = () => {
  const [reviewGeoJSON, setReviewGeoJSON] =
    useState<GeoJSONFeatureCollection | null>(null);

  const [selectedReviews, setSelectedReviews] =
    useState<SelectedReviews | null>(null);
  const { isCollapsed } = useNavbar();
  const [loading, setLoading] = useState(false);

  const [reviewData, setReviewData] = useState<ReviewData[]>([]);

  const [sortBy, setSortBy] = useState<"most" | "least" | null>(null);

  const [scoreFetch, setScoreFetch] = useState<boolean>(false);

  const handleSelectReviews = (id: string, coordinates: number[]): void => {
    setSelectedReviews({
      id,
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
      setReviewGeoJSON(geoData);
    } catch (error) {
      console.log("!! error: ", error);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-5 z-[100] transition-all duration-300",
          isCollapsed ? "left-24" : "left-64"
        )}
      >
        <div className="bg-[#EDEDEC] rounded-md p-2.5 flex flex-col">
          <ReviewMapFilters
            handleLoading={handleLoading}
            onSelectReview={handleSelectReviews}
            onSelectGeoJSON={handleSelectGeoJSON}
            sortBy={sortBy}
            setSortBy={setSortBy}
            scoreFetch={scoreFetch}
            setScoreFetch={setScoreFetch}
          />
        </div>
      </div>
      <ReviewMapView
        loading={loading}
        reviewGeoJSON={reviewGeoJSON}
        selectedReviews={selectedReviews}
        handleSelectReviews={handleSelectReviews}
        handleSelectGeoJSON={handleSelectGeoJSON}
        reviewData={reviewData}
        setReviewData={setReviewData}
        sortBy={sortBy}
        setSortBy={setSortBy}
        setScoreFetch={setScoreFetch}
        scoreFetch={scoreFetch}
      />
      <ReviewButton />
    </>
  );
};

export default ReviewMapComponent;
