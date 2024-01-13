package com.feupAlumni.alumniFEUP.controller;

import com.feupAlumni.alumniFEUP.service.AlumniBackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/alumniBackup")
@CrossOrigin
public class AlumniBackupController {
    @Autowired
    private AlumniBackupService alumniBackupService;

    // Performs the backup of registers in table "Alumni"
    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(){
        try {
            alumniBackupService.backupAlumnis();
            return ResponseEntity.ok("Alumnis backed up successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

}
