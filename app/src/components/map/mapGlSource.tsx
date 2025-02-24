import React from 'react';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './mapLayers';
import { Source, Layer, useMap } from 'react-map-gl/mapbox-legacy';

const MapGLSource = ({alumniGeoJSON}) => {
  const { current: map } = useMap();

  if (!map) return null;

  return (
    <Source
        id="alumniDistribution"
        type="geojson"
        data={alumniGeoJSON}
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
        <Layer {...clusterLayer}/>
        <Layer {...clusterCountLayer}/>
        <Layer {...unclusterPointLayer}/>
    </Source>
  );
};

export default MapGLSource;
