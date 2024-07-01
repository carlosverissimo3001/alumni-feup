import React, { useState } from 'react';
import { FcSettings, FcPlus } from "react-icons/fc";
import setUp from "../../helpers/setUp";

const AdminSettings = () => {
    const [newPassword, setNewPassword] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        console.log('Uploaded file:', file);
        setUploadedFile(file);
    };

    // Backsup the Alumni table to an excel
    const handleBackupAlumnus = async () => {
        await setUp.backupAlumnusExcel();
    }

    // Deletes the Alumni information and repopulates all tables with new updated information from the LinkedinLink API
    const handleReplaceAlumnus = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        await setUp.replaceAlumnus(uploadedFile);
    }

    // Only calls the API to alumnis that don't already exist in the app
    const handleAddAlumnusData = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        await setUp.addAlumnusData(uploadedFile);
    }

    // TODO: MISSING TO IMPLEMENT THIS
    // TODO: It should ask first for the actual pass. Then for a new one. The backend then validates if the passwords match and if so
    //       updates the password
    // Updates the user's password
    const handleChangePass = async () => {
        await setUp.changePass();
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
                                    <button className='admin-button' onClick={handleReplaceAlumnus}>Replace Alumnus Data</button>
                                    <button className='admin-button' onClick={handleAddAlumnusData}>Add Alumnus Data</button>
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
                                <button className='admin-button' onClick={handleChangePass}>Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminSettings;