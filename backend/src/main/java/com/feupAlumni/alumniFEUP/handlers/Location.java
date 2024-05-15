package com.feupAlumni.alumniFEUP.handlers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feupAlumni.alumniFEUP.model.GeoJSONFeature;
import com.feupAlumni.alumniFEUP.model.GeoJSONGeometry;
import com.feupAlumni.alumniFEUP.model.GeoJSONProperties;
import com.feupAlumni.alumniFEUP.model.GeoJSONStructure;
import com.feupAlumni.alumniFEUP.model.LocationAlumnis;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.net.URLEncoder;
import java.util.Map;
import java.util.Properties;

public class Location {

    private static final String PROPERTIES_FILE = "backend/src/main/resources/application.properties";

    private static Properties loadProperties() throws IOException {
        Properties properties = new Properties();
        FileInputStream fis = new FileInputStream(PROPERTIES_FILE);
        properties.load(fis);
        fis.close();
        return properties;
    }

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

    // Calls on the API which gets the information about a given location (inlcuding their latitude and longitude)
    private static JsonNode getCoordinatesForLocation (String location, boolean isCity) throws IOException, InterruptedException {
        Properties properties = loadProperties();
        String username = properties.getProperty("geonames.username");

        String url;
        if (isCity) {
            String encodedCityName = URLEncoder.encode(location, "UTF-8");
            url = "http://api.geonames.org/searchJSON?q=" + encodedCityName + "&maxRows=1&username=" + username;
        } else {
            String API_URL = "http://api.geonames.org/searchJSON";
            url = String.format("%s?country=%s&maxRows=1&username=%s", API_URL, location, username);
        }        

        HttpClient httpClient = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).version(Version.HTTP_1_1).build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() == 200){
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.readTree(response.body());
            } else {
                System.out.println("Failed to get coordinates for location: " + location);
                return null;
            }
        } catch (Exception e) {
            System.out.println("ERRO");
            e.printStackTrace();
            return null;
        }
    }

    // Creates a GeoJSON file
    public static void createEmptyGeoJSONFile(File file) {
        GeoJSONStructure emptyStructure = new GeoJSONStructure();
        try (FileWriter fileWriter = new FileWriter(file, false)) { // false allows overrides
            new GsonBuilder().setPrettyPrinting().create().toJson(emptyStructure, fileWriter);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Gets the coordinates of a given location, be it city or country
    public static String getLocationCoordinates(String location, boolean isCity) throws IOException, InterruptedException {
        JsonNode jsonResponse = getCoordinatesForLocation(location, isCity);
        JsonNode geonamesNode = jsonResponse.path("geonames");
        if (geonamesNode.isArray() && geonamesNode.size() > 0) {
            JsonNode firstResultNode = geonamesNode.get(0);

            double latitude = firstResultNode.path("lat").asDouble();
            double longitude = firstResultNode.path("lng").asDouble();

            return "[" + latitude + "," + longitude +"]";
        } else {
            System.out.println("No geonames data found for location: " + location);
            return null;
        }
    }

    // Writes the information in the GeoJson file
    public static void addLocationGeoJson(LocationAlumnis location, Map<String, String> alumniLinkedinLinkForLocation, Map<String, Map<String, String>> alumniByCourseYearConclusionForLocation, File fileGeoJson, Gson gson){
        try (FileReader fileReader = new FileReader(fileGeoJson, StandardCharsets.UTF_8)) {
            GeoJSONStructure geoJSONStructure = gson.fromJson(fileReader, GeoJSONStructure.class);

            GeoJSONFeature feature = new GeoJSONFeature();
            feature.setType("Feature");

            GeoJSONProperties properties = new GeoJSONProperties();
            properties.setName(Arrays.asList(location.getName()));
            properties.setStudents(alumniLinkedinLinkForLocation.size());

            // Collect alumni names and linkedin links for this location
            properties.setListLinkedinLinks(alumniLinkedinLinkForLocation);

            // Collect alumni names and courses (and respective year of conclusion) for this location
            properties.setCoursesYearConclusionByUser(alumniByCourseYearConclusionForLocation);

            feature.setProperties(properties);

            GeoJSONGeometry geometry = new GeoJSONGeometry();
            geometry.setType("Point");
            List<Double> coordinatesList = coordinatesToList(location.getCoordinates());
            geometry.setCoordinates(coordinatesList);

            feature.setGeometry(geometry);

            geoJSONStructure.setFeatures(feature);

            // Write the updated GeoJSON structure back to the file
            try (FileWriter fileWriter = new FileWriter(fileGeoJson, StandardCharsets.UTF_8)) {
                gson.toJson(geoJSONStructure, fileWriter);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
