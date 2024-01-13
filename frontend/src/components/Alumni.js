import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import { Container, Paper, Button, Input } from '@mui/material';

export default function Alumni() {
  const paperStyle = {padding: '50px 20px', width:600, margin:"20px auto"}

  const[file, setFile]=useState('')
  const[alumnis, setAlumnis]=useState([])

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Backup of the alumni table to an alumniBack up table
  const handleAlumniBackup = async () => {
    //console.log("If you want to perform this functionality uncoment the code in the Alumni class. This was done to avoid backup replication in the table.")
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

  // Adds the file with the alumnis' linkedin link to the database
  const handleFileUpload = async () => {
    console.log("If you want to perform this functionality uncoment the code in the Alumni class. This was done to avoid uploading a file and consequently calling the API (wasting credits) by accident.")
    /*
    if(!file){
        alert('Please Select a File.');
        return;
    }

    // File is sent to the server using a 'FormData' object
    const formData = new FormData();
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
        } else {
            console.error('File upload failed');
        }

    } catch (error) {
        console.error('Error during file upload:', error);
    }*/

  }

  const handlePopulateView = async () => {
    try {
        const response = await fetch('http://localhost:8080/alumniCountryView/populate', {
            method: 'POST',
            body: '',
        });

        if (response.ok){
            console.log('ViewAlumniCountry Table pouplated sccessfully.');
            // Trigger a refresh of the alumni list after file upload
            fetchAlumnis();
        } else {
            console.error('ViewAlumniCountry Table FAILED to pouplated.');
        }
    } catch (error) {
        console.error('Error during ViewAlumniCountry Table upload', error);
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

  useEffect(()=>{
    fetchAlumnis();
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
            <Button variant="contained" color='secondary' onClick={handleAlumniBackup}>Backup Alumnis</Button>
            <Button variant="contained" color='secondary' onClick={handlePopulateView}>Populate ViewAlumniCountry Table</Button>
            </Box>
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
