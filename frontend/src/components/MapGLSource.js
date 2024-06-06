import React from 'react';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './MapLayers';
import {Source, Layer} from 'react-map-gl';

const MapGLSource = ({alumniGeoJSON}) => {
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
