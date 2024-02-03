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

    // Uploads the file containing Alumni LinkedIn links to the Alumni table along side with the data of the LinkedIn profile.
    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestBody MultipartFile file){
        try {
            System.out.println("Achieved Server");
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

    // Populates a table with the information needed to identify which users don't have an LinkedIn link associated
    // Creates a separate table with the users that have either an empty field, or values that make no sense, and these users don't show on the other table
    @PostMapping("/dataHundleAlumniWithoutLink")
    public ResponseEntity<String> handleDataAlumniWithoutLink() {
        try {
            alumniService.dataAlumniWithoutLink();
            return ResponseEntity.ok("Data for detecting Alumnis without links successfully cleaned.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during detecting Alumnis without links: " + e.getMessage());
        } 
    }

}
