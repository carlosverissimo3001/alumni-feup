import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//import {useWeb3} from '../helpers/web3Client';
//import UserApp from '../helpers/UserApp'
//import InfoPopup from './Infos/InfoPopup';
import { FcHighPriority } from "react-icons/fc";

const Admin = () => {
    const [showInfoNamePopup, setShowInfoNamePopup] = useState(false); // controls the info name popup visibility
    const [message, setMessage] = useState("");
    const [titleInfoNamePopup, setTitleInfoNamePopup] = useState("");
    const navigate = useNavigate();
    //const {fileManagerFacadeInstance} = useWeb3();
    const [password, setPassword] = useState('');

    // On page refresh redirects the user to the WalletConnection page
    /*useEffect(() => {
        async function fetchData() {
            if (fileManagerFacadeInstance.current == null) {
                navigate("/");
            }
        }
        fetchData();
    }, [fileManagerFacadeInstance, navigate]);*/

    const onNext = async () => {
        // Hashes the inserted mnemonic
        /*var hashedMnemonic = await fileManagerFacadeInstance.current.hashMnemonicSymmetricEncryption(mnemonic);
        // Verifies if the entered mnemonic belongs to a given user
        UserApp.verifyMnemonic(hashedMnemonic, fileManagerFacadeInstance.current).then(async (correctMnemonic)=>{
            if (correctMnemonic) {
                // Regenerates the public and private keys for the given mnomonic and sets on the local storage 
                const {privateKey, publicKey, address} = await fileManagerFacadeInstance.current.generateKeysFromMnemonic(mnemonic);
                await fileManagerFacadeInstance.current.storeLocalSotrage(privateKey, publicKey, address);

                // Logs in the user in the backend
                await fileManagerFacadeInstance.current.logsInUser();
                
                // Redirects the user to the home page
                handleContinue();
                return;
            } 
            
            setShowInfoNamePopup(true);
            setMessage("Oops! That doesn't look like the correct seed. Please make sure you've entered the seed given to you when you first logged in. Remember, it's private and should not be shared.");
            setTitleInfoNamePopup("Attention");
        }).catch(err=>{
            console.log(err);
        })   */
    };

    const handleContinue = () => {
        cleanFields();
        navigate('/home');
    }

    const handleContinueName = () => {
        cleanFields();
        navigate('/login');
    }

    const cleanFields = () => {
        setShowInfoNamePopup(false);
        setMessage("");
        setTitleInfoNamePopup("");
    }

    const handleBack = async () => {
        navigate('/');
    }

    const iconComponent = FcHighPriority;

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
                                    type="text"
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