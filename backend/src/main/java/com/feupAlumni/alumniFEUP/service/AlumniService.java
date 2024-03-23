package com.feupAlumni.alumniFEUP.service;

import org.springframework.web.multipart.MultipartFile;

public interface AlumniService {

    // By calling the API stores the scraped information in the Alumni Table
    //                                                   in a Backup file
    public void populateAlumniTable(MultipartFile file);

    // Backs up alumnis from table "Alumni". If the table is already populated:  all registeries are deleted
    //                                                                           the table is repopulated.
    public void backupAlumniTable();

    // Processes the file backup, which contains the response of the LinkdIn API and repopulates the Alumni table
    public void processFileBackup(MultipartFile fileBackup);

    // Associates the missing linkedin links to the needed rows
    public void missingLinkedinLinks();

    // Populates the AlumniEic table
    public void populateAlumniEic();
}
