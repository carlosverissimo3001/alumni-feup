package com.feupAlumni.alumniFEUP.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feupAlumni.alumniFEUP.model.City;
import com.feupAlumni.alumniFEUP.repository.CityRepository;

@Service
public class CityServiceImpl implements CityService {
    
    @Autowired
    private CityRepository cityRepository;
    @Autowired
    private AlumniService alumniService;

    @Override
    public void populateCityTable(List<String> errorMessages) throws IOException, InterruptedException {
        try {
            // cityInformation[0] => map where Key: cityName Value: cityCoordinates
            // cityInformation[1] => map where Key: cityCoordinates Value: Nº of Alumnis in the city coordinates
            // This had to be implemented like this in order to avoid calling the API that gets the city coordinates twice
            ArrayList<Map<String, String>> cityInformation = alumniService.getCityInformation(errorMessages);

            // Gets the city names for each city coordinate
            // Key: city name Value: city coordinate
            Map<String, String> cityNameCityCoordinate = cityInformation.get(0);

            // Gets the number of alumnis across each city
            // Key: city coordinates Value: nº alumnis
            Map<String, String> cityAlumniCount = cityInformation.get(1);

            // Iterates over the map and saves the data on the city table
            for(Map.Entry<String, String> cityCoordinate : cityNameCityCoordinate.entrySet()){
                String cityName = cityCoordinate.getKey();
                String coordinateOfCity = cityCoordinate.getValue();

                Integer alumniCount = Integer.parseInt(cityAlumniCount.get(coordinateOfCity));

                try {
                    // Saves the data in the table
                    City city = findCityByName(cityName.toLowerCase());
                    String cityNameLowerCase = cityName.toLowerCase();
                    if (city != null) {
                        city.setCity(cityNameLowerCase);
                        city.setCityCoordinates(coordinateOfCity);
                        city.setNAlumni(alumniCount);
                        saveCity(city);
                    } else { // If there is no register already with this name
                        City citySave = new City(cityNameLowerCase, coordinateOfCity, alumniCount);
                        saveCity(citySave);
                    }
                } catch (Error e) {
                    System.out.println("error: " + e);
                }
            }
            
            System.out.println("City Table repopulated.");
            System.out.println("-----");
        } catch (Error e) {
            System.out.println("Something went wrong while trying to populate the city table: " + e);
        }
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
