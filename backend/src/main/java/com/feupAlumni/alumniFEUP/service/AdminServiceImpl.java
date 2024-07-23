package com.feupAlumni.alumniFEUP.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.feupAlumni.alumniFEUP.handlers.EncryptionHandler;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.model.Admin;
import com.feupAlumni.alumniFEUP.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;

import java.sql.Timestamp;

@Service
public class AdminServiceImpl implements AdminService{

    @Value("${encryption.key}")
    private String encryptionKey; // gets the value from application.properties Symmetric Key
    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private String getAdminHashedPass() {
        String adminUsername = JsonFileHandler.getPropertyFromApplicationProperties("admin.username");
        Admin adminInfo = adminRepository.findByUserName(adminUsername);
        return adminInfo.getPasswordHash();
    }

    private Boolean updateAdminHashedPass(String hashedPassword) {
        String adminUsername = JsonFileHandler.getPropertyFromApplicationProperties("admin.username");
        Admin admin = adminRepository.findByUserName(adminUsername);

        if (admin != null) {
            admin.setPasswordHash(hashedPassword);
            admin.setCreatedAt(new Timestamp(System.currentTimeMillis())); 
            adminRepository.save(admin);
            return true;  // Success
        } else {
            return false; // No success
        }
    }

    @Override
    public Boolean verifyPassword(String password) {
        String adminHashedPassword = getAdminHashedPass();
        return passwordEncoder.matches(password, adminHashedPassword);
    }

    @Override
    public Boolean changeAdminPass(String password) {
        String hashedPassword = passwordEncoder.encode(password);
        return updateAdminHashedPass(hashedPassword);
    }

    @Override
    public Boolean updateAPIKey(String apiKey) throws Exception {            
        // Encrypts the API Key with the symmetric key
        String encryptedApiKey = EncryptionHandler.encrypt(apiKey, encryptionKey);

        // Stores the API Key on the Database
        String adminUsername = JsonFileHandler.getPropertyFromApplicationProperties("admin.username");
        Admin admin = adminRepository.findByUserName(adminUsername);
        if (admin != null) {
            admin.setEncryptedApiKey(encryptedApiKey);
            adminRepository.save(admin);
            return true; // success
        }

        return false; // Admin user not found
    }

    @Override
    public String getEncryptedApiKey() {
        String adminUsername = JsonFileHandler.getPropertyFromApplicationProperties("admin.username");
        Admin admin = adminRepository.findByUserName(adminUsername);
        if (admin != null) {
            return admin.getEncryptedApiKey();
        }
        return ""; // admin not found and for so Encrypted API Key not found
    }

}