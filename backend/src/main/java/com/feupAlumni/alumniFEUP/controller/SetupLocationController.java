package com.feupAlumni.alumniFEUP.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.CityService;

@RestController
@RequestMapping("/setupLocation")
@CrossOrigin
public class SetupLocationController {
    @Autowired
    private CountryService countryService;
    @Autowired
    private CityService cityService;

    // Populates the table country. If it is already populated, registers are deleted and the table is repopulated
    @PostMapping("/populateCountry")
    public ResponseEntity<String> handleCountryTablePopulate(){
        try {
            countryService.populateCountryTable();
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

    // Populates the table city. If it is already populated, registers are deleted and the table is repopulated
    @PostMapping("/generateCountryGeoJason")
    public ResponseEntity<String> handleCountryGeoJason(){
        try{
            countryService.generateCountryGeoJson();
            return ResponseEntity.ok("Country GeoJason successfully created.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during country geoJason generation: " + e.getMessage());
        }
    }

    // Populates the table city. If it is already populated, registers are deleted and the table is repopulated
    @PostMapping("/generateCityGeoJason")
    public ResponseEntity<String> handleCityGeoJason(){
        try{
            cityService.generateCityGeoJason();
            return ResponseEntity.ok("City GeoJason successfully created.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during city geoJason generation: " + e.getMessage());
        }
    }
}
