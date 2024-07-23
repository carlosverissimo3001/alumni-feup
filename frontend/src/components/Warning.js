/**
* This class is responsible for showing warning messages for the user
*/

import React from 'react';
import { FcHighPriority } from "react-icons/fc";

const Warning = ({message, onConfirm, onCancel}) => {

    return (
        <div className="warning-overlay">
            <div className="warning-content">
                <h2 className='warning-title'><FcHighPriority className='warning-icon'/>Warning</h2>
                <p className='message'>{message}</p>
                <button className="warning-button" onClick={onConfirm}>Next</button>
                <button className="warning-button" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default Warning;
