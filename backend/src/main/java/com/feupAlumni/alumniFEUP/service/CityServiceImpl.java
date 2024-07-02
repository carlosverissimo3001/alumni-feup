package com.feupAlumni.alumniFEUP.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.City;
import com.feupAlumni.alumniFEUP.repository.CityRepository;

@Service
public class CityServiceImpl implements CityService {
    
    @Autowired
    private CityRepository cityRepository;
    @Autowired
    private AlumniService alumniService;

    @Override
    public void populateCityTable() {
        Map<String, Integer> cityAlumniCount = alumniService.getAlumniDistCity();

        // Iterate over the map and save the data to city table
        for(Map.Entry<String, Integer> entry : cityAlumniCount.entrySet()){
            String city = entry.getKey();
            Integer alumniCount = entry.getValue();

            // Get City Coordinates
            String coordinates = "";
            if(city != "null"){
                try{
                    coordinates = Location.getCityCoordinates(city, country);
                    // Saves the data in the table
                    City citySave = new City(city, coordinates, alumniCount);
                    saveCity(citySave);
                } catch (Exception e) {
                    System.out.println("city: " + city + " was not considered. Number of alumnis: " + alumniCount + " error:" + e);
                }
            }
        }
        System.out.println("City Table repopulated.");
        System.out.println("-----");
    }

    @Override
    public void saveCity(City citySave) {
        cityRepository.save(citySave);
    }

    @Override
    public City findCityByName(String cityName) {
        return cityRepository.findByCity(cityName);
    }
    
    @Override
    public void cleanCityTable() {
        if (cityRepository.count() > 0) {
            try {
                System.out.println("-----");
                System.out.println("Registers are going to be deteled from: " + cityRepository);
                cityRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } 
    }
}
