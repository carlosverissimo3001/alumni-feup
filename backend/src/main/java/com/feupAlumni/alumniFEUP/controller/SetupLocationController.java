package com.feupAlumni.alumniFEUP.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.LocationService;
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

    // Generates the geoJson
    @PostMapping("/generateGeoJson")
    public ResponseEntity<String> handleGeoJson(@RequestBody String filters){
        try{
            ObjectMapper objectMapper = new ObjectMapper();                            // Use ObjectMapper to convert JSON string to Map
            Map<String, Object> map = objectMapper.readValue(filters, Map.class);
            
            String geoJsonType = (String) map.get("geoJsonType");
            String courseFilter = (String) map.get("courseFilter");                    // Extract courseFilter from the Map            
            List<String> yearFilter = (List<String>) map.get("yearsConclusionFilter"); // Extract yearsConclusionFilter from the Map
            
            locationService.generateGeoJson(courseFilter, yearFilter, geoJsonType);
            return ResponseEntity.ok("GeoJson successfully created.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during geoJson generation: " + e.getMessage());
        }
    }
}
