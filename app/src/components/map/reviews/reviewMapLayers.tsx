import { LayerProps } from "react-map-gl/mapbox";

const LAYER_TYPE = 'circle' as const;
const SOURCE_ID = 'reviews';

export const clusterLayer: LayerProps = {
    id: 'clusters',
    type: LAYER_TYPE,
    source: SOURCE_ID,
    filter: ['>', ['get', 'reviews'], 0],
    paint: {
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'reviews'],
        0, '#7DCEA0',
        50, '#e5c100',
        100, '#E74C3C'
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'reviews'],
        0, 10,
        50, 20,
        100, 30,
        500, 40
      ]
    }
  };

export const clusterCountLayer: LayerProps = {
    id: 'cluster-count',
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['>', ['get', 'reviews'], -1],
    layout: {
        'text-field': '{reviews}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
        //'text-allow-overlap': true,
    },
    paint: {
        'text-color': 'black'
    }
};

export const unclusterPointLayer: LayerProps = {
    id: 'unclustered-point',
    type: LAYER_TYPE,
    source: SOURCE_ID,
    filter: ['!', ['has', 'reviews']],
    paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
    }
}