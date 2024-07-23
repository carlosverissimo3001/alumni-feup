import React, { useState } from 'react';
import setUp from "../../helpers/setUp";
import Warning from './Warning'; 
import Success from './Success';
import Error from './Error';

const AdminChangeAPIKey = () => {
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [showWarningAPI, setShowWarningAPI] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const toggleApiKeyVisibility = () => {
        setShowApiKey(!showApiKey);
    }  

    // Updates the API Key
    const handleUpdateApiKey = async (apiKey) => {
        var successUdateAPIKey = await setUp.updateApiKey(apiKey);
        if (successUdateAPIKey) {
            setShowSuccess(true); 
        } else {
            setShowError(true);
        }
        setShowWarningAPI(false);
    }

    const handleChangeAPIKeyClick = async () => {
        setShowWarningAPI(true);
    }

    const handleConfirm = () => {
        handleUpdateApiKey(apiKey)
    };

    const handleCancel = () => {
        setShowWarningAPI(false);
    };

    const handleConfirmSuccess = () => {
        setShowSuccess(false);
    };

    const handleConfirmError = () => {
        setShowError(false);
    }

    return (
        <>                  
            <div className='grid-container'>
                <div className='grid-item label-column'>
                    <label htmlFor='newPassword' className='admin-description input-label'>Change proxycurl API Key</label>
                </div>

                <div className='grid-item input-column'>
                    <div className='password-input-container'>
                        <input
                            type={showApiKey ? 'text' : 'password'}
                            id='apiKey'
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder='API Key'
                            className='input-pass-admin input-field'
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={toggleApiKeyVisibility}
                            className='password-toggle-button'
                            aria-label={showApiKey ? 'Hide password' : 'Show password'}
                        >
                            {showApiKey ? '👁️' : '👁️'}
                        </button>
                    </div>
                </div>

                <div className='grid-item button-column'>
                    <button className='button-no-margin admin-button' onClick={handleChangeAPIKeyClick}>Done</button>
                </div>
            </div>  
            {showWarningAPI && (
                <Warning
                    message="Are you sure you want to change the API Key of ProxyCurl?"
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
            {showSuccess && (
                <Success
                    message="Great! API Key Updated Successfully."
                    onConfirm={handleConfirmSuccess}
                />
            )}  
            {showError && (
                <Error
                    message="Ups, something went wrong while trying to update API Key."
                    onConfirm={handleConfirmError}
                />
            )}   
        </>
    );
}

export default AdminChangeAPIKey;