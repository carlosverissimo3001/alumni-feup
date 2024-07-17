import React, { useState } from 'react';
import { FcSettings, FcPlus } from "react-icons/fc";
import setUp from "../../helpers/setUp";

const AdminSettings = () => {
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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

    // Updates the user's password
    const handleChangePass = async (newPass, oldPassword) => {
        await setUp.changePass(newPass, oldPassword);
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

                            <div className='grid-container'>
                                <div className='grid-item label-column'>
                                    <label htmlFor='fileUpload' className='input-label'>Add Alumnus</label>
                                    <label htmlFor='newPassword' className='input-label input-label-change-pass'>Change Password</label>
                                    <button className='logout-button' onClick={handleAddAlumnusData}>Logout</button>
                                </div>

                                <div className='grid-item input-column'>
                                    <div className='file-upload-container'>
                                        <input
                                            type='file'
                                            id='fileUpload'
                                            accept='.xlsx, .xls'
                                            onChange={handleFileUpload}
                                            className='insert-file input-field'
                                        />
                                        <label htmlFor='fileUpload' className='upload-icon'>
                                            <span className='file-name-admin-wrapp'>
                                                <FcPlus className='upload-file-admin' />
                                                {uploadedFile ? uploadedFile.name : 'Upload'}
                                            </span>
                                        </label>
                                    </div>

                                    <div className='password-input-container'>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id='oldPassword'
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder='Old password'
                                            className='input-pass-admin input-field'
                                            autoComplete="new-password"
                                        />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id='newPassword'
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder='New password'
                                            className='input-pass-admin input-field new-pass-space'
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className='password-toggle-button'
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? '👁️' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                <div className='grid-item button-column'>
                                    <div className='file-buttons'>
                                        <button className='admin-button' onClick={handleReplaceAlumnus}>Replace Alumnus Data</button>
                                        <button className='admin-button' onClick={handleAddAlumnusData}>Add Alumnus Data</button>
                                    </div>
                                    <button className='admin-button' onClick={() => handleChangePass(newPassword, oldPassword)}>Done</button>
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