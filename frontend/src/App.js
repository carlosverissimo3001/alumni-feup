import './App.css';
import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapCmp from './components/MapCmp';
import MenuButtons from './components/MenuButtons';


function App() {
  return (
    <>
        <MapCmp/>
        <MenuButtons/>
    </>
  );
}

export default App;
