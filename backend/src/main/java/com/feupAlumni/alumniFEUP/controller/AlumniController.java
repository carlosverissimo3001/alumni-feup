package com.feupAlumni.alumniFEUP.controller;

import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.service.AlumniService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/alumni")
@CrossOrigin
public class AlumniController {
    @Autowired
    private AlumniService alumniService;

    // Uploads the file containing Alumni LinkedIn links to the Alumni table along side with the data of the LinkedIn profile.
    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestBody MultipartFile file){
        try {
            alumniService.processFile(file);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

    // Uploads the BACKUP file containing the result of the LinkedIn API to the Alumni table
    @PostMapping("/uploadBackupFil")
    public ResponseEntity<String> handleFileBackupUpload(@RequestBody MultipartFile fileBackup){
        try {
            alumniService.processFileBackup(fileBackup);
            return ResponseEntity.ok("File Backup uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file backup upload: " + e.getMessage());
        }        
    }

    // Performs the backup of registers in table "Alumni" to the table AlumniBackup
    @PostMapping("/backup")
    public ResponseEntity<String> handleAlumniBackup(){
        try {
            alumniService.backupAlumnis();
            return ResponseEntity.ok("Alumnis backed up successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

    // Gets data from the Alumni table
    @GetMapping("/getAll")
    public List<Alumni> getAllStudents(){
        return alumniService.getAllAlumnis();
    }

    // Clenas the information needed to match alumnis to linkedin links. One table with the needed data and another table with the ones that are not elegible and why.
    @PostMapping("/dataHundleAlumniMatchLink")
    public ResponseEntity<String> handleDataAlumniMatchLink() {
        try {
            alumniService.dataAlumniMatchLink();
            return ResponseEntity.ok("Data for matching Alumnis with linkedins' links successfully cleaned.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while cleaning data for matching Alumnis with linkedins' links: " + e.getMessage());
        } 
    }

    // Receives an Excel file and tries to match the students with the alumnis Linkdein links in the DB.
    // Returns the file updated, this is, the file with the linkedin column field with the found links
    @PostMapping("/matchLinksToAlumnis")
    public ResponseEntity<byte[]> handleMatchLinksToAlumnis(@RequestParam("excelData") MultipartFile file) throws IOException {
        try {
            byte[] modifiedExcelBytes = alumniService.matchLinksToAlumnis(file);
            // Set the response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "modified_excel.xlsx");

            return new ResponseEntity<>(modifiedExcelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } 
    }

    // Sets the missing linkedin links on the DB 
    @PostMapping("/missingLinkedinLinks")
    public ResponseEntity<String> handleMissingLinkedinLinks() {
        try {
            alumniService.missingLinkedinLinks();
            return ResponseEntity.ok("Missing Linkedin links successfully set for the needed rows.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while seting the missing linkedin links: " + e.getMessage());
        } 
    }

    // Returns the Excel file with one column containing the alumni names, and other column containing their professional situation
    @PostMapping("/almProfiSitu")
    public ResponseEntity<byte[]> handleAlmProfiSitu(@RequestParam("excelData") MultipartFile file) throws IOException {
        try {
            byte[] modifiedExcelBytes = alumniService.excelAlumnProfSitu(file);
            // Set the response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "alumniProfSitu.xlsx");

            return new ResponseEntity<>(modifiedExcelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } 
    }

}
