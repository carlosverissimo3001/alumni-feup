package com.feupAlumni.alumniFEUP.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@Service
public class ViewAlumniCountryServiceImpl implements ViewAlumniCountryService{

    @Autowired
    private ViewAlumniCountryRepository viewAlumniCountryRepository;
    @Autowired
    private AlumniRepository alumniRepository;

    private String extractFieldFromJson(String fieldToExtract, String jsonData) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonData);
            return jsonNode.get(fieldToExtract).asText();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void setViewAlumniCountry() {
        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();
        Map<String, Integer> countryAlumniCount = new HashMap<>();

        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = extractFieldFromJson("country", linkedinInfo);
            
            // Update the count for the country in the map
            countryAlumniCount.put(country, countryAlumniCount.getOrDefault(country, 0) + 1);
        }

        // Iterate over the map and save the data to ViewAlumniCountry table
        for (Map.Entry<String, Integer> entry : countryAlumniCount.entrySet()) {
            String country = entry.getKey();
            Integer alumniCount = entry.getValue();

            // Saves the data in the table
            System.out.println("country: " + country + " alumniCount: " + alumniCount);
            ViewAlumniCountry viewAlumniCountry = new ViewAlumniCountry(country, alumniCount);
            viewAlumniCountryRepository.save(viewAlumniCountry);
        }
    }

    @Override
    public List<ViewAlumniCountry> getViewAlumniCountry() {
        return viewAlumniCountryRepository.findAll();
    }

}
