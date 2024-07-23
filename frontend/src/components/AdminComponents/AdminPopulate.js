import React, { useState } from 'react';
import Warning from '../Warning'; 
import { FcPlus } from "react-icons/fc";

const AdminPopulate = () => {
    const [showWarningAdminReplace, setShowWarningAdminReplace] = useState(false);
    const [showWarningAdminAdd, setShowWarningAdminAdd] = useState(false);
    const [showWarningAdminUpdate, setShowWarningAdminUpdate] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedFile(file);
    };

    // Deletes the Alumni information and repopulates all tables with new updated information from the LinkedinLink API
    const handleReplaceAlumnus = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        // await setUp.replaceAlumnus(uploadedFile); Commented meanwhile
        setShowWarningAdminReplace(false);
    }

    // Only calls the API to alumnis that don't already exist in the app. If the alumni exists it doesn't call the API again
    const handleAddAlumnusData = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        // await setUp.addAlumnusData(uploadedFile); Commented meanwhile
        setShowWarningAdminAdd(false);
    }

    // Calls the API for the alumnis that don't exist. If the alumni exists, updates the alumni information
    const handleUpdateAlumnusData = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        // await setUp.updateAlumnusData(uploadedFile); Commented meanwhile
        setShowWarningAdminUpdate(false);
    }

    const handleReplaceAlumniClick = async () => {
        setShowWarningAdminReplace(true);
    }

    const handleAddAlumniClick = async () => {
        setShowWarningAdminAdd(true);
    }

    const handleUpdateAlumniClick = async () => {
        setShowWarningAdminUpdate(true);
    }

    const handleConfirmReplace = () => {
        handleReplaceAlumnus();
    };
    const handleConfirmAdd = () => {
        handleAddAlumnusData();
    };
    const handleConfirmUpdate = () => {
        handleUpdateAlumnusData();
    };

    const handleCancel = () => {   
        setShowWarningAdminUpdate(false);
        setShowWarningAdminAdd(false);
        setShowWarningAdminReplace(false);
    };

    return (
        <>                  
            <div className='grid-container'>
                <div className='grid-item label-column'>
                    <label htmlFor='fileUpload' className='admin-description input-label'>Add Alumnus</label>
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
                </div>

                <div className='grid-item button-column'>
                    <div className='file-buttons'>
                        <button className='admin-button button-no-margin' onClick={handleReplaceAlumniClick}>Replace Alumnus Data</button>
                        <button className='admin-button' onClick={handleAddAlumniClick}>Add Alumnus Data</button>
                        <button className='admin-button' onClick={handleUpdateAlumniClick}>Update Alumnus Data</button>
                    </div>
                </div>

            </div>

            {showWarningAdminReplace && (
                <Warning
                    message="Alumni Table is going to be deleted, it's adviced to backup alumni first. Proxycurl API is going to be called and spend credits."
                    onConfirm={handleConfirmReplace}
                    onCancel={handleCancel}
                />
            )}   

            {showWarningAdminAdd && (
                <Warning
                    message="New Alumni are going to be added to the Alumni Table, it's adviced to backup alumni first. Proxycurl API is going to be called and spend credits."
                    onConfirm={handleConfirmAdd}
                    onCancel={handleCancel}
                />
            )}   

            {showWarningAdminUpdate && (
                <Warning
                    message="Alumni in the Alumni Table will be updated and new ones added, it's adviced to backup alumni first. Proxycurl API is going to be called and spend credits."
                    onConfirm={handleConfirmUpdate}
                    onCancel={handleCancel}
                />
            )}   
        </>
    );
}

export default AdminPopulate;