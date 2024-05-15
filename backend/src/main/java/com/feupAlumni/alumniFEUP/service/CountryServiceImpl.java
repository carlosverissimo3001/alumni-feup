package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.CleanData;
import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.Country;
import com.feupAlumni.alumniFEUP.repository.AlumniEicRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.CountryRepository;

import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class CountryServiceImpl implements CountryService{
 
    @Autowired
    private CountryRepository countryRepository;
    @Autowired
    private AlumniEicRepository alumniEicRepository;
    @Autowired
    private AlumniRepository alumniRepository;

    // Gets the alumni distribution per country
    private void getAlumniDistCountry(Map<String, Integer> countryAlumniCount, Map<String, String> countryCodes) {
        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();
        var count = 0;
        // Puts in a map the countries (as keys) and the number of alumni for each country (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = FilesHandler.extractFieldFromJson("country_full_name", linkedinInfo);
            String countryCode = FilesHandler.extractFieldFromJson("country", linkedinInfo);
            if(countryCode.toUpperCase().equals("SI")){
                System.out.println("alumni: " + alumni.getLinkedinInfo());
                count++;
                System.out.println("----------------------------------------------------------------");
            }

            // Ensures consistency across fields
            country = country.toLowerCase();
            countryCode = countryCode.toUpperCase();

            // Update the count for the country in the map
            countryAlumniCount.put(country, countryAlumniCount.getOrDefault(country, 0) + 1);
            // Adds the country code
            countryCodes.put(country, countryCode);
        }
        System.out.println("count: " + count);
    }      

    @Override
    public void populateCountryTable() {
        CleanData.cleanTable(alumniEicRepository); // it has a foreign key
        CleanData.cleanTable(countryRepository);

        Map<String, Integer> countryAlumniCount = new HashMap<>();
        Map<String, String> countryCodes = new HashMap<>();
        getAlumniDistCountry(countryAlumniCount, countryCodes);

        // Iterate over the map and save the data to ViewAlumniCountry table + Adds the information to the GeoJSON file
        for (Map.Entry<String, Integer> entry : countryAlumniCount.entrySet()) {
            String country = entry.getKey();
            Integer alumniCount = entry.getValue();

            String countryCode = countryCodes.get(country);
            try {
                // Get Country Coordinates
                String coordinates = "";
                if(country != "null"){
                    coordinates = Location.getLocationCoordinates(countryCode, false);
                }

                // Saves the data in the table
                Country viewAlumniCountry = new Country(country, countryCode, alumniCount, coordinates);
                countryRepository.save(viewAlumniCountry);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        System.out.println("Information added to the GeoJSON file and Table viewAlumniCountryRepository repopulated.");
        System.out.println("-----");
    }
}
