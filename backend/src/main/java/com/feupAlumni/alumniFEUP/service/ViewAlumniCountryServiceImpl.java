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
                System.err.println("Table viewAlumniCountryRepository populated. Registers are going to be deteled!");
                viewAlumniCountryRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // Populates Alumni country table with values of the Alumni table
    private void populateAlumniCountryTable(Map<String, Integer> countryAlumniCount) {
        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();

        // Puts in a map the countries (as keys) and the number of alumni for each country (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = FilesHandler.extractFieldFromJson("country_full_name", linkedinInfo);
           
            // Ensures consistency across fields
            country = country.toLowerCase();

            // Update the count for the country in the map
            countryAlumniCount.put(country, countryAlumniCount.getOrDefault(country, 0) + 1);
        }
        System.err.println("Table viewAlumniCountryRepository repopulated.");
    }   

    @Override
    public void setLocationSetup() {

        cleanAlumniCountryTable();

        Map<String, Integer> countryAlumniCount = new HashMap<>();
        populateAlumniCountryTable(countryAlumniCount);
        
        File geoJSONFile = new File("frontend/src/countriesGeoJSON.json");
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        FilesHandler.fileDeletion(geoJSONFile);
        Location.createEmptyGeoJSONFile(geoJSONFile);
        System.out.println("GeoJSON file created");

        // Iterate over the map and save the data to ViewAlumniCountry table + Adds the information to the GeoJSON file
        for (Map.Entry<String, Integer> entry : countryAlumniCount.entrySet()) {
            String country = entry.getKey();
            Integer alumniCount = entry.getValue();

            try {
                // Get Country Coordinates
                String coordinates = "";
                if(country != "null"){
                    coordinates = Location.getCountryCoordinates(country);
                }

                // Saves the data in the table
                ViewAlumniCountry viewAlumniCountry = new ViewAlumniCountry(country, alumniCount, coordinates);
                viewAlumniCountryRepository.save(viewAlumniCountry);

                // Adds the country, the country coordinates and the number of alumni per country in the GeoJSON file
                Location.addInfoGeoJSON(viewAlumniCountry, geoJSONFile, gson);

            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println("Information added to the GeoJSON file.");
    }

    @Override
    public List<ViewAlumniCountry> getViewAlumniCountry() {
        return viewAlumniCountryRepository.findAll();
    }

}
