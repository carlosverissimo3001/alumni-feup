import React, { useEffect, useState } from 'react';
import { Source, MapRef } from 'react-map-gl/mapbox-legacy';
import { GeoJSONFeatureCollection } from '@/sdk';
import { clusterCountLayer, clusterLayer, unclusterPointLayer } from './reviewMapLayers';

const LAYER_IDS = ['cluster-count', 'unclustered-point', 'clusters', 'stats'];

interface MapGLSourceProps {
  reviewGeoJSON: GeoJSONFeatureCollection;
  mapRef: React.RefObject<MapRef>;
}

export function ReviewMapGLSource({ reviewGeoJSON, mapRef }: MapGLSourceProps) {

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on('load', () => {
        setIsMapLoaded(true);
      });
    }
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    // First, clean up any existing layers and source
    LAYER_IDS.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });
    if (map.getSource('reviews')) {
      map.removeSource('reviews');
    }

    // Add source
    map.addSource('reviews', {
      type: 'geojson',
      data: reviewGeoJSON as unknown as GeoJSON.FeatureCollection,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add layers
    map.addLayer(clusterLayer as mapboxgl.Layer);
    map.addLayer(clusterCountLayer as mapboxgl.Layer);
    map.addLayer(unclusterPointLayer as mapboxgl.Layer);

    // Cleanup on unmount
    return () => {
      if (!map.getStyle()) return; // Map might be destroyed
      LAYER_IDS.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });
      if (map.getSource('reviews')) {
        map.removeSource('reviews');
      }
    };
  }, [reviewGeoJSON, mapRef]);

  if (!mapRef.current || !isMapLoaded) return null;

  return (
    <Source
      id="reviewDistribution"
      type="geojson"
      data={reviewGeoJSON as unknown as GeoJSON.FeatureCollection}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
      clusterProperties={{
        name: ['concat', ['get', 'name']],
        reviews: ['+', ['get', 'reviews']],
        listLinkedinLinksByUser: ['concat', ['get', 'listLinkedinLinksByUser'], ';'],
      }}
    >
    </Source> 
  );
}

export default ReviewMapGLSource;
