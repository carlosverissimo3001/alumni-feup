package com.feupAlumni.alumniFEUP.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.LocationService;
import com.feupAlumni.alumniFEUP.service.CityService;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
            System.out.println("yearFilter: " + yearFilter);
            locationService.generateGeoJson(courseFilter, yearFilter, geoJsonType);

            File geoJsonFile = new File("backend/src/locationGeoJSON.json");
            InputStreamResource resource = new InputStreamResource(new FileInputStream(geoJsonFile));

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=locationGeoJSON.json");
            headers.setContentType(MediaType.APPLICATION_JSON);

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(geoJsonFile.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
}
