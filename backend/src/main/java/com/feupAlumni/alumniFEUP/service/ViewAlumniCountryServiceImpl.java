package com.feupAlumni.alumniFEUP.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.GeoJSONFeature;
import com.feupAlumni.alumniFEUP.model.GeoJSONGeometry;
import com.feupAlumni.alumniFEUP.model.GeoJSONProperties;
import com.feupAlumni.alumniFEUP.model.GeoJSONStructure;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

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

    private void createEmptyGeoJSONFile(File file) {
        GeoJSONStructure emptyStructure = new GeoJSONStructure();
        try (FileWriter fileWriter = new FileWriter(file)) {
            new GsonBuilder().setPrettyPrinting().create().toJson(emptyStructure, fileWriter);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void addInfoGeoJSON(ViewAlumniCountry viewAlumniCountry, File geoJSONFile, Gson gson) {
        
        try (FileReader fileReader = new FileReader(geoJSONFile)) {
            GeoJSONStructure geoJSONStructure = gson.fromJson(fileReader, GeoJSONStructure.class);

            // Create a new GeoJSON feature
            GeoJSONFeature feature = new GeoJSONFeature();
            feature.setType("Feature");

            GeoJSONProperties properties = new GeoJSONProperties();
            properties.setName(viewAlumniCountry.getCountry());
            properties.setStudents(viewAlumniCountry.getNAlumniInCountry());

            feature.setProperties(properties);

            GeoJSONGeometry geometry = new GeoJSONGeometry();
            geometry.setType("Point");
            List<Double> coordinatesList = coordinatesToList(viewAlumniCountry.getCountryCoordinates());
            geometry.setCoordinates(coordinatesList);

            feature.setGeometry(geometry);

            geoJSONStructure.setFeatures(feature);

            // Write the updated GeoJSON structure back to the file
            try (FileWriter fileWriter = new FileWriter(geoJSONFile)) {
                gson.toJson(geoJSONStructure, fileWriter);
            }
            
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    private List<Double> coordinatesToList(String coordinates) throws JsonMappingException, JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        JsonNode latlngNode = objectMapper.readTree(coordinates);

        List<Double> latlngList = new ArrayList<>();
        for(int i = latlngNode.size()-1; i>=0;i--){
            JsonNode element = latlngNode.get(i);
            latlngList.add(element.asDouble());
        }
        return latlngList;
    }

    @Override
    public void setViewAlumniCountry() {

        // Check if AlumniBackup table is not empty
        if (viewAlumniCountryRepository.count() > 0) {   
            try {
                System.err.println("Table viewAlumniCountryRepository populated. Registers are going to be deteled!");
                viewAlumniCountryRepository.deleteAll();
            } catch (Exception e) {
                System.out.println("ERROR: ");
                e.printStackTrace();
            }
            
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

        // If the GeoJSON file exists it leats so new information can be added
        File geoJSONFile = new File("frontend/src/countriesGeoJSON.json");
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 

        if(geoJSONFile.exists()){
            if (geoJSONFile.delete()) {
                System.out.println("Deleted existing GeoJSON file.");
            } else {
                System.err.println("Failed to delete existing GeoJSON file.");
            }
        }

        createEmptyGeoJSONFile(geoJSONFile);

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

                // Adds the country, the country coordinates and the number of alumni per country in the GeoJSON file
                addInfoGeoJSON(viewAlumniCountry, geoJSONFile, gson);
                System.out.println("GeoJSON file updated!");

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
