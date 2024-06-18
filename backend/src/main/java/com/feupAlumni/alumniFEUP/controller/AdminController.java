package com.feupAlumni.alumniFEUP.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.service.AdminService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminController {

    @Autowired
    private AdminService adminService;

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

}
