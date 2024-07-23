import React, { useState } from 'react';
import setUp from "../../helpers/setUp";
import Warning from './Warning'; 
import Success from './Success';
import Error from './Error';

const AdminChangePass = () => {
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Updates the user's password
    const handleChangePass = async (newPass, oldPassword) => {
        var success = await setUp.changePass(newPass, oldPassword);
        if (success) {
            setShowSuccess(true);
        } else {
            setShowError(true);
        }
        setShowWarning(false); // Hide the warning afteer executing the action
    }

    // Shows warning to ensure the admin wants to change password
    const handlePasswordChangeClick = () => {
        setShowWarning(true);
    }

    const handleConfirmWarning = () => {
        handleChangePass(newPassword, oldPassword);
    };

    const handleCancel = () => {
        setShowWarning(false);
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
                    <label htmlFor='newPassword' className='admin-description input-label'>Change Password</label>
                </div>

                <div className='grid-item'>
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
                    <button className='button-no-margin admin-button' onClick={handlePasswordChangeClick}>Done</button>
                </div>
            </div>
            {showWarning && (
                <Warning
                    message="Are you sure you want to change the password?"
                    onConfirm={handleConfirmWarning}
                    onCancel={handleCancel}
                />
            )}
            {showSuccess && (
                <Success
                    message="Great! Password Updated Successfully."
                    onConfirm={handleConfirmSuccess}
                />
            )}
            {showError && (
                <Error
                    message="Ups, something went wrong while trying to update password. Ensure the old password is correct."
                    onConfirm={handleConfirmError}
                />
            )}
        </>
    );
}

export default AdminChangePass;