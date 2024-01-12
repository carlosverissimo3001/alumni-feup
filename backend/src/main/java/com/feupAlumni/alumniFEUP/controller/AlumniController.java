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

    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestBody MultipartFile file){
        try {
            alumniService.processFile(file);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

    @GetMapping("/getAll")
    public List<Alumni> getAllStudents(){
        return alumniService.getAllAlumnis();
    }

}
