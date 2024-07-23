/**
* This class is responsible for giving success feedback to the user
*/

import React from 'react';
import { FcApproval } from "react-icons/fc";

const Success = ({message, onConfirm}) => {

    return (
        <div className="warning-overlay">
            <div className="warning-content">
                <h2 className='warning-title'><FcApproval className='warning-icon'/>Success</h2>
                <p className='message'>{message}</p>
                <button className="warning-button" onClick={onConfirm}>Next</button>
            </div>
        </div>
    );
};

export default Success;
