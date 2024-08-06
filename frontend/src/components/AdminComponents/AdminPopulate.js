import React, { useState } from 'react';
import Warning from './Warning'; 
import { FcPlus } from "react-icons/fc";
import Success from './Success';
import Error from './Error';
import setUp from '../../helpers/setUp';

const AdminPopulate = () => {
    const [showWarningAdminReplace, setShowWarningAdminReplace] = useState(false);
    const [showWarningAdminAdd, setShowWarningAdminAdd] = useState(false);
    const [showWarningAdminUpdate, setShowWarningAdminUpdate] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [ errorMessage, setErrorMessage] = useState(false);
    const [showError, setShowError] = useState(false);
    const [executingReplace, setExecutingReplace] = useState(false);
    const [executingAdd, setExecutingAdd] = useState(false);
    const [executingUpdate, setExecutingUpdate] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedFile(file);
    };

    // Deletes the Alumni information and repopulates all tables with new updated information from the LinkedinLink API
    const handleReplaceAlumnus = async () => {
        setExecutingReplace(true);
        if (uploadedFile == null) {
            setShowWarningAdminReplace(false);
            setShowError(true);
            setErrorMessage("Ups! No Excel file has been selected.");
        } else {
            var successReplace = await setUp.replaceAlumnus(uploadedFile);
            if (successReplace) {
                setShowSuccess(true);
                setSuccessMessage("Great! Alumni information has been replaced."); 
            }  else {
                setShowError(true);
                setErrorMessage("Ups! Something went wrong while trying to replace alumni data. A file with the errors was downloaded.");
            }
            setShowWarningAdminReplace(false);
        }
        setExecutingReplace(false);
    }

    // Only calls the API to alumnis that don't already exist in the app. If the alumni exists it doesn't call the API again
    const handleAddAlumnusData = async () => {
        setExecutingAdd(true);
        if (uploadedFile == null) {
            setShowWarningAdminReplace(false);
            setShowError(true);
            setErrorMessage("Ups! No Excel file has been selected.");
        } else {
            var successReplace = await setUp.addAlumnusData(uploadedFile);
            if (successReplace) {
                setShowSuccess(true);
                setSuccessMessage("Great! New Alumni information has been added the system."); 
            } else {
                setShowError(true);
                setErrorMessage("Ups! Something went wrong while trying to add alumni data. A file with the errors was downloaded.");
            }
            setShowWarningAdminAdd(false);
        }
        setExecutingAdd(false);
    }

    // Calls the API for the alumnis that don't exist. If the alumni exists, updates the alumni information
    const handleUpdateAlumnusData = async () => {
        setExecutingUpdate(true);
        if (uploadedFile == null) {
            setShowWarningAdminReplace(false);
            setShowError(true);
            setErrorMessage("Ups! No Excel file has been selected.");
        } else {
            var successReplace = await setUp.updateAlumnusData(uploadedFile);
            if (successReplace) {
                setShowSuccess(true);
                setSuccessMessage("Great! Alumni information has been updated. A warning file might be downloaded in case something that is not trivial happened."); 
            } else {
                setShowError(true);
                setErrorMessage("Ups! Something went wrong while trying to update alumni data. A file with the errors was downloaded.");
            }
            setShowWarningAdminUpdate(false);
        }
        setExecutingUpdate(false);
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

    const handleConfirmSuccess = () => {
        setShowSuccess(false);
    }

    const handleConfirmError = () => {
        setShowError(false);
    }

    const handleCancel = () => {   
        setShowWarningAdminUpdate(false);
        setShowWarningAdminAdd(false);
        setShowWarningAdminReplace(false);
    };

    return (
        <>                  
            <div className='grid-container'>
                <div className='grid-item label-column'>
                    <label htmlFor='fileUpload' className='admin-description input-label'>Alumnus Data</label>
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
                        <button className='admin-button button-no-margin' onClick={handleReplaceAlumniClick}>Replace</button>
                        <button className='admin-button' onClick={handleAddAlumniClick}>Add</button>
                        <button className='admin-button' onClick={handleUpdateAlumniClick}>Update</button>
                    </div>
                </div>

            </div>

            {showWarningAdminReplace && (
                <Warning
                    message="It's adviced to backup alumni first. Ensure your API Key is correct. Credits of Proxycurl API will be spent and Alumni table deleted. IMPORTANT: this might take a few seconds, wait for the feedback message."
                    onConfirm={handleReplaceAlumnus}
                    onCancel={handleCancel}
                    executing={executingReplace}
                />
            )}   

            {showWarningAdminAdd && (
                <Warning
                    message="It's adviced to backup alumni first. Proxycurl API is going to be called for alumnis that are not already in the DB and credits will be spent. IMPORTANT: this might take a few seconds, wait for the feedback message."
                    onConfirm={handleAddAlumnusData}
                    onCancel={handleCancel}
                    executing={executingAdd}
                />
            )}   

            {showWarningAdminUpdate && (
                <Warning
                    message="It's adviced to backup alumni first. Proxycurl API is going to be called and credits will be spent. IMPORTANT: this might take a few seconds, wait for the feedback message."
                    onConfirm={handleUpdateAlumnusData}
                    onCancel={handleCancel}
                    executing={executingUpdate}
                />
            )}  

            {showSuccess && (
                <Success
                    message={successMessage}
                    onConfirm={handleConfirmSuccess}
                />
            )} 

            {showError && (
                <Error
                    message={errorMessage}
                    onConfirm={handleConfirmError}
                />
            )}
        </>
    );
}

export default AdminPopulate;