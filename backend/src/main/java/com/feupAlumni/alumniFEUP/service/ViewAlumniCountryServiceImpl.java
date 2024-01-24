package com.feupAlumni.alumniFEUP.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.ViewAlumniCountry;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.ViewAlumniCountryRepository;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
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

    private String getEncodedCountryName(String country) throws UnsupportedEncodingException{
        return URLEncoder.encode(country, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private JsonNode  getCoordinatesForCountry (String country) throws IOException, InterruptedException {

        String encodedCountry = getEncodedCountryName(country);

        String apiUrl = "https://restcountries.com/v3.1/name/" + encodedCountry;

        // Create an HTTPClient
        HttpClient httpClient = HttpClient.newHttpClient();

        // Create a request
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUrl)).build();
    
        // Send the request and get the response
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if(response.statusCode() == 200){
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readTree(response.body());
        } else {
            System.out.println("Failed to get coordinates for country: " + country);
            return null;
        }
    }

    @Override
    public void setViewAlumniCountry() {

        // Check if AlumniBackup table is not empty
        if (viewAlumniCountryRepository.count() > 0) {   
            System.err.println("Table viewAlumniCountryRepository populated. Registers are going to be deteled!");
            viewAlumniCountryRepository.deleteAll();
        }

        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();
        Map<String, Integer> countryAlumniCount = new HashMap<>();

        // Puts in a map the countries (as keys) and the number of alumni for each country (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = extractFieldFromJson("country_full_name", linkedinInfo);
           
            // Ensures consistency across fields
            country = country.toLowerCase();

            // Update the count for the country in the map
            countryAlumniCount.put(country, countryAlumniCount.getOrDefault(country, 0) + 1);
        }

        // Iterate over the map and save the data to ViewAlumniCountry table
        for (Map.Entry<String, Integer> entry : countryAlumniCount.entrySet()) {
            String country = entry.getKey();
            Integer alumniCount = entry.getValue();

            // Gets the coordinates of the current country
            try {
                String coordinates = "";

                if(country != "null"){
                    JsonNode jsonResponse = getCoordinatesForCountry(country);

                    JsonNode firstElement = jsonResponse.path(0);
                    JsonNode latlngNode = firstElement.path("latlng");
                    coordinates = latlngNode.toString();
                }
                
                // Saves the data in the table
                ViewAlumniCountry viewAlumniCountry = new ViewAlumniCountry(country, alumniCount, coordinates);
                viewAlumniCountryRepository.save(viewAlumniCountry);
            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public List<ViewAlumniCountry> getViewAlumniCountry() {
        return viewAlumniCountryRepository.findAll();
    }

}
