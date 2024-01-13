package com.feupAlumni.alumniFEUP.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.service.ViewAlumniCountryService;


@RestController
@RequestMapping("/alumniCountryView")
@CrossOrigin
public class ViewAlumniCountryController {
    @Autowired
    private ViewAlumniCountryService viewAlumniCountryService;

    // Populates the data to be used in the Location view with updated information.
    // TODO: this needs to be refactored. The table for this view should be updated when the file with the Alumni info is uploaded.
    @PostMapping("/populate")
    public ResponseEntity<String> handlePopulateAlumniCountry(){
        try {
            viewAlumniCountryService.setViewAlumniCountry();
            return ResponseEntity.ok("AlumniCountry table population successfull");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during AlumniCountry table population: " + e.getMessage());
        }        
    }

    /*
    @GetMapping("/getAll")
    public List<Alumni> getAllStudents(){
        return alumniService.getAllAlumnis();
    }*/

}
