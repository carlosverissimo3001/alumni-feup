import './App.css';
import React, { useRef } from 'react';
import {Map, Source, Layer} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './components/layers';
import alumniPerCountry from './countriesGeoJSON.json'
import mapboxgl from 'mapbox-gl';

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function App() {
  const mapRef = useRef(null);

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
  

  return (
    <>
      {/*
      <div className="App">
        <AppNavBar/>
        <Alumni/>
      </div>
      */}
      <div style={{height: '100vh'}}>
        {
          // Log the Mapbox GL JS version
          console.log('Mapbox GL JS version:', mapboxgl.version)
        }
        <Map
          initialViewState={{
            latitude: 0,
            longitude: 0,
            zoom: 3,
            //pitch: 45, // Set pitch to create a 3D effect         // 3D
            //bearing: 0, // Set bearing to control the orientation // 3D
          }}
          mapStyle="mapbox://styles/mapbox/dark-v9"                 // 2D
          //mapStyle="mapbox://styles/mapbox/satellite-v9"          // 2D
          //mapStyle="mapbox://styles/mapbox/satellite-streets-v12" // 3D
          mapboxAccessToken={TOKEN}
          interactiveLayerIds={[clusterLayer.id]}
          onClick={onClick}
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
            }}
          >
            <Layer {...clusterLayer}/>
            <Layer {...clusterCountLayer}/>
            <Layer {...unclusterPointLayer}/>
          </Source>
        </Map>
      </div>
    </>
  );
}

export default App;
