package com.feupAlumni.alumniFEUP.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.model.Alumni;

public interface AlumniService {

    // Deletes the alumni information in the DB 
    // By calling the API, repopulates the tables with new information: Alumni, BackupAlumni, AlumniEIC, Couse, AlumniEIC_Has_Course
    //                                                                  City, Country
    // Profile Pic: Uploades the profile pics to the folder: "C:/alimniProject/backend/src/main/java/com/feupAlumni/alumniFEUP/Images"
    //              The name of the profile pics is set to the public identifier of the user, which is retrieved by the API
    // file: Excel File
    public void populateAlumniTable(MultipartFile file) throws IOException, InterruptedException;

    // Writes the alumni table to an Excel file
    public byte[] alumniTableToExcel(MultipartFile file);

    // Populates table
    public void addAlumni(Alumni alumni);

    // Returns all alumnis
    public List<Alumni> getAllAlumnis();

    // Sees if the linkedin link exists in the tabel 
    public boolean linkedinExists(String linkValue);

    // Gets the alumni distribution per city
    public void getAlumniDistCity(Map<String, Integer> cityAlumniCount);

    // Gets the alumni distribution per country
    public void getAlumniDistCountry(Map<String, Integer> countryAlumniCount, Map<String, String> countryCodes);

    // Cleans the data in the Alumni Table
    public void cleanAlumniTable();

}
