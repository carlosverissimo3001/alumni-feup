package com.feupAlumni.alumniFEUP.controller;

import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.service.AlumniService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

}
