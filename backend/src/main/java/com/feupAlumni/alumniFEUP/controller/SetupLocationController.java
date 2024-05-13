package com.feupAlumni.alumniFEUP.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.CityService;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

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

    // Generates the country geoJson
    @PostMapping("/generateCountryGeoJson")
    public ResponseEntity<String> handleCountryGeoJson(@RequestBody String filters){
        try{
            ObjectMapper objectMapper = new ObjectMapper(); // Use ObjectMapper to convert JSON string to Map
            Map<String, Object> map = objectMapper.readValue(filters, Map.class);
            
            String courseFilter = (String) map.get("courseFilter"); // Extract courseFilter from the Map            
            List<String> yearFilter = (List<String>) map.get("yearsConclusionFilter"); // Extract yearsConclusionFilter from the Map
            
            countryService.generateCountryGeoJson(courseFilter, yearFilter);
            return ResponseEntity.ok("Country GeoJason successfully created.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during country geoJason generation: " + e.getMessage());
        }
    }

    // Generates the city geoJson
    @PostMapping("/generateCityGeoJson")
    public ResponseEntity<String> handleCityGeoJson(@RequestBody String filters){
        try{
            ObjectMapper objectMapper = new ObjectMapper(); // Use ObjectMapper to convert JSON string to Map
            Map<String, Object> map = objectMapper.readValue(filters, Map.class);

            String courseFilter = (String) map.get("courseFilter"); // Extract cityFilter from the Map
            List<String> yearFilter = (List<String>) map.get("yearsConclusionFilter"); // Extract yearsConclusionFilter from the Map

            cityService.generateCityGeoJson(courseFilter, yearFilter);
            return ResponseEntity.ok("City GeoJason successfully created.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during city geoJason generation: " + e.getMessage());
        }
    }
}
