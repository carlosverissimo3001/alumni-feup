package com.feupAlumni.alumniFEUP.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.service.AdminService;
import com.feupAlumni.alumniFEUP.service.AlumniService;
import com.feupAlumni.alumniFEUP.service.DataPopulationService;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.AddAlumnusStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.ReplaceAlumnusStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.AddAlumniStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.UpdateAlumniStrategy;

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

    // Change admin password
    @PostMapping("/changeAdminPass")
    public ResponseEntity<String> handleChangeAdminPass(@RequestBody String requestBody) {
        try {
            // ObjectMapper to convert JSON string to Map
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> map = objectMapper.readValue(requestBody, Map.class);

            // Get oldPass and newPass from the map
            String newPass = (String) map.get("newPass");
            String oldPass = (String) map.get("oldPass");

            // Verify if the old pass is correct
            Boolean validPassword = adminService.verifyPassword(oldPass);
            Boolean changedSuccess = false;
            if (validPassword) {
                // Changes the password to the new one
                changedSuccess = adminService.changeAdminPass(newPass);
            }
            
            return ResponseEntity.ok().body("{\"success\":" + changedSuccess + "}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while password update: " + e.getMessage());
        }        
    }

    // Updates API Key
    @PostMapping("/updateApiKey")
    public ResponseEntity<String> handleUpdateAPIKey(@RequestBody String requestBody) {
        try {
            //ObjectMapper to convert JSON string to Map
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> map = objectMapper.readValue(requestBody, Map.class);

            // Get apiKey
            String apiKey = (String) map.get("apiKey");

            // Updates the apiKey
            Boolean updateSuccess = adminService.updateAPIKey(apiKey);

            return ResponseEntity.ok().body("{\"success\":" + updateSuccess + "}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while updating API Key: " + e.getMessage());
        }      
    }

    // Deletes the alumni information in the DB 
    // By calling the API, repopulates the tables with new information 
    // file: Excel File
    /* TODO: UNCOMMENT THIS @PostMapping("replaceAlumnus")
    public ResponseEntity<String> handleReplaceAlumnus(@RequestBody MultipartFile file){
        try {
            // Clean Tables
            dataPopulationService.cleanTables(new ReplaceAlumnusStrategy());

            // Cleans GeoJson files C:\alumniProject\backend\src\main\resources\locationGeoJson
            JsonFileHandler.cleanGeoJsonFiles("backend/src/main/resources/locationGeoJson");
            
            // Populates tables TODO: UNCOMMENT THIS - I COMMENTED SO THE API DOESN'T GET CALLED 
            //dataPopulationService.populateTables(file, new AddAlumniStrategy());

            return ResponseEntity.ok().body("Alumni replaced successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while replacing the alumnus data: " + e.getMessage());
        }  
    }*/

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
            String fileLocation = JsonFileHandler.getPropertyFromApplicationProperties("json.fileLocation");
            JsonFileHandler.cleanGeoJsonFiles(fileLocation);

            // Populates tables: alumnis it adds up, and the others it repopulates again 
            // TODO: UNCOMMENT THIS - I COMMENTED SO THE API DOESN'T GET CALLED 
            //dataPopulationService.populateTables(file, new AddAlumniStrategy());

            return ResponseEntity.ok().body("Alumni added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while replacing the alumnus data: " + e.getMessage());
        }  
    }

    // Calls the API for: alumnis already on the db (updates their data)
    //                    alumnis that are not on the db (adds their information)
    // file: Excel File
    @PostMapping("updateAlumnus")
    public ResponseEntity<String> handleUpdateAlumnus(@RequestBody MultipartFile file){
        try {
            // Clean Tables
                // Clean: AlumniEic, Course, City, Country, AlumniEic_Has_Course tables
                // Doesn't delete alumni table because we want to add alumnis and update the already existing ones
            dataPopulationService.cleanTables(new AddAlumnusStrategy());

            // Cleans GeoJson files
            String fileLocation = JsonFileHandler.getPropertyFromApplicationProperties("json.fileLocation");
            JsonFileHandler.cleanGeoJsonFiles(fileLocation);

            // Populates tables: registers are added and updated on the alumni table, and other tabler are repopulated again 
            // TODO: UNCOMMENT THIS - I COMMENTED SO THE API DOESN'T GET CALLED 
            //dataPopulationService.populateTables(file, new UpdateAlumniStrategy());

            return ResponseEntity.ok().body("Alumni updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while updating the alumnus data: " + e.getMessage());
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
