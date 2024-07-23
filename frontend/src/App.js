import './App.css';
import React, {useState} from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapCmp from './components/MapCmp';
import AdminLogin from './components/AdminComponents/AdminLogin';
import AdminSettings from './components/AdminComponents/AdminSettings';
import PrivateRoute from './components/AdminComponents/PrivateRoute';

// Context for authentication
export const AuthContext = React.createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (   
    <>
      <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
        <Router>
          <Routes>
            <Route path="/:yearUrl?" element={<MapCmp/>} />
            <Route path="/admin" element={<AdminLogin/>} />
            <Route 
              path="/adminDefinitions"
              element={
                <PrivateRoute><AdminSettings /></PrivateRoute>
              }
            />
            <Route path="/" element={<MapCmp/>} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </> 
  );
}

export default App;
