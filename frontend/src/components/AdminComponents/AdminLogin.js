import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';

const Admin = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');

    const onNext = async () => {
        // Number of salr rounds for hashing
        const saltRounds = 10;
        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Verifies if it is the correct password
            

        } catch (error) {
            console.error('Error hashing password: ', error);
        }
    };

    const handleContinue = () => {
        navigate('/home');
    }

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
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='password'
                                    className='input-username input-usernameWelcome'
                                />
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