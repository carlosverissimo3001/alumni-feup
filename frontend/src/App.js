import './App.css';
import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapCmp from './components/MapCmp';
import AdminLogin from './components/AdminComponents/AdminLogin';
import AdminSettings from './components/AdminComponents/AdminSettings';

function App() {
  return (   
    <>
      <Router>
        <Routes>
          <Route path="/:yearUrl?" element={<MapCmp/>} />
          <Route path="/admin" element={<AdminLogin/>} />
          <Route path="/adminDefinitions" element={<AdminSettings/>} />
          <Route path="/" element={<MapCmp/>} />
        </Routes>
      </Router>
    </> 
  );
}

export default App;
