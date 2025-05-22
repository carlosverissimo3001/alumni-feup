import { LayerProps } from "react-map-gl/mapbox";

const LAYER_TYPE = 'circle' as const;
const SOURCE_ID = 'alumni';

export const clusterLayer: LayerProps = {
    id: 'clusters',
    type: LAYER_TYPE,
    source: SOURCE_ID,
    filter: ['>', ['get', 'students'], -1],
    paint: {
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'students'],
        0, '#7DCEA0',
        50, '#e5c100',
        100, '#E74C3C'
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'students'],
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
    filter: ['>', ['get', 'students'], -1],
    layout: {
        'text-field': '{students}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
        //'text-allow-overlap': true,
    },
    paint: {
        'text-color': 'black'
    }
};

export const statsLayer: LayerProps = {
  id: 'stats',
  type: 'symbol',
  source: SOURCE_ID,
  filter: ['!=', ['get', 'compareYearStudents'], null],
  layout: {
      'icon-image': [
      'case',
      ['<', ['get', 'compareYearStudents'], 0],
      'arrowicon',
      ['>', ['get', 'compareYearStudents'], 0],
      'arrowicon',
      'equalsicon' 
    ],
      'icon-size': //0.1,
      [
        'interpolate',
        ['linear'],
        ['get', 'students'],
        //0, 0,
        0, 0.03,
        50, 0.05,
        100, 0.08,
        500, 0.1
      ],
      'icon-rotate': [
          'case',
          ['<', ['get', 'compareYearStudents'], 0],
          90, 
          ['>', ['get', 'compareYearStudents'], 0],
          -90,
          0 
      ]
  },
  paint: {
      'icon-color': [
        'case',
        ['>', ['get', 'compareYearStudents'], 0], 'green',
        ['<', ['get', 'compareYearStudents'], 0], 'red',
        'yellow'
      ]
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