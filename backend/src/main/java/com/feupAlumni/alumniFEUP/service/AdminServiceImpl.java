package com.feupAlumni.alumniFEUP.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.feupAlumni.alumniFEUP.model.Admin;
import com.feupAlumni.alumniFEUP.repository.AdminRepository;

import java.sql.Timestamp;

@Service
public class AdminServiceImpl implements AdminService{

    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private String getAdminHashedPass() {
        Admin adminInfo = adminRepository.findByUserName("admin");
        return adminInfo.getPasswordHash();
    }

    private Boolean updateAdminHashedPass(String hashedPassword) {
        Admin admin = adminRepository.findByUserName("admin");

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

}