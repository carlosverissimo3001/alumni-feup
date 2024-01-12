import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Container, Paper, Button } from '@mui/material';

export default function Alumni() {
  const paperStyle = {padding: '50px 20px', width:600, margin:"20px auto"}

  const[linkedinLink, setLinkedinLink]=useState('')
  const[alumnis, setAlumnis]=useState([])

  const handleClick=(e)=>{
    e.preventDefault()
    const alumni={linkedinLink}
    console.log(alumni)
    fetch("http://localhost:8080/alumni/add",{
        method: "Post",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(alumni)
    }).then(()=>{
        console.log("New Alumni Added")
    })
  }

  useEffect(()=>{
    fetch("http://localhost:8080/alumni/getAll")
    .then(res=>res.json())
    .then((result) => {
        setAlumnis(result);
    })
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
            <TextField id="outlined-basic" label="Alumni LinkedIn Link" variant="outlined" fullWidth value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)}/>
            <Button variant="contained" color='secondary' onClick={handleClick}>Submit</Button>
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
