/**
* This class is responsible for giving error feedback to the user
*/

import React from 'react';
import { FcCancel } from "react-icons/fc";

const Error = ({message, onConfirm}) => {

    return (
        <div className="warning-overlay">
            <div className="warning-content">
                <h2 className='warning-title'><FcCancel className='warning-icon'/>Error</h2>
                <p className='message'>{message}</p>
                <button className="warning-button" onClick={onConfirm}>Next</button>
            </div>
        </div>
    );
};

export default Error;
