package com.feupAlumni.alumniFEUP.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface AlumniService {

    // By calling the API stores the scraped information in the Alumni Table
    //                                                   in a Backup file
    //                                                   uploades the profile pics to the folder: "C:/alimniProject/backend/src/main/java/com/feupAlumni/alumniFEUP/Images"
    // The name of the profile pics is set to the public identifier of the user, which is retrieved by the API
    public void populateAlumniTable(MultipartFile file) throws IOException, InterruptedException;;

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
