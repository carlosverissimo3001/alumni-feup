import './App.css';
import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapCmp from './components/MapCmp';
import MenuButtons from './components/MenuButtons';


function App() {
  const [geoJSONFile, setGeoJSONFile] = useState('countries'); // by default it shows the countries

  const handleSelectGeoJSON = (file) => {
    setGeoJSONFile(file);
  };

  return (
    <>
        <MapCmp geoJSONFile={geoJSONFile}/>
        <MenuButtons onSelectGeoJSON={handleSelectGeoJSON}/>
    </>
  );
}

export default App;
