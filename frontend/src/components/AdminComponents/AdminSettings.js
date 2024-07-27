import React, { useContext, useState } from 'react';
import { FcSettings } from "react-icons/fc";
import setUp from "../../helpers/setUp";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import AdminChangePass from './AdminChangePass';
import AdminChangeAPIKey from './AdminChangeAPIKey';
import AdminPopulate from './AdminPopulate';
import Information from './Information'; 

const AdminSettings = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [showWarningAPIResultExcel, setShowWarningAPIResultExcel] = useState(false);


    // Puts the call to the API in an Excel file
    const handleGetAPIResultExcel = async () => {
        setShowWarningAPIResultExcel(true);
        await setUp.getAPIResultExcel();
    }

    // Logs the user out
    const handleLogoutButton = async () => {
        logout();
        navigate('/admin');
    }

    const handleConfirm = () => {
        setShowWarningAPIResultExcel(false);
    };

    return (
        <>
            <div className='background-admin'>
                <div className='content-container'>
                    <div className='content-wrapper admin-wrapper'>
                        <div className='shadow-overlay shadow-overlay-login'></div>
                        <div className='row-admin-title'>
                            <h1 className='admin-heading'> <FcSettings /> Adimin Settings</h1>
                        </div>
                        <button className='admin-button' onClick={handleGetAPIResultExcel}>Get API Result to Excel</button>
                        <div className='row-admin-menu'>
                            <AdminPopulate/>
                            <AdminChangePass/>
                            <AdminChangeAPIKey/>
                            <div className='grid-container'>
                                <div className='grid-item label-column'>
                                    <button className='logout-button' onClick={handleLogoutButton}>Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showWarningAPIResultExcel && (
                <Information
                    message="This might take a few seconds. Wait a little."
                    onConfirm={handleConfirm}
                />
            )}   
        </>
    );
}

export default AdminSettings;