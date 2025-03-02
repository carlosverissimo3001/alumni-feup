import { LayerProps } from "react-map-gl/mapbox";

const LAYER_TYPE = 'circle' as const;
const SOURCE_ID = 'alumni';

export const clusterLayer: LayerProps = {
    id: 'clusters',
    type: LAYER_TYPE,
    source: SOURCE_ID,
    filter: ['>', ['get', 'students'], 0],
    paint: {
        'circle-color': ['step', ['get', 'students'], '#7DCEA0', 50, '#e5c100', 100, '#E74C3C'],
        'circle-radius': 20 // FOR TESTING
    }
};

export const clusterCountLayer: LayerProps = {
    id: 'cluster-count',
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['>', ['get', 'students'], 0],
    layout: {
        'text-field': '{students}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
    },
    paint: {
        'text-color': 'black'
    }
};

export const unclusterPointLayer: LayerProps = {
    id: 'unclustered-point',
    type: LAYER_TYPE,
    source: SOURCE_ID,
    filter: ['!', ['has', 'students']],
    paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
    }
}