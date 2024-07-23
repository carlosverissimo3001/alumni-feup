import React, { useState } from 'react';
import setUp from "../../helpers/setUp";
import Warning from '../Warning'; 

const AdminChangePass = () => {
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Updates the user's password
    const handleChangePass = async (newPass, oldPassword) => {
        await setUp.changePass(newPass, oldPassword);
        setShowWarning(false); // Hide the warning afteer executing the action
    }

    // Shows warning to ensure the admin wants to change password
    const handlePasswordChangeClick = () => {
        setShowWarning(true);
    }

    const handleConfirm = () => {
        handleChangePass(newPassword, oldPassword);
    };

    const handleCancel = () => {
        setShowWarning(false);
    };

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
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
}

export default AdminChangePass;