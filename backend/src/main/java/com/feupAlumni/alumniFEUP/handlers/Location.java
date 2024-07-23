package com.feupAlumni.alumniFEUP.handlers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.net.http.HttpClient.Version;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URLEncoder;

public class Location {

    // Calls on the API which gets the information about a given country (inlcuding their latitude and longitude)
    private static JsonNode getCoordinatesForCountry (String countryCode) throws IOException, InterruptedException {
            
        String API_URL = JsonFileHandler.getPropertyFromApplicationProperties("apiGeoCoordinates.url");
        String USERNAME = JsonFileHandler.getPropertyFromApplicationProperties("apiGeoCoordinates.username");
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
    private static JsonNode getCoordinatesForCity(String city, String country) throws IOException, InterruptedException {
        String API_URL = JsonFileHandler.getPropertyFromApplicationProperties("apiGeoCoordinates.url");
        String username = JsonFileHandler.getPropertyFromApplicationProperties("apiGeoCoordinates.username");
        String encodedCityName = URLEncoder.encode(city, "UTF-8");
        String apiUrl = API_URL+"?q=" + encodedCityName + "&country=" + country + "&maxRows=1&username=" + username;

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
    public static String getCityCoordinates(String city, String country) throws IOException, InterruptedException {
        JsonNode jsonResponse = getCoordinatesForCity(city, country);

        JsonNode geonamesNode = jsonResponse.path("geonames");
        JsonNode firstResultNode = geonamesNode.get(0);
        if (firstResultNode != null) {
            double latitude = firstResultNode.get("lat").asDouble();
            double longitude = firstResultNode.get("lng").asDouble();
            return "[" + latitude + "," + longitude + "]";
        } else {
            System.out.println("Coordinates API was not able to find coordinates for city: " + city + " country: " + country + " firstResultNode: " + firstResultNode);
        }
        
        return null;        
    }

    // Converts city names that the GeoCoordinates API doesn't recognize to recognizable ones
    public static Map<String, String> convertUnrecognizableCities(){
        Map<String, String> convertCityNames = new HashMap<>(); // Converts unacceptable city names to acceptable ones
        convertCityNames.put("porto metropolitan area", "porto");
        convertCityNames.put("brussels metropolitan area", "brussels"); 
        convertCityNames.put("porto e região", "porto"); 
        convertCityNames.put("kraków i okolice", "kraków");
        convertCityNames.put("greater guimaraes area", "guimarães"); 
        convertCityNames.put("hamburg und umgebung", "hamburg"); 
        convertCityNames.put("braga e região", "braga"); 
        convertCityNames.put("greater viana do castelo area", "viana do castelo"); 
        convertCityNames.put("antwerp metropolitan area", "antwerp"); 
        convertCityNames.put("metropolregion berlin/brandenburg", "berlin"); 
        convertCityNames.put("greater ipswich area", "ipswich"); 
        convertCityNames.put("greater madrid metropolitan area", "madrid"); 
        convertCityNames.put("pontevedra y alrededores", "pontevedra"); 
        convertCityNames.put("greater cambridge area", "cambridge"); 
        convertCityNames.put("oslo og omegn", "oslo"); 
        convertCityNames.put("greater tokyo area", "tokyo");
        convertCityNames.put("greater barcelona metropolitan area", "barcelona"); 
        convertCityNames.put("greater cardiff area", "cardiff"); 
        convertCityNames.put("greater oslo region", "oslo");
        convertCityNames.put("greater aveiro area", "aveiro"); 
        convertCityNames.put("the randstad", "randstad"); 
        convertCityNames.put("geneva metropolitan area", "geneva");
        return convertCityNames;
    }

}
