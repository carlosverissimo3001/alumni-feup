package com.feupAlumni.alumniFEUP.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.handlers.ExcelFilesHandler;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.handlers.TxtFilesHandler;
import com.feupAlumni.alumniFEUP.service.AdminService;
import com.feupAlumni.alumniFEUP.service.AlumniService;
import com.feupAlumni.alumniFEUP.service.DataPopulationService;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.AddAlumnusStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.ReplaceAlumnusStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.AddAlumniStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.UpdateAlumniStrategy;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.FileInputStream;

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
    @PostMapping("replaceAlumnus")
    public ResponseEntity<Resource> handleReplaceAlumnus(@RequestBody MultipartFile file){
        try {
            // Validates if the Excel File is valid. If not sends an error indicating what is the error
            List<String> arrayWithExcelStructureError = ExcelFilesHandler.validateExcelFile(file);
            List<String> arrayWithPopulationErrors = new ArrayList<>();
            if (arrayWithExcelStructureError.size() == 0) { // Valid Excel file
                // Clean Tables
                dataPopulationService.cleanTables(new ReplaceAlumnusStrategy());

                // Cleans GeoJson files 
                String fileLocation = JsonFileHandler.getPropertyFromApplicationProperties("json.fileLocation");
                JsonFileHandler.cleanGeoJsonFiles(fileLocation);

                // Populates tables 
                arrayWithPopulationErrors = dataPopulationService.populateTables(file, new AddAlumniStrategy(alumniService, adminService));
            }

            File errorFile = TxtFilesHandler.writeErrorFile(arrayWithExcelStructureError, arrayWithPopulationErrors);
            if (errorFile.length() == 0) {
                return ResponseEntity.ok().body(null);
            }
            // Return the file with errors for download
            InputStreamResource resource = new InputStreamResource(new FileInputStream(errorFile));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=errorMessages.txt");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .headers(headers)
                                .contentLength(errorFile.length())
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(resource);        
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }  
    }

    // Calls the API only for the alumnis that are not alreay in the DB
    // file: Excel File
    @PostMapping("addAlumnus")
    public ResponseEntity<Resource> handleAddAlumnus(@RequestBody MultipartFile file){
        try {
            // Validates if the Excel File is valid. If not sends an error indicating what is the error
            List<String> arrayWithExcelStructureError = ExcelFilesHandler.validateExcelFile(file);
            List<String> arrayWithPopulationErrors = new ArrayList<>();
            if (arrayWithExcelStructureError.size() == 0) { // Valid Excel file 
                // Clean Tables
                // Clean: AlumniEic, Course, City, Country, AlumniEic_Has_Course tables
                // Doesn't delete alumni table because we want to add alumnis
                dataPopulationService.cleanTables(new AddAlumnusStrategy());

                // Cleans GeoJson files
                String fileLocation = JsonFileHandler.getPropertyFromApplicationProperties("json.fileLocation");
                JsonFileHandler.cleanGeoJsonFiles(fileLocation);

                // Populates tables: alumnis it adds up, and repopulates other tables with the Alumni table again
                //                   if the alumni already exist in the DB, the ProxyCurl API doesn't get called again 
                arrayWithPopulationErrors = dataPopulationService.populateTables(file, new AddAlumniStrategy(alumniService, adminService));
            }

            File errorFile = TxtFilesHandler.writeErrorFile(arrayWithExcelStructureError, arrayWithPopulationErrors);
            if (errorFile.length() == 0) {
                return ResponseEntity.ok().body(null);
            }
            InputStreamResource resource = new InputStreamResource(new FileInputStream(errorFile));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=errorMessages.txt");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .headers(headers)
                                .contentLength(errorFile.length())
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(resource);   
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }  
    }

    // Calls the API for: alumnis already on the db (updates their data)
    //                    alumnis that are not on the db (adds their information)
    // file: Excel File
    @PostMapping("updateAlumnus")
    public ResponseEntity<Resource> handleUpdateAlumnus(@RequestBody MultipartFile file){
        try {
            // Validates if the Excel File is valid. If not sends an error indicating what is the error
            List<String> arrayWithExcelStructureError = ExcelFilesHandler.validateExcelFile(file);
            List<String> arrayWithPopulationErrors = new ArrayList<>();
            if (arrayWithExcelStructureError.size() == 0) { // Valid Excel file 
                // Clean Tables
                // Clean: AlumniEic, Course, City, Country, AlumniEic_Has_Course tables
                // Doesn't delete alumni table because we want to add alumnis and update the already existing ones
                dataPopulationService.cleanTables(new AddAlumnusStrategy());

                // Cleans GeoJson files
                String fileLocation = JsonFileHandler.getPropertyFromApplicationProperties("json.fileLocation");
                JsonFileHandler.cleanGeoJsonFiles(fileLocation);

                // Populates tables: registers are added and updated on the alumni table, and other tabler are repopulated again 
                arrayWithPopulationErrors = dataPopulationService.populateTables(file, new UpdateAlumniStrategy(alumniService, adminService));
            }

            File errorFile = TxtFilesHandler.writeErrorFile(arrayWithExcelStructureError, arrayWithPopulationErrors);
            if (errorFile.length() == 0) {
                return ResponseEntity.ok().body(null);
            }
            // Return the file with errors for download
            InputStreamResource resource = new InputStreamResource(new FileInputStream(errorFile));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=errorMessages.txt");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .headers(headers)
                                .contentLength(errorFile.length())
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(resource);        
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }  
    }

    // Puts the call to the API in an Excel file
    @PostMapping("/readAPIResultToExcel")
    public ResponseEntity<byte[]> handleAlmTblExcel() throws IOException {
        try {
            byte[] modifiedExcelBytes = alumniService.apiResultToExcel();
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
