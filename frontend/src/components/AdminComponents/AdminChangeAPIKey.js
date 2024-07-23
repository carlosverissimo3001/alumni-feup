import React, { useState } from 'react';
import setUp from "../../helpers/setUp";
import Warning from '../Warning'; 

const AdminChangeAPIKey = () => {
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [showWarningAPI, setShowWarningAPI] = useState(false);

    const toggleApiKeyVisibility = () => {
        setShowApiKey(!showApiKey);
    }  

    // Updates the API Key
    const handleUpdateApiKey = async (apiKey) => {
        await setUp.updateApiKey(apiKey);
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


    return (
        <>                  
            <div className='grid-container'>
                <div className='grid-item label-column'>
                    <label htmlFor='newPassword' className='admin-description input-label'>Change API Key</label>
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
                    message="Are you sure you want to change the APII Key of ProxyCurl?"
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}     
        </>
    );
}

export default AdminChangeAPIKey;