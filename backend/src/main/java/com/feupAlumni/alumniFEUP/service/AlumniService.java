package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Alumni;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface AlumniService {

    // Backs up alumnis from table "Alumni". If the table is already populated, all registeries are deleted and the table is repopulated.
    public void backupAlumnis();

    // Processes the file, extracts LinkedIn links, and stores them in the database
    public void processFile(MultipartFile file);

    // Processes the file backup, which contains the response of the LinkdIn API and repopulates the Alumni table
    public void processFileBackup(MultipartFile fileBackup);
    
    // Returns all alumnis
    public List<Alumni> getAllAlumnis();

    // Puts in one table all Alumnis with fileds that have a coherent value. Puts in another table users that have "dirty" fields (no value, values that make no sense...)
    public void dataAlumniWithoutLink();
}
