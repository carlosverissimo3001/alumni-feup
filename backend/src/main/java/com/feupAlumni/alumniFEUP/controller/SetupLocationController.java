package com.feupAlumni.alumniFEUP.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.LocationService;
import com.feupAlumni.alumniFEUP.service.CityService;
import com.feupAlumni.alumniFEUP.handlers.FilesHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.File;

@RestController
@RequestMapping("/setupLocation")
@CrossOrigin
public class SetupLocationController {
    @Autowired
    private CountryService countryService;
    @Autowired
    private CityService cityService;
    @Autowired
    private LocationService locationService;


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

    @GetMapping("/getGeoJson")
    public ResponseEntity<InputStreamResource> getGeoJson(
        @RequestParam String courseFilter,
        @RequestParam String yearsConclusionFilter,
        @RequestParam String geoJsonType
    ) {
        try {
            List<String> yearFilter = new ObjectMapper().readValue(yearsConclusionFilter, List.class);
            
            // Determines the file name based on the input filters received
            var fileName = FilesHandler.determineFileName(geoJsonType, courseFilter, yearFilter);

            // Defines a directory where the files are stored
            String directoryPath = "backend/src/";

            // Checks if the file already exists
            File locationGeoJSON = new File(directoryPath, fileName);
            if (!locationGeoJSON.exists()) {
                // If the file doesn't exist, generates it
                locationService.generateGeoJson(locationGeoJSON, courseFilter, yearFilter, geoJsonType);
            }

            // Grabs the file and returns it 
            InputStreamResource resource = new InputStreamResource(new FileInputStream(locationGeoJSON));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
            headers.setContentType(MediaType.APPLICATION_JSON);

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(locationGeoJSON.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
