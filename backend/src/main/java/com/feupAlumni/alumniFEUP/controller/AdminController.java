package com.feupAlumni.alumniFEUP.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.service.AdminService;
import com.feupAlumni.alumniFEUP.service.AlumniService;
import com.feupAlumni.alumniFEUP.service.DataPopulationService;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.AddAlumnusStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.ReplaceAlumnusStrategy;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminController {

    @Autowired
    private AdminService adminService;
    @Autowired
    private DataPopulationService dataPopulationService;
    @Autowired
    private AlumniService alumniService;

    // Verifies if the admin password is correct
    @PostMapping("/verifyPass")
    public ResponseEntity<String> handleVerifyPassword(@RequestBody String passRequest){
        try {
            // Gets the password
            ObjectMapper objectMapper = new ObjectMapper(); // Use ObjectMapper to convert JSON string to Map
            Map<String, Object> map = objectMapper.readValue(passRequest, Map.class);
            String password = (String) map.get("password");
            var validPassword = adminService.verifyPassword(password);
            
            return ResponseEntity.ok().body("{\"validPassword\":" + validPassword + "}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while password verification: " + e.getMessage());
        }        
    }

    // Deletes the alumni information in the DB 
    // By calling the API, repopulates the tables with new information 
    // file: Excel File
    @PostMapping("replaceAlumnus")
    public ResponseEntity<String> handleReplaceAlumnus(@RequestBody MultipartFile file){
        try {
            // Clean Tables
            dataPopulationService.cleanTables(new ReplaceAlumnusStrategy());

            // Cleans GeoJson files
            JsonFileHandler.cleanGeoJsonFiles("backend/src/resources/locationGeoJson");

            // Populates tables 
            dataPopulationService.populateTables(file);

            return ResponseEntity.ok().body("");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while replacing the alumnus data: " + e.getMessage());
        }  
    }

    // Calls the API only for the alumnis that are not alreay in the DB
    // file: Excel File
    @PostMapping("addAlumnus")
    public ResponseEntity<String> handleAddAlumnus(@RequestBody MultipartFile file){
        try {
            // Clean Tables
                // Clean: AlumniEic, Course, City, Country, AlumniEic_Has_Course tables
                // Doesn't delete alumni table because we want to add alumnis
            dataPopulationService.cleanTables(new AddAlumnusStrategy());

            // Cleans GeoJson files
            JsonFileHandler.cleanGeoJsonFiles("backend/src/resources/locationGeoJson");

            // Populates tables: alumnis it adds up, and the others it repopulates again
            dataPopulationService.populateTables(file);

            return ResponseEntity.ok().body("");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while replacing the alumnus data: " + e.getMessage());
        }  
    }

    // Backs up the alumni table to an excel file
    @PostMapping("/readToExcel")
    public ResponseEntity<byte[]> handleAlmTblExcel() throws IOException {
        try {
            byte[] modifiedExcelBytes = alumniService.alumniTableToExcel();
            // Set the response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "alumniInformationAPI.xlsx");

            return new ResponseEntity<>(modifiedExcelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } 
    }
}
