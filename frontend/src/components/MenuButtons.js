import React, {useState} from 'react';
import setUp from '../helpers/setUp';

const MenuButtons = () => {

    const[file, setFile]=useState('')

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Makes the uplication setup: populades the Alumni table and performs its backup. Populates the view_alumni_country table and 
    // generates the GeoJSON file.
    const handleFileUpload = async () => {
        
        if(!file){
            alert('Please Select a File.');
            return;
        }
        
        const userConfirmed = window.confirm('By uploading a new file, the existing populated tables are going to be deleted and repopulated with the new information from the inserted file. Are you sure you want to continue with this action?');

        if (userConfirmed) {
            // Reads the LinkedIn links from the file, calls the API that scrapes information from each link, and stores in the Alumni table
            console.log("If you want to perform this functionality uncoment the code in the Alumni class. This was done to avoid uploading a file and consequently calling the API by accident (wasting credits).")
            var succAlumniInfo = setUp.getAlumniLinkedinInfo(file); 

            // Only repopulates the DB when the get information of the alumni linkedin profile was well performed
            if (succAlumniInfo) {
                // Performs the backup of the table Alumni
                await setUp.setAlumniBackup();

                // Populates the view_alumni_country table < Calls the API to get the countries coordinates < generates the GEOJson file
                await setUp.setPopulateView();            
            }

        } else {
            console.log('User canceled file upload operation.');
        }
    }

    return (
        <>
            <input type="file" className='fileInput' onChange={handleFileChange} accept=".txt" />         
            <button className="button butnUplFile" onClick={handleFileUpload}>Upload File</button>

            <button className="button butnAlumCountry">Alumni per County</button>
        </>
    );
};

export default MenuButtons;
