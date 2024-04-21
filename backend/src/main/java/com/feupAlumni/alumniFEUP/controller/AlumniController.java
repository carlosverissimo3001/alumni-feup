package com.feupAlumni.alumniFEUP.controller;

import com.feupAlumni.alumniFEUP.service.AlumniService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/alumni")
@CrossOrigin
public class AlumniController {
    @Autowired
    private AlumniService alumniService;

    // By calling the API that scrapes info from profiles: populates the Alumni table 
    //                                                     stores information in a backup file
    @PostMapping("/upload")
    public ResponseEntity<String> handlePopulateAlumniTable(@RequestBody MultipartFile file){
        try {
            alumniService.populateAlumniTable(file);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

    // Performs the backup of registers in table "Alumni"
    @PostMapping("/backup")
    public ResponseEntity<String> handleAlumniTableBackup(){
        try {
            alumniService.backupAlumniTable();
            return ResponseEntity.ok("Alumnis backed up successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

    // Uploads the BACKUP file containing the result of the LinkedIn API to the Alumni table
    @PostMapping("/uploadBackupFile")
    public ResponseEntity<String> handleFileBackupUpload(@RequestBody MultipartFile fileBackup){
        try {
            alumniService.processFileBackup(fileBackup);
            return ResponseEntity.ok("File Backup uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file backup upload: " + e.getMessage());
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

    // Makes sure that every linkedin link finishes with /
    @PostMapping("/refactorlinkdinLinkAlumnis")
    public ResponseEntity<String> refactorlinkdinLinkAlumnis() {
        try {
            System.out.println("--------");
            alumniService.refactorlinkdinLinkAlumnis();
            return ResponseEntity.ok("Finished: every linkedin link in the alumni table finishes with /.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while trying to make sure that every linkedin link in the alumni table finishes with /: " + e.getMessage());
        } 
    }

    // Delete repeated alumnis
    @PostMapping("/deleteRepeatedAlumnis")
    public ResponseEntity<String> deleteRepeatedAlumnis() {
        try {
            System.out.println("--------");
            alumniService.deleteRepeatedAlumnis();
            return ResponseEntity.ok("Repeated Alumnis deleted.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while deleting repeated alumnis: " + e.getMessage());
        } 
    }

    // Populated the table alumniEIC. If it is already populated, registers are deleted and the table is repopulated
    @PostMapping("/populateAlumniEIC")
    public ResponseEntity<String> handlePopulateAlumniEic(@RequestBody MultipartFile file){
        try{
            alumniService.populateAlumniEic(file);
            return ResponseEntity.ok("AlumniEIC successfully populated.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while populating AlumniEIC table: " + e.getMessage());
        }
    }

    // Populates the table
    @PostMapping("/populateCoursesTable")
    public ResponseEntity<String> handlePopulateCoursesTable(@RequestBody MultipartFile file){
        try{
            alumniService.populateCoursesTable(file);
            return ResponseEntity.ok("Courses successfully populated.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while populating Courses table: " + e.getMessage());
        }
    }
}
