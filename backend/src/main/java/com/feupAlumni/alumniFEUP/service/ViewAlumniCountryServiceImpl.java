package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.ViewAlumniCountry;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.ViewAlumniCountryRepository;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.io.File;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Service
public class ViewAlumniCountryServiceImpl implements ViewAlumniCountryService{

    @Autowired
    private ViewAlumniCountryRepository viewAlumniCountryRepository;
    @Autowired
    private AlumniRepository alumniRepository;

    // Check if AlumniBackup table is not empty
    private void cleanAlumniCountryTable() {
        if (viewAlumniCountryRepository.count() > 0) {   
            try {
                System.out.println("-----");
                System.out.println("Table viewAlumniCountryRepository populated. Registers are going to be deteled!");
                viewAlumniCountryRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // Gets the alumni distribution per country
    private void getAlumniDistCountry(Map<String, Integer> countryAlumniCount, Map<String, String> countryCodes) {
        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();

        // Puts in a map the countries (as keys) and the number of alumni for each country (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = FilesHandler.extractFieldFromJson("country_full_name", linkedinInfo, null);
            String countryCode = FilesHandler.extractFieldFromJson("country", linkedinInfo, null);

            // Ensures consistency across fields
            country = country.toLowerCase();
            countryCode = countryCode.toUpperCase();

            // Update the count for the country in the map
            countryAlumniCount.put(country, countryAlumniCount.getOrDefault(country, 0) + 1);
            // Adds the country code
            countryCodes.put(country, countryCode);
        }
    }   

    @Override
    public void setLocationSetup() {

        cleanAlumniCountryTable();

        Map<String, Integer> countryAlumniCount = new HashMap<>();
        Map<String, String> countryCodes = new HashMap<>();
        getAlumniDistCountry(countryAlumniCount, countryCodes);
        
        File geoJSONFile = new File("frontend/src/countriesGeoJSON.json");
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        FilesHandler.fileDeletion(geoJSONFile);
        Location.createEmptyGeoJSONFile(geoJSONFile);
        System.out.println("GeoJSON file created");

        // Iterate over the map and save the data to ViewAlumniCountry table + Adds the information to the GeoJSON file
        for (Map.Entry<String, Integer> entry : countryAlumniCount.entrySet()) {
            String country = entry.getKey();
            Integer alumniCount = entry.getValue();

            String countryCode = countryCodes.get(country);
            try {
                // Get Country Coordinates
                String coordinates = "";
                if(country != "null"){
                    coordinates = Location.getCountryCoordinates(countryCode);
                }

                // Saves the data in the table
                ViewAlumniCountry viewAlumniCountry = new ViewAlumniCountry(country, countryCode, alumniCount, coordinates);
                viewAlumniCountryRepository.save(viewAlumniCountry);
                

                // Adds the country, the country coordinates and the number of alumni per country in the GeoJSON file
                Location.addInfoGeoJSON(viewAlumniCountry, geoJSONFile, gson);

            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println("Information added to the GeoJSON file and Table viewAlumniCountryRepository repopulated.");
        System.out.println("-----");
    }

    @Override
    public List<ViewAlumniCountry> getViewAlumniCountry() {
        return viewAlumniCountryRepository.findAll();
    }

}
