package com.feupAlumni.alumniFEUP.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.feupAlumni.alumniFEUP.model.Admin;
import com.feupAlumni.alumniFEUP.repository.AdminRepository;


@Service
public class AldminServiceImpl implements AdminService{

    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private String getAdminHashedPass() {
        Admin adminInfo = adminRepository.findByUserName("admin");
        return adminInfo.getPasswordHash();
    }

    @Override
    public Boolean verifyPassword(String password) {
        String adminHashedPassword = getAdminHashedPass();
        return passwordEncoder.matches(password, adminHashedPassword);
    }

}