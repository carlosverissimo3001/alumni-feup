import './App.css';
import React, { useRef } from 'react';
//import ControlPanel from './components/control-panel';
import {Map, Source, Layer} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { clusterLayer, clusterCountLayer, unclusterPointLayer } from './components/layers';
import alumniPerCountry from './countriesGeoJSON.json'

const TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function App() {
  const mapRef = useRef(null);

  const onClick = event => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      console.log("feature: ", feature)
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
        <Map
          initialViewState={{
            latitude: 40.67,
            longitude: -103.59,
            zoom: 3
          }}
          mapStyle="mapbox://styles/mapbox/dark-v9"
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
      
      {/* <ControlPanel />*/}
    </>
  );
}

export default App;
