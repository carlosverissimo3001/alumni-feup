import React, { useRef, useState } from 'react';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './MapLayers';
//import alumniPerCountry from '../countriesGeoJSON.json';
import alumniPerCountry from '../citiesGeoJSON.json';
//import alumniPerCountry from '../edit_citiesGeoJSON.json';
import {Map, Source, Layer} from 'react-map-gl';

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapCmp = () => {

    const mapRef = useRef(null);
    const [listAlumniNames, setListAlumniNames] = useState(null);
    const [listLinkedinLinks, setListLinkedinLinks] = useState(null);
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
        var listAlumniNames = feature.properties.listAlumniNames;
        var listLinkedinLinks = feature.properties.listLinkedinLinks;

        // Parse listAlumniNames if it's a string
        if (typeof listAlumniNames === 'string') {
          const regex = /"([^"]+)"|'([^']+)'/g;
          listAlumniNames = listAlumniNames.match(regex).map(match => match.replace(/['"]/g, ''));
        }
        if (typeof listLinkedinLinks === 'string') {
          const regex = /"([^"]+)"|'([^']+)'/g;
          listLinkedinLinks = listLinkedinLinks.match(regex).map(match => match.replace(/['"]/g, ''));
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
        listAlumniNames = flattenArray(listAlumniNames);
        listLinkedinLinks = flattenArray(listLinkedinLinks);

        if (listAlumniNames.length > 0 && listLinkedinLinks.length > 0) {
          setListAlumniNames(listAlumniNames);
          setListLinkedinLinks(listLinkedinLinks);
          setHoveredCluster(true);
        } else {
          setListAlumniNames([]);
          setListLinkedinLinks([]);
          setHoveredCluster(false);
          setHoveredMouseCoords(null);
        }
      } else {
        setListAlumniNames([]);
        setListLinkedinLinks([]);
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
                  listAlumniNames: ['concat', ['get', 'listAlumniNames']],
                  listLinkedinLinks: ['concat', ['get', 'listLinkedinLinks']],
                }}
            >
                <Layer {...clusterLayer}/>
                <Layer {...clusterCountLayer}/>
                <Layer {...unclusterPointLayer}/>
            </Source>
          </Map>
          
          { hoveredCluster && listAlumniNames.length > 0  && listLinkedinLinks.length > 0 && (
            <div
              className="clusterRectangle"
              style={{
              position: 'absolute',
              top:`${hoveredMouseCoords[1]}px`,
              left: `${hoveredMouseCoords[0]}px`
              }}
            >
              <ul className={`list-alumni${listAlumniNames.length > 5 ? ' scrollable' : ''}`}>
                {listAlumniNames.map((alumniName, index) => (
                  <li key={index}>
                    <a className="link" href={listLinkedinLinks[index]} target="_blank" rel="noopener noreferrer">{alumniName}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
    );
};

export default MapCmp;
