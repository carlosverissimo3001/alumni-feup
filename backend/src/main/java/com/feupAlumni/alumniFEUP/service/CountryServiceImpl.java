package com.feupAlumni.alumniFEUP.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.Country;
import com.feupAlumni.alumniFEUP.repository.CountryRepository;

@Service
public class CountryServiceImpl implements CountryService{
        
    @Autowired
    private CountryRepository countryRepository;
    @Autowired
    private AlumniService alumniService;

    @Override
    public void populateCountryTable(List<String> errorMessages) {
        Map<String, Integer> countryAlumniCount = new HashMap<>();
        Map<String, String> countryCodes = new HashMap<>();
        alumniService.getAlumniDistCountry(countryAlumniCount, countryCodes);

        // Iterate over the map and save the data to ViewAlumniCountry table
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
                if (coordinates == "") {
                    errorMessages.add("Country: " + country + " was not recognized by GeoNames API. It's coordinates were not found.");
                }

                // Saves the data in the table
                Country countryToSave = new Country(country, countryCode, alumniCount, coordinates);
                saveCountry(countryToSave);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        System.out.println("Country Table Repopulated.");
        System.out.println("-----");
    }

    @Override
    public void saveCountry(Country country) {
        countryRepository.save(country);
    }

    @Override
    public Country getCountryByName(String countryName) {
        return countryRepository.findByCountry(countryName);
    }

    @Override
    public void cleanCountryTable() {
        if (countryRepository.count() > 0) {
            try {
                System.out.println("-----");
                System.out.println("Registers are going to be deteled from: " + countryRepository);
                countryRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } 
    }
}
