package com.feupAlumni.alumniFEUP.handlers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient.Version;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.model.GeoJSONFeature;
import com.feupAlumni.alumniFEUP.model.GeoJSONGeometry;
import com.feupAlumni.alumniFEUP.model.GeoJSONProperties;
import com.feupAlumni.alumniFEUP.model.GeoJSONStructure;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.City;
import com.feupAlumni.alumniFEUP.model.Country;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.net.URLEncoder;
import com.feupAlumni.alumniFEUP.model.Course;
import java.util.Map;

public class Location {

    // It receives the coordinates in the form of a string like: "[latitude, longitude]"
    // and returns them as an array like: [longitude, latitude]
    private static List<Double> coordinatesToList(String coordinates) throws JsonMappingException, JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        JsonNode latlngNode = objectMapper.readTree(coordinates);

        List<Double> latlngList = new ArrayList<>();
        for(int i = latlngNode.size()-1; i>=0;i--){
            JsonNode element = latlngNode.get(i);
            latlngList.add(element.asDouble());
        }
        return latlngList;
    }

    // Calls on the API which gets the information about a given country (inlcuding their latitude and longitude)
    private static JsonNode getCoordinatesForCountry (String countryCode) throws IOException, InterruptedException {
        
        String API_URL = "http://api.geonames.org/searchJSON";
        String USERNAME = "jenifer12345";
        String url = String.format("%s?country=%s&maxRows=1&username=%s", API_URL, countryCode, USERNAME);

        HttpClient httpClient = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).version(Version.HTTP_1_1).build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() == 200){
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.readTree(response.body());
            } else {
                System.out.println("Failed to get coordinates for country code: " + countryCode);
                return null;
            }
        } catch (Exception e) {
            System.out.println("ERRO");
            e.printStackTrace();
            return null;
        }
        
    }

    // Calls on the API which gets the information about a given city (including their latitude and longitude)
    private static JsonNode getCoordinatesForCity(String city) throws IOException, InterruptedException {

        String username = "jenifer12345";
        String encodedCityName = URLEncoder.encode(city, "UTF-8");
        String apiUrl = "http://api.geonames.org/searchJSON?q=" + encodedCityName + "&maxRows=1&username=" + username;

        // Create an HTTP connection
        URL url = new URL(apiUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        // Get the response
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null){
            response.append(line);
        }
        reader.close();

        // Parse the JSON response to extract latitude and longitude
        ObjectMapper objectMapper = new ObjectMapper();
        connection.disconnect();
        return objectMapper.readTree(response.toString());
    }

    // Creates a GeoJSON file
    public static void createEmptyGeoJSONFile(File file) {
        GeoJSONStructure emptyStructure = new GeoJSONStructure();
        try (FileWriter fileWriter = new FileWriter(file)) {
            new GsonBuilder().setPrettyPrinting().create().toJson(emptyStructure, fileWriter);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Gets the coordinates of a given country
    public static String getCountryCoordinates(String countryCode) throws IOException, InterruptedException{
        JsonNode jsonResponse = getCoordinatesForCountry(countryCode);

        JsonNode geonamesArray = jsonResponse.path("geonames");
        if (geonamesArray.isArray() && geonamesArray.size() > 0) {
            JsonNode firstElement = geonamesArray.get(0);

            JsonNode latitude = firstElement.path("lat");
            JsonNode longitude = firstElement.path("lng");

            return "[" + latitude + "," + longitude +"]";
        } else {
            System.out.println("No geonames data found for the country code: " + countryCode);
            return null;
        }
    }

    // Gets the coordinates of a given city
    public static String getCityCoordinates(String city) throws IOException, InterruptedException {
        JsonNode jsonResponse = getCoordinatesForCity(city);

        JsonNode geonamesNode = jsonResponse.path("geonames");
        JsonNode firstResultNode = geonamesNode.get(0);
        double latitude = firstResultNode.get("lat").asDouble();
        double longitude = firstResultNode.get("lng").asDouble();
        
        return "[" + latitude + "," + longitude + "]";
    }

    // Adds the city to the GeoJSON file
    public static void addCityGeoJSON(City city, Map<String, String> listLinkedinLinksByUser, Map<String, Map<String, String>> alumniByCourseYearConclusion, File geoJSONFile, Gson gson) {
        try (FileReader fileReader = new FileReader(geoJSONFile, StandardCharsets.UTF_8)) {
            GeoJSONStructure geoJSONStructure = gson.fromJson(fileReader, GeoJSONStructure.class);

            GeoJSONFeature feature = new GeoJSONFeature();
            feature.setType("Feature");

            GeoJSONProperties properties = new GeoJSONProperties();
            properties.setName(Arrays.asList(city.getCity()));
            properties.setStudents(city.getNAlumniInCity());
            // Collect alumni names and linkedin links for this country
            properties.setListLinkedinLinks(listLinkedinLinksByUser);

            // Collect alumni names and courses (and respective year of conclusion) for this country
            properties.setCoursesYearConclusionByUser(alumniByCourseYearConclusion);

            feature.setProperties(properties);

            GeoJSONGeometry geometry = new GeoJSONGeometry();
            geometry.setType("Point");
            List<Double> coordinatesList = coordinatesToList(city.getCityCoordinates());
            geometry.setCoordinates(coordinatesList);

            feature.setGeometry(geometry);

            geoJSONStructure.setFeatures(feature);

            // Write the updated GeoJSON structure back to the file
            try (FileWriter fileWriter = new FileWriter(geoJSONFile, StandardCharsets.UTF_8)) {
                gson.toJson(geoJSONStructure, fileWriter);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Adds the country to the GeoJSON file
    public static void addCountryGeoJSON(Country country, Map<String, String> listLinkedinLinksByUser, Map<String, Map<String, String>> alumniByCourseYearConclusion, File geoJSONFile, Gson gson) {
        try (FileReader fileReader = new FileReader(geoJSONFile, StandardCharsets.UTF_8)) {
            GeoJSONStructure geoJSONStructure = gson.fromJson(fileReader, GeoJSONStructure.class);

            GeoJSONFeature feature = new GeoJSONFeature();
            feature.setType("Feature");

            GeoJSONProperties properties = new GeoJSONProperties();
            properties.setName(Arrays.asList(country.getCountry()));
            properties.setStudents(listLinkedinLinksByUser.size());

            // Collect alumni names and linkedin links for this country
            properties.setListLinkedinLinks(listLinkedinLinksByUser);

            // Collect alumni names and courses (and respective year of conclusion) for this country
            properties.setCoursesYearConclusionByUser(alumniByCourseYearConclusion);

            feature.setProperties(properties);

            GeoJSONGeometry geometry = new GeoJSONGeometry();
            geometry.setType("Point");
            List<Double> coordinatesList = coordinatesToList(country.getCountryCoordinates());
            geometry.setCoordinates(coordinatesList);

            feature.setGeometry(geometry);

            geoJSONStructure.setFeatures(feature);

            // Write the updated GeoJSON structure back to the file
            try (FileWriter fileWriter = new FileWriter(geoJSONFile, StandardCharsets.UTF_8)) {
                gson.toJson(geoJSONStructure, fileWriter);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
