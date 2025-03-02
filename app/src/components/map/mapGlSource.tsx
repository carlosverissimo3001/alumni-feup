import React, { useEffect, useState } from 'react';
import { Source, MapRef } from 'react-map-gl/mapbox-legacy';
import { GeoJSONFeatureCollection } from '@/sdk';
import { clusterCountLayer, clusterLayer, unclusterPointLayer } from './mapLayers';

const LAYER_IDS = ['cluster-count', 'unclustered-point', 'clusters'];

interface MapGLSourceProps {
  alumniGeoJSON: GeoJSONFeatureCollection;
  mapRef: React.RefObject<MapRef>;
}

export function MapGLSource({ alumniGeoJSON, mapRef }: MapGLSourceProps) {
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
    if (map.getSource('alumni')) {
      map.removeSource('alumni');
    }

    // Add source
    map.addSource('alumni', {
      type: 'geojson',
      data: alumniGeoJSON as unknown as GeoJSON.FeatureCollection,
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
      if (map.getSource('alumni')) {
        map.removeSource('alumni');
      }
    };
  }, [alumniGeoJSON, mapRef]);

  if (!mapRef.current || !isMapLoaded) return null;

  return (
    <Source
      id="alumniDistribution"
      type="geojson"
      data={alumniGeoJSON as unknown as GeoJSON.FeatureCollection}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
      clusterProperties={{
        name: ['concat', ['get', 'name']],
        students: ['+', ['get', 'students']],
        listLinkedinLinksByUser: ['concat', ['get', 'listLinkedinLinksByUser'], ';'],
        coursesYearConclusionByUser: ['concat', ['get', 'coursesYearConclusionByUser'], ';'],
      }}
    >
    </Source> 
  );
}

export default MapGLSource;
