package com.feupAlumni.alumniFEUP.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.model.Country;
import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.CityService;


@RestController
@RequestMapping("/setupLocation")
@CrossOrigin
public class SetupLocationController {
    @Autowired
    private CountryService viewAlumniCountryService;
    @Autowired
    private CityService cityService;

    // Populates the table country. If it is already populated, registers are deleted and the table is repopulated
    @PostMapping("/populateCountry")
    public ResponseEntity<String> handleCountryTablePopulate(){
        try {
            viewAlumniCountryService.populateCountryTable();
            return ResponseEntity.ok("Country table successfully populated.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during Location setup: " + e.getMessage());
        }        
    }

    // Populates the table city. If it is already populated, registers are deleted and the table is repopulated
    @PostMapping("/populateCity")
    public ResponseEntity<String> handleCityTablePopulate(){
        try{
            cityService.populateCityTable();
            return ResponseEntity.ok("City table successfully popoulated.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during Location City setup: " + e.getMessage());
        }
    }

    // Returns the alumni distribution across countries
    @GetMapping("/getAll")
    public List<Country> getAllAlumniCountries(){
        return viewAlumniCountryService.getViewAlumniCountry();
    }

}
