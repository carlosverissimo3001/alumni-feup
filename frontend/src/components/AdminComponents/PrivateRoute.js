import React from 'react';
import '../../App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../App';

const PrivateRoute = ({ children }) => {
    const { isLoggedIn } = React.useContext(AuthContext);

    return isLoggedIn ? children : <Navigate to="/admin" replace />;
}

export default PrivateRoute;