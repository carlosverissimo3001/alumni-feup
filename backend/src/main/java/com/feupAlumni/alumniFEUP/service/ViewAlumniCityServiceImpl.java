package com.feupAlumni.alumniFEUP.service;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.ViewAlumniCity;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.ViewAlumniCityRepository;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Service
public class ViewAlumniCityServiceImpl implements ViewAlumniCityService {
    
    @Autowired
    private ViewAlumniCityRepository viewAlumniCityRepository;
    @Autowired
    private AlumniRepository alumniRepository;

    // Check if AlumniBackup table is not empty
    private void cleanAlumniCityTable() {
        if (viewAlumniCityRepository.count() > 0) {   
            try {
                System.out.println("-----");
                System.out.println("Table viewAlumniCityRepository populated. Registers are going to be deteled!");
                viewAlumniCityRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // Gets the alumni distribution per city
    private void getAlumniDistCity(Map<String, Integer> cityAlumniCount) {
        // Accesses the Alumni table and populates the ViewAlumniCity table
        List<Alumni> alumniList = alumniRepository.findAll();

        // Puts in a map the cites (as keys) and the number of alumni for each city (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String city = FilesHandler.extractFieldFromJson("city", linkedinInfo);

            // Ensures consistency across fields
            city = city.toLowerCase();

            // Update the count for the city in the map
            cityAlumniCount.put(city, cityAlumniCount.getOrDefault(city, 0) + 1);
        }
    }  

    @Override
    public void setLocationCitySetup() {

        cleanAlumniCityTable();

        Map<String, Integer> cityAlumniCount = new HashMap<>();
        getAlumniDistCity(cityAlumniCount);

        File geoJSONFile = new File("frontend/src/citiesGeoJSON.json");
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        FilesHandler.fileDeletion(geoJSONFile);
        Location.createEmptyGeoJSONFile(geoJSONFile);
        System.out.println("GeoJSON file created");

        // Iterate over the map and save the data to ViewAlumniCity table + Adds the information to the GeoJSON file
        for(Map.Entry<String, Integer> entry : cityAlumniCount.entrySet()){
            String city = entry.getKey();
            Integer alumniCount = entry.getValue();

            // Get City Coordinates
            String coordinates = "";
            if(city != "null"){
                try{
                    coordinates = Location.getCityCoordinates(city);
                    // Saves the data in the table
                    ViewAlumniCity viewAlumniCity = new ViewAlumniCity(city, coordinates, alumniCount);
                    viewAlumniCityRepository.save(viewAlumniCity);

                    // Adds the city, the city coordinates and the number of alumni per city in the GeoJSON file
                    Location.addCityGeoJSON(viewAlumniCity, geoJSONFile, gson);
                } catch (Exception e) {
                    System.out.println("city: " + city + " was not considered. Number of alumnis: " + alumniCount + " error:" + e);
                }
            }
        }
        System.out.println("Information added to the GeoJSON file and Table viewAlumniCityRepository repopulated.");
        System.out.println("-----");
    }

}
