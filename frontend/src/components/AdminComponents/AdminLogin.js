import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import setUp from '../../helpers/setUp';

const Admin = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onNext = async () => {
        try {
            // Verifies if it is the correct password
            const validPass = await setUp.verifyCorrectPassword(password);
            if (validPass) {
                navigate('/adminDefinitions');
            } else {
                // Send warning pop up of incorrect pass
                console.log("NOT HOME SCREEN");
            }
        } catch (error) {
            console.error('Error hashing password: ', error);
        }
    };

    return (
        <>
            <div className='background-admin'>
                <div className='content-container'>
                    <div className='login-wrapper content-wrapper'>
                        <div className='shadow-overlay shadow-overlay-login'></div>
                        <div className='content-column'>
                            <h1 className='admin-heading'>Adimin Login</h1>
                            <p className='admin-description'>Please enter the admin password.</p>
                        </div>
                        <div className='login-column'>
                            <div className='input-button-container-welcome'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='password'
                                    className='input-username input-usernameWelcome'
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className='password-toggle-button password-toggle-button-login'
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '👁️' : '👁️'}
                                </button>
                                <button className='app-button app-button__welcome' onClick={onNext}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}

export default Admin;