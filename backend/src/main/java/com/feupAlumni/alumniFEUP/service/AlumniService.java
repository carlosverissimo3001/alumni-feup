package com.feupAlumni.alumniFEUP.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.AlumniStrategy;

public interface AlumniService {

    // Deletes the alumni information in the DB 
    // By calling the API, repopulates the tables with new information: Alumni, BackupAlumni, AlumniEIC, Couse, AlumniEIC_Has_Course
    //                                                                  City, Country
    // Profile Pic: Uploades the profile pics to the folder: "C:/alimniProject/backend/src/main/java/com/feupAlumni/alumniFEUP/Images"
    //              The name of the profile pics is set to the public identifier of the user, which is retrieved by the API
    // file: Excel File
    public void populateAlumniTable(MultipartFile file, AlumniStrategy strategy) throws IOException, InterruptedException;

    // Writes the alumni table to an Excel file
    public byte[] alumniTableToExcel();

    // Populates table
    public void addAlumni(Alumni alumni);

    // Returns all alumnis
    public List<Alumni> getAllAlumnis();

    // Sees if the linkedin link exists in the tabel 
    public boolean linkedinExists(String linkValue);    

    // Finds the alumni based on its linkedin link
    public Alumni findByLinkedinLink(String linkValue);

    // cityInformation[0] => map where Key: cityName Value: cityCoordinates
    // cityInformation[1] => map where Key: cityCoordinates Value: Nº of Alumnis in the city coordinates
    // This had to be implemented like this in order to avoid calling the API that gets the city coordinates twice
    public ArrayList<Map<String, String>> getCityInformation() throws IOException, InterruptedException;

    // Gets the alumni distribution per country
    public void getAlumniDistCountry(Map<String, Integer> countryAlumniCount, Map<String, String> countryCodes);

    // Cleans the data in the Alumni Table
    public void cleanAlumniTable();

}
