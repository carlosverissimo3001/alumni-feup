/**
* This class is responsible for managing the connection between the MenyButtons.js and the MapView
*/
import React, { useState } from 'react';
import { clusterLayer } from './MapLayers';
import MenuButtons from './MenuButtons';
import MapView from './MapView';
import { useParams } from 'react-router-dom';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

const MapCmp = () => { 
    const [alumniGeoJSON, setAlumniGeoJSON] = useState(null);     // GeoJson to be displayed. Created on the MenuButtons.js and used in the MapView.js 
    const [selectedAlumni, setSelectedAlumni] = useState(null);   // Contains the alumni the user is search for. Set by the MenuButtons.js and used by MapView.js to position the map where that alumni is
    const [menuVisible, setMenuVisible] = useState(true);
    const [loading, setLoading] = useState(true);                 // Loading state. Set on the MenuButtons.js and used in the MapView.js
    const { yearUrl } = useParams();

    // Alumni selection
    const handleSelectAlumni = (name, coordinates) => {
      setSelectedAlumni({name, coordinates});
    }

    // Handles the laoding
    const handleLoading = (loading) => {
      setLoading(loading);
    }

    // Passes the geoJson content to be displayed
    const handleSelectGeoJSON = (geoData) => {
      try {
        setAlumniGeoJSON(geoData);
      } catch (error) {
        console.log("!! error: ", error);
      }
    };

    // Handles cases where the images don't exist
    const handleImageError = (event) => {
      event.target.src = `/Images/noImage.png`;
    };

    const toggleMenuVisibility = () => {
      setMenuVisible(!menuVisible);
    }

    return (
      <>
        <div className="menu-buttons-container">
            <div className='button-group'>
                {menuVisible ?
                  <IoIosArrowUp className="icon-show-menu" onClick={() => toggleMenuVisibility()}/>
                :
                  <IoIosArrowDown className="icon-show-menu" onClick={() => toggleMenuVisibility()}/>
                }
            </div>
            <MenuButtons menuVisible={menuVisible} onLoading={handleLoading} onSelectAlumni={handleSelectAlumni} onSelectGeoJSON={handleSelectGeoJSON} yearUrl={yearUrl}/>
        </div>
        
        <MapView
          loading={loading}
          alumniGeoJSON={alumniGeoJSON}
          clusterLayer={clusterLayer}
          handleImageError={handleImageError}
          selectedAlumni={selectedAlumni}
        />
      </>
    );
};

export default MapCmp;
