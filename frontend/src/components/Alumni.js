import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import { Container, Paper, Button, Input } from '@mui/material';

export default function Alumni() {
  const paperStyle = {padding: '50px 20px', width:600, margin:"20px auto"}

  const[file, setFile]=useState('')
  const[alumnis, setAlumnis]=useState([])
  const[viewAlumnisCountry, seViewAlumniCountry]=useState([])

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  /* 
   * Calls the endpoint responsible for reading the linkdin links from the file, calling the API capable of scraping the LinkdeIn profile
   * and stores the scraped information in the table Alumni
   */
  const getAlumniLinkedinInfo = async () => {
    return true; // TODO: take this when the code below is to be uncommented
    // File is sent to the server using a 'FormData' object
    /*const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:8080/alumni/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok){
            console.log('File uploaded successfully');
            // Trigger a refresh of the alumni list after file upload
            fetchAlumnis();
            return true;
        } else {
            console.error('File upload failed');
            return false;
        }

    } catch (error) {
        console.error('Error during file upload:', error);
        return false;
    }*/
  }

  /* 
   * Backup of the alumni table to an alumniBack up table. If the table is already populated the data is 
   * going to be deleted and the table repopulated.
   */
  const setAlumniBackup = async () => {
    try {
        const response = await fetch('http://localhost:8080/alumni/backup', {
            method: 'POST',
            body: '',
        });

        if (response.ok){
            console.log('Alumni backup successful');
        } else {
            console.error('Error during alumni backup.');
        }
    } catch(error) {
        console.error('Error during alumni backup:', error);
    }
  }

  /*
   * Calls the endpoint responsible for counting the number of alumni per country
   * calls the API capable of getting the coordinates of each of these countries
   * populates the table view_alumni_country => if the table is already populated, the registers are delted and the table is repopulated.
   */
  const setPopulateView = async () => {
    try {
        const response = await fetch('http://localhost:8080/alumniCountryView/populate', {
            method: 'POST',
            body: '',
        });

        if (response.ok){
            console.log('ViewAlumniCountry Table pouplated sccessfully.');
            // Trigger a refresh of the ViewAlumniCountry list after the table being populated
            fetchViewAlumniCountry();
        } else {
            console.error('ViewAlumniCountry Table FAILED to pouplated.');
        }
    } catch (error) {
        console.error('Error during ViewAlumniCountry Table upload', error);
    }
  }

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
        var succAlumniInfo = getAlumniLinkedinInfo(); 

        // Only repopulates the DB when the get information of the alumni linkedin profile was well performed
        if (succAlumniInfo) {
            // Performs the backup of the table Alumni
            setAlumniBackup();

            // Populates the view_alumni_country table
                // Calls the API to get the countries coordinates
            setPopulateView();

            // Generates the GEOJason file
        }

    } else {
        console.log('User canceled file upload operation.');
    }
    
  }

  const fetchAlumnis = () => {
    fetch('http://localhost:8080/alumni/getAll')
    .then((res)=>res.json())
    .then((result) => {
        setAlumnis(result);
    })
    .catch((error) => console.error('Error fetching alumnis: ', error));
  }

  const fetchViewAlumniCountry = () => {
    fetch('http://localhost:8080/alumniCountryView/getAll')
    .then((res)=>res.json())
    .then((result) => {
        console.log(result);
        seViewAlumniCountry(result);
    })
    .catch((error) => console.error('Error fetching alumnis: ', error));
  }

  useEffect(()=>{
    fetchAlumnis();
    fetchViewAlumniCountry();
  }, [])

  return (
    <Container>
        <Paper elevation={3} style={paperStyle}>
            <h1 style={{color:"blue"}}><u>Add Alumni</u></h1>
            <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1 },
            }}
            noValidate
            autoComplete="off"
            >
            <Input type="file" onChange={handleFileChange} accept=".txt" />              
            <Button variant="contained" color='secondary' onClick={handleFileUpload}>Upload File</Button>
            </Box>
        </Paper>  

        <h1>View</h1>

        <Paper elevation={3} style={paperStyle}>
            {viewAlumnisCountry.map(viewAlumniCountry=>(
                <Paper elevation={6} style={{margin:"10px", padding:"15px", textAlign:"left"}} key={viewAlumniCountry.id}>
                    Country: {viewAlumniCountry.country}<br/>
                    Nº of Alumnis: {viewAlumniCountry.nalumniInCountry}<br/>
                </Paper>
            ))
            }
        </Paper>


        <h1>Alumnis</h1>
        
        <Paper elevation={3} style={paperStyle}>
            {alumnis.map(alumni=>(
                <Paper elevation={6} style={{margin:"10px", padding:"15px", textAlign:"left"}} key={alumni.id}>
                    Id:{alumni.id}<br/>
                    LinkedInLink:{alumni.linkedinLink}<br/>
                </Paper>
            ))
            }
        </Paper>
        
    </Container>
  );
}
