import React, { useContext } from 'react';
import { FcSettings } from "react-icons/fc";
import setUp from "../../helpers/setUp";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import AdminChangePass from './AdminChangePass';
import AdminChangeAPIKey from './AdminChangeAPIKey';
import AdminPopulate from './AdminPopulate';

const AdminSettings = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    // Backsup the Alumni table to an excel
    const handleBackupAlumnus = async () => {
        await setUp.backupAlumnusExcel();
    }

    // Logs the user out
    const handleLogoutButton = async () => {
        logout();
        navigate('/admin');
    }

    return (
        <>
            <div className='background-admin'>
                <div className='content-container'>
                    <div className='content-wrapper admin-wrapper'>
                        <div className='shadow-overlay shadow-overlay-login'></div>
                        <div className='row-admin-title'>
                            <h1 className='admin-heading'> <FcSettings /> Adimin Settings</h1>
                        </div>
                        <button className='admin-button' onClick={handleBackupAlumnus}>Backup Alumnus Data</button>
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
        </>
    );
}

export default AdminSettings;