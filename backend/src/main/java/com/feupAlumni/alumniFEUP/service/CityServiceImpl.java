package com.feupAlumni.alumniFEUP.service;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feupAlumni.alumniFEUP.handlers.CleanData;
import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.City;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.CityRepository;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Service
public class CityServiceImpl implements CityService {
    
    @Autowired
    private CityRepository cityRepository;
    @Autowired
    private AlumniRepository alumniRepository;

    // Gets the alumni distribution per city
    private void getAlumniDistCity(Map<String, Integer> cityAlumniCount) {
        // Accesses the Alumni table and populates the City table
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
    public void populateCityTable() {
        CleanData.cleanTable(cityRepository);

        Map<String, Integer> cityAlumniCount = new HashMap<>();
        getAlumniDistCity(cityAlumniCount);

        // Iterate over the map and save the data to city table + Adds the information to the GeoJSON file
        for(Map.Entry<String, Integer> entry : cityAlumniCount.entrySet()){
            String city = entry.getKey();
            Integer alumniCount = entry.getValue();

            // Get City Coordinates
            String coordinates = "";
            if(city != "null"){
                try{
                    coordinates = Location.getCityCoordinates(city);
                    // Saves the data in the table
                    City citySave = new City(city, coordinates, alumniCount);
                    cityRepository.save(citySave);
                } catch (Exception e) {
                    System.out.println("city: " + city + " was not considered. Number of alumnis: " + alumniCount + " error:" + e);
                }
            }
        }
        System.out.println("Information added to the GeoJSON file and Table cityRepository repopulated.");
        System.out.println("-----");
    }

    @Override
    public void generateCityGeoJason() {
        // Creates the GeoJason file
        File geoJSONFile = new File("frontend/src/citiesGeoJSON.json");
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        FilesHandler.fileDeletion(geoJSONFile);
        Location.createEmptyGeoJSONFile(geoJSONFile);
        System.out.println("GeoJSON file created");

        // Iterates over the City table and populates the GeoJason file
        List<City> cityList = cityRepository.findAll();
        for (City city : cityList) {
            // Adds the country, the country coordinates and the number of alumni per country in the GeoJSON file
            Location.addCityGeoJSON(city, geoJSONFile, gson);
        }
    }
}
