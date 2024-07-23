import React, { useState } from 'react';
import { FcPlus } from "react-icons/fc";
import Warning from '../Warning'; 

const ReplaceAlumni = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [showWarningAddAlumni, setShowWarningAddAlumni] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedFile(file);
    };

    // Deletes the Alumni information and repopulates all tables with new updated information from the LinkedinLink API
    const handleReplaceAlumnus = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        // await setUp.replaceAlumnus(uploadedFile); Commented meanwhile
        setShowWarningAddAlumni(false);
    }

    // Only calls the API to alumnis that don't already exist in the app. If the alumni exists it doesn't call the API again
    const handleAddAlumnusData = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        // await setUp.addAlumnusData(uploadedFile); Commented meanwhile
        setShowWarningAddAlumni(false);
    }

    // Calls the API for the alumnis that don't exist. If the alumni exists, updates the alumni information
    const handleUpdateAlumnusData = async () => {
        // TODO: SHOULD ENSURE THE FILE IS AN EXCEL FILE AND THAT THERE IS A FILE
        // await setUp.updateAlumnusData(uploadedFile); Commented meanwhile
        setShowWarningAddAlumni(false);
    }

    const handleConfirm = () => {
        handleUpdateApiKey(apiKey)
    };

    const handleCancel = () => {
        setShowWarningAddAlumni(false);
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
                        <button className='admin-button button-no-margin' onClick={handleReplaceAlumnus}>Replace Alumnus Data</button>
                        <button className='admin-button' onClick={handleAddAlumnusData}>Add Alumnus Data</button>
                        <button className='admin-button' onClick={handleUpdateAlumnusData}>Update Alumnus Data</button>
                    </div>
                </div>
            </div>
            {showWarningAddAlumni && (
                <Warning
                    message="It's advised to first Backup Alumni Data. ProxyCurl API is going to be called and credits will be spent."
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}   
        </>
    );
}

export default ReplaceAlumni;