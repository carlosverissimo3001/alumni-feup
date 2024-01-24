package com.feupAlumni.alumniFEUP.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.model.ViewAlumniCountry;
import com.feupAlumni.alumniFEUP.service.ViewAlumniCountryService;


@RestController
@RequestMapping("/setupLocation")
@CrossOrigin
public class SetupLocationController {
    @Autowired
    private ViewAlumniCountryService viewAlumniCountryService;

    // Populates the table view_alumni_country. If it is already populated, registers are deleted and the table is repopulated
    // Generates the GeoJson File
    @PostMapping("/populate")
    public ResponseEntity<String> handleLocationSetup(){
        try {
            viewAlumniCountryService.setLocationSetup();
            return ResponseEntity.ok("Location Setup Successful: almni_country table instantiated, and GeoJSON file created.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during Location setup: " + e.getMessage());
        }        
    }

    // Returns the alumni distribution across countries
    @GetMapping("/getAll")
    public List<ViewAlumniCountry> getAllAlumniCountries(){
        return viewAlumniCountryService.getViewAlumniCountry();
    }

}
