import React, { useRef, useState } from 'react';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './MapLayers';
//import alumniPerCountry from '../countriesGeoJSON.json';
//import alumniPerCountry from '../citiesGeoJSON.json';
import alumniPerCountry from '../edit_citiesGeoJSON.json';
import {Map, Source, Layer} from 'react-map-gl';

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapCmp = () => {

    const mapRef = useRef(null);
    const [residentNames, setResidentNames] = useState(null);
    const [residentLinks, setResidentLinks] = useState(null);
    const [hoveredCluster, setHoveredCluster] = useState(Boolean);
    const [hoveredMouseCoords, setHoveredMouseCoords] = useState([]);

    const onClick = event => {
        if (event.features && event.features.length > 0) {
          const feature = event.features[0];
          const clusterId = feature.properties.cluster_id;
    
          const mapboxSource = mapRef.current.getSource('alumniPerCountry');
          
          mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if(err){
              return;
            }
    
            mapRef.current.easeTo({
              center: feature.geometry.coordinates,
              zoom,
              duration: 500
            });
          });
        }
    }

    const onHover = event => {
      if (event.lngLat) {
        setHoveredMouseCoords([event.point.x, event.point.y]);
      }

      if (event.features && event.features.length > 0) {
        const feature = event.features[0];
        console.log("feature: ", feature);
        var residentes = feature.properties.residents;
        var links = feature.properties.links;

        // Parse residentes if it's a string
        if (typeof residentes === 'string') {
          const regex = /"([^"]+)"|'([^']+)'/g;
          residentes = residentes.match(regex).map(match => match.replace(/['"]/g, ''));
        }
        if (typeof links === 'string') {
          const regex = /"([^"]+)"|'([^']+)'/g;
          links = links.match(regex).map(match => match.replace(/['"]/g, ''));
        }

        // Function to flatten nested arrays
        const flattenArray = arr => {
          if (!Array.isArray(arr)) return [arr];
          let flattened = [];
          arr.forEach(item => {
            flattened = flattened.concat(flattenArray(item));
          });
          return flattened;
        };
        residentes = flattenArray(residentes);
        links = flattenArray(links);

        if (residentes.length > 0 && links.length > 0) {
          setResidentNames(residentes);
          setResidentLinks(links);
          console.log("residentLinks: ", residentLinks);
          setHoveredCluster(true);
        } else {
          setResidentNames([]);
          setResidentLinks([]);
          setHoveredCluster(false);
          setHoveredMouseCoords(null);
        }
      } else {
        setResidentNames([]);
        setResidentLinks([]);
        setHoveredCluster(false);
        setHoveredMouseCoords(null);
      }
    };

    return (
        <div className="mapCmpDiv">
          <Map
            initialViewState={{
                latitude: 0,
                longitude: 0,
                zoom: 3,
                //pitch: 45, // Set pitch to create a 3D effect         // 3D
                //bearing: 0, // Set bearing to control the orientation // 3D
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11"                  // 3D preto e branco
            //mapStyle="mapbox://styles/mapbox/dark-v9"                 // 2D
            //mapStyle="mapbox://styles/mapbox/satellite-v9"            // 2D
            //mapStyle="mapbox://styles/mapbox/satellite-streets-v12"   // 3D
            mapboxAccessToken={TOKEN}
            interactiveLayerIds={[clusterLayer.id]}
            onClick={onClick}
            onMouseMove={onHover}
            ref={mapRef}
            >
            <Source
                id="alumniPerCountry"
                type="geojson"
                data={alumniPerCountry}
                cluster={true}
                clusterMaxZoom={14}
                clusterRadius={50}
                clusterProperties={{
                  students: ['+', ['get', 'students']],
                  residents: ['concat', ['get', 'residents']],
                  links: ['concat', ['get', 'links']],
                }}
            >
                <Layer {...clusterLayer}/>
                <Layer {...clusterCountLayer}/>
                <Layer {...unclusterPointLayer}/>
            </Source>
          </Map>
          
          { hoveredCluster && residentNames.length > 0  && residentLinks.length > 0 && (
            <div
              className="clusterRectangle"
              style={{
              position: 'absolute',
              top:`${hoveredMouseCoords[1]}px`,
              left: `${hoveredMouseCoords[0]}px`
              }}
            >
              <ul className="list-alumni">
                {residentNames.map((resident, index) => (
                  <li key={index}>
                    <a className="link" href={residentLinks[index]} target="_blank" rel="noopener noreferrer">{resident}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
    );
};

export default MapCmp;
