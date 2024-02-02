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
        
        // Check if the selected file is an Excel file (xlsx or xls)
        const allowedFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedFileTypes.includes(file.type)) {
            alert('Invalid file type. Please upload an Excel file.');
            return;
        }

        const userConfirmed = window.confirm('By uploading a new file, the existing populated tables are going to be deleted and repopulated with the new information from the inserted file. Are you sure you want to continue with this action?');

        if (userConfirmed) {
            // Reads the LinkedIn links from the file, calls the API that scrapes information from each link, and stores in the Alumni table and stores in a backup file the result of the API
            console.log("If you want to perform this functionality uncoment the code in the Alumni class. This was done to avoid uploading a file and consequently calling the API by accident (wasting credits).")
            //var succAlumniInfo = setUp.getAlumniLinkedinInfo(file); 

            // Only repopulates the DB when the get information of the alumni linkedin profile was well performed
            if (/*succAlumniInfo*/true) {
                // Performs the backup of the table Alumni
                await setUp.setAlumniBackup();

                // Populates the view_alumni_country table < Calls the API to get the countries coordinates < generates the GEOJson file
                await setUp.setUpLocation();            
            }

        } else {
            console.log('User canceled file upload operation.');
        }
    }

    // Reads from the "BackUpCallAPI", which contains a backup of the data returned by the LinkdIn API => this way we avoid calling this 
    // API unecessarly.
    const handleFileUploadBackup = async () => {
       
        // Check if the selected file is a text file (txt)
        const allowedFileTypes = ['text/plain'];
        if (!allowedFileTypes.includes(file.type)) {
            alert('Invalid file type. Please upload a text file.');
            return;
        }
       
        await setUp.setAlumniUsingBackup(file);
        console.log("Backup set in the Alumni table");
        // Performs the backup of the table Alumni
        await setUp.setAlumniBackup();
        console.log("Backup set in the AlumniBackup table");
    }

    return (
        <>
            <input type="file" className='fileInput' onChange={handleFileChange} />         
            <button className="button butnUplFile" onClick={handleFileUpload}>Upload File</button>
            <button className="button butnUplFileBackup" onClick={handleFileUploadBackup}>Pop Alumni with backup file</button>

            <button className="button butnAlumCountry">Alumni per County</button>
        </>
    );
};

export default MenuButtons;
