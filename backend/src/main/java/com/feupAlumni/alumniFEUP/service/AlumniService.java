package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Alumni;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface AlumniService {

    // Backs up alumnis from table "Alumni". If the table is already populated, all registeries are deleted and the table is repopulated.
    public void backupAlumnis();

    // Processes the file, extracts LinkedIn links, and stores them in the database
    public void processFile(MultipartFile file);
    
    // Returns alll alumnis
    public List<Alumni> getAllAlumnis();
}
