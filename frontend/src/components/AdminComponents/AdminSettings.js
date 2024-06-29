import React, { useState } from 'react';
import { FcSettings, FcPlus } from "react-icons/fc";

const AdminSettings = () => {
    const [newPassword, setNewPassword] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        console.log('Uploaded file:', file);
        setUploadedFile(file);
        // Handle file upload logic here
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
                        <div className='row-admin-menu'>
                            <div className='input-row'>
                                <label htmlFor='fileUpload' className='input-label'>Add Alumnus:</label>
                                <input
                                    type='file'
                                    id='fileUpload'
                                    accept='.xlsx, .xls'
                                    onChange={handleFileUpload}
                                    className='insert-file input-field'
                                />
                                <label htmlFor='fileUpload' className='upload-icon'>
                                    <span className='file-name-admin-wrapp'>
                                    <FcPlus className='upload-file-admin'/>
                                        {uploadedFile ? uploadedFile.name : 'Upload'}
                                    </span>
                                </label>
                                <div className='buttons-alumnus'>
                                    <button className='admin-button'>Replace Alumnus Data</button>
                                    <button className='admin-button'>Update Alumnus Data</button>
                                </div>
                            </div>
                            <div className='input-row'>
                                <label htmlFor='newPassword' className='input-label'>Change Password:</label>
                                <input
                                    type='password'
                                    id='newPassword'
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder='New password'
                                    className='input-pass-admin input-field'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminSettings;