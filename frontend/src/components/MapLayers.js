
export const clusterLayer = {
    id: 'clusters',
    type: 'circle',
    source: 'alumniPerCountry',
    filter: ['>', 'students', 0],
    paint: {
        'circle-color': ['step', ['get', 'students'], '#7DCEA0', 50, '#e5c100', 100, '#E74C3C'],
        'circle-radius': ['step', ['get', 'students'], 20, 100, 30, 750, 40]
    }
};

export const clusterCountLayer = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'alumniPerCountry',
    filter: ['>', 'students', 0],
    layout: {
        'text-field': '{students}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
    },
    paint: {
        'text-color': 'black'
    }
};

export const unclusterPointLayer = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'alumniPerCountry',
    filter: ['!', ['has', 'students']],
    paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
    }
}