/**
* This class is responsible for showing information messages for the user
*/

import React from 'react';
import { FcInfo } from "react-icons/fc";

const Infromation = ({message, onConfirm}) => {

    return (
        <div className="warning-overlay">
            <div className="warning-content">
                <h2 className='warning-title'><FcInfo className='warning-icon'/>Information</h2>
                <p className='message'>{message}</p>
                <button className="warning-button" onClick={onConfirm}>Proceed with download</button>
            </div>
        </div>
    );
};

export default Infromation;
